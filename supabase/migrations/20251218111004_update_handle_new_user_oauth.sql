-- Update handle_new_user trigger to properly handle OAuth provider metadata
-- This extracts display name, avatar URL from Google and Discord OAuth responses

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
  default_display_name TEXT;
  default_avatar_url TEXT;
BEGIN
  -- Get display name from OAuth metadata or email
  -- Google uses 'full_name' or 'name', Discord uses 'full_name'
  default_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.email
  );

  -- Get avatar from OAuth metadata
  -- Google uses 'avatar_url' or 'picture', Discord uses 'avatar_url'
  default_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  -- Generate username from email prefix or OAuth display name
  default_username := COALESCE(
    split_part(NEW.email, '@', 1),
    regexp_replace(COALESCE(default_display_name, ''), '[^a-zA-Z0-9]', '', 'g')
  );

  -- Ensure minimum length of 3 characters for username
  IF char_length(default_username) < 3 THEN
    default_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Truncate username if too long (max 30 chars)
  IF char_length(default_username) > 30 THEN
    default_username := substr(default_username, 1, 30);
  END IF;

  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (NEW.id, default_username, default_display_name, default_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(user_profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(user_profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
