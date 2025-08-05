import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    console.log('Adding email column to user_profiles table...')
    
    // First, check if the email column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (checkError) {
      console.error('Error checking table structure:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check table structure',
        details: checkError.message
      }, { status: 500 })
    }

    // Try to add the email column by attempting to select it
    // If it doesn't exist, this will fail and we'll know
    const { data: testSelect, error: selectError } = await supabase
      .from('user_profiles')
      .select('email')
      .limit(1)

    if (selectError && selectError.message.includes('column') && selectError.message.includes('email')) {
      console.log('Email column does not exist, attempting to add it...')
      
      // Since we can't use exec_sql, we'll need to manually add the column
      // For now, let's return instructions for manual SQL execution
      return NextResponse.json({
        success: false,
        error: 'Email column missing',
        message: 'The email column is missing from user_profiles table. Please run the following SQL in your Supabase SQL Editor:',
        sql: `
          ALTER TABLE user_profiles 
          ADD COLUMN IF NOT EXISTS email VARCHAR(255);
          
          COMMENT ON COLUMN user_profiles.email IS 'User email address';
        `,
        instructions: [
          '1. Go to your Supabase Dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the SQL above',
          '4. Run the script',
          '5. Refresh this page'
        ]
      }, { status: 400 })
    }

    console.log('Email column already exists or was added successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Email column exists in user_profiles table',
      testSelect: testSelect
    })
  } catch (error) {
    console.error('Unexpected error in add-email-column-simple:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 