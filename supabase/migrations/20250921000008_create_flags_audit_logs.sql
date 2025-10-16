-- Create flags table for content moderation
CREATE TABLE IF NOT EXISTS public.flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flagged_item_type TEXT NOT NULL CHECK (flagged_item_type IN ('monster', 'group')),
    flagged_item_id UUID NOT NULL,
    reporter_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'copyright', 'spam', 'inaccurate', 'other')),
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT flags_comment_length CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
    CONSTRAINT flags_resolved_consistency CHECK (
        (status = 'pending' AND resolved_at IS NULL AND resolved_by IS NULL) OR
        (status IN ('resolved', 'dismissed') AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
    )
);

-- Create audit logs table for admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_id UUID,
    target_type TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT audit_logs_action_type_length CHECK (char_length(action_type) >= 1 AND char_length(action_type) <= 100)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flags_flagged_item ON public.flags(flagged_item_type, flagged_item_id);
CREATE INDEX IF NOT EXISTS idx_flags_reporter ON public.flags(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_flags_status ON public.flags(status);
CREATE INDEX IF NOT EXISTS idx_flags_reason ON public.flags(reason);
CREATE INDEX IF NOT EXISTS idx_flags_created_at ON public.flags(created_at);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Function to auto-resolve flags and log admin actions
CREATE OR REPLACE FUNCTION public.resolve_flag_with_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed to resolved or dismissed
    IF OLD.status = 'pending' AND NEW.status IN ('resolved', 'dismissed') THEN
        -- Set resolved timestamp if not already set
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at = NOW();
        END IF;

        -- Set resolved_by if not already set
        IF NEW.resolved_by IS NULL THEN
            NEW.resolved_by = auth.uid();
        END IF;

        -- Create audit log entry
        INSERT INTO public.audit_logs (
            admin_user_id,
            action_type,
            target_id,
            target_type,
            details,
            notes
        ) VALUES (
            NEW.resolved_by,
            'flag_' || NEW.status,
            NEW.id,
            'flag',
            jsonb_build_object(
                'flagged_item_type', NEW.flagged_item_type,
                'flagged_item_id', NEW.flagged_item_id,
                'reason', NEW.reason,
                'original_status', OLD.status,
                'new_status', NEW.status
            ),
            NEW.admin_notes
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resolve_flag_audit_trigger ON public.flags;
CREATE TRIGGER resolve_flag_audit_trigger
    BEFORE UPDATE ON public.flags
    FOR EACH ROW
    EXECUTE FUNCTION public.resolve_flag_with_audit();

-- Function to prevent duplicate flags
CREATE OR REPLACE FUNCTION public.check_duplicate_flag()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has already flagged this item
    IF EXISTS (
        SELECT 1 FROM public.flags
        WHERE flagged_item_type = NEW.flagged_item_type
        AND flagged_item_id = NEW.flagged_item_id
        AND reporter_user_id = NEW.reporter_user_id
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'You have already flagged this item';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_duplicate_flag_trigger ON public.flags;
CREATE TRIGGER check_duplicate_flag_trigger
    BEFORE INSERT ON public.flags
    FOR EACH ROW
    EXECUTE FUNCTION public.check_duplicate_flag();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_action_type TEXT,
    p_target_id UUID DEFAULT NULL,
    p_target_type TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    admin_id UUID;
BEGIN
    admin_id := auth.uid();

    -- Verify user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = admin_id AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admins can create audit logs';
    END IF;

    INSERT INTO public.audit_logs (
        admin_user_id,
        action_type,
        target_id,
        target_type,
        details,
        notes
    ) VALUES (
        admin_id,
        p_action_type,
        p_target_id,
        p_target_type,
        p_details,
        p_notes
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies for flags
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "flags_select" ON public.flags;
DROP POLICY IF EXISTS "flags_insert" ON public.flags;
DROP POLICY IF EXISTS "flags_update" ON public.flags;
DROP POLICY IF EXISTS "flags_delete" ON public.flags;

-- Users can read their own flags, admins can read all flags
CREATE POLICY "flags_select" ON public.flags
    FOR SELECT USING (
        reporter_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can insert flags (but not flag their own content)
CREATE POLICY "flags_insert" ON public.flags
    FOR INSERT WITH CHECK (
        reporter_user_id = auth.uid() AND
        NOT EXISTS (
            SELECT 1 FROM public.user_monsters um
            WHERE um.id = flagged_item_id AND um.user_id = auth.uid()
        ) AND
        NOT EXISTS (
            SELECT 1 FROM public.user_groups ug
            WHERE ug.id = flagged_item_id AND ug.user_id = auth.uid()
        )
    );

-- Only admins can update flags
CREATE POLICY "flags_update" ON public.flags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can delete flags
CREATE POLICY "flags_delete" ON public.flags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Row Level Security policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_update" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_delete" ON public.audit_logs;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can insert audit logs
CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (
        admin_user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Audit logs cannot be updated or deleted to maintain integrity
CREATE POLICY "audit_logs_no_update" ON public.audit_logs
    FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_delete" ON public.audit_logs
    FOR DELETE USING (false);