import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const serverClient = createServerClient()
    
    // Temporarily disable RLS for testing
    const { error: userProfilesError } = await serverClient.rpc('disable_rls', { table_name: 'user_profiles' })
    const { error: buildingsError } = await serverClient.rpc('disable_rls', { table_name: 'buildings' })
    const { error: membersError } = await serverClient.rpc('disable_rls', { table_name: 'members' })
    const { error: flatsError } = await serverClient.rpc('disable_rls', { table_name: 'flats' })
    const { error: coloniesError } = await serverClient.rpc('disable_rls', { table_name: 'colonies' })
    const { error: floorsError } = await serverClient.rpc('disable_rls', { table_name: 'floors' })
    
    if (userProfilesError || buildingsError || membersError || flatsError || coloniesError || floorsError) {
      console.error('Error disabling RLS:', { userProfilesError, buildingsError, membersError, flatsError, coloniesError, floorsError })
    }
    
    return NextResponse.json({
      success: true,
      message: 'RLS temporarily disabled for testing'
    })
    
  } catch (error) {
    console.error('Error disabling RLS:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 