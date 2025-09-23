-- Create encounter tables
CREATE TABLE IF NOT EXISTS public.encounter_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    die_size INTEGER NOT NULL CHECK (die_size >= 2 AND die_size <= 100),
    tags JSONB DEFAULT '{"type": [], "location": []}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT encounter_tables_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Create encounter slots
CREATE TABLE IF NOT EXISTS public.encounter_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES public.encounter_tables(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1),
    item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'group')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT encounter_slots_unique UNIQUE (table_id, slot_number)
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_encounter_tables
    BEFORE UPDATE ON public.encounter_tables
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_encounter_tables_user_id ON public.encounter_tables(user_id);
CREATE INDEX idx_encounter_tables_name ON public.encounter_tables USING GIN (name gin_trgm_ops);
CREATE INDEX idx_encounter_tables_die_size ON public.encounter_tables(die_size);
CREATE INDEX idx_encounter_tables_tags ON public.encounter_tables USING GIN (tags);

-- Indexes for encounter slots
CREATE INDEX idx_encounter_slots_table_id ON public.encounter_slots(table_id);
CREATE INDEX idx_encounter_slots_slot_number ON public.encounter_slots(table_id, slot_number);
CREATE INDEX idx_encounter_slots_item_type_id ON public.encounter_slots(item_type, item_id);

-- Full-text search index for encounter tables
CREATE INDEX idx_encounter_tables_search ON public.encounter_tables USING GIN (
    to_tsvector('english', COALESCE(name, ''))
);

-- Function to validate encounter slots don't exceed die size
CREATE OR REPLACE FUNCTION public.validate_encounter_slot()
RETURNS TRIGGER AS $$
DECLARE
    max_slots INTEGER;
BEGIN
    SELECT die_size INTO max_slots
    FROM public.encounter_tables
    WHERE id = NEW.table_id;

    IF NEW.slot_number > max_slots THEN
        RAISE EXCEPTION 'Slot number % exceeds die size %', NEW.slot_number, max_slots;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_encounter_slot_trigger
    BEFORE INSERT OR UPDATE ON public.encounter_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_encounter_slot();

-- Function to get random encounter from table
CREATE OR REPLACE FUNCTION public.roll_encounter_table(table_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    die_size_val INTEGER;
    roll_result INTEGER;
    slot_data RECORD;
BEGIN
    -- Get die size for the table
    SELECT die_size INTO die_size_val
    FROM public.encounter_tables
    WHERE id = table_uuid;

    IF die_size_val IS NULL THEN
        RAISE EXCEPTION 'Encounter table not found';
    END IF;

    -- Roll the die (1 to die_size)
    roll_result := floor(random() * die_size_val) + 1;

    -- Get the slot data
    SELECT es.item_type, es.item_id
    INTO slot_data
    FROM public.encounter_slots es
    WHERE es.table_id = table_uuid AND es.slot_number = roll_result;

    IF slot_data IS NULL THEN
        RETURN jsonb_build_object(
            'roll', roll_result,
            'result', 'empty',
            'message', 'No encounter assigned to this slot'
        );
    END IF;

    RETURN jsonb_build_object(
        'roll', roll_result,
        'item_type', slot_data.item_type,
        'item_id', slot_data.item_id
    );
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies for encounter_tables
ALTER TABLE public.encounter_tables ENABLE ROW LEVEL SECURITY;

-- Users can read their own encounter tables
CREATE POLICY "encounter_tables_select" ON public.encounter_tables
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert their own encounter tables
CREATE POLICY "encounter_tables_insert" ON public.encounter_tables
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own encounter tables, admins can update any
CREATE POLICY "encounter_tables_update" ON public.encounter_tables
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can delete their own encounter tables, admins can delete any
CREATE POLICY "encounter_tables_delete" ON public.encounter_tables
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for encounter_slots
ALTER TABLE public.encounter_slots ENABLE ROW LEVEL SECURITY;

-- Users can read slots for their own encounter tables
CREATE POLICY "encounter_slots_select" ON public.encounter_slots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.encounter_tables et
            WHERE et.id = table_id AND (
                et.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can insert slots into their own encounter tables
CREATE POLICY "encounter_slots_insert" ON public.encounter_slots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.encounter_tables et
            WHERE et.id = table_id AND et.user_id = auth.uid()
        )
    );

-- Users can update slots in their own encounter tables
CREATE POLICY "encounter_slots_update" ON public.encounter_slots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.encounter_tables et
            WHERE et.id = table_id AND (
                et.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Users can delete slots from their own encounter tables
CREATE POLICY "encounter_slots_delete" ON public.encounter_slots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.encounter_tables et
            WHERE et.id = table_id AND (
                et.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );