import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: colonies, error } = await supabase
      .from('colonies')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching colonies:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch colonies',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      colonies: colonies || [] 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/colonies:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 