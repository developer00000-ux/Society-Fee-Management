-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'colony_admin', 'block_manager', 'resident')),
  colony_id UUID,
  building_id UUID,
  flat_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colonies (Residential complexes)
CREATE TABLE IF NOT EXISTS colonies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  total_buildings INTEGER DEFAULT 0,
  total_flats INTEGER DEFAULT 0,
  admin_id UUID REFERENCES user_profiles(id),
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings/Blocks within colonies
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building_type TEXT NOT NULL,
  total_floors INTEGER NOT NULL,
  total_flats INTEGER NOT NULL,
  manager_id UUID REFERENCES user_profiles(id),
  has_lift BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  construction_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Floors within buildings
CREATE TABLE IF NOT EXISTS floors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  floor_name TEXT,
  total_flats INTEGER NOT NULL,
  base_maintenance_charge DECIMAL(10,2) DEFAULT 0,
  floor_area_sqft INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual flats/units
CREATE TABLE IF NOT EXISTS flats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  flat_number TEXT NOT NULL,
  flat_type TEXT NOT NULL,
  area_sqft INTEGER,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'rented', 'maintenance')),
  monthly_rent DECIMAL(10,2) DEFAULT 0,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  owner_id UUID REFERENCES user_profiles(id),
  tenant_id UUID REFERENCES user_profiles(id),
  lease_start_date DATE,
  lease_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill categories for flexible billing
CREATE TABLE IF NOT EXISTS bill_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  applies_to TEXT NOT NULL CHECK (applies_to IN ('colony', 'building', 'floor', 'flat')),
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES bill_categories(id),
  amount DECIMAL(10,2) NOT NULL,
  billing_month TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  description TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_id TEXT,
  gateway_response JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'maintenance', 'billing', 'emergency', 'event')),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('colony', 'building', 'floor', 'flat')),
  scope_id UUID,
  is_urgent BOOLEAN DEFAULT false,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking login/logout
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Legacy tables for backward compatibility
CREATE TABLE IF NOT EXISTS fee_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  block TEXT NOT NULL,
  member_name TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  months TEXT[] NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  total_fee DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Members table (block_id references buildings table)
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  block_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  flat_id UUID REFERENCES flats(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for user_profiles (with error handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_profiles_colony') THEN
        ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_colony FOREIGN KEY (colony_id) REFERENCES colonies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_profiles_building') THEN
        ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_profiles_flat') THEN
        ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for colonies (with error handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_colonies_admin') THEN
        ALTER TABLE colonies ADD CONSTRAINT fk_colonies_admin FOREIGN KEY (admin_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for buildings (with error handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_buildings_manager') THEN
        ALTER TABLE buildings ADD CONSTRAINT fk_buildings_manager FOREIGN KEY (manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for flats (with error handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_flats_owner') THEN
        ALTER TABLE flats ADD CONSTRAINT fk_flats_owner FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_flats_tenant') THEN
        ALTER TABLE flats ADD CONSTRAINT fk_flats_tenant FOREIGN KEY (tenant_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Note: Foreign key constraints for maintenance_requests are defined inline in the table creation

-- Note: Foreign key constraints for announcements are defined inline in the table creation

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_colony_id ON user_profiles(colony_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_building_id ON user_profiles(building_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_flat_id ON user_profiles(flat_id);
CREATE INDEX IF NOT EXISTS idx_buildings_colony_id ON buildings(colony_id);
CREATE INDEX IF NOT EXISTS idx_floors_building_id ON floors(building_id);
CREATE INDEX IF NOT EXISTS idx_flats_floor_id ON flats(floor_id);
CREATE INDEX IF NOT EXISTS idx_bills_flat_id ON bills(flat_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_flat_id ON maintenance_requests(flat_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_announcements_scope_type ON announcements(scope_type);
CREATE INDEX IF NOT EXISTS idx_announcements_scope_id ON announcements(scope_id);
CREATE INDEX IF NOT EXISTS idx_members_block_id ON members(block_id);
CREATE INDEX IF NOT EXISTS idx_members_flat_id ON members(flat_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (with error handling)
DO $$
BEGIN
    -- Create triggers only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_colonies_updated_at') THEN
        CREATE TRIGGER update_colonies_updated_at BEFORE UPDATE ON colonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_buildings_updated_at') THEN
        CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_flats_updated_at') THEN
        CREATE TRIGGER update_flats_updated_at BEFORE UPDATE ON flats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bills_updated_at') THEN
        CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_requests_updated_at') THEN
        CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
ALTER TABLE fee_entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
DO $$
BEGIN
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can view their own profile" ON user_profiles
          FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can update their own profile" ON user_profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can view all profiles' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Super admins can view all profiles" ON user_profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND role = 'super_admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can update all profiles' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Super admins can update all profiles" ON user_profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND role = 'super_admin'
            )
          );
    END IF;
END $$;

-- Create RLS policies for colonies
DO $$
BEGIN
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view colonies they belong to' AND tablename = 'colonies') THEN
        CREATE POLICY "Users can view colonies they belong to" ON colonies
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND colony_id = colonies.id
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can view all colonies' AND tablename = 'colonies') THEN
        CREATE POLICY "Super admins can view all colonies" ON colonies
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND role = 'super_admin'
            )
          );
    END IF;
END $$;

-- Create RLS policies for buildings
DO $$
BEGIN
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view buildings in their colony' AND tablename = 'buildings') THEN
        CREATE POLICY "Users can view buildings in their colony" ON buildings
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND colony_id = buildings.colony_id
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can view all buildings' AND tablename = 'buildings') THEN
        CREATE POLICY "Super admins can view all buildings" ON buildings
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND role = 'super_admin'
            )
          );
    END IF;
END $$;

-- Create RLS policies for flats
DO $$
BEGIN
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view flats in their building' AND tablename = 'flats') THEN
        CREATE POLICY "Users can view flats in their building" ON flats
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND building_id = (
                SELECT building_id FROM floors WHERE id = flats.floor_id
              )
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can view all flats' AND tablename = 'flats') THEN
        CREATE POLICY "Super admins can view all flats" ON flats
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE id = auth.uid() AND role = 'super_admin'
            )
          );
    END IF;
END $$;

-- Insert default data
INSERT INTO bill_categories (name, description, applies_to, is_recurring) VALUES
('Maintenance Fee', 'Monthly maintenance charges', 'flat', true),
('Water Bill', 'Water consumption charges', 'flat', true),
('Electricity Bill', 'Electricity consumption charges', 'flat', true),
('Parking Fee', 'Vehicle parking charges', 'flat', true),
('Security Fee', 'Security service charges', 'colony', true),
('Garbage Collection', 'Waste management charges', 'colony', true),
('Common Area Maintenance', 'Common area upkeep charges', 'building', true),
('Lift Maintenance', 'Elevator maintenance charges', 'building', true);

-- Insert a default colony
INSERT INTO colonies (id, name, address, city, state, pincode, total_buildings, total_flats) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sunrise Colony', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 2, 16);

-- Insert default buildings (replacing blocks)
INSERT INTO buildings (id, name, building_type, total_floors, total_flats, colony_id) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Block A', 'residential', 4, 8, '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440031', 'Block B', 'residential', 4, 8, '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440032', 'Block C', 'commercial', 2, 4, '550e8400-e29b-41d4-a716-446655440001');

-- Function to disable RLS for testing
CREATE OR REPLACE FUNCTION disable_rls(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql;

-- Function to enable RLS
CREATE OR REPLACE FUNCTION enable_rls(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql;
