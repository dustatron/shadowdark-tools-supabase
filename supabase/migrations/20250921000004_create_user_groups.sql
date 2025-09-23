-- Create user groups table
CREATE TABLE IF NOT EXISTS public.user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    monsters JSONB NOT NULL DEFAULT '[]'::jsonb,
    combined_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags JSONB NOT NULL DEFAULT '{"type": [], "location": []}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT groups_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_user_groups
    BEFORE UPDATE ON public.user_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_groups_user_id ON public.user_groups(user_id);
CREATE INDEX idx_user_groups_name ON public.user_groups USING GIN (name gin_trgm_ops);
CREATE INDEX idx_user_groups_public ON public.user_groups(is_public) WHERE is_public = true;
CREATE INDEX idx_user_groups_user_public ON public.user_groups(user_id, is_public);
CREATE INDEX idx_user_groups_tags ON public.user_groups USING GIN (tags);

-- Full-text search index
CREATE INDEX idx_user_groups_search ON public.user_groups USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '')
    )
);

-- Function to calculate combined stats
CREATE OR REPLACE FUNCTION public.calculate_group_stats(group_monsters JSONB)
RETURNS JSONB AS $$
DECLARE
    total_xp INTEGER := 0;
    total_hp INTEGER := 0;
    total_count INTEGER := 0;
    avg_ac DECIMAL := 0;
    effective_cl INTEGER := 0;
    monster_record RECORD;
    monster_data JSONB;
    quantity INTEGER;
BEGIN
    -- Loop through monsters in the group
    FOR monster_record IN
        SELECT jsonb_array_elements(group_monsters) as monster
    LOOP
        monster_data := monster_record.monster;
        quantity := COALESCE((monster_data->>'quantity')::INTEGER, 1);

        -- Add to totals (assumes XP calculation: CL * 25)
        total_xp := total_xp + (COALESCE((monster_data->>'challenge_level')::INTEGER, 1) * 25 * quantity);
        total_hp := total_hp + (COALESCE((monster_data->>'hit_points')::INTEGER, 1) * quantity);
        total_count := total_count + quantity;
        avg_ac := avg_ac + (COALESCE((monster_data->>'armor_class')::INTEGER, 10) * quantity);
    END LOOP;

    -- Calculate averages
    IF total_count > 0 THEN
        avg_ac := avg_ac / total_count;
        effective_cl := GREATEST(1, LEAST(20, (total_xp / 25)::INTEGER));
    END IF;

    RETURN jsonb_build_object(
        'total_xp', total_xp,
        'total_hp', total_hp,
        'effective_cl', effective_cl,
        'monster_count', total_count,
        'average_ac', ROUND(avg_ac, 1)
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate combined stats
CREATE OR REPLACE FUNCTION public.update_group_combined_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.combined_stats = public.calculate_group_stats(NEW.monsters);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_group_stats_trigger
    BEFORE INSERT OR UPDATE ON public.user_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_group_combined_stats();

-- Row Level Security policies
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

-- Users can read their own groups and all public groups
CREATE POLICY "user_groups_select" ON public.user_groups
    FOR SELECT USING (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own groups
CREATE POLICY "user_groups_insert" ON public.user_groups
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own groups, admins can update any
CREATE POLICY "user_groups_update" ON public.user_groups
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can delete their own groups, admins can delete any
CREATE POLICY "user_groups_delete" ON public.user_groups
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );