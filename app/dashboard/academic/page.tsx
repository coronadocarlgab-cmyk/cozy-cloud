'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Map, Plus, Calendar, Plane } from 'lucide-react'
import Link from 'next/link'

type Itinerary = {
  id: string
  title: string
  destination: string
  start_date: string
  status: string
}

export default function AcademicHub() {
  const supabase = createClient()
  const [trips, setTrips] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('start_date', { ascending: true })

      if (data) setTrips(data)
      setLoading(false)
    }
    fetchTrips()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-cozy-text flex items-center gap-2">
            Academic Hub <Plane className="text-cozy-pink -rotate-45" />
          </h1>
          <p className="text-cozy-sage text-sm">Manage your tourism requirements & field trips.</p>
        </div>
        
        {/* New Trip Button (Correctly Linked) */}
        <Link href="/dashboard/academic/new">
          <button className="bg-cozy-sage text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-[#A39D7A] transition-colors flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> New Trip
          </button>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-cozy-pink/30 flex flex-col items-center justify-center text-center text-gray-400">
            <Map size={48} className="mb-4 text-cozy-pink/50" />
            <p>No trips planned yet.</p>
            <p className="text-sm">Time to plan a new adventure!</p>
          </div>
        )}

        {/* Trip Cards (NOW CLICKABLE) */}
        {trips.map((trip) => (
          <Link 
            href={`/dashboard/academic/${trip.id}`} 
            key={trip.id} 
            className="block group"
          >
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-cozy-cream hover:border-cozy-pink transition-all relative overflow-hidden h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-400 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  <Map size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  trip.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {trip.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-cozy-text mb-1">{trip.title}</h3>
              <p className="text-gray-400 text-sm mb-6 flex items-center gap-1">
                📍 {trip.destination || 'No destination set'}
              </p>

              <div className="flex items-center gap-2 text-sm text-cozy-sage font-medium bg-cozy-cream/50 p-3 rounded-xl">
                <Calendar size={16} />
                {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}