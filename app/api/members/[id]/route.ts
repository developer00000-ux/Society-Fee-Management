import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { name, phone, email, block_id, flat_id, user_id } = body
    const { id } = await params

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Member name is required' 
      }, { status: 400 })
    }

    const { data: member, error } = await supabase
      .from('members')
      .update({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        block_id: block_id || null,
        flat_id: flat_id || null,
        user_id: user_id || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating member:', error)
      return NextResponse.json({ 
        error: 'Failed to update member',
        details: error.message 
      }, { status: 500 })
    }

    if (!member) {
      return NextResponse.json({ 
        error: 'Member not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      member 
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/members/[id]:', error)
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

    // Check if member exists before deleting
    const { data: existingMember, error: checkError } = await supabase
      .from('members')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingMember) {
      return NextResponse.json({ 
        error: 'Member not found' 
      }, { status: 404 })
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting member:', error)
      return NextResponse.json({ 
        error: 'Failed to delete member',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Member deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/members/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 