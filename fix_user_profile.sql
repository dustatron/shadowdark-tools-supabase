-- Fix missing user profile
-- This script creates a user_profiles record for authenticated users who don't have one

-- Insert missing profiles for all auth.users that don't have a profile
INSERT INTO public.user_profiles (id, display_name)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User')
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify the fix
SELECT
    'Fixed profiles count:' as message,
    COUNT(*) as count
FROM public.user_profiles;

-- Show all profiles
SELECT
    id,
    display_name,
    is_admin,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;
