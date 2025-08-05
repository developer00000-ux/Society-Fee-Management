import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    // Check if the columns already exist by trying to select them
    const { data, error } = await supabase
      .from('members')
      .select('block_id, flat_id, user_id')
      .limit(1)

    if (error) {
      // Columns don't exist, provide instructions
      return NextResponse.json({ 
        error: 'Members table needs to be updated',
        message: 'Please run the following SQL in your Supabase dashboard:',
        sql: `
          ALTER TABLE members 
          ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS flat_id UUID REFERENCES flats(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

          CREATE INDEX IF NOT EXISTS idx_members_block_id ON members(block_id);
          CREATE INDEX IF NOT EXISTS idx_members_flat_id ON members(flat_id);
          CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
        `
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Members table is already updated' 
    })
  } catch (error) {
    console.error('Error checking members table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 