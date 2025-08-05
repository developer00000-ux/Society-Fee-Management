-- Create fee_types table
CREATE TABLE IF NOT EXISTS fee_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_fee_types_name ON fee_types(name);

-- Create index on is_active for filtering active fee types
CREATE INDEX IF NOT EXISTS idx_fee_types_active ON fee_types(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read fee types
CREATE POLICY "Allow authenticated users to read fee types" ON fee_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow block managers to manage fee types
-- Simplified policy to avoid recursion
CREATE POLICY "Allow block managers to manage fee types" ON fee_types
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'block_manager'
            LIMIT 1
        )
    );

-- Alternative simpler policy if the above still causes issues
-- Uncomment the following and comment out the above policy if needed
/*
CREATE POLICY "Allow block managers to manage fee types" ON fee_types
    FOR ALL USING (auth.role() = 'authenticated');
*/

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fee_types_updated_at 
    BEFORE UPDATE ON fee_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default fee types
INSERT INTO fee_types (name, description, amount, is_active) VALUES
    ('Rent', 'Monthly rent payment for the flat', 5000.00, true),
    ('Maintenance Fee', 'Monthly maintenance charges for building upkeep', 1500.00, true),
    ('Electricity', 'Monthly electricity bill payment', 800.00, true),
    ('Water', 'Monthly water bill payment', 300.00, true),
    ('Parking', 'Monthly parking fee', 500.00, true),
    ('Security Deposit', 'One-time security deposit', 10000.00, true)
ON CONFLICT (name) DO NOTHING; 