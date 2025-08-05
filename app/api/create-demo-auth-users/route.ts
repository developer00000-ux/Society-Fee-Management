import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const serverClient = createServerClient()
    
    // Create Supabase auth users with corresponding user profiles
    const demoUsers = [
      {
        email: 'superadmin@demo.com',
        password: 'superadmin123',
        profileId: '550e8400-e29b-41d4-a716-446655440011',
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin'
      },
      {
        email: 'colonyadmin@demo.com',
        password: 'colonyadmin123',
        profileId: '550e8400-e29b-41d4-a716-446655440012',
        role: 'colony_admin',
        firstName: 'Colony',
        lastName: 'Admin'
      },
      {
        email: 'blockmanager@demo.com',
        password: 'blockmanager123',
        profileId: '550e8400-e29b-41d4-a716-446655440013',
        role: 'block_manager',
        firstName: 'Block',
        lastName: 'Manager'
      },
      {
        email: 'resident1@demo.com',
        password: 'resident123',
        profileId: '550e8400-e29b-41d4-a716-446655440014',
        role: 'resident',
        firstName: 'John',
        lastName: 'Resident'
      },
      {
        email: 'resident2@demo.com',
        password: 'resident123',
        profileId: '550e8400-e29b-41d4-a716-446655440015',
        role: 'resident',
        firstName: 'Jane',
        lastName: 'Resident'
      }
    ]

    const createdUsers = []
    const errors = []

    for (const user of demoUsers) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await serverClient.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        })

        if (authError) {
          errors.push(`Failed to create auth user for ${user.email}: ${authError.message}`)
          continue
        }

        if (!authUser.user) {
          errors.push(`No user returned for ${user.email}`)
          continue
        }

        // Update the user profile with the auth user ID
        const { error: profileError } = await serverClient
          .from('user_profiles')
          .update({ id: authUser.user.id })
          .eq('id', user.profileId)

        if (profileError) {
          errors.push(`Failed to update profile for ${user.email}: ${profileError.message}`)
          continue
        }

        createdUsers.push({
          email: user.email,
          role: user.role,
          authId: authUser.user.id
        })

      } catch (error) {
        errors.push(`Error creating user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo auth users created successfully',
      createdUsers,
      errors,
      credentials: demoUsers.map(user => ({
        email: user.email,
        password: user.password,
        role: user.role
      }))
    })

  } catch (error) {
    console.error('Error creating demo auth users:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 