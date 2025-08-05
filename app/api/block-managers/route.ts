import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        colony_id,
        is_active,
        created_at,
        colonies!fk_user_profiles_colony(
          name
        )
      `)
      .eq('role', 'block_manager')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching block managers:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch block managers',
        details: error.message 
      }, { status: 500 })
    }

    // Transform data to include colony name
    const blockManagers = data?.map(manager => {
      console.log('Manager data:', JSON.stringify(manager, null, 2))
      
      let colonyName = 'No Colony Assigned'
      
      // Handle different possible data structures
      if (manager.colonies) {
        if (Array.isArray(manager.colonies) && manager.colonies.length > 0) {
          colonyName = (manager.colonies[0] as any).name
        } else if (typeof manager.colonies === 'object' && (manager.colonies as any).name) {
          colonyName = (manager.colonies as any).name
        }
      }
      
      return {
        id: manager.id,
        first_name: manager.first_name,
        last_name: manager.last_name,
        phone: manager.phone,
        colony_id: manager.colony_id,
        colony_name: colonyName,
        is_active: manager.is_active,
        created_at: manager.created_at
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      blockManagers 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/block-managers:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { first_name, last_name, email, phone, colony_id, password } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !colony_id) {
      return NextResponse.json({ 
        error: 'First name, last name, email, password, and colony are required' 
      }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
        role: 'block_manager'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ 
        error: 'Failed to create user account',
        details: authError.message 
      }, { status: 500 })
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        first_name: first_name,
        last_name: last_name,
        phone: phone || null,
        role: 'block_manager',
        colony_id: colony_id,
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return NextResponse.json({ 
        error: 'Failed to create user profile',
        details: profileError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      blockManager: profile 
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/block-managers:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 