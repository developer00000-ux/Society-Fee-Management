-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS bill_categories CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS flats CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS colonies CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS flat_status CASCADE;
DROP TYPE IF EXISTS bill_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS maintenance_priority CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;
DROP TYPE IF EXISTS announcement_type CASCADE;
DROP TYPE IF EXISTS announcement_scope CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('super_admin', 'colony_admin', 'block_manager', 'resident');
CREATE TYPE flat_status AS ENUM ('vacant', 'occupied', 'rented', 'maintenance');
CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE maintenance_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE announcement_type AS ENUM ('general', 'maintenance', 'billing', 'emergency', 'event');
CREATE TYPE announcement_scope AS ENUM ('colony', 'building', 'floor', 'flat');
CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'resident',
  colony_id UUID, -- NULL for super_admin
  building_id UUID, -- NULL for super_admin, colony_admin  
  flat_id UUID, -- Only for residents
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colonies (Residential complexes)
CREATE TABLE IF NOT EXISTS colonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  total_buildings INTEGER DEFAULT 0,
  total_flats INTEGER DEFAULT 0,
  admin_id UUID REFERENCES user_profiles(id),
  subscription_plan subscription_plan DEFAULT 'starter',
  subscription_status subscription_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings/Blocks within colonies
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID REFERENCES colonies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  building_type VARCHAR(50) DEFAULT 'residential',
  total_floors INTEGER NOT NULL,
  total_flats INTEGER DEFAULT 0,
  manager_id UUID REFERENCES user_profiles(id),
  has_lift BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  construction_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Floors within buildings  
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  floor_name VARCHAR(50), -- 'Ground Floor', 'First Floor', etc.
  total_flats INTEGER NOT NULL,
  base_maintenance_charge DECIMAL(10,2) DEFAULT 0,
  floor_area_sqft DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, floor_number)
);

-- Individual flats/units
CREATE TABLE IF NOT EXISTS flats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  flat_number VARCHAR(50) NOT NULL,
  flat_type VARCHAR(20) DEFAULT '2bhk',
  area_sqft DECIMAL(10,2),
  status flat_status DEFAULT 'vacant',
  monthly_rent DECIMAL(10,2) DEFAULT 0,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  owner_id UUID REFERENCES user_profiles(id),
  tenant_id UUID REFERENCES user_profiles(id),
  lease_start_date DATE,
  lease_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(floor_id, flat_number)
);

-- Bill categories for flexible billing
CREATE TABLE IF NOT EXISTS bill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- 'rent', 'maintenance', 'electricity', 'water', 'security'
  description TEXT,
  applies_to announcement_scope NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly bills for residents
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id UUID REFERENCES flats(id) ON DELETE CASCADE,
  category_id UUID REFERENCES bill_categories(id),
  amount DECIMAL(10,2) NOT NULL,
  billing_month DATE NOT NULL, -- First day of billing month
  due_date DATE NOT NULL,
  status bill_status DEFAULT 'pending',
  description TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_id VARCHAR(255) UNIQUE,
  gateway_response JSONB,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance requests from residents
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id UUID REFERENCES flats(id) ON DELETE CASCADE,
  category VARCHAR(50), -- 'plumbing', 'electrical', 'appliance', 'structural', 'cleaning', 'other'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority maintenance_priority DEFAULT 'medium',
  status maintenance_status DEFAULT 'pending',
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  assigned_to VARCHAR(255), -- Vendor/maintenance person
  created_by UUID REFERENCES user_profiles(id),
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements and notifications
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type announcement_type DEFAULT 'general',
  scope_type announcement_scope NOT NULL,
  scope_id UUID, -- ID of colony/building/floor/flat depending on scope_type
  is_urgent BOOLEAN DEFAULT false,
  valid_until DATE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session tracking for security
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_colony_id ON user_profiles(colony_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_building_id ON user_profiles(building_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_flat_id ON user_profiles(flat_id);

CREATE INDEX IF NOT EXISTS idx_colonies_admin_id ON colonies(admin_id);
CREATE INDEX IF NOT EXISTS idx_colonies_subscription_status ON colonies(subscription_status);

CREATE INDEX IF NOT EXISTS idx_buildings_colony_id ON buildings(colony_id);
CREATE INDEX IF NOT EXISTS idx_buildings_manager_id ON buildings(manager_id);

CREATE INDEX IF NOT EXISTS idx_floors_building_id ON floors(building_id);
CREATE INDEX IF NOT EXISTS idx_floors_floor_number ON floors(floor_number);

CREATE INDEX IF NOT EXISTS idx_flats_floor_id ON flats(floor_id);
CREATE INDEX IF NOT EXISTS idx_flats_owner_id ON flats(owner_id);
CREATE INDEX IF NOT EXISTS idx_flats_tenant_id ON flats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_flats_status ON flats(status);

CREATE INDEX IF NOT EXISTS idx_bills_flat_id ON bills(flat_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_billing_month ON bills(billing_month);

CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_flat_id ON maintenance_requests(flat_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);

CREATE INDEX IF NOT EXISTS idx_announcements_scope_type ON announcements(scope_type);
CREATE INDEX IF NOT EXISTS idx_announcements_scope_id ON announcements(scope_id);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_profiles_policy" ON user_profiles;
DROP POLICY IF EXISTS "colonies_policy" ON colonies;
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "floors_policy" ON floors;
DROP POLICY IF EXISTS "flats_policy" ON flats;
DROP POLICY IF EXISTS "bill_categories_policy" ON bill_categories;
DROP POLICY IF EXISTS "bills_policy" ON bills;
DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "maintenance_requests_policy" ON maintenance_requests;
DROP POLICY IF EXISTS "announcements_policy" ON announcements;
DROP POLICY IF EXISTS "user_sessions_policy" ON user_sessions;

-- Create RLS policies
-- Users can only see their own profile and users they manage
CREATE POLICY "user_profiles_policy" ON user_profiles FOR ALL USING (
  auth.uid() = id OR
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid())) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))
);

-- Colony access based on role
CREATE POLICY "colonies_policy" ON colonies FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND admin_id = auth.uid()) OR
  (auth.jwt() ->> 'role' IN ('block_manager', 'resident') AND id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid()))
);

-- Building access based on role and colony
CREATE POLICY "buildings_policy" ON buildings FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid())) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND manager_id = auth.uid()) OR
  (auth.jwt() ->> 'role' = 'resident' AND id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))
);

-- Floor access based on building
CREATE POLICY "floors_policy" ON floors FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND building_id IN (SELECT id FROM buildings WHERE colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid()))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid())) OR
  (auth.jwt() ->> 'role' = 'resident' AND building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))
);

-- Flat access based on role
CREATE POLICY "flats_policy" ON flats FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND floor_id IN (SELECT id FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid())))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND floor_id IN (SELECT id FROM floors WHERE building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))) OR
  (auth.jwt() ->> 'role' = 'resident' AND (owner_id = auth.uid() OR tenant_id = auth.uid()))
);

-- Bill categories - all roles can read
CREATE POLICY "bill_categories_policy" ON bill_categories FOR ALL USING (true);

-- Bills access based on flat ownership
CREATE POLICY "bills_policy" ON bills FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid()))))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid())))) OR
  (auth.jwt() ->> 'role' = 'resident' AND flat_id IN (SELECT id FROM flats WHERE owner_id = auth.uid() OR tenant_id = auth.uid()))
);

-- Payments access based on bill ownership
CREATE POLICY "payments_policy" ON payments FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND bill_id IN (SELECT id FROM bills WHERE flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid())))))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND bill_id IN (SELECT id FROM bills WHERE flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))))) OR
  (auth.jwt() ->> 'role' = 'resident' AND bill_id IN (SELECT id FROM bills WHERE flat_id IN (SELECT id FROM flats WHERE owner_id = auth.uid() OR tenant_id = auth.uid())))
);

-- Maintenance requests access
CREATE POLICY "maintenance_requests_policy" ON maintenance_requests FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE colony_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid()))))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND flat_id IN (SELECT id FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid())))) OR
  (auth.jwt() ->> 'role' = 'resident' AND created_by = auth.uid())
);

-- Announcements access based on scope
CREATE POLICY "announcements_policy" ON announcements FOR ALL USING (
  (auth.jwt() ->> 'role' = 'super_admin') OR
  (auth.jwt() ->> 'role' = 'colony_admin' AND (scope_type = 'colony' AND scope_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid()))) OR
  (auth.jwt() ->> 'role' = 'block_manager' AND (scope_type = 'building' AND scope_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid()))) OR
  (auth.jwt() ->> 'role' = 'resident' AND (
    (scope_type = 'colony' AND scope_id = (SELECT colony_id FROM user_profiles WHERE id = auth.uid())) OR
    (scope_type = 'building' AND scope_id = (SELECT building_id FROM user_profiles WHERE id = auth.uid())) OR
    (scope_type = 'flat' AND scope_id = (SELECT flat_id FROM user_profiles WHERE id = auth.uid()))
  ))
);

-- User sessions - users can only see their own sessions
CREATE POLICY "user_sessions_policy" ON user_sessions FOR ALL USING (
  user_id = auth.uid()
);

-- Insert default bill categories
INSERT INTO bill_categories (name, description, applies_to, is_recurring) VALUES
('Rent', 'Monthly rent payment', 'flat', true),
('Maintenance', 'Monthly maintenance charges', 'flat', true),
('Electricity', 'Electricity bill', 'flat', true),
('Water', 'Water bill', 'flat', true),
('Security', 'Security guard charges', 'building', true),
('Lift Maintenance', 'Lift maintenance and repair', 'building', true),
('Garden Maintenance', 'Garden and landscaping', 'colony', true),
('Common Area', 'Common area maintenance', 'colony', true),
('Parking', 'Parking charges', 'flat', true),
('Garbage Collection', 'Garbage collection charges', 'building', true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colonies_updated_at BEFORE UPDATE ON colonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flats_updated_at BEFORE UPDATE ON flats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data for testing
-- Note: These users need to be created in Supabase Auth first, then their profiles will be linked

-- Demo Colony
INSERT INTO colonies (id, name, address, city, state, pincode, total_buildings, total_flats, subscription_plan, subscription_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', '123 Green Valley Road', 'Mumbai', 'Maharashtra', '400001', 3, 24, 'professional', 'active');

-- Demo Buildings
INSERT INTO buildings (id, colony_id, name, building_type, total_floors, total_flats, has_lift, has_parking, construction_year) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Building A', 'residential', 4, 8, true, true, 2020),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Building B', 'residential', 4, 8, true, true, 2020),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Building C', 'residential', 4, 8, true, true, 2020);

-- Demo Floors
INSERT INTO floors (id, building_id, floor_number, floor_name, total_flats, base_maintenance_charge) VALUES
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 1, 'Ground Floor', 2, 500),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 2, 'First Floor', 2, 500),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 3, 'Second Floor', 2, 500),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 4, 'Third Floor', 2, 500);

-- Demo Flats
INSERT INTO flats (id, floor_id, flat_number, flat_type, area_sqft, status, monthly_rent, security_deposit) VALUES
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'A-101', '2bhk', 1200, 'occupied', 15000, 30000),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'A-102', '2bhk', 1200, 'occupied', 15000, 30000),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', 'A-201', '3bhk', 1500, 'occupied', 20000, 40000),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', 'A-202', '3bhk', 1500, 'vacant', 20000, 40000);

-- Update colony with actual counts
UPDATE colonies SET 
  total_buildings = (SELECT COUNT(*) FROM buildings WHERE colony_id = '550e8400-e29b-41d4-a716-446655440001'),
  total_flats = (SELECT COUNT(*) FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE colony_id = '550e8400-e29b-41d4-a716-446655440001')))
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Update buildings with actual counts
UPDATE buildings SET 
  total_flats = (SELECT COUNT(*) FROM flats WHERE floor_id IN (SELECT id FROM floors WHERE building_id = buildings.id))
WHERE colony_id = '550e8400-e29b-41d4-a716-446655440001'; 