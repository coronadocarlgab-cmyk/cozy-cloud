'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, Coffee, LogOut, Heart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Academic', href: '/dashboard/academic', icon: BookOpen },
    { name: 'MICE', href: '/dashboard/mice', icon: Calendar },
    { name: 'Comfort', href: '/dashboard/personal', icon: Coffee },
  ]

  return (
    <div className="flex min-h-screen bg-cozy-cream">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-white border-r-2 border-cozy-pink/20 flex-col p-6 fixed h-full shadow-soft z-20">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <Heart className="text-cozy-pink fill-cozy-pink" size={28} />
          <span className="text-2xl font-bold text-cozy-text tracking-tight">Cozy Cloud</span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-cozy-pink text-white shadow-md transform scale-105'
                    : 'text-cozy-text hover:bg-cozy-cream hover:text-cozy-sage'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Logout */}
        <div className="pt-6 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-cozy-pink hover:bg-red-50 w-full rounded-2xl transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM BAR (Visible only on Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cozy-pink/20 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive ? 'text-cozy-pink' : 'text-gray-400'
                }`}
              >
                <item.icon size={24} fill={isActive ? "currentColor" : "none"} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            )
          })}
          {/* Mobile Logout (Small icon) */}
          <button onClick={handleLogout} className="text-gray-300 p-2">
            <LogOut size={20} />
          </button>
        </nav>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      {/* Added 'pb-24' so content doesn't hide behind the bottom bar on mobile */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  )
}