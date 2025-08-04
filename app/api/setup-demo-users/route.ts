import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const serverClient = createServerClient()
    
    // Create demo buildings
    const { data: buildings, error: buildingsError } = await serverClient
      .from('buildings')
      .insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          colony_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Building A',
          building_type: 'residential',
          total_floors: 4,
          total_flats: 8,
          has_lift: true,
          has_parking: true,
          construction_year: 2020
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          colony_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Building B',
          building_type: 'residential',
          total_floors: 4,
          total_flats: 8,
          has_lift: true,
          has_parking: true,
          construction_year: 2020
        }
      ])
      .select()

    if (buildingsError) {
      console.error('Error creating buildings:', buildingsError)
    }

    // Create demo floors
    const { data: floors, error: floorsError } = await serverClient
      .from('floors')
      .insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          building_id: '550e8400-e29b-41d4-a716-446655440002',
          floor_number: 1,
          floor_name: 'Ground Floor',
          total_flats: 2,
          base_maintenance_charge: 500
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440006',
          building_id: '550e8400-e29b-41d4-a716-446655440002',
          floor_number: 2,
          floor_name: 'First Floor',
          total_flats: 2,
          base_maintenance_charge: 500
        }
      ])
      .select()

    if (floorsError) {
      console.error('Error creating floors:', floorsError)
    }

    // Create demo flats
    const { data: flats, error: flatsError } = await serverClient
              .from('flats')
      .insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440009',
          floor_id: '550e8400-e29b-41d4-a716-446655440005',
          flat_number: 'A-101',
          flat_type: '2bhk',
          area_sqft: 1200,
          status: 'occupied',
          monthly_rent: 15000,
          security_deposit: 30000
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          floor_id: '550e8400-e29b-41d4-a716-446655440005',
          flat_number: 'A-102',
          flat_type: '2bhk',
          area_sqft: 1200,
          status: 'occupied',
          monthly_rent: 15000,
          security_deposit: 30000
        }
      ])
      .select()

    if (flatsError) {
      console.error('Error creating flats:', flatsError)
    }

    // Create demo members (for the fee management system)
    const { data: members, error: membersError } = await serverClient
      .from('members')
          .insert([
            {
          id: '550e8400-e29b-41d4-a716-446655440020',
          name: 'John Doe',
          phone: '+91-9876543210',
          email: 'john.doe@example.com'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440021',
          name: 'Jane Smith',
          phone: '+91-9876543211',
          email: 'jane.smith@example.com'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440022',
          name: 'Bob Johnson',
          phone: '+91-9876543212',
          email: 'bob.johnson@example.com'
        }
      ])
      .select()

    if (membersError) {
      console.error('Error creating members:', membersError)
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data created successfully',
      buildings: buildings?.length || 0,
      floors: floors?.length || 0,
      flats: flats?.length || 0,
      members: members?.length || 0
    })

  } catch (error) {
    console.error('Error setting up demo data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 