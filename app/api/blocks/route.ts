import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name', { ascending: true })

    // Get colonies for mapping
    const { data: colonies } = await supabase
      .from('colonies')
      .select('id, name')

    const colonyMap = new Map(colonies?.map(colony => [colony.id, colony.name]) || [])

    // Transform buildings to blocks format
    const blocks = buildings?.map(building => ({
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      colony_id: building.colony_id,
      colony_name: building.colony_id ? colonyMap.get(building.colony_id) || 'Unknown Colony' : 'No Colony Assigned',
      created_at: building.created_at
    })) || []

    if (error) {
      console.error('Error fetching blocks:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch blocks',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      blocks: blocks || [] 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/blocks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { block_name, description, colony_id } = body

    // Validate required fields
    if (!block_name || block_name.trim() === '') {
      return NextResponse.json({ 
        error: 'Block name is required' 
      }, { status: 400 })
    }

    if (!colony_id) {
      return NextResponse.json({ 
        error: 'Colony is required' 
      }, { status: 400 })
    }

    // Create a building as a block
    const { data: building, error } = await supabase
      .from('buildings')
      .insert({
        name: block_name.trim(),
        building_type: description?.trim() || 'residential',
        total_floors: 1,
        total_flats: 1,
        colony_id: colony_id
      })
      .select()
      .single()

    // Transform building to block format
    const block = {
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    }

    if (error) {
      console.error('Error creating block:', error)
      return NextResponse.json({ 
        error: 'Failed to create block',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      block 
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/blocks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 