-- Create user spells table
CREATE TABLE IF NOT EXISTS public.user_spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    classes JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration TEXT NOT NULL,
    range TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 5),
    source TEXT NOT NULL DEFAULT 'Custom',
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_user_spells
    BEFORE UPDATE ON public.user_spells
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_spells_user_id ON public.user_spells(user_id);
CREATE INDEX idx_user_spells_creator_id ON public.user_spells(creator_id);
CREATE INDEX idx_user_spells_name ON public.user_spells USING GIN (name gin_trgm_ops);
CREATE INDEX idx_user_spells_slug ON public.user_spells(user_id, slug);
CREATE INDEX idx_user_spells_tier ON public.user_spells(tier);
CREATE INDEX idx_user_spells_classes ON public.user_spells USING GIN (classes);
CREATE INDEX idx_user_spells_is_public ON public.user_spells(is_public);

-- Full-text search index
CREATE INDEX idx_user_spells_search ON public.user_spells USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);

-- Row Level Security policies
ALTER TABLE public.user_spells ENABLE ROW LEVEL SECURITY;

-- Users can read their own spells and public spells
CREATE POLICY "user_spells_select" ON public.user_spells
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true
    );

-- Users can insert their own spells
CREATE POLICY "user_spells_insert" ON public.user_spells
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own spells
CREATE POLICY "user_spells_update" ON public.user_spells
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own spells
CREATE POLICY "user_spells_delete" ON public.user_spells
    FOR DELETE USING (user_id = auth.uid());

-- Admins can update any spell
CREATE POLICY "user_spells_admin_update" ON public.user_spells
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can delete any spell
CREATE POLICY "user_spells_admin_delete" ON public.user_spells
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
