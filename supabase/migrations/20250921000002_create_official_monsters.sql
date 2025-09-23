-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create official monsters table
CREATE TABLE IF NOT EXISTS public.official_monsters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    challenge_level INTEGER NOT NULL CHECK (challenge_level >= 1 AND challenge_level <= 20),
    hit_points INTEGER NOT NULL CHECK (hit_points >= 1),
    armor_class INTEGER NOT NULL CHECK (armor_class >= 1 AND armor_class <= 25),
    speed TEXT NOT NULL,
    attacks JSONB NOT NULL DEFAULT '[]'::jsonb,
    abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    treasure JSONB,
    tags JSONB NOT NULL DEFAULT '{"type": [], "location": []}'::jsonb,
    source TEXT NOT NULL,
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    xp INTEGER GENERATED ALWAYS AS (challenge_level * 25) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_official_monsters
    BEFORE UPDATE ON public.official_monsters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_official_monsters_name ON public.official_monsters USING GIN (name gin_trgm_ops);
CREATE INDEX idx_official_monsters_challenge_level ON public.official_monsters(challenge_level);
CREATE INDEX idx_official_monsters_tags ON public.official_monsters USING GIN (tags);
CREATE INDEX idx_official_monsters_source ON public.official_monsters(source);

-- Full-text search index
CREATE INDEX idx_official_monsters_search ON public.official_monsters USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);

-- Row Level Security policies
ALTER TABLE public.official_monsters ENABLE ROW LEVEL SECURITY;

-- Everyone can read official monsters
CREATE POLICY "official_monsters_select" ON public.official_monsters
    FOR SELECT USING (true);

-- Only admins can insert/update/delete official monsters
CREATE POLICY "official_monsters_insert" ON public.official_monsters
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "official_monsters_update" ON public.official_monsters
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "official_monsters_delete" ON public.official_monsters
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Insert some sample official monsters
INSERT INTO public.official_monsters (name, challenge_level, hit_points, armor_class, speed, attacks, abilities, tags, source) VALUES
('Goblin', 1, 4, 12, '30 ft',
 '[{"name": "Scimitar", "type": "melee", "damage": "1d6+2", "range": "5 ft", "description": "Slashing damage"}]'::jsonb,
 '[{"name": "Keen Senses", "description": "Advantage on Perception checks"}]'::jsonb,
 '{"type": ["humanoid"], "location": ["forest", "cave"]}'::jsonb,
 'Shadowdark Core'),
('Orc', 2, 15, 13, '30 ft',
 '[{"name": "Greataxe", "type": "melee", "damage": "1d12+3", "range": "5 ft", "description": "Slashing damage"}]'::jsonb,
 '[{"name": "Aggressive", "description": "Can move up to speed toward an enemy as bonus action"}]'::jsonb,
 '{"type": ["humanoid"], "location": ["mountain", "wasteland"]}'::jsonb,
 'Shadowdark Core'),
('Skeleton', 1, 8, 13, '30 ft',
 '[{"name": "Shortsword", "type": "melee", "damage": "1d6+2", "range": "5 ft", "description": "Piercing damage"}]'::jsonb,
 '[{"name": "Undead Resilience", "description": "Immune to poison and exhaustion"}]'::jsonb,
 '{"type": ["undead"], "location": ["dungeon", "graveyard"]}'::jsonb,
 'Shadowdark Core');