import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    console.log('Disabling RLS using existing function...')
    
    // Use the existing disable_rls function for key tables
    const tables = ['user_profiles', 'colonies']
    
    const results = []
    
    for (const table of tables) {
      const { error } = await supabase.rpc('disable_rls', { table_name: table })
      if (error) {
        console.error(`Error disabling RLS for ${table}:`, error)
        results.push({ table, error: error.message })
      } else {
        results.push({ table, success: true })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLS disabled for key tables',
      results
    })
  } catch (error) {
    console.error('Error disabling RLS:', error)
    return NextResponse.json({
      error: 'Failed to disable RLS',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 