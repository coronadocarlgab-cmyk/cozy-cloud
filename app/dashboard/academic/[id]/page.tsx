'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Calendar, MapPin, FileText, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type TripDetails = {
  id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  status: string
}

export default function TripDetailsPage() {
  const params = useParams()
  const id = params?.id as string // Get the ID from the URL
  
  const supabase = createClient()
  const [trip, setTrip] = useState<TripDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single() // We expect only one result

      if (error) {
        console.error('Error:', error)
      } else {
        setTrip(data)
      }
      setLoading(false)
    }

    fetchTripDetails()
  }, [id])

  if (loading) return <div className="p-10 text-center text-cozy-sage animate-pulse">Loading adventure details...</div>
  if (!trip) return <div className="p-10 text-center text-red-400">Trip not found!</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Navigation */}
      <Link href="/dashboard/academic" className="inline-flex items-center text-cozy-sage hover:text-cozy-text transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Hub
      </Link>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-8 shadow-soft border-2 border-cozy-pink/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-cozy-text mb-2">{trip.title}</h1>
              <div className="flex items-center gap-4 text-cozy-sage">
                <span className="flex items-center gap-1"><MapPin size={18} /> {trip.destination}</span>
                <span className="flex items-center gap-1"><Calendar size={18} /> {new Date(trip.start_date).toLocaleDateString()}</span>
              </div>
            </div>
            <span className="bg-cozy-pink/20 text-cozy-text px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide">
              {trip.status}
            </span>
          </div>
        </div>
        {/* Decorative background circle */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cozy-pink/10 rounded-full blur-3xl"></div>
      </div>

      {/* Tabs / Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Itinerary (NOW CLICKABLE) */}
        <Link href={`/dashboard/academic/${id}/itinerary`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-blue-200 transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-cozy-text">Day-by-Day</h3>
            <p className="text-sm text-gray-400">View daily schedule</p>
          </div>
        </Link>

        {/* Module 2: Budget */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-green-200 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <h3 className="text-lg font-bold text-cozy-text">Trip Budget</h3>
          <p className="text-sm text-gray-400">Track expenses</p>
        </div>

        {/* Module 3: Documents (The File Repository) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-cozy-pink transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-cozy-pink mb-4 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold text-cozy-text">Documents</h3>
          <p className="text-sm text-gray-400">Tickets & PDFs</p>
        </div>

      </div>
    </div>
  )
}