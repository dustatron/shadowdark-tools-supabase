-- Ensure all auth.users have corresponding user_profiles
-- This migration fixes any existing users who were created before the auto-profile trigger

INSERT INTO public.user_profiles (id, display_name)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User')
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
