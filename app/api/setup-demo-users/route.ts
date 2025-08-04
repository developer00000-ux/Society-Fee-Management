import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Demo user credentials
    const demoUsers = [
      {
        email: 'superadmin@example.com',
        password: 'password123',
        profile: {
          id: '7f826414-74f4-44a2-b311-c2bdf9cf682a',
          role: 'super_admin',
          first_name: 'Super',
          last_name: 'Admin',
          phone: '+91-9876543210'
        }
      },
      {
        email: 'colonyadmin@example.com',
        password: 'password123',
        profile: {
          id: 'b7619d9c-06ea-4340-9df5-839639765212',
          role: 'colony_admin',
          colony_id: '550e8400-e29b-41d4-a716-446655440001',
          first_name: 'Colony',
          last_name: 'Manager',
          phone: '+91-9876543211'
        }
      },
      {
        email: 'blockmanager@example.com',
        password: 'password123',
        profile: {
          id: 'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
          role: 'block_manager',
          colony_id: '550e8400-e29b-41d4-a716-446655440001',
          building_id: '550e8400-e29b-41d4-a716-446655440002',
          first_name: 'Block',
          last_name: 'Manager',
          phone: '+91-9876543212'
        }
      },
      {
        email: 'resident1@example.com',
        password: 'password123',
        profile: {
          id: '23b05656-eaa7-42d2-88be-9858d4e865b9',
          role: 'resident',
          colony_id: '550e8400-e29b-41d4-a716-446655440001',
          building_id: '550e8400-e29b-41d4-a716-446655440002',
          flat_id: '550e8400-e29b-41d4-a716-446655440009',
          first_name: 'John',
          last_name: 'Resident',
          phone: '+91-9876543213'
        }
      }
    ]

    const results = []

    for (const user of demoUsers) {
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: user.profile.role
          }
        })

        if (authError) {
          results.push({
            email: user.email,
            success: false,
            error: authError.message
          })
          continue
        }

        if (!authData.user) {
          results.push({
            email: user.email,
            success: false,
            error: 'Failed to create user'
          })
          continue
        }

        // Create user profile using the actual generated user ID
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: authData.user.id, // Use the actual generated ID
            role: user.profile.role,
            colony_id: user.profile.colony_id,
            building_id: user.profile.building_id,
            flat_id: user.profile.flat_id,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            phone: user.profile.phone,
            is_active: true
          })

        if (profileError) {
          results.push({
            email: user.email,
            success: false,
            error: profileError.message
          })
        } else {
          // Update colony admin, building manager, and flat assignments based on role
          if (user.profile.role === 'colony_admin') {
            await supabase
              .from('colonies')
              .update({ admin_id: authData.user.id })
              .eq('id', user.profile.colony_id)
          } else if (user.profile.role === 'block_manager') {
            await supabase
              .from('buildings')
              .update({ manager_id: authData.user.id })
              .eq('id', user.profile.building_id)
          } else if (user.profile.role === 'resident') {
            await supabase
              .from('flats')
              .update({ 
                owner_id: authData.user.id,
                tenant_id: authData.user.id 
              })
              .eq('id', user.profile.flat_id)
          }

          results.push({
            email: user.email,
            success: true,
            message: 'User created successfully'
          })
        }
      } catch (error) {
        results.push({
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Create demo data after all users are created
    try {
      // Get the created user IDs for demo data by role
      const { data: colonyAdmin } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'colony_admin')
        .single()

      const { data: blockManager } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'block_manager')
        .single()

      const { data: resident } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'resident')
        .single()

      // Create demo bills
      if (colonyAdmin && resident) {
        await supabase
          .from('bills')
          .insert({
            flat_id: '550e8400-e29b-41d4-a716-446655440009',
            category_id: (await supabase.from('bill_categories').select('id').eq('name', 'Maintenance').single()).data?.id,
            amount: 500,
            billing_month: '2024-01-01',
            due_date: '2024-01-15',
            status: 'pending',
            description: 'January 2024 Maintenance',
            created_by: colonyAdmin.id
          })
      }

      // Create demo maintenance requests
      if (resident) {
        await supabase
          .from('maintenance_requests')
          .insert({
            flat_id: '550e8400-e29b-41d4-a716-446655440009',
            category: 'plumbing',
            title: 'Leaky Faucet',
            description: 'Kitchen faucet is leaking water',
            priority: 'medium',
            status: 'pending',
            created_by: resident.id
          })
      }

      // Create demo announcements
      if (colonyAdmin && blockManager) {
        await supabase
          .from('announcements')
          .insert([
            {
              title: 'Society Meeting',
              content: 'Monthly society meeting on 15th January at 6 PM in the community hall.',
              type: 'event',
              scope_type: 'colony',
              scope_id: '550e8400-e29b-41d4-a716-446655440001',
              is_urgent: false,
              created_by: colonyAdmin.id
            },
            {
              title: 'Water Supply Interruption',
              content: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance.',
              type: 'maintenance',
              scope_type: 'building',
              scope_id: '550e8400-e29b-41d4-a716-446655440002',
              is_urgent: true,
              created_by: blockManager.id
            },
            {
              title: 'New Security Guard',
              content: 'Welcome Mr. Rajesh as our new security guard. Please cooperate with him.',
              type: 'general',
              scope_type: 'colony',
              scope_id: '550e8400-e29b-41d4-a716-446655440001',
              is_urgent: false,
              created_by: colonyAdmin.id
            }
          ])
      }
    } catch (error) {
      console.error('Error creating demo data:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users setup completed',
      results
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
} 