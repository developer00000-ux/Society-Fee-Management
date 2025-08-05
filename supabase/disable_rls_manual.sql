-- Manual RLS Disable Script
-- Run this in your Supabase SQL Editor to disable RLS for problematic tables

-- Disable RLS for user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS for colonies table  
ALTER TABLE colonies DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'colonies');

-- Optional: Drop problematic policies to prevent future issues
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_profiles;

DROP POLICY IF EXISTS "Users can view colonies they belong to" ON colonies;
DROP POLICY IF EXISTS "Super admins can view all colonies" ON colonies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON colonies;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON colonies;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON colonies; 