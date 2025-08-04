import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/register' || 
                      path === '/forgot-password' ||
                      path === '/reset-password' ||
                      path.startsWith('/api/auth/')

  // Check if user is authenticated (you can implement your own logic here)
  // For now, we'll let all requests through and handle auth in components
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, let them through and handle auth in components
  return NextResponse.next()
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