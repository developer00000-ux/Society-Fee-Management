import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id } = await params
    
    const { first_name, last_name, email, phone, colony_id } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !colony_id) {
      return NextResponse.json({ 
        error: 'First name, last name, email, and colony are required' 
      }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: first_name,
        last_name: last_name,
        phone: phone || null,
        colony_id: colony_id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating block manager:', error)
      return NextResponse.json({ 
        error: 'Failed to update block manager',
        details: error.message 
      }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ 
        error: 'Block manager not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      blockManager: profile 
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/block-managers/[id]:', error)
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

    // Check if block manager exists
    const { data: existingManager, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', id)
      .eq('role', 'block_manager')
      .single()

    if (checkError || !existingManager) {
      return NextResponse.json({ 
        error: 'Block manager not found' 
      }, { status: 404 })
    }

    // Deactivate the block manager instead of deleting
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deactivating block manager:', error)
      return NextResponse.json({ 
        error: 'Failed to deactivate block manager',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Block manager deactivated successfully'
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/block-managers/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 