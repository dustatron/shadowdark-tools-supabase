-- Create user monsters table
CREATE TABLE IF NOT EXISTS public.user_monsters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    challenge_level INTEGER NOT NULL CHECK (challenge_level >= 1 AND challenge_level <= 20),
    hit_points INTEGER NOT NULL CHECK (hit_points >= 1),
    armor_class INTEGER NOT NULL CHECK (armor_class >= 1 AND armor_class <= 21),
    speed TEXT NOT NULL,
    attacks JSONB NOT NULL DEFAULT '[]'::jsonb,
    abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    treasure JSONB,
    tags JSONB NOT NULL DEFAULT '{"type": [], "location": []}'::jsonb,
    source TEXT NOT NULL,
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    xp INTEGER GENERATED ALWAYS AS (challenge_level * 25) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_user_monsters
    BEFORE UPDATE ON public.user_monsters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_monsters_user_id ON public.user_monsters(user_id);
CREATE INDEX idx_user_monsters_name ON public.user_monsters USING GIN (name gin_trgm_ops);
CREATE INDEX idx_user_monsters_challenge_level ON public.user_monsters(challenge_level);
CREATE INDEX idx_user_monsters_tags ON public.user_monsters USING GIN (tags);
CREATE INDEX idx_user_monsters_source ON public.user_monsters(source);
CREATE INDEX idx_user_monsters_public ON public.user_monsters(is_public) WHERE is_public = true;
CREATE INDEX idx_user_monsters_user_public ON public.user_monsters(user_id, is_public);

-- Full-text search index
CREATE INDEX idx_user_monsters_search ON public.user_monsters USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);

-- Row Level Security policies
ALTER TABLE public.user_monsters ENABLE ROW LEVEL SECURITY;

-- Users can read their own monsters and all public monsters
CREATE POLICY "user_monsters_select" ON public.user_monsters
    FOR SELECT USING (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own monsters
CREATE POLICY "user_monsters_insert" ON public.user_monsters
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own monsters, admins can update any
CREATE POLICY "user_monsters_update" ON public.user_monsters
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can delete their own monsters, admins can delete any
CREATE POLICY "user_monsters_delete" ON public.user_monsters
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );