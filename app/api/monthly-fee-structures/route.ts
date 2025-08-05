import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const serverClient = createServerClient()
    const { data: structures, error } = await serverClient
      .from('monthly_fee_structures')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false })
      .order('month', { ascending: true })

    if (error) {
      console.error('Error fetching monthly fee structures:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(structures || [])
  } catch (error) {
    console.error('Error in GET /api/monthly-fee-structures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year, fee_types, is_active = true } = body

    if (!month || !year || !fee_types) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serverClient = createServerClient()
    const { data: structure, error } = await serverClient
      .from('monthly_fee_structures')
      .insert({
        month,
        year,
        fee_types,
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating monthly fee structure:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error('Error in POST /api/monthly-fee-structures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 