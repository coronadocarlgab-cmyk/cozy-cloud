'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, Calendar, ArrowRight, PenTool, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

type DashboardStats = {
  nextTrip: { id: string; title: string; destination: string; start_date: string } | null;
  activeEventsCount: number;
  supplierCount: number;
  name: string;
}

export default function DashboardHome() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    nextTrip: null,
    activeEventsCount: 0,
    supplierCount: 0,
    name: 'Traveler'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get User Profile (for Name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
        const firstName = "my princess"
      // 2. Get Next Upcoming Trip
      const today = new Date().toISOString()
      const { data: trips } = await supabase
        .from('itineraries')
        .select('id, title, destination, start_date')
        .gte('start_date', today) // Only future trips
        .order('start_date', { ascending: true })
        .limit(1)

      // 3. Get Active Events Count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active') // Only count 'active' events (or planning)

      // 4. Get Supplier Count
      const { count: supplierCount } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })

      setStats({
        nextTrip: trips && trips.length > 0 ? trips[0] : null,
        activeEventsCount: eventCount || 0,
        supplierCount: supplierCount || 0,
        name: firstName
      })
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  // --- TIME BASED GREETING ---
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-cozy-sage">
        <Loader2 className="animate-spin mr-2" /> Waking up your dashboard...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Hero Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-cozy-text mb-2">
            {greeting}, {stats.name}! 🌸
          </h1>
          <p className="text-cozy-sage text-lg">Here is what's happening in your world.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Next Adventure (Dynamic) */}
        <Link href={stats.nextTrip ? `/dashboard/academic/${stats.nextTrip.id}` : '/dashboard/academic'} className="group">
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-blue-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-500 px-2 py-1 rounded-full">Next Trip</span>
              </div>
              
              {stats.nextTrip ? (
                <>
                  <h3 className="text-xl font-bold text-gray-700 truncate">{stats.nextTrip.destination}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> 
                    {new Date(stats.nextTrip.start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-400">No trips planned</h3>
                  <p className="text-sm text-gray-400 mt-1">Ready for a new adventure?</p>
                </>
              )}
            </div>
            
            <div className="mt-6 flex items-center text-blue-400 text-sm font-bold group-hover:gap-2 transition-all">
              {stats.nextTrip ? 'View Itinerary' : 'Plan a Trip'} <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 2: Events (MICE) - Dynamic Count */}
        <Link href="/dashboard/mice">
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-green-200 cursor-pointer h-full group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                  <PenTool size={24} />
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-500 px-2 py-1 rounded-full">Events</span>
              </div>
              <h3 className="text-xl font-bold text-gray-600">MICE Toolkit</h3>
              <p className="text-sm text-gray-400 mt-1">
                {stats.activeEventsCount === 0 
                  ? 'No active events currently.' 
                  : `${stats.activeEventsCount} active project${stats.activeEventsCount === 1 ? '' : 's'}.`
                }
              </p>
            </div>
            <div className="mt-6 flex items-center text-green-500 text-sm font-bold group-hover:gap-2 transition-all">
              Manage Events <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 3: Directory - Dynamic Count */}
        <Link href="/dashboard/directory">
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-purple-200 cursor-pointer h-full group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="text-xs font-bold bg-purple-100 text-purple-500 px-2 py-1 rounded-full">Network</span>
              </div>
              <h3 className="text-xl font-bold text-gray-600">Supplier Directory</h3>
              <p className="text-sm text-gray-400 mt-1">
                 {stats.supplierCount} contact{stats.supplierCount === 1 ? '' : 's'} saved.
              </p>
            </div>
            <div className="mt-6 flex items-center text-purple-500 text-sm font-bold group-hover:gap-2 transition-all">
              Browse Directory <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* Optional: Quote or Footer area */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8 flex items-center justify-between opacity-80">
        <div>
          <h4 className="font-bold text-cozy-text text-lg">"The world is a book and those who do not travel read only one page."</h4>
          <p className="text-cozy-sage text-sm mt-1">— St. Augustine</p>
        </div>
        <div className="text-4xl">🌍</div>
      </div>

    </div>
  )
}