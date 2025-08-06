import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const serverClient = createServerClient()

    // Check if member record exists
    const { data: existingMember, error: checkError } = await serverClient
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking member:', checkError)
      return NextResponse.json(
        { error: 'Failed to check member record' },
        { status: 500 }
      )
    }

    if (existingMember) {
      return NextResponse.json({
        success: true,
        member: existingMember,
        message: 'Member record already exists'
      })
    }

    // Get user profile to create member record
    const { data: userProfile, error: profileError } = await serverClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create member record
    const memberData = {
      name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
      email: userProfile.email,
      phone: userProfile.phone,
      block_id: userProfile.building_id,
      flat_id: userProfile.flat_id,
      user_id: userId
    }

    const { data: newMember, error: createError } = await serverClient
      .from('members')
      .insert(memberData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating member:', createError)
      return NextResponse.json(
        { error: 'Failed to create member record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      member: newMember,
      message: 'Member record created successfully'
    })

  } catch (error) {
    console.error('Unexpected error in ensure-member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 