-- Add email column to user_profiles table
-- This script adds the missing email column that's being referenced in the application

-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.email IS 'User email address';

-- Update existing records with email from auth.users if possible
-- This is optional and can be run separately if needed
-- UPDATE user_profiles 
-- SET email = auth.users.email 
-- FROM auth.users 
-- WHERE user_profiles.id = auth.users.id 
-- AND user_profiles.email IS NULL;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'email';

-- Show current user_profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position; 