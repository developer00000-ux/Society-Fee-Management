import { supabase, createServerClient } from './supabase'
import { FeeEntry, Block, Member, Flat, FeeType } from '@/types/database'

export async function createFeeEntry(data: Omit<FeeEntry, 'id' | 'created_at'>) {
  
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { data: entry, error } = await supabase
    .from('fee_entries')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating fee entry: ${error.message}`)
  }

  return entry
}

export async function getFeeEntries() {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase is not configured. Returning empty array.')
    return []
  }

  const { data: entries, error } = await supabase
    .from('fee_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching fee entries: ${error.message}`)
  }

  return entries
}

export async function getFeeEntriesByBlock(block: string) {
  const { data: entries, error } = await supabase
    .from('fee_entries')
    .select('*')
    .eq('block', block)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching fee entries by block: ${error.message}`)
  }

  return entries
}

export async function deleteFeeEntry(id: string) {
  const { error } = await supabase
    .from('fee_entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting fee entry: ${error.message}`)
  }
}

// Block functions (working with buildings table as blocks)
export async function createBlock(data: Omit<Block, 'id' | 'created_at'>) {
  try {
    // First, get or create a default colony
    let colonyId = '00000000-0000-0000-0000-000000000000'
    
    // Try to get an existing colony
    const { data: existingColony, error: colonyError } = await supabase
      .from('colonies')
      .select('id')
      .limit(1)
      .single()

    if (existingColony) {
      colonyId = existingColony.id
    } else {
      // Create a default colony if none exists
      const { data: newColony, error: createColonyError } = await supabase
        .from('colonies')
        .insert({
          name: 'Default Colony',
          address: 'Default Address',
          city: 'Default City',
          state: 'Default State',
          pincode: '000000'
        })
        .select('id')
        .single()

      if (createColonyError) {
        console.error('Error creating default colony:', createColonyError)
        throw new Error(`Error creating default colony: ${createColonyError.message}`)
      }

      colonyId = newColony.id
    }

    const { data: building, error } = await supabase
      .from('buildings')
      .insert({
        name: data.block_name,
        building_type: data.description || 'residential',
        total_floors: 1,
        total_flats: 1,
        colony_id: colonyId
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating building:', error)
      throw new Error(`Error creating block: ${error.message}`)
    }

    // Transform building to block format
    return {
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    }
  } catch (error) {
    console.error('Error in createBlock:', error)
    throw error
  }
}

export async function getBlocks() {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: buildings, error } = await serverClient
      .from('buildings')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching buildings with service client:', error)
      // Fallback to regular client if service client fails
      const { data: fallbackBuildings, error: fallbackError } = await supabase
        .from('buildings')
        .select('*')
        .order('name', { ascending: true })
      
      if (fallbackError) {
        console.error('Error fetching buildings with fallback client:', fallbackError)
        throw new Error(`Error fetching blocks: ${fallbackError.message}`)
      }
      
      // Transform buildings to blocks format
      return (fallbackBuildings || []).map(building => ({
        id: building.id,
        block_name: building.name,
        description: building.building_type,
        created_at: building.created_at
      }))
    }

    // Transform buildings to blocks format
    return (buildings || []).map(building => ({
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    }))
  } catch (error) {
    console.error('Error in getBlocks:', error)
    // Return empty array as fallback
    return []
  }
}

export async function updateBlock(id: string, data: Partial<Omit<Block, 'id' | 'created_at'>>) {
  try {
    const { data: building, error } = await supabase
      .from('buildings')
      .update({
        name: data.block_name,
        building_type: data.description || 'residential'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating building:', error)
      throw new Error(`Error updating block: ${error.message}`)
    }

    // Transform building to block format
    return {
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    }
  } catch (error) {
    console.error('Error in updateBlock:', error)
    throw error
  }
}

export async function deleteBlock(id: string) {
  try {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting building:', error)
      throw new Error(`Error deleting block: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteBlock:', error)
    throw error
  }
}

// Building functions (for backward compatibility)
export async function createBuilding(data: Omit<Block, 'id' | 'created_at'>) {
  // Convert block_name to name for buildings table
  const buildingData = {
    name: data.block_name,
    building_type: 'residential',
    total_floors: 1,
    total_flats: 1,
    colony_id: '550e8400-e29b-41d4-a716-446655440001' // Default colony
  }
  
  const { data: building, error } = await supabase
    .from('buildings')
    .insert(buildingData)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating building: ${error.message}`)
  }

  return building
}

export async function getBuildings() {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: buildings, error } = await serverClient
      .from('buildings')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching buildings with service client:', error)
      // Fallback to regular client if service client fails
      const { data: fallbackBuildings, error: fallbackError } = await supabase
        .from('buildings')
        .select('*')
        .order('name', { ascending: true })
      
      if (fallbackError) {
        throw new Error(`Error fetching buildings: ${fallbackError.message}`)
      }
      
      return fallbackBuildings || []
    }

    // Convert buildings to blocks format for backward compatibility
    const blocks = buildings?.map(building => ({
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    })) || []

    return blocks
  } catch (error) {
    console.error('Error in getBuildings:', error)
    // Return empty array as fallback
    return []
  }
}

export async function getBuildingById(buildingId: string) {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: building, error } = await serverClient
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single()

    if (error) {
      console.error('Error fetching building by ID:', error)
      return null
    }

    // Convert to block format for consistency
    return {
      id: building.id,
      block_name: building.name,
      description: building.building_type,
      created_at: building.created_at
    }
  } catch (error) {
    console.error('Error in getBuildingById:', error)
    return null
  }
}

export async function updateBuilding(id: string, data: Partial<Omit<Block, 'id' | 'created_at'>>) {
  // Convert block_name to name for buildings table
  const buildingData = {
    name: data.block_name,
    building_type: 'residential',
    total_floors: 1,
    total_flats: 1
  }
  
  const { data: building, error } = await supabase
    .from('buildings')
    .update(buildingData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating building: ${error.message}`)
  }

  return building
}

export async function deleteBuilding(id: string) {
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting building: ${error.message}`)
  }
}

// Member functions
export async function createMember(data: Omit<Member, 'id' | 'created_at'>) {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Database error creating member:', error)
      throw new Error(`Error creating member: ${error.message}`)
    }

    return member
  } catch (error) {
    console.error('Error in createMember:', error)
    throw error
  }
}

export async function getMembers() {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: members, error } = await serverClient
      .from('members')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching members with service client:', error)
      // Fallback to regular client if service client fails
      const { data: fallbackMembers, error: fallbackError } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true })
      
      if (fallbackError) {
        throw new Error(`Error fetching members: ${fallbackError.message}`)
      }
      
      return fallbackMembers || []
    }

    return members || []
  } catch (error) {
    console.error('Error in getMembers:', error)
    // Return empty array as fallback
    return []
  }
}

export async function getMemberByUserId(userId: string) {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: member, error } = await serverClient
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching member by user ID:', error)
      return null
    }

    return member
  } catch (error) {
    console.error('Error in getMemberByUserId:', error)
    return null
  }
}

export async function updateMember(id: string, data: Partial<Omit<Member, 'id' | 'created_at'>>) {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating member:', error)
      throw new Error(`Error updating member: ${error.message}`)
    }

    return member
  } catch (error) {
    console.error('Error in updateMember:', error)
    throw error
  }
}

export async function deleteMember(id: string) {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting member:', error)
      throw new Error(`Error deleting member: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteMember:', error)
    throw error
  }
}

// Flat functions
export async function createFlat(data: Omit<Flat, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data: flat, error } = await supabase
      .from('flats')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Database error creating flat:', error)
      throw new Error(`Error creating flat: ${error.message}`)
    }

    return flat
  } catch (error) {
    console.error('Error in createFlat:', error)
    throw error
  }
}

export async function getFlats() {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: flats, error } = await serverClient
      .from('flats')
      .select('*')
      .order('flat_number', { ascending: true })

    if (error) {
      console.error('Error fetching flats with service client:', error)
      // Fallback to regular client if service client fails
      const { data: fallbackFlats, error: fallbackError } = await supabase
        .from('flats')
        .select('*')
        .order('flat_number', { ascending: true })
      
      if (fallbackError) {
        throw new Error(`Error fetching flats: ${fallbackError.message}`)
      }
      
      return fallbackFlats || []
    }

    return flats || []
  } catch (error) {
    console.error('Error in getFlats:', error)
    // Return empty array as fallback
    return []
  }
}

export async function getFlatById(flatId: string) {
  try {
    // Use service role client to bypass RLS for this query
    const serverClient = createServerClient()
    const { data: flat, error } = await serverClient
      .from('flats')
      .select('*')
      .eq('id', flatId)
      .single()

    if (error) {
      console.error('Error fetching flat by ID:', error)
      return null
    }

    return flat
  } catch (error) {
    console.error('Error in getFlatById:', error)
    return null
  }
}

export async function updateFlat(id: string, data: Partial<Omit<Flat, 'id' | 'created_at'>>) {
  try {
    const { data: flat, error } = await supabase
      .from('flats')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating flat:', error)
      throw new Error(`Error updating flat: ${error.message}`)
    }

    return flat
  } catch (error) {
    console.error('Error in updateFlat:', error)
    throw error
  }
}

export async function deleteFlat(id: string) {
  try {
    const { error } = await supabase
      .from('flats')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting flat:', error)
      throw new Error(`Error deleting flat: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteFlat:', error)
    throw error
  }
}

// Legacy function names for backward compatibility
export const getBlocksLegacy = getBuildings
export const createBlockLegacy = createBuilding
export const updateBlockLegacy = updateBuilding
export const deleteBlockLegacy = deleteBuilding 

// Fee Type functions
export async function createFeeType(data: Omit<FeeType, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { data: feeType, error } = await serverClient
      .from('fee_types')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Database error creating fee type:', error)
      throw new Error(`Error creating fee type: ${error.message}`)
    }

    return feeType
  } catch (error) {
    console.error('Error in createFeeType:', error)
    throw error
  }
}

export async function getFeeTypes() {
  try {
    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { data: feeTypes, error } = await serverClient
      .from('fee_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error fetching fee types:', error)
      throw new Error(`Error fetching fee types: ${error.message}`)
    }

    return feeTypes || []
  } catch (error) {
    console.error('Error in getFeeTypes:', error)
    return []
  }
}

export async function getActiveFeeTypes() {
  try {
    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { data: feeTypes, error } = await serverClient
      .from('fee_types')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error fetching active fee types:', error)
      throw new Error(`Error fetching active fee types: ${error.message}`)
    }

    return feeTypes || []
  } catch (error) {
    console.error('Error in getActiveFeeTypes:', error)
    return []
  }
}

export async function updateFeeType(id: string, data: Partial<Omit<FeeType, 'id' | 'created_at' | 'updated_at'>>) {
  try {
    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { data: feeType, error } = await serverClient
      .from('fee_types')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating fee type:', error)
      throw new Error(`Error updating fee type: ${error.message}`)
    }

    return feeType
  } catch (error) {
    console.error('Error in updateFeeType:', error)
    throw error
  }
}

export async function deleteFeeType(id: string) {
  try {
    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { error } = await serverClient
      .from('fee_types')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting fee type:', error)
      throw new Error(`Error deleting fee type: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteFeeType:', error)
    throw error
  }
}

// Monthly Fee Structure functions
export async function getMonthlyFeeStructures() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase is not configured. Returning sample data.')
      return [
        {
          id: '1',
          month: 'January',
          year: 2024,
          fee_types: [
            { fee_type_id: '1', fee_type_name: 'Maintenance', amount: 500, is_required: true },
            { fee_type_id: '2', fee_type_name: 'Water', amount: 200, is_required: true },
            { fee_type_id: '3', fee_type_name: 'Electricity', amount: 300, is_required: false }
          ],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          month: 'February',
          year: 2024,
          fee_types: [
            { fee_type_id: '1', fee_type_name: 'Maintenance', amount: 500, is_required: true },
            { fee_type_id: '2', fee_type_name: 'Water', amount: 250, is_required: true },
            { fee_type_id: '3', fee_type_name: 'Electricity', amount: 350, is_required: false }
          ],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
    }

    // Use service role client to bypass RLS
    const serverClient = createServerClient()
    const { data: structures, error } = await serverClient
      .from('monthly_fee_structures')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false })
      .order('month', { ascending: true })

    if (error) {
      // If table doesn't exist, return sample data
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.warn('Monthly fee structures table does not exist. Please run the SQL migration. Returning sample data.')
        return [
          {
            id: '1',
            month: 'January',
            year: 2024,
            fee_types: [
              { fee_type_id: '1', fee_type_name: 'Maintenance', amount: 500, is_required: true },
              { fee_type_id: '2', fee_type_name: 'Water', amount: 200, is_required: true },
              { fee_type_id: '3', fee_type_name: 'Electricity', amount: 300, is_required: false }
            ],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            month: 'February',
            year: 2024,
            fee_types: [
              { fee_type_id: '1', fee_type_name: 'Maintenance', amount: 500, is_required: true },
              { fee_type_id: '2', fee_type_name: 'Water', amount: 250, is_required: true },
              { fee_type_id: '3', fee_type_name: 'Electricity', amount: 350, is_required: false }
            ],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            month: 'March',
            year: 2024,
            fee_types: [
              { fee_type_id: '1', fee_type_name: 'Maintenance', amount: 500, is_required: true },
              { fee_type_id: '2', fee_type_name: 'Water', amount: 200, is_required: true },
              { fee_type_id: '3', fee_type_name: 'Electricity', amount: 300, is_required: false }
            ],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      }
      console.error('Database error fetching monthly fee structures:', error)
      throw new Error(`Error fetching monthly fee structures: ${error.message}`)
    }

    return structures || []
  } catch (error) {
    console.error('Error in getMonthlyFeeStructures:', error)
    return []
  }
}

export async function createMonthlyFeeStructure(data: {
  month: string
  year: number
  fee_types: any[]
  is_active?: boolean
}) {
  try {
    const serverClient = createServerClient()
    const { data: structure, error } = await serverClient
      .from('monthly_fee_structures')
      .insert({
        month: data.month,
        year: data.year,
        fee_types: data.fee_types,
        is_active: data.is_active ?? true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating monthly fee structure:', error)
      throw new Error(`Error creating monthly fee structure: ${error.message}`)
    }

    return structure
  } catch (error) {
    console.error('Error in createMonthlyFeeStructure:', error)
    throw error
  }
}

export async function updateMonthlyFeeStructure(id: string, data: {
  month?: string
  year?: number
  fee_types?: any[]
  is_active?: boolean
}) {
  try {
    const serverClient = createServerClient()
    const { data: structure, error } = await serverClient
      .from('monthly_fee_structures')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating monthly fee structure:', error)
      throw new Error(`Error updating monthly fee structure: ${error.message}`)
    }

    return structure
  } catch (error) {
    console.error('Error in updateMonthlyFeeStructure:', error)
    throw error
  }
}

export async function deleteMonthlyFeeStructure(id: string) {
  const { error } = await supabase
    .from('monthly_fee_structures')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting monthly fee structure: ${error.message}`)
  }
}

// Payment confirmation functions
export async function confirmPayment(feeEntryId: string, confirmedBy: string) {
  const { data: entry, error } = await supabase
    .from('fee_entries')
    .update({
      payment_confirmed: true,
      payment_confirmed_by: confirmedBy,
      payment_confirmed_at: new Date().toISOString()
    })
    .eq('id', feeEntryId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error confirming payment: ${error.message}`)
  }

  return entry
}

export async function unconfirmPayment(feeEntryId: string) {
  const { data: entry, error } = await supabase
    .from('fee_entries')
    .update({
      payment_confirmed: false,
      payment_confirmed_by: null,
      payment_confirmed_at: null
    })
    .eq('id', feeEntryId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error unconfirming payment: ${error.message}`)
  }

  return entry
}

export async function getPendingPayments() {
  const { data: entries, error } = await supabase
    .from('fee_entries')
    .select(`
      *,
      user_profiles!fee_entries_created_by_fkey (
        id,
        first_name,
        last_name,
        email,
        role
      ),
      user_profiles!fee_entries_payment_confirmed_by_fkey (
        id,
        first_name,
        last_name,
        email,
        role
      )
    `)
    .eq('payment_confirmed', false)
    .in('payment_type', ['Cash', 'Request Payment'])
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching pending payments: ${error.message}`)
  }

  return entries
}

export async function getConfirmedPayments() {
  const { data: entries, error } = await supabase
    .from('fee_entries')
    .select(`
      *,
      user_profiles!fee_entries_created_by_fkey (
        id,
        first_name,
        last_name,
        email,
        role
      ),
      user_profiles!fee_entries_payment_confirmed_by_fkey (
        id,
        first_name,
        last_name,
        email,
        role
      )
    `)
    .eq('payment_confirmed', true)
    .order('payment_confirmed_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching confirmed payments: ${error.message}`)
  }

  return entries
} 