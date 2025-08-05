-- Add block_id and flat_id columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS flat_id UUID REFERENCES flats(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_block_id ON members(block_id);
CREATE INDEX IF NOT EXISTS idx_members_flat_id ON members(flat_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id); 