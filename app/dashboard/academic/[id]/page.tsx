'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Calendar, MapPin, FileText, DollarSign, Clock, Trash2, Check, ChevronDown, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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
  const id = params?.id as string 
  const router = useRouter()
  const supabase = createClient()

  const [trip, setTrip] = useState<TripDetails | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Status Dropdown State
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error:', error)
      } else {
        setTrip(data)
      }
      setLoading(false)
    }

    fetchTripDetails()
  }, [id])

  // --- HANDLERS ---

  const handleStatusChange = async (newStatus: string) => {
    if (!trip) return
    setUpdatingStatus(true)
    
    const { error } = await supabase
      .from('itineraries')
      .update({ status: newStatus })
      .eq('id', trip.id)

    if (!error) {
      setTrip({ ...trip, status: newStatus })
      setShowStatusMenu(false)
    }
    setUpdatingStatus(false)
  }

  const handleDeleteTrip = async () => {
    setIsDeleting(true)
    // Cascading delete in SQL handles the sub-tables (expenses, docs, activities)
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Could not delete trip: " + error.message)
      setIsDeleting(false)
    } else {
      router.push('/dashboard/academic') // Send back to hub
      router.refresh()
    }
  }

  // --- UI HELPERS ---

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-600 border-green-200'
      default: return 'bg-yellow-100 text-yellow-600 border-yellow-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed ✈️'
      case 'completed': return 'Completed ✅'
      default: return 'Planning 📝'
    }
  }

  if (loading) return <div className="p-10 text-center text-cozy-sage animate-pulse">Loading adventure details...</div>
  if (!trip) return <div className="p-10 text-center text-red-400">Trip not found!</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      
      {/* Navigation Header */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/academic" className="inline-flex items-center text-cozy-sage hover:text-cozy-text transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Hub
        </Link>
        
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="text-gray-300 hover:text-red-400 hover:bg-red-50 p-2 rounded-xl transition-colors"
          title="Delete Trip"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-8 shadow-soft border-2 border-cozy-pink/20 relative overflow-visible z-10">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            
            {/* Title & Info */}
            <div>
              <h1 className="text-4xl font-bold text-cozy-text mb-2">{trip.title}</h1>
              <div className="flex items-center gap-4 text-cozy-sage">
                <span className="flex items-center gap-1"><MapPin size={18} /> {trip.destination}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={18} /> 
                  {new Date(trip.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-2 transition-all ${getStatusColor(trip.status)}`}
              >
                {updatingStatus ? 'Updating...' : getStatusLabel(trip.status)}
                <ChevronDown size={14} />
              </button>

              {/* Dropdown Menu */}
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <button onClick={() => handleStatusChange('planning')} className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-yellow-600 font-bold text-sm rounded-xl flex items-center gap-2">
                      📝 Planning
                    </button>
                    <button onClick={() => handleStatusChange('confirmed')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 font-bold text-sm rounded-xl flex items-center gap-2">
                      ✈️ Confirmed
                    </button>
                    <button onClick={() => handleStatusChange('completed')} className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 font-bold text-sm rounded-xl flex items-center gap-2">
                      ✅ Completed
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        
        {/* Decorative background blob */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cozy-pink/10 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Tabs / Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Itinerary */}
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
        <Link href={`/dashboard/academic/${id}/budget`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-green-200 transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <h3 className="text-lg font-bold text-cozy-text">Trip Budget</h3>
            <p className="text-sm text-gray-400">Track expenses</p>
          </div>
        </Link>

        {/* Module 3: Documents */}
        <Link href={`/dashboard/academic/${id}/documents`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-cozy-pink transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-cozy-pink mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-cozy-text">Documents</h3>
            <p className="text-sm text-gray-400">Tickets & PDFs</p>
          </div>
        </Link>

      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 border-4 border-white ring-4 ring-cozy-pink/20 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>

            <h3 className="text-xl font-bold text-cozy-text mb-2">Delete Trip?</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Are you sure? This will permanently remove the itinerary, all expenses, and documents for <strong>{trip.title}</strong>.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTrip}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}