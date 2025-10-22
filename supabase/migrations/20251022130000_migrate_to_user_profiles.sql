-- Migration to use existing user_profiles table instead of creating new profiles table
-- This adds username and username_slug columns to the existing user_profiles table

-- Drop the new profiles table if it was created
DROP TABLE IF EXISTS profiles CASCADE;

-- Add username and username_slug columns to existing user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS username_slug TEXT;

-- Update bio length constraint (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bio_length' AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT bio_length CHECK (char_length(bio) <= 500);
  END IF;
END $$;

-- Create unique constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_username_key' AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_username_slug_key' AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_slug_key UNIQUE (username_slug);
  END IF;
END $$;

-- Create username slug generation function (reuse from dropped profiles table)
CREATE OR REPLACE FUNCTION generate_username_slug(username TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(username, '[^a-zA-Z0-9\\s-]', '', 'g'),
    '\\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-update username_slug
CREATE OR REPLACE FUNCTION update_username_slug_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username_slug = generate_username_slug(NEW.username);
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_profiles_username_slug ON user_profiles;

-- Create trigger to auto-update username_slug when username changes
CREATE TRIGGER update_user_profiles_username_slug
  BEFORE INSERT OR UPDATE OF username ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_username_slug_user_profiles();

-- Add indexes for username and username_slug
CREATE INDEX IF NOT EXISTS idx_user_profiles_username_slug ON user_profiles(username_slug);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Migrate existing users to have username and username_slug
-- Generate username from email (before @) or display_name
UPDATE user_profiles
SET
  username = COALESCE(
    display_name,
    split_part(
      (SELECT email FROM auth.users WHERE id = user_profiles.id),
      '@',
      1
    )
  ),
  username_slug = generate_username_slug(
    COALESCE(
      display_name,
      split_part(
        (SELECT email FROM auth.users WHERE id = user_profiles.id),
        '@',
        1
      )
    )
  )
WHERE username IS NULL OR username_slug IS NULL;

-- Make username required (NOT NULL) after migration
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN username_slug SET NOT NULL;

-- Add username length constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'username_length' AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT username_length
      CHECK (char_length(username) >= 3 AND char_length(username) <= 30);
  END IF;
END $$;

-- Update the auto-create profile function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Generate default username from email
  default_username := split_part(NEW.email, '@', 1);

  -- Ensure minimum length of 3 characters
  IF char_length(default_username) < 3 THEN
    default_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    default_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
