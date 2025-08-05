import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { block_name, description } = body
    const { id } = await params

    // Validate required fields
    if (!block_name || block_name.trim() === '') {
      return NextResponse.json({ 
        error: 'Block name is required' 
      }, { status: 400 })
    }

    const { data: building, error } = await supabase
      .from('buildings')
      .update({
        name: block_name.trim(),
        building_type: description?.trim() || 'residential'
      })
      .eq('id', id)
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
      console.error('Error updating block:', error)
      return NextResponse.json({ 
        error: 'Failed to update block',
        details: error.message 
      }, { status: 500 })
    }

    if (!block) {
      return NextResponse.json({ 
        error: 'Block not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      block 
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/blocks/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const { id } = await params

    // Check if building exists before deleting
    const { data: existingBuilding, error: checkError } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError || !existingBuilding) {
      return NextResponse.json({ 
        error: 'Block not found' 
      }, { status: 404 })
    }

    // Check for foreign key constraints (floors that reference this building)
    const { data: floors, error: floorsError } = await supabase
      .from('floors')
      .select('id')
      .eq('building_id', id)

    if (floorsError) {
      console.error('Error checking floors:', floorsError)
      return NextResponse.json({ 
        error: 'Failed to check building dependencies',
        details: floorsError.message 
      }, { status: 500 })
    }

    if (floors && floors.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete block',
        details: `Block ${existingBuilding.name} has ${floors.length} floor(s) with flats. Please delete the flats first.`,
        floors: floors.length
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting block:', error)
      return NextResponse.json({ 
        error: 'Failed to delete block',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Block deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/blocks/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 