import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getFeeTypes, createFeeType } from '@/lib/database'

export async function GET() {
  try {
    const feeTypes = await getFeeTypes()
    return NextResponse.json(feeTypes)
  } catch (error) {
    console.error('Error fetching fee types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, amount, is_active } = body

    if (!name || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Name, description, and amount are required' },
        { status: 400 }
      )
    }

    const feeType = await createFeeType({
      name,
      description,
      amount: parseFloat(amount),
      is_active: is_active !== undefined ? is_active : true
    })

    return NextResponse.json(feeType, { status: 201 })
  } catch (error) {
    console.error('Error creating fee type:', error)
    return NextResponse.json(
      { error: 'Failed to create fee type' },
      { status: 500 }
    )
  }
} 