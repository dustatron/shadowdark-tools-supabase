-- Fix user profile creation trigger to use SECURITY DEFINER
-- This allows the trigger to insert into user_profiles with elevated permissions

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions to the authenticator role
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT INSERT ON public.user_profiles TO authenticator;
