import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    }

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => !value || value === 'NOT SET')
      .map(([key]) => key)

    return NextResponse.json({
      success: missingVars.length === 0,
      environment: envVars,
      missing: missingVars,
      message: missingVars.length === 0 
        ? 'All environment variables are set' 
        : `Missing environment variables: ${missingVars.join(', ')}`
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 