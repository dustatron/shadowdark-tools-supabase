-- Migration: Create user_magic_items table
-- Feature: 012-for-magic-items
-- Date: 2025-12-05

-- Create user_magic_items table
CREATE TABLE IF NOT EXISTS public.user_magic_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT user_magic_item_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT user_magic_item_slug_format CHECK (slug ~ '^[a-z0-9_-]+$'),
    CONSTRAINT user_magic_item_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
    CONSTRAINT user_magic_item_traits_is_array CHECK (jsonb_typeof(traits) = 'array'),
    UNIQUE(user_id, slug)
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_user_magic_items
    BEFORE UPDATE ON public.user_magic_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_user_magic_items_user_id ON public.user_magic_items(user_id);
CREATE INDEX idx_user_magic_items_slug ON public.user_magic_items(user_id, slug);
CREATE INDEX idx_user_magic_items_name_trgm ON public.user_magic_items USING GIN (name gin_trgm_ops);
CREATE INDEX idx_user_magic_items_is_public ON public.user_magic_items(is_public) WHERE is_public = true;

-- Full-text search index
CREATE INDEX idx_user_magic_items_search ON public.user_magic_items USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '')
    )
);

-- Enable Row Level Security
ALTER TABLE public.user_magic_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own items and public items
CREATE POLICY "user_magic_items_select" ON public.user_magic_items
    FOR SELECT USING (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policy: Users can insert their own items
CREATE POLICY "user_magic_items_insert" ON public.user_magic_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own items, admins can update any
CREATE POLICY "user_magic_items_update" ON public.user_magic_items
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policy: Users can delete their own items, admins can delete any
CREATE POLICY "user_magic_items_delete" ON public.user_magic_items
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Comments
COMMENT ON TABLE public.user_magic_items IS 'User-created magic items';
COMMENT ON COLUMN public.user_magic_items.id IS 'Unique magic item identifier';
COMMENT ON COLUMN public.user_magic_items.user_id IS 'Owner user ID';
COMMENT ON COLUMN public.user_magic_items.name IS 'Display name of the magic item';
COMMENT ON COLUMN public.user_magic_items.slug IS 'URL-safe identifier (unique per user)';
COMMENT ON COLUMN public.user_magic_items.description IS 'Detailed description of the magic item';
COMMENT ON COLUMN public.user_magic_items.traits IS 'Array of trait objects (Benefit, Curse, Bonus, Personality)';
COMMENT ON COLUMN public.user_magic_items.is_public IS 'Whether the item is visible to other users';
COMMENT ON COLUMN public.user_magic_items.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.user_magic_items.updated_at IS 'Last modification timestamp';
