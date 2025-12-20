'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Calendar, MapPin, PenTool } from 'lucide-react'
import Link from 'next/link'

type Event = {
  id: string
  name: string
  event_type: string
  role: string
  event_date: string
  venue: string
  status: string
}

export default function MiceHub() {
  const supabase = createClient()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (data) setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-cozy-text flex items-center gap-2">
            MICE Toolkit <PenTool className="text-green-400" />
          </h1>
          <p className="text-cozy-sage text-sm">Meetings, Incentives, Conferences & Exhibitions.</p>
        </div>
        
        <Link href="/dashboard/mice/new">
          <button className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-green-600 transition-colors flex items-center gap-2">
            <Plus size={18} /> New Event
          </button>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center text-center text-gray-400">
            <PenTool size={48} className="mb-4 text-green-200" />
            <p>No events managed yet.</p>
            <p className="text-sm">Start your first project!</p>
          </div>
        )}

        {/* Event Cards */}
        {events.map((event) => (
          <Link href={`/dashboard/mice/${event.id}`} key={event.id} className="block group">
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-cozy-cream hover:border-green-300 transition-all relative overflow-hidden h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-50 text-green-500 p-3 rounded-2xl group-hover:bg-green-100 transition-colors">
                  <Calendar size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  event.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'
                }`}>
                  {event.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-cozy-text mb-1 truncate">{event.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                📍 {event.venue || 'TBA'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}