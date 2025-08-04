import { supabase } from './supabase'
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

// Block functions
export async function createBlock(data: Omit<Block, 'id' | 'created_at'>) {
  const { data: block, error } = await supabase
    .from('blocks')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating block: ${error.message}`)
  }

  return block
}

export async function getBlocks() {
  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .order('block_name', { ascending: true })

  if (error) {
    throw new Error(`Error fetching blocks: ${error.message}`)
  }

  return blocks
}

export async function updateBlock(id: string, data: Partial<Omit<Block, 'id' | 'created_at'>>) {
  const { data: block, error } = await supabase
    .from('blocks')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating block: ${error.message}`)
  }

  return block
}

export async function deleteBlock(id: string) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting block: ${error.message}`)
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
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Error fetching members: ${error.message}`)
  }

  return members
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
export async function createFlat(data: Omit<Flat, 'id' | 'created_at'>) {
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
  const { data: flats, error } = await supabase
    .from('flats')
    .select(`
      *,
      blocks(block_name),
      members(name)
    `)
    .order('flat_number', { ascending: true })

  if (error) {
    throw new Error(`Error fetching flats: ${error.message}`)
  }

  return flats
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