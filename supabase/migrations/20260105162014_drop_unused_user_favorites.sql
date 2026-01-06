-- Drop the unused user_favorites table
-- The favorites table is the one actually being used by the application

-- Drop policies first (if they exist)
DROP POLICY IF EXISTS "Users can only view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Admins can do anything with favorites" ON user_favorites;

-- Drop the table
DROP TABLE IF EXISTS user_favorites;