// Auth layout for login and register pages
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform glow-purple">
                <Heart className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black text-white tracking-tight">DonorConnect</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}