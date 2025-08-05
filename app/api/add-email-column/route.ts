import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    console.log('Adding email column to user_profiles table...')
    
    // Add email column to user_profiles table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        
        COMMENT ON COLUMN user_profiles.email IS 'User email address';
      `
    })

    if (alterError) {
      console.error('Error adding email column:', alterError)
      return NextResponse.json({
        success: false,
        error: 'Failed to add email column',
        details: alterError.message
      }, { status: 500 })
    }

    // Verify the column was added
    const { data: columnInfo, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email';
      `
    })

    if (verifyError) {
      console.error('Error verifying column:', verifyError)
      return NextResponse.json({
        success: false,
        error: 'Failed to verify email column',
        details: verifyError.message
      }, { status: 500 })
    }

    console.log('Email column added successfully')
    console.log('Column info:', columnInfo)

    return NextResponse.json({
      success: true,
      message: 'Email column added to user_profiles table',
      columnInfo: columnInfo
    })
  } catch (error) {
    console.error('Unexpected error in add-email-column:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 