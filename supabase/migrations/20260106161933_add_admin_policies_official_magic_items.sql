-- Migration: Add admin UPDATE and DELETE policies to official_magic_items
-- Feature: 020-update-site-logic
-- Date: 2026-01-06

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update official magic items"
ON public.official_magic_items
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

-- Add DELETE policy for admins (for future use)
CREATE POLICY "Admins can delete official magic items"
ON public.official_magic_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
