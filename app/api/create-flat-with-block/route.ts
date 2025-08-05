import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { flat_number, block_id, flat_type, status, monthly_rent, security_deposit } = body

    // First, create a floor for the block if it doesn't exist
    const { data: existingFloor, error: floorError } = await supabase
      .from('floors')
      .select('id')
      .eq('building_id', block_id)
      .eq('floor_number', 1)
      .single()

    let floorId = existingFloor?.id

    if (!existingFloor) {
      // Create a floor for this block
      const { data: newFloor, error: createFloorError } = await supabase
        .from('floors')
        .insert({
          building_id: block_id,
          floor_number: 1,
          floor_name: 'Ground Floor',
          total_flats: 1,
          base_maintenance_charge: 0
        })
        .select('id')
        .single()

      if (createFloorError) {
        throw new Error(`Error creating floor: ${createFloorError.message}`)
      }

      floorId = newFloor.id
    }

    // Now create the flat
    const { data: flat, error: flatError } = await supabase
      .from('flats')
      .insert({
        floor_id: floorId,
        flat_number,
        flat_type,
        status,
        monthly_rent,
        security_deposit
      })
      .select()
      .single()

    if (flatError) {
      throw new Error(`Error creating flat: ${flatError.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      flat 
    })
  } catch (error) {
    console.error('Error creating flat with block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 