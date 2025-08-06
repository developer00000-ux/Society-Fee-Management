import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const serverClient = createServerClient()

    // Check if user exists
    const { data: { users }, error: listError } = await serverClient.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      )
    }

    const userExists = users.some(user => user.email === email)
    
    if (!userExists) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      )
    }

    // Create a client with anon key for password reset
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey)

    // Send password reset email
    const { error: resetError } = await anonClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
    })

    if (resetError) {
      console.error('Error sending reset email:', resetError)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset link has been sent to your email address.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 