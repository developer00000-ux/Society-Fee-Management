-- Add payment status fields to fee_entries table
ALTER TABLE fee_entries 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_confirmed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);

-- Create index for status field
CREATE INDEX IF NOT EXISTS idx_fee_entries_status ON fee_entries(status);
CREATE INDEX IF NOT EXISTS idx_fee_entries_payment_confirmed ON fee_entries(payment_confirmed); 