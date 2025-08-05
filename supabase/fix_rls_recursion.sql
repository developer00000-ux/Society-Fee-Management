-- Fix infinite recursion in RLS policies
-- Drop ALL existing policies to start fresh
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

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON buildings;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON floors;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON floors;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON floors;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON flats;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON flats;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON flats;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bill_categories;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bill_categories;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bill_categories;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bills;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON payments;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_requests;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON maintenance_requests;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON maintenance_requests;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON announcements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON announcements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON announcements;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_sessions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_sessions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_sessions;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON fee_entries;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON fee_entries;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON fee_entries;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON members;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON members;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON members;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON fee_types;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON fee_types;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON fee_types;

-- Create new policies without recursion
-- For user_profiles table
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert access for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For colonies table
CREATE POLICY "Enable read access for authenticated users" ON colonies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON colonies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON colonies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For buildings table
CREATE POLICY "Enable read access for authenticated users" ON buildings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON buildings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON buildings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For floors table
CREATE POLICY "Enable read access for authenticated users" ON floors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON floors
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON floors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For flats table
CREATE POLICY "Enable read access for authenticated users" ON flats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON flats
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON flats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For bill_categories table
CREATE POLICY "Enable read access for authenticated users" ON bill_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON bill_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON bill_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For bills table
CREATE POLICY "Enable read access for authenticated users" ON bills
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON bills
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON bills
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For payments table
CREATE POLICY "Enable read access for authenticated users" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON payments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For maintenance_requests table
CREATE POLICY "Enable read access for authenticated users" ON maintenance_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON maintenance_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON maintenance_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For announcements table
CREATE POLICY "Enable read access for authenticated users" ON announcements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON announcements
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON announcements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For user_sessions table
CREATE POLICY "Enable read access for authenticated users" ON user_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON user_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON user_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For fee_entries table
CREATE POLICY "Enable read access for authenticated users" ON fee_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON fee_entries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON fee_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For members table
CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For fee_types table
CREATE POLICY "Enable read access for authenticated users" ON fee_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON fee_types
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON fee_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 