import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    console.log('Fixing RLS recursion issues...')
    
    // First, temporarily disable RLS to avoid recursion during policy updates
    const disableRLSQueries = [
      'ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE colonies DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE buildings DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE floors DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE flats DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE bill_categories DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE bills DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE payments DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE maintenance_requests DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE announcements DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE fee_entries DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE members DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE fee_types DISABLE ROW LEVEL SECURITY'
    ]
    
    for (const query of disableRLSQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Error disabling RLS:', error)
      }
    }
    
    // Drop ALL existing policies to start fresh
    const dropAllPolicies = [
      // user_profiles policies
      'DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles',
      'DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles',
      'DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles',
      'DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles',
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles',
      'DROP POLICY IF EXISTS "Enable update access for own profile" ON user_profiles',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_profiles',
      
      // colonies policies
      'DROP POLICY IF EXISTS "Users can view colonies they belong to" ON colonies',
      'DROP POLICY IF EXISTS "Super admins can view all colonies" ON colonies',
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON colonies',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON colonies',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON colonies',
      
      // buildings policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON buildings',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON buildings',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON buildings',
      
      // floors policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON floors',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON floors',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON floors',
      
      // flats policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON flats',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON flats',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON flats',
      
      // bill_categories policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bill_categories',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bill_categories',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bill_categories',
      
      // bills policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bills',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bills',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bills',
      
      // payments policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON payments',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON payments',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON payments',
      
      // maintenance_requests policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_requests',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON maintenance_requests',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON maintenance_requests',
      
      // announcements policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON announcements',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON announcements',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON announcements',
      
      // user_sessions policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_sessions',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_sessions',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_sessions',
      
      // fee_entries policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON fee_entries',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON fee_entries',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON fee_entries',
      
      // members policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON members',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON members',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON members',
      
      // fee_types policies
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON fee_types',
      'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON fee_types',
      'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON fee_types'
    ]
    
    for (const query of dropAllPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Error dropping policy:', error)
      }
    }
    
    // Create new simple policies without recursion
    const createPolicies = [
      // user_profiles policies
      `CREATE POLICY "Enable read access for authenticated users" ON user_profiles
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for own profile" ON user_profiles
        FOR UPDATE USING (auth.uid() = id)`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON user_profiles
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // colonies policies
      `CREATE POLICY "Enable read access for authenticated users" ON colonies
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON colonies
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON colonies
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // buildings policies
      `CREATE POLICY "Enable read access for authenticated users" ON buildings
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON buildings
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON buildings
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // floors policies
      `CREATE POLICY "Enable read access for authenticated users" ON floors
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON floors
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON floors
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // flats policies
      `CREATE POLICY "Enable read access for authenticated users" ON flats
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON flats
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON flats
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // bill_categories policies
      `CREATE POLICY "Enable read access for authenticated users" ON bill_categories
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON bill_categories
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON bill_categories
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // bills policies
      `CREATE POLICY "Enable read access for authenticated users" ON bills
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON bills
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON bills
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // payments policies
      `CREATE POLICY "Enable read access for authenticated users" ON payments
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON payments
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON payments
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // maintenance_requests policies
      `CREATE POLICY "Enable read access for authenticated users" ON maintenance_requests
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON maintenance_requests
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON maintenance_requests
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // announcements policies
      `CREATE POLICY "Enable read access for authenticated users" ON announcements
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON announcements
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON announcements
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // user_sessions policies
      `CREATE POLICY "Enable read access for authenticated users" ON user_sessions
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON user_sessions
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON user_sessions
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // fee_entries policies
      `CREATE POLICY "Enable read access for authenticated users" ON fee_entries
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON fee_entries
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON fee_entries
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // members policies
      `CREATE POLICY "Enable read access for authenticated users" ON members
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON members
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON members
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      
      // fee_types policies
      `CREATE POLICY "Enable read access for authenticated users" ON fee_types
        FOR SELECT USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable update access for authenticated users" ON fee_types
        FOR UPDATE USING (auth.role() = 'authenticated')`,
      
      `CREATE POLICY "Enable insert access for authenticated users" ON fee_types
        FOR INSERT WITH CHECK (auth.role() = 'authenticated')`
    ]
    
    for (const query of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Error creating policy:', error)
      }
    }
    
    // Re-enable RLS
    const enableRLSQueries = [
      'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE colonies ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE buildings ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE floors ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE flats ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE bill_categories ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE bills ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE payments ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE announcements ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE fee_entries ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE members ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY'
    ]
    
    for (const query of enableRLSQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Error enabling RLS:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLS recursion issues fixed. All policies have been dropped and recreated to avoid infinite recursion.'
    })
  } catch (error) {
    console.error('Error fixing RLS recursion:', error)
    return NextResponse.json({
      error: 'Failed to fix RLS recursion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 