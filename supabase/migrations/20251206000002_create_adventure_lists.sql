-- Migration: Create adventure_lists and adventure_list_items tables
-- Feature: 013-adventure-lists
-- Date: 2025-12-06

-- Create adventure_lists table
CREATE TABLE IF NOT EXISTS public.adventure_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    image_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT adventure_lists_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100)
);

-- Create adventure_list_items table
CREATE TABLE IF NOT EXISTS public.adventure_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.adventure_lists(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'spell', 'magic_item')),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for adventure_lists
CREATE TRIGGER set_updated_at_adventure_lists
    BEFORE UPDATE ON public.adventure_lists
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for adventure_list_items
CREATE TRIGGER set_updated_at_adventure_list_items
    BEFORE UPDATE ON public.adventure_list_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_adventure_lists_user_id ON public.adventure_lists(user_id);
CREATE INDEX idx_adventure_lists_title ON public.adventure_lists USING GIN (title gin_trgm_ops);
CREATE INDEX idx_adventure_lists_is_public ON public.adventure_lists(is_public) WHERE is_public = true;

-- Full-text search index for adventure lists
CREATE INDEX idx_adventure_lists_search ON public.adventure_lists USING GIN (
    to_tsvector('english',
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(notes, '')
    )
);

-- Indexes for adventure list items
CREATE INDEX idx_adventure_list_items_list_id ON public.adventure_list_items(list_id);
CREATE INDEX idx_adventure_list_items_item_type_id ON public.adventure_list_items(item_type, item_id);
CREATE UNIQUE INDEX idx_adventure_list_items_unique ON public.adventure_list_items(list_id, item_type, item_id);

-- Function to get all items in a list with their details
CREATE OR REPLACE FUNCTION public.get_adventure_list_items(list_uuid UUID)
RETURNS TABLE (
    id UUID,
    list_id UUID,
    item_type TEXT,
    item_id UUID,
    quantity INTEGER,
    notes TEXT,
    name TEXT,
    description TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    
    -- Get monsters
    SELECT 
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(om.name, um.name) AS name,
        '' AS description,
        jsonb_build_object(
            'challenge_level', COALESCE(om.challenge_level, um.challenge_level),
            'hit_points', COALESCE(om.hit_points, um.hit_points),
            'armor_class', COALESCE(om.armor_class, um.armor_class),
            'source', COALESCE(om.source, um.source)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_monsters om ON ali.item_id = om.id AND ali.item_type = 'monster'
    LEFT JOIN public.user_monsters um ON ali.item_id = um.id AND ali.item_type = 'monster'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'monster'
    
    UNION ALL
    
    -- Get spells
    SELECT 
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(os.name, us.name) AS name,
        COALESCE(os.description, us.description) AS description,
        jsonb_build_object(
            'tier', COALESCE(os.tier, us.tier),
            'classes', COALESCE(os.classes, us.classes),
            'duration', COALESCE(os.duration, us.duration),
            'range', COALESCE(os.range, us.range),
            'source', COALESCE(os.source, us.source)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_spells os ON ali.item_id = os.id AND ali.item_type = 'spell'
    LEFT JOIN public.user_spells us ON ali.item_id = us.id AND ali.item_type = 'spell'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'spell'
    
    UNION ALL
    
    -- Get magic items
    SELECT 
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(omi.name, umi.name) AS name,
        COALESCE(omi.description, umi.description) AS description,
        jsonb_build_object(
            'traits', COALESCE(omi.traits, umi.traits)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_magic_items omi ON ali.item_id = omi.id AND ali.item_type = 'magic_item'
    LEFT JOIN public.user_magic_items umi ON ali.item_id = umi.id AND ali.item_type = 'magic_item'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'magic_item';
    
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies for adventure_lists
ALTER TABLE public.adventure_lists ENABLE ROW LEVEL SECURITY;

-- Users can read their own lists and public lists
CREATE POLICY "adventure_lists_select" ON public.adventure_lists
    FOR SELECT USING (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own lists
CREATE POLICY "adventure_lists_insert" ON public.adventure_lists
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own lists, admins can update any
CREATE POLICY "adventure_lists_update" ON public.adventure_lists
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can delete their own lists, admins can delete any
CREATE POLICY "adventure_lists_delete" ON public.adventure_lists
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for adventure_list_items
ALTER TABLE public.adventure_list_items ENABLE ROW LEVEL SECURITY;

-- Users can read list items for their own lists and public lists
CREATE POLICY "adventure_list_items_select" ON public.adventure_list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.adventure_lists al
            WHERE al.id = list_id AND (
                al.user_id = auth.uid() OR
                al.is_public = true OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can insert items into their own lists
CREATE POLICY "adventure_list_items_insert" ON public.adventure_list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.adventure_lists al
            WHERE al.id = list_id AND al.user_id = auth.uid()
        )
    );

-- Users can update items in their own lists
CREATE POLICY "adventure_list_items_update" ON public.adventure_list_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.adventure_lists al
            WHERE al.id = list_id AND (
                al.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can delete items from their own lists
CREATE POLICY "adventure_list_items_delete" ON public.adventure_list_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.adventure_lists al
            WHERE al.id = list_id AND (
                al.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );