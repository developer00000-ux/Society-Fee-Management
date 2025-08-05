import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    console.log('Basic connection test:', { data: testData, error: testError })
    
    // Test user_profiles table
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, role')
      .limit(5)
    
    console.log('User profiles test:', { data: userProfiles, error: userProfilesError })
    
    // Test colonies table
    const { data: colonies, error: coloniesError } = await supabase
      .from('colonies')
      .select('id, name')
      .limit(5)
    
    console.log('Colonies test:', { data: colonies, error: coloniesError })
    
    // Test RLS status
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_rls_status', { table_name: 'user_profiles' })
    
    console.log('RLS status test:', { data: rlsStatus, error: rlsError })

    return NextResponse.json({
      success: true,
      tests: {
        basicConnection: {
          success: !testError,
          error: testError
        },
        userProfiles: {
          success: !userProfilesError,
          data: userProfiles,
          error: userProfilesError,
          count: userProfiles?.length || 0
        },
        colonies: {
          success: !coloniesError,
          data: colonies,
          error: coloniesError,
          count: colonies?.length || 0
        },
        rlsStatus: {
          success: !rlsError,
          data: rlsStatus,
          error: rlsError
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error in test-db:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 