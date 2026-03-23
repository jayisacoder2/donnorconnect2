// Authentication API - User Login
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { createSession } from '@/lib/session'

// Prevent caching of this route
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const email = body?.email?.trim()
    const password = body?.password

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'password is required' }, { status: 400 })
    }

    const user = await login(email, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionToken = await createSession(user.id)
    
    // Build cookie string manually for maximum compatibility
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieValue = [
      `session=${sessionToken}`,
      'Path=/',
      'HttpOnly',
      `Max-Age=${60 * 60 * 24 * 7}`,
      'SameSite=Lax',
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ')

    const response = NextResponse.json({ 
      success: true,
      user: { ...user, password: undefined } 
    })
    
    response.headers.set('Set-Cookie', cookieValue)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}