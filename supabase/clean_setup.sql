-- Clean setup script to fix all issues
-- Run this script to properly set up the database

-- 1. Fix foreign key constraint for members table
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_block_id_fkey;
ALTER TABLE members ADD CONSTRAINT members_block_id_fkey 
  FOREIGN KEY (block_id) REFERENCES buildings(id) ON DELETE SET NULL;

-- 2. Remove blocks table if it exists
DROP TABLE IF EXISTS blocks CASCADE;

-- 3. Remove RLS policy for blocks table
DROP POLICY IF EXISTS "Allow all operations on blocks" ON blocks;

-- 4. Clean up existing data to avoid duplicates
DELETE FROM bill_categories;
DELETE FROM buildings;
DELETE FROM colonies;

-- 5. Insert default colony
INSERT INTO colonies (id, name, address, city, state, pincode, total_buildings, total_flats) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sunrise Colony', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 2, 16);

-- 6. Insert default buildings
INSERT INTO buildings (id, name, building_type, total_floors, total_flats, colony_id) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Block A', 'residential', 4, 8, '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440031', 'Block B', 'residential', 4, 8, '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440032', 'Block C', 'commercial', 2, 4, '550e8400-e29b-41d4-a716-446655440001');

-- 7. Insert default bill categories
INSERT INTO bill_categories (name, description, applies_to, is_recurring) VALUES
('Maintenance Fee', 'Monthly maintenance charges', 'flat', true),
('Water Bill', 'Water consumption charges', 'flat', true),
('Electricity Bill', 'Electricity consumption charges', 'flat', true),
('Parking Fee', 'Vehicle parking charges', 'flat', true),
('Security Fee', 'Security service charges', 'colony', true),
('Garbage Collection', 'Waste management charges', 'colony', true),
('Common Area Maintenance', 'Common area upkeep charges', 'building', true),
('Lift Maintenance', 'Elevator maintenance charges', 'building', true);

-- 8. Verify the setup
SELECT 'Setup completed successfully' as status; 