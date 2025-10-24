-- Fix user profile creation trigger to include username
-- Generate username from email address

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  username_counter INT := 0;
BEGIN
  -- Extract username from email (part before @)
  base_username := lower(split_part(NEW.email, '@', 1));

  -- Remove any non-alphanumeric characters and replace with underscore
  base_username := regexp_replace(base_username, '[^a-z0-9]', '_', 'g');

  -- Ensure minimum length of 3 characters
  IF char_length(base_username) < 3 THEN
    base_username := 'user_' || substring(NEW.id::text, 1, 8);
  END IF;

  -- Ensure maximum length of 30 characters
  base_username := substring(base_username, 1, 30);

  final_username := base_username;

  -- Check if username exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := substring(base_username, 1, 30 - char_length(username_counter::text) - 1) || '_' || username_counter;
  END LOOP;

  -- Insert the user profile with username
  INSERT INTO public.user_profiles (id, display_name, username, username_slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    final_username,
    final_username  -- username_slug is the same as username for now
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
