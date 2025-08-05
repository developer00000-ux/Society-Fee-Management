import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { flat_number, floor_id, flat_type, status, monthly_rent, security_deposit } = body
    const { id } = await params

    // Validate required fields
    if (!flat_number || flat_number.trim() === '') {
      return NextResponse.json({ 
        error: 'Flat number is required' 
      }, { status: 400 })
    }

    if (!floor_id) {
      return NextResponse.json({ 
        error: 'Floor ID is required' 
      }, { status: 400 })
    }

    const { data: flat, error } = await supabase
      .from('flats')
      .update({
        flat_number: flat_number.trim(),
        floor_id: floor_id,
        flat_type: flat_type || '1BHK',
        status: status || 'vacant',
        monthly_rent: monthly_rent || 0,
        security_deposit: security_deposit || 0
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating flat:', error)
      return NextResponse.json({ 
        error: 'Failed to update flat',
        details: error.message 
      }, { status: 500 })
    }

    if (!flat) {
      return NextResponse.json({ 
        error: 'Flat not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      flat 
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/flats/[id]:', error)
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

    // Check if flat exists before deleting
    const { data: existingFlat, error: checkError } = await supabase
      .from('flats')
      .select('id, flat_number')
      .eq('id', id)
      .single()

    if (checkError || !existingFlat) {
      return NextResponse.json({ 
        error: 'Flat not found' 
      }, { status: 404 })
    }

    // Check for foreign key constraints (members that reference this flat)
    const { data: membersWithFlat, error: membersError } = await supabase
      .from('members')
      .select('id, name')
      .eq('flat_id', id)

    if (membersError) {
      console.error('Error checking members with flat:', membersError)
      return NextResponse.json({ 
        error: 'Failed to check flat dependencies',
        details: membersError.message 
      }, { status: 500 })
    }

    if (membersWithFlat && membersWithFlat.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete flat',
        details: `Flat ${existingFlat.flat_number} is assigned to ${membersWithFlat.length} member(s). Please reassign or delete the members first.`,
        members: membersWithFlat
      }, { status: 400 })
    }

    // Check for fee entries that reference this flat
    const { data: feeEntries, error: feeError } = await supabase
      .from('fee_entries')
      .select('id')
      .eq('flat_number', existingFlat.flat_number)

    if (feeError) {
      console.error('Error checking fee entries:', feeError)
      return NextResponse.json({ 
        error: 'Failed to check fee entries',
        details: feeError.message 
      }, { status: 500 })
    }

    if (feeEntries && feeEntries.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete flat',
        details: `Flat ${existingFlat.flat_number} has ${feeEntries.length} fee entry(ies). Please delete the fee entries first.`,
        feeEntries: feeEntries.length
      }, { status: 400 })
    }

    // Now delete the flat
    const { error } = await supabase
      .from('flats')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting flat:', error)
      return NextResponse.json({ 
        error: 'Failed to delete flat',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Flat ${existingFlat.flat_number} deleted successfully`
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/flats/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 