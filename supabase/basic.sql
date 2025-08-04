-- Create the fee_entries table
CREATE TABLE IF NOT EXISTS fee_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block VARCHAR(10) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  flat_number VARCHAR(50) NOT NULL,
  months TEXT[] NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  total_fee DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_name VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flats table
CREATE TABLE IF NOT EXISTS flats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number VARCHAR(50) NOT NULL,
  block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  floor_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flat_number, block_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fee_entries_block ON fee_entries(block);
CREATE INDEX IF NOT EXISTS idx_fee_entries_member_name ON fee_entries(member_name);
CREATE INDEX IF NOT EXISTS idx_fee_entries_created_at ON fee_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_name ON blocks(block_name);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_flats_number ON flats(flat_number);
CREATE INDEX IF NOT EXISTS idx_flats_block ON flats(block_id);

-- Enable Row Level Security (RLS)
ALTER TABLE fee_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on fee_entries" ON fee_entries;
DROP POLICY IF EXISTS "Allow all operations on blocks" ON blocks;
DROP POLICY IF EXISTS "Allow all operations on members" ON members;
DROP POLICY IF EXISTS "Allow all operations on flats" ON flats;

-- Create policies that allow all operations (you can modify this based on your needs)
CREATE POLICY "Allow all operations on fee_entries" ON fee_entries
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on blocks" ON blocks
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on members" ON members
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on flats" ON flats
  FOR ALL USING (true); 