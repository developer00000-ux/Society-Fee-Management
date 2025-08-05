import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const serverClient = createServerClient()
    const { data: structure, error } = await serverClient
      .from('monthly_fee_structures')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching monthly fee structure:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!structure) {
      return NextResponse.json({ error: 'Structure not found' }, { status: 404 })
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error('Error in GET /api/monthly-fee-structures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { month, year, fee_types, is_active } = body

    const serverClient = createServerClient()
    const { data: structure, error } = await serverClient
      .from('monthly_fee_structures')
      .update({
        month,
        year,
        fee_types,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating monthly fee structure:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error('Error in PUT /api/monthly-fee-structures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const serverClient = createServerClient()
    const { error } = await serverClient
      .from('monthly_fee_structures')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting monthly fee structure:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Structure deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/monthly-fee-structures/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 