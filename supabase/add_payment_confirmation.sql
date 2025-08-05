-- Add payment confirmation field to fee_entries table
-- This field will track whether a payment has been confirmed by admin/block manager

-- Add created_by column first (if it doesn't exist)
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add payment_confirmed column to fee_entries table
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false;

-- Add payment_confirmed_by column to track who confirmed the payment
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS payment_confirmed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add payment_confirmed_at column to track when the payment was confirmed
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance on payment confirmation queries
CREATE INDEX IF NOT EXISTS idx_fee_entries_payment_confirmed ON fee_entries(payment_confirmed);
CREATE INDEX IF NOT EXISTS idx_fee_entries_payment_confirmed_by ON fee_entries(payment_confirmed_by);
CREATE INDEX IF NOT EXISTS idx_fee_entries_created_by ON fee_entries(created_by);

-- Create a function to automatically confirm payments for non-cash/non-request payment types
CREATE OR REPLACE FUNCTION auto_confirm_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm payments that are not cash or payment requests
    IF NEW.payment_type NOT IN ('Cash', 'Request Payment') THEN
        NEW.payment_confirmed = true;
        NEW.payment_confirmed_at = NOW();
        -- Set confirmed_by to the user who created the entry
        NEW.payment_confirmed_by = NEW.created_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm payments
DROP TRIGGER IF EXISTS trigger_auto_confirm_payment ON fee_entries;
CREATE TRIGGER trigger_auto_confirm_payment
    BEFORE INSERT ON fee_entries
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_payment();

-- Add RLS policies for payment confirmation
-- Only admins and block managers can confirm payments
CREATE POLICY "Allow payment confirmation by admins and block managers" ON fee_entries
    FOR UPDATE USING (
        (auth.jwt() ->> 'role')::text IN ('super_admin', 'colony_admin', 'block_manager') AND
        payment_type IN ('Cash', 'Request Payment')
    );

-- Allow users to view their own entries and admins/block managers to view all
CREATE POLICY "Allow users to view fee entries" ON fee_entries
    FOR SELECT USING (
        (auth.jwt() ->> 'role')::text IN ('super_admin', 'colony_admin', 'block_manager') OR
        created_by = auth.uid()
    );

-- Allow users to create their own entries
CREATE POLICY "Allow users to create fee entries" ON fee_entries
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
    );

-- Add comments to explain the payment confirmation logic
COMMENT ON COLUMN fee_entries.created_by IS 'User ID of the person who created the fee entry';
COMMENT ON COLUMN fee_entries.payment_confirmed IS 'Whether the payment has been confirmed by admin/block manager. Auto-confirmed for non-cash/non-request payments.';
COMMENT ON COLUMN fee_entries.payment_confirmed_by IS 'User ID of the admin/block manager who confirmed the payment';
COMMENT ON COLUMN fee_entries.payment_confirmed_at IS 'Timestamp when the payment was confirmed';

-- Update existing entries to auto-confirm non-cash/non-request payments
-- Note: This will only work for entries that have created_by set
UPDATE fee_entries 
SET 
    payment_confirmed = true,
    payment_confirmed_at = created_at,
    payment_confirmed_by = created_by
WHERE payment_type NOT IN ('Cash', 'Request Payment') 
AND payment_confirmed IS NULL
AND created_by IS NOT NULL; 