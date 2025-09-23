-- Create user lists table
CREATE TABLE IF NOT EXISTS public.user_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    party_level INTEGER CHECK (party_level >= 1 AND party_level <= 20),
    challenge_level_min INTEGER CHECK (challenge_level_min >= 1 AND challenge_level_min <= 20),
    challenge_level_max INTEGER CHECK (challenge_level_max >= 1 AND challenge_level_max <= 20),
    xp_budget INTEGER CHECK (xp_budget >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT lists_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT lists_cl_range CHECK (challenge_level_min IS NULL OR challenge_level_max IS NULL OR challenge_level_min <= challenge_level_max)
);

-- Create list items table
CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'group')),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for lists
CREATE TRIGGER set_updated_at_user_lists
    BEFORE UPDATE ON public.user_lists
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_lists_user_id ON public.user_lists(user_id);
CREATE INDEX idx_user_lists_name ON public.user_lists USING GIN (name gin_trgm_ops);
CREATE INDEX idx_user_lists_party_level ON public.user_lists(party_level);

-- Full-text search index for lists
CREATE INDEX idx_user_lists_search ON public.user_lists USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '')
    )
);

-- Indexes for list items
CREATE INDEX idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX idx_list_items_item_type_id ON public.list_items(item_type, item_id);
CREATE UNIQUE INDEX idx_list_items_unique ON public.list_items(list_id, item_type, item_id);

-- Function to calculate list totals
CREATE OR REPLACE FUNCTION public.calculate_list_totals(list_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    total_xp INTEGER := 0;
    total_count INTEGER := 0;
    item_record RECORD;
    monster_xp INTEGER;
    group_xp INTEGER;
BEGIN
    -- Calculate totals from monsters in the list
    FOR item_record IN
        SELECT li.quantity, li.item_type, li.item_id
        FROM public.list_items li
        WHERE li.list_id = list_uuid
    LOOP
        IF item_record.item_type = 'monster' THEN
            -- Get XP from official monsters
            SELECT om.xp INTO monster_xp
            FROM public.official_monsters om
            WHERE om.id = item_record.item_id;

            -- If not found in official, try user monsters
            IF monster_xp IS NULL THEN
                SELECT um.xp INTO monster_xp
                FROM public.user_monsters um
                WHERE um.id = item_record.item_id;
            END IF;

            IF monster_xp IS NOT NULL THEN
                total_xp := total_xp + (monster_xp * item_record.quantity);
                total_count := total_count + item_record.quantity;
            END IF;

        ELSIF item_record.item_type = 'group' THEN
            -- Get XP from group combined stats
            SELECT (ug.combined_stats->>'total_xp')::INTEGER INTO group_xp
            FROM public.user_groups ug
            WHERE ug.id = item_record.item_id;

            IF group_xp IS NOT NULL THEN
                total_xp := total_xp + (group_xp * item_record.quantity);
                -- Group count is handled within the group's combined stats
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'total_xp', total_xp,
        'total_items', total_count,
        'effective_cl', GREATEST(1, LEAST(20, (total_xp / 25)::INTEGER))
    );
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies for user_lists
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

-- Users can read their own lists
CREATE POLICY "user_lists_select" ON public.user_lists
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own lists
CREATE POLICY "user_lists_insert" ON public.user_lists
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own lists, admins can update any
CREATE POLICY "user_lists_update" ON public.user_lists
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can delete their own lists, admins can delete any
CREATE POLICY "user_lists_delete" ON public.user_lists
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for list_items
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Users can read list items for their own lists
CREATE POLICY "list_items_select" ON public.list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_lists ul
            WHERE ul.id = list_id AND (
                ul.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can insert items into their own lists
CREATE POLICY "list_items_insert" ON public.list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_lists ul
            WHERE ul.id = list_id AND ul.user_id = auth.uid()
        )
    );

-- Users can update items in their own lists
CREATE POLICY "list_items_update" ON public.list_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_lists ul
            WHERE ul.id = list_id AND (
                ul.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can delete items from their own lists
CREATE POLICY "list_items_delete" ON public.list_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_lists ul
            WHERE ul.id = list_id AND (
                ul.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );