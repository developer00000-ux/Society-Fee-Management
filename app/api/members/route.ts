import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createResidentUser, checkUserExists } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch members',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      members: members || [] 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/members:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { name, phone, email, password, block_id, flat_id, createUserAccount } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Member name is required' 
      }, { status: 400 })
    }

    let userId: string | null = null

    // Create user account if requested
    if (createUserAccount && email && password) {
      try {
        // Check if user already exists
        const userExists = await checkUserExists(email.trim())
        if (userExists) {
          return NextResponse.json({ 
            error: 'User account already exists',
            details: 'A user account with this email address already exists. Please use a different email or uncheck "Create User Account".'
          }, { status: 400 })
        }

        const user = await createResidentUser({
          email: email.trim(),
          password: password,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          phone: phone?.trim() || undefined,
          building_id: block_id || undefined,
          flat_id: flat_id || undefined
        })
        userId = user.id
      } catch (error) {
        console.error('Error creating user account:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Check if it's a duplicate email error
        if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
          return NextResponse.json({ 
            error: 'User account already exists',
            details: 'A user account with this email address already exists. Please use a different email or uncheck "Create User Account".'
          }, { status: 400 })
        }
        
        return NextResponse.json({ 
          error: 'Failed to create user account',
          details: errorMessage
        }, { status: 500 })
      }
    }

    // For now, we'll store the building_id as block_id in members table
    // This maintains compatibility with the existing members table structure
    const { data: member, error } = await supabase
      .from('members')
      .insert({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        block_id: block_id || null, // This will be the building_id
        flat_id: flat_id || null,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating member:', error)
      return NextResponse.json({ 
        error: 'Failed to create member',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      member 
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/members:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 