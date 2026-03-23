// Debug what cookies the server sees
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const sessionToken = cookieStore.get('session')?.value
  
  let sessionValid = false
  let sessionData = null
  
  if (sessionToken) {
    const session = await getSession(sessionToken)
    sessionValid = !!session
    sessionData = session ? { userId: session.user?.id, email: session.user?.email } : null
  }
  
  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    hasSessionCookie: !!sessionToken,
    sessionTokenLength: sessionToken?.length || 0,
    sessionValid,
    sessionData,
  })
}
