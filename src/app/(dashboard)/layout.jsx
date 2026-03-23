// Dashboard layout - Protected area
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { Sidebar } from '@/components/sidebar'

// Prevent caching to ensure fresh session checks
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  
  if (!sessionToken) {
    redirect('/login?reason=no-session')
  }
  
  const session = await getSession(sessionToken)

  if (!session) {
    redirect('/login?reason=invalid-session')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950 overflow-hidden">
      <Sidebar user={session.user} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}