import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    // Disable RLS temporarily for testing
    const { error: userProfilesError } = await supabase.rpc('disable_rls', { table_name: 'user_profiles' })
    const { error: coloniesError } = await supabase.rpc('disable_rls', { table_name: 'colonies' })
    
    if (userProfilesError) {
      console.error('Error disabling RLS for user_profiles:', userProfilesError)
    }
    
    if (coloniesError) {
      console.error('Error disabling RLS for colonies:', coloniesError)
    }

    return NextResponse.json({
      success: true,
      message: 'RLS disabled for testing',
      errors: {
        userProfiles: userProfilesError,
        colonies: coloniesError
      }
    })
  } catch (error) {
    console.error('Error fixing RLS policies:', error)
    return NextResponse.json({
      error: 'Failed to fix RLS policies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 