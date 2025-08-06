-- Add updated_at column to fee_entries table
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for fee_entries table
DROP TRIGGER IF EXISTS update_fee_entries_updated_at ON fee_entries;
CREATE TRIGGER update_fee_entries_updated_at
    BEFORE UPDATE ON fee_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 