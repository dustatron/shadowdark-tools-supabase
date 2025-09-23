-- Create tag types table for admin-managed monster type categories
CREATE TABLE IF NOT EXISTS public.tag_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tag_types_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50)
);

-- Create tag locations table for admin-managed location categories
CREATE TABLE IF NOT EXISTS public.tag_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tag_locations_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50)
);

-- Create user favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'group')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, item_type, item_id)
);

-- Create indexes for performance
CREATE INDEX idx_tag_types_name ON public.tag_types(name);
CREATE INDEX idx_tag_locations_name ON public.tag_locations(name);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_item ON public.user_favorites(item_type, item_id);

-- Seed common monster types
INSERT INTO public.tag_types (name) VALUES
    ('humanoid'),
    ('beast'),
    ('monstrosity'),
    ('undead'),
    ('fiend'),
    ('celestial'),
    ('fey'),
    ('dragon'),
    ('elemental'),
    ('giant'),
    ('aberration'),
    ('construct'),
    ('ooze'),
    ('plant')
ON CONFLICT (name) DO NOTHING;

-- Seed common locations
INSERT INTO public.tag_locations (name) VALUES
    ('any'),
    ('cave'),
    ('dungeon'),
    ('forest'),
    ('mountain'),
    ('desert'),
    ('swamp'),
    ('water'),
    ('coastal'),
    ('underground'),
    ('urban'),
    ('ruins'),
    ('wasteland'),
    ('arctic'),
    ('plains'),
    ('hills')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security policies for tag_types
ALTER TABLE public.tag_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read tag types
CREATE POLICY "tag_types_select" ON public.tag_types
    FOR SELECT USING (true);

-- Only admins can insert/update/delete tag types
CREATE POLICY "tag_types_insert" ON public.tag_types
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "tag_types_update" ON public.tag_types
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "tag_types_delete" ON public.tag_types
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for tag_locations
ALTER TABLE public.tag_locations ENABLE ROW LEVEL SECURITY;

-- Everyone can read tag locations
CREATE POLICY "tag_locations_select" ON public.tag_locations
    FOR SELECT USING (true);

-- Only admins can insert/update/delete tag locations
CREATE POLICY "tag_locations_insert" ON public.tag_locations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "tag_locations_update" ON public.tag_locations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "tag_locations_delete" ON public.tag_locations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "user_favorites_select" ON public.user_favorites
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own favorites
CREATE POLICY "user_favorites_insert" ON public.user_favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own favorites
CREATE POLICY "user_favorites_delete" ON public.user_favorites
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );