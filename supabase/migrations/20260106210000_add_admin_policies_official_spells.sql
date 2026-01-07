-- Add RLS policies for admin access to official_spells
-- Admins can update official spells

CREATE POLICY "Admins can update official spells"
ON public.official_spells
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can delete official spells (if needed)
CREATE POLICY "Admins can delete official spells"
ON public.official_spells
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
