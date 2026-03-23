'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DocsNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    // Check if user is logged in by calling session API
    fetch('/api/auth/session')
      .then(res => res.ok ? res.json() : null)
      .then(data => setIsLoggedIn(!!data?.user))
      .catch(() => setIsLoggedIn(false))
  }, [])
  
  const publicNavItems = [
    { href: '/about', label: 'Problem' },
    { href: '/why-donorconnect', label: 'Solution' },
    { href: '/ai-policy', label: 'AI Policy' },
  ]
  
  const protectedNavItems = [
    { href: '/evidence', label: 'Evidence' },
    { href: '/reflection', label: 'Reflection' },
  ]

  return (
    <header className="bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="hover:opacity-80 transition">
              <h1 className="text-2xl font-bold text-purple-400">DonorConnect</h1>
              <p className="text-sm text-gray-400">Making a difference together</p>
            </Link>
          </div>
          <nav className="flex gap-2 items-center flex-wrap">
            {publicNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`text-gray-300 hover:text-white hover:bg-purple-500/20 ${
                    pathname === item.href ? 'bg-purple-500/20 text-white' : ''
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {isLoggedIn && protectedNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`text-gray-300 hover:text-white hover:bg-purple-500/20 ${
                    pathname === item.href ? 'bg-purple-500/20 text-white' : ''
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="w-px h-6 bg-purple-500/30 mx-2" />
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-purple-500/20">
                Dashboard
              </Button>
            </Link>
            {!isLoggedIn && (
              <Link href="/login">
                <Button className="bg-slate-950 text-white border border-purple-500/50 hover:bg-purple-500/20">
                  Staff Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
