import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/register' || 
                      path === '/forgot-password' ||
                      path === '/reset-password' ||
                      path.startsWith('/api/auth/') ||
                      path.startsWith('/api/setup-demo-users')

  // Define auth pages where logged-in users should be redirected
  const isAuthPage = path === '/login' || path === '/register'

  // Check if user is authenticated by looking for auth token
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (user && isAuthPage) {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const redirectPath = getRoleBasedRedirect(profile.role)
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // For public paths, let them through
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, let them through and handle auth in components
  return NextResponse.next()
}

// Helper function to get role-based redirect
function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard'
    case 'colony_admin':
      return '/colony-admin/dashboard'
    case 'block_manager':
      return '/block-manager/dashboard'
    case 'resident':
      return '/entries'
    default:
      return '/'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 