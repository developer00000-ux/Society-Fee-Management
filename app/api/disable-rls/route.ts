import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const serverClient = createServerClient()
    
    // Temporarily disable RLS for testing
    const { error: buildingsError } = await serverClient.rpc('disable_rls', { table_name: 'buildings' })
    const { error: membersError } = await serverClient.rpc('disable_rls', { table_name: 'members' })
    const { error: flatsError } = await serverClient.rpc('disable_rls', { table_name: 'flats' })
    
    if (buildingsError || membersError || flatsError) {
      console.error('Error disabling RLS:', { buildingsError, membersError, flatsError })
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