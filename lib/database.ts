import { supabase, createServerClient } from './supabase'
import { FeeEntry, Block, Member, Flat } from '@/types/database'

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

// Building functions (replacing blocks)
export async function createBuilding(data: Omit<Block, 'id' | 'created_at'>) {
  const { data: building, error } = await supabase
    .from('buildings')
    .insert(data)
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

    return buildings || []
  } catch (error) {
    console.error('Error in getBuildings:', error)
    // Return empty array as fallback
    return []
  }
}

export async function updateBuilding(id: string, data: Partial<Omit<Block, 'id' | 'created_at'>>) {
  const { data: building, error } = await supabase
    .from('buildings')
    .update(data)
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
  const { data: member, error } = await supabase
    .from('members')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating member: ${error.message}`)
  }

  return member
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

export async function updateMember(id: string, data: Partial<Omit<Member, 'id' | 'created_at'>>) {
  const { data: member, error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating member: ${error.message}`)
  }

  return member
}

export async function deleteMember(id: string) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting member: ${error.message}`)
  }
}

// Flat functions
export async function createFlat(data: Omit<Flat, 'id' | 'created_at' | 'updated_at'>) {
  const { data: flat, error } = await supabase
    .from('flats')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating flat: ${error.message}`)
  }

  return flat
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

export async function updateFlat(id: string, data: Partial<Omit<Flat, 'id' | 'created_at'>>) {
  const { data: flat, error } = await supabase
    .from('flats')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating flat: ${error.message}`)
  }

  return flat
}

export async function deleteFlat(id: string) {
  const { error } = await supabase
    .from('flats')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting flat: ${error.message}`)
  }
}

// Legacy function names for backward compatibility
export const getBlocks = getBuildings
export const createBlock = createBuilding
export const updateBlock = updateBuilding
export const deleteBlock = deleteBuilding 