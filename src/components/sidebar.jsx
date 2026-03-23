'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Gift, 
  TrendingUp, 
  CheckSquare, 
  FolderTree, 
  Workflow,
  LogOut,
  User,
  Zap,
  Heart,
  FileText,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Donors', href: '/donors', icon: Users },
  { name: 'Donations', href: '/donations', icon: Gift },
  { name: 'Campaigns', href: '/campaigns', icon: TrendingUp },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Segments', href: '/segments', icon: FolderTree },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
]

const documentationLinks = [
  { name: 'Evidence', href: '/evidence', icon: FileText },
  { name: 'Reflection', href: '/reflection', icon: MessageSquare },
]

export function Sidebar({ user }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-gradient-to-b from-gray-900/95 via-purple-950/30 to-gray-900/95 backdrop-blur-xl shadow-2xl">
      <div className="flex h-16 items-center px-6 border-b border-white/10 bg-gradient-to-r from-purple-900/50 to-pink-900/30">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform glow-purple">
            <Heart className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">DonorConnect</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-white/10" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                  isActive ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                )} 
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </Link>
          )
        })}
        
        {/* Documentation Section */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documentation</p>
          {documentationLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-white/10" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <item.icon 
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                    isActive ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                  )} 
                />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/10">
            <User className="h-5 w-5 text-purple-300" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 group border border-transparent hover:border-red-500/20"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-red-400 group-hover:scale-110" />
          Logout
        </button>
      </div>
    </div>
  )
}
