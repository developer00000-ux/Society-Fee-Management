import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get flats with their floor and building information
    const { data: flats, error } = await supabase
      .from('flats')
      .select(`
        *,
        floors!inner(
          *,
          buildings!inner(
            id,
            name
          )
        )
      `)
      .order('flat_number', { ascending: true })

    if (error) {
      console.error('Error fetching flats:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch flats',
        details: error.message 
      }, { status: 500 })
    }

    // Transform the data to include block information
    const transformedFlats = flats?.map(flat => ({
      ...flat,
      block_name: flat.floors?.buildings?.name || 'Unknown Block',
      block_id: flat.floors?.buildings?.id
    })) || []

    return NextResponse.json({ 
      success: true, 
      flats: transformedFlats 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/flats:', error)
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
    
    const { flat_number, block_id, floor_number, flat_type, status, monthly_rent, security_deposit } = body

    // Validate required fields
    if (!flat_number || flat_number.trim() === '') {
      return NextResponse.json({ 
        error: 'Flat number is required' 
      }, { status: 400 })
    }

    if (!block_id) {
      return NextResponse.json({ 
        error: 'Block is required' 
      }, { status: 400 })
    }

    // First, check if the block_id exists in the buildings table
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', block_id)
      .single()

    if (buildingError || !building) {
      return NextResponse.json({ 
        error: 'Block not found',
        details: 'The selected block does not exist in the system'
      }, { status: 404 })
    }

    // Check if a floor already exists for this building and floor number
    const floorNum = floor_number || 1
    const { data: existingFloor, error: floorError } = await supabase
      .from('floors')
      .select('id')
      .eq('building_id', building.id)
      .eq('floor_number', floorNum)
      .single()

    let floorId = existingFloor?.id

    if (!existingFloor) {
      // Create a floor for this building
      const { data: newFloor, error: createFloorError } = await supabase
        .from('floors')
        .insert({
          building_id: building.id,
          floor_number: floorNum,
          floor_name: `Floor ${floorNum}`,
          total_flats: 1,
          base_maintenance_charge: 0
        })
        .select('id')
        .single()

      if (createFloorError) {
        console.error('Error creating floor:', createFloorError)
        return NextResponse.json({ 
          error: 'Failed to create floor for building',
          details: createFloorError.message 
        }, { status: 500 })
      }

      floorId = newFloor.id
    }

    // Now create the flat
    const { data: flat, error: flatError } = await supabase
      .from('flats')
      .insert({
        floor_id: floorId,
        flat_number: flat_number.trim(),
        flat_type: flat_type || '1BHK',
        status: status || 'vacant',
        monthly_rent: monthly_rent || 0,
        security_deposit: security_deposit || 0
      })
      .select()
      .single()

    if (flatError) {
      console.error('Error creating flat:', flatError)
      return NextResponse.json({ 
        error: 'Failed to create flat',
        details: flatError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      flat 
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/flats:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 