-- Fix foreign key constraint for members table
-- Drop the existing foreign key constraint that references blocks table
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_block_id_fkey;

-- Add the correct foreign key constraint that references buildings table
ALTER TABLE members ADD CONSTRAINT members_block_id_fkey 
  FOREIGN KEY (block_id) REFERENCES buildings(id) ON DELETE SET NULL;

-- Also remove the blocks table if it exists (since we're not using it)
DROP TABLE IF EXISTS blocks CASCADE;

-- Remove the RLS policy for blocks table if it exists (handle case where table doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocks') THEN
        DROP POLICY IF EXISTS "Allow all operations on blocks" ON blocks;
    END IF;
END $$; 