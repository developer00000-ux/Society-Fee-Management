import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const serverClient = createServerClient()
    
    // Test buildings query
    const { data: buildings, error: buildingsError } = await serverClient
      .from('buildings')
      .select('*')
      .limit(5)
    
    if (buildingsError) {
      return NextResponse.json({ 
        error: 'Buildings query failed', 
        details: buildingsError.message 
      }, { status: 500 })
    }
    
    // Test members query
    const { data: members, error: membersError } = await serverClient
      .from('members')
      .select('*')
      .limit(5)
    
    if (membersError) {
      return NextResponse.json({ 
        error: 'Members query failed', 
        details: membersError.message 
      }, { status: 500 })
    }
    
    // Test flats query
    const { data: flats, error: flatsError } = await serverClient
      .from('flats')
      .select('*')
      .limit(5)
    
    if (flatsError) {
      return NextResponse.json({ 
        error: 'Flats query failed', 
        details: flatsError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      buildings: buildings?.length || 0,
      members: members?.length || 0,
      flats: flats?.length || 0,
      message: 'All database queries successful'
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 