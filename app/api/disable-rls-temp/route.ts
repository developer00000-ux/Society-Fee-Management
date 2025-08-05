import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    console.log('Temporarily disabling RLS for testing...')
    
    // Disable RLS for all tables to avoid recursion issues
    const tables = [
      'user_profiles',
      'colonies', 
      'buildings',
      'floors',
      'flats',
      'bill_categories',
      'bills',
      'payments',
      'maintenance_requests',
      'announcements',
      'user_sessions',
      'fee_entries',
      'members',
      'fee_types'
    ]
    
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
      message: 'RLS temporarily disabled for testing',
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