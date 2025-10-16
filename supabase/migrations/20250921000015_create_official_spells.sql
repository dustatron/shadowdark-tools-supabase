-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create official spells table
CREATE TABLE IF NOT EXISTS public.official_spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    classes JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration TEXT NOT NULL,
    range TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 5),
    source TEXT NOT NULL DEFAULT 'Shadowdark Core',
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_official_spells
    BEFORE UPDATE ON public.official_spells
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_official_spells_name ON public.official_spells USING GIN (name gin_trgm_ops);
CREATE INDEX idx_official_spells_slug ON public.official_spells(slug);
CREATE INDEX idx_official_spells_tier ON public.official_spells(tier);
CREATE INDEX idx_official_spells_classes ON public.official_spells USING GIN (classes);
CREATE INDEX idx_official_spells_source ON public.official_spells(source);

-- Full-text search index
CREATE INDEX idx_official_spells_search ON public.official_spells USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);

-- Row Level Security policies
ALTER TABLE public.official_spells ENABLE ROW LEVEL SECURITY;

-- Everyone can read official spells
CREATE POLICY "official_spells_select" ON public.official_spells
    FOR SELECT USING (true);

-- Only admins can insert/update/delete official spells
CREATE POLICY "official_spells_insert" ON public.official_spells
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "official_spells_update" ON public.official_spells
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "official_spells_delete" ON public.official_spells
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
