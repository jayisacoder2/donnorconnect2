// Next.js Middleware - Route protection and authentication
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/donors', '/campaigns', '/donations', '/segments', '/workflows', '/tasks']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export async function proxy(request) {
  const url = request.nextUrl
  const pathname = url.pathname
  const sessionToken = request.cookies.get('session')?.value

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  let isAuthenticated = false
  if (sessionToken) {
    try {
      const checkUrl = new URL('/api/auth/session', request.url)
      const res = await fetch(checkUrl.toString(), {
        headers: { cookie: `session=${sessionToken}` },
      })
      isAuthenticated = res.ok
    } catch (_) {
      isAuthenticated = false
    }
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callback', pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}