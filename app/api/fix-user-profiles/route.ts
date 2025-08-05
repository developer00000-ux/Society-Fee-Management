import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const serverClient = createServerClient()
    
    // Get existing auth users
    const { data: authUsers, error: authError } = await serverClient.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 500 })
    }

    const demoUsers = [
      {
        email: 'superadmin@demo.com',
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+91-9876543200',
        colonyId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        email: 'colonyadmin@demo.com',
        role: 'colony_admin',
        firstName: 'Colony',
        lastName: 'Admin',
        phone: '+91-9876543201',
        colonyId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        email: 'blockmanager@demo.com',
        role: 'block_manager',
        firstName: 'Block',
        lastName: 'Manager',
        phone: '+91-9876543202',
        colonyId: '550e8400-e29b-41d4-a716-446655440001',
        buildingId: '550e8400-e29b-41d4-a716-446655440002'
      },
      {
        email: 'resident1@demo.com',
        role: 'resident',
        firstName: 'John',
        lastName: 'Resident',
        phone: '+91-9876543203',
        colonyId: '550e8400-e29b-41d4-a716-446655440001',
        buildingId: '550e8400-e29b-41d4-a716-446655440002',
        flatId: '550e8400-e29b-41d4-a716-446655440009'
      },
      {
        email: 'resident2@demo.com',
        role: 'resident',
        firstName: 'Jane',
        lastName: 'Resident',
        phone: '+91-9876543204',
        colonyId: '550e8400-e29b-41d4-a716-446655440001',
        buildingId: '550e8400-e29b-41d4-a716-446655440002',
        flatId: '550e8400-e29b-41d4-a716-446655440010'
      }
    ]

    const updatedProfiles = []
    const errors = []

    for (const demoUser of demoUsers) {
      try {
        // Find the auth user
        const authUser = authUsers.users.find(user => user.email === demoUser.email)
        
        if (!authUser) {
          errors.push(`Auth user not found for ${demoUser.email}`)
          continue
        }

        // Check if user profile exists
        const { data: existingProfile } = await serverClient
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await serverClient
            .from('user_profiles')
            .update({
              role: demoUser.role,
              first_name: demoUser.firstName,
              last_name: demoUser.lastName,
              phone: demoUser.phone,
              colony_id: demoUser.colonyId,
              building_id: demoUser.buildingId || null,
              flat_id: demoUser.flatId || null,
              is_active: true
            })
            .eq('id', authUser.id)

          if (updateError) {
            errors.push(`Failed to update profile for ${demoUser.email}: ${updateError.message}`)
            continue
          }
        } else {
          // Create new profile
          const { error: insertError } = await serverClient
            .from('user_profiles')
            .insert({
              id: authUser.id,
              role: demoUser.role,
              first_name: demoUser.firstName,
              last_name: demoUser.lastName,
              phone: demoUser.phone,
              colony_id: demoUser.colonyId,
              building_id: demoUser.buildingId || null,
              flat_id: demoUser.flatId || null,
              is_active: true
            })

          if (insertError) {
            errors.push(`Failed to create profile for ${demoUser.email}: ${insertError.message}`)
            continue
          }
        }

        updatedProfiles.push({
          email: demoUser.email,
          role: demoUser.role,
          authId: authUser.id
        })

      } catch (error) {
        errors.push(`Error processing ${demoUser.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User profiles updated successfully',
      updatedProfiles,
      errors,
      totalAuthUsers: authUsers.users.length
    })

  } catch (error) {
    console.error('Error fixing user profiles:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 