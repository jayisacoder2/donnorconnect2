// Authentication API - User Logout
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    // Clear cookie with explicit header
    response.headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}