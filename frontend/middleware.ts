import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication - these will be handled client-side
const protectedRoutes = ['/dashboard', '/screener', '/stocks']
// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = ['/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // For Appwrite OAuth with client-side sessions, we can't check authentication server-side
  // Instead, we'll let all routes through and handle authentication client-side
  
  // Only redirect auth routes that shouldn't be accessed directly
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // If someone tries to access auth routes directly, redirect to home
  // The client-side will handle authentication state
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
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