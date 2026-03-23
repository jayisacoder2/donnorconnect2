// Simple test page without the dashboard layout
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TestDashboard() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  
  const debugInfo = {
    hasToken: !!sessionToken,
    tokenLength: sessionToken?.length || 0,
  }
  
  if (!sessionToken) {
    return (
      <div style={{ padding: 40, color: 'white', background: '#1a1a2e' }}>
        <h1>No Session Token</h1>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <a href="/login">Go to Login</a>
      </div>
    )
  }
  
  const session = await getSession(sessionToken)
  
  if (!session) {
    return (
      <div style={{ padding: 40, color: 'white', background: '#1a1a2e' }}>
        <h1>Invalid Session</h1>
        <pre>{JSON.stringify({ ...debugInfo, sessionValid: false }, null, 2)}</pre>
        <a href="/login">Go to Login</a>
      </div>
    )
  }
  
  return (
    <div style={{ padding: 40, color: 'white', background: '#1a1a2e', minHeight: '100vh' }}>
      <h1>✅ Session Valid!</h1>
      <p>Welcome, {session.user.firstName} {session.user.lastName}</p>
      <p>Email: {session.user.email}</p>
      <p>Organization: {session.user.organization?.name}</p>
      <hr />
      <p><a href="/dashboard" style={{ color: '#60a5fa' }}>Go to Real Dashboard →</a></p>
    </div>
  )
}
