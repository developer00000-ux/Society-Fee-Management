import { NextResponse } from 'next/server'
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
      throw new Error(`Error fetching flats: ${error.message}`)
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
    console.error('Error fetching flats with blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 