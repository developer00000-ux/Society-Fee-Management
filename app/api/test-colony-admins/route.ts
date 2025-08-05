import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    console.log('Testing colony admins query...')
    
    // Test colony admins query
    const { data: colonyAdmins, error: colonyAdminsError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        colony_id,
        is_active,
        created_at
      `)
      .eq('role', 'colony_admin')
      .order('first_name', { ascending: true })

    console.log('Colony admins query result:', { data: colonyAdmins, error: colonyAdminsError })

    // Test colonies query
    const { data: colonies, error: coloniesError } = await supabase
      .from('colonies')
      .select('id, name')
      .order('name', { ascending: true })

    console.log('Colonies query result:', { data: colonies, error: coloniesError })

    // Test RLS policies
    const { data: rlsTest, error: rlsError } = await supabase
      .from('user_profiles')
      .select('count')
      .eq('role', 'colony_admin')

    console.log('RLS test result:', { data: rlsTest, error: rlsError })

    return NextResponse.json({
      success: true,
      colonyAdmins: {
        data: colonyAdmins,
        error: colonyAdminsError,
        count: colonyAdmins?.length || 0
      },
      colonies: {
        data: colonies,
        error: coloniesError,
        count: colonies?.length || 0
      },
      rlsTest: {
        data: rlsTest,
        error: rlsError
      }
    })
  } catch (error) {
    console.error('Unexpected error in test-colony-admins:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 