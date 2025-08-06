import { NextRequest, NextResponse } from 'next/server'
import { updateFeeType, deleteFeeType } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, amount, is_active } = body

    if (!name || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Name, description, and amount are required' },
        { status: 400 }
      )
    }

    const feeType = await updateFeeType(id, {
      name,
      description,
      amount: parseFloat(amount),
      is_active: is_active !== undefined ? is_active : true
    })

    return NextResponse.json(feeType)
  } catch (error) {
    console.error('Error updating fee type:', error)
    return NextResponse.json(
      { error: 'Failed to update fee type' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteFeeType(id)
    return NextResponse.json({ message: 'Fee type deleted successfully' })
  } catch (error) {
    console.error('Error deleting fee type:', error)
    return NextResponse.json(
      { error: 'Failed to delete fee type' },
      { status: 500 }
    )
  }
} 