-- Fix fee_types table by dropping existing policies and recreating them
-- This script safely handles existing policies and tables

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read fee types" ON fee_types;
DROP POLICY IF EXISTS "Allow block managers to manage fee types" ON fee_types;
DROP POLICY IF EXISTS "Allow all authenticated users" ON fee_types;

-- Disable RLS temporarily to avoid recursion issues
ALTER TABLE fee_types DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;

-- Create simple policy that allows all authenticated users to read
CREATE POLICY "Allow authenticated users to read fee types" ON fee_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create simple policy that allows all authenticated users to manage (temporarily)
-- This avoids the recursion issue while still providing basic security
CREATE POLICY "Allow authenticated users to manage fee types" ON fee_types
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure the trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_fee_types_updated_at ON fee_types;
CREATE TRIGGER update_fee_types_updated_at 
    BEFORE UPDATE ON fee_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default fee types if they don't exist
INSERT INTO fee_types (name, description, amount, is_active) VALUES
    ('Rent', 'Monthly rent payment for the flat', 5000.00, true),
    ('Maintenance Fee', 'Monthly maintenance charges for building upkeep', 1500.00, true),
    ('Electricity', 'Monthly electricity bill payment', 800.00, true),
    ('Water', 'Monthly water bill payment', 300.00, true),
    ('Parking', 'Monthly parking fee', 500.00, true),
    ('Security Deposit', 'One-time security deposit', 10000.00, true)
ON CONFLICT (name) DO NOTHING; 