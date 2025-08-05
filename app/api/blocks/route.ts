import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name', { ascending: true })

    // Transform buildings to blocks format
    const blocks = buildings?.map(building => ({
      id: building.id,
      block_name: building.name,
      description: building.building_type,
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
    
    const { block_name, description } = body

    // Validate required fields
    if (!block_name || block_name.trim() === '') {
      return NextResponse.json({ 
        error: 'Block name is required' 
      }, { status: 400 })
    }

    // First, get or create a default colony
    let colonyId = '00000000-0000-0000-0000-000000000000'
    
    // Try to get an existing colony
    const { data: existingColony, error: colonyError } = await supabase
      .from('colonies')
      .select('id')
      .limit(1)
      .single()

    if (existingColony) {
      colonyId = existingColony.id
    } else {
      // Create a default colony if none exists
      const { data: newColony, error: createColonyError } = await supabase
        .from('colonies')
        .insert({
          name: 'Default Colony',
          address: 'Default Address',
          city: 'Default City',
          state: 'Default State',
          pincode: '000000'
        })
        .select('id')
        .single()

      if (createColonyError) {
        console.error('Error creating default colony:', createColonyError)
        return NextResponse.json({ 
          error: 'Failed to create default colony',
          details: createColonyError.message 
        }, { status: 500 })
      }

      colonyId = newColony.id
    }

    // Create a building as a block
    const { data: building, error } = await supabase
      .from('buildings')
      .insert({
        name: block_name.trim(),
        building_type: description?.trim() || 'residential',
        total_floors: 1,
        total_flats: 1,
        colony_id: colonyId
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