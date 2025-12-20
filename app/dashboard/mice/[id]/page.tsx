'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Calendar, MapPin, Users, List, Clock, Trash2, ChevronDown, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type EventDetails = {
  id: string
  name: string
  event_type: string
  role: string
  venue: string
  event_date: string
  status: string
}

export default function EventCommandCenter() {
  const params = useParams()
  const id = params?.id as string 
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Status Dropdown State
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error('Error:', error)
      else setEvent(data)
      
      setLoading(false)
    }

    fetchEventDetails()
  }, [id])

  // --- HANDLERS ---
  const handleStatusChange = async (newStatus: string) => {
    if (!event) return
    setUpdatingStatus(true)
    
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', event.id)

    if (!error) {
      setEvent({ ...event, status: newStatus })
      setShowStatusMenu(false)
    }
    setUpdatingStatus(false)
  }

  const handleDeleteEvent = async () => {
    setIsDeleting(true)
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
      alert("Could not delete event: " + error.message)
      setIsDeleting(false)
    } else {
      router.push('/dashboard/mice')
      router.refresh()
    }
  }

  // --- HELPERS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-500 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-600 border-yellow-200'
    }
  }

  if (loading) return <div className="p-10 text-center text-cozy-sage animate-pulse">Loading command center...</div>
  if (!event) return <div className="p-10 text-center text-red-400">Event not found!</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      
      {/* Navigation Header */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/mice" className="inline-flex items-center text-cozy-sage hover:text-cozy-text transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Toolkit
        </Link>
        
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="text-gray-300 hover:text-red-400 hover:bg-red-50 p-2 rounded-xl transition-colors"
          title="Delete Event"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-8 shadow-soft border-2 border-green-100 relative overflow-visible z-10">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            
            {/* Title & Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-100 uppercase tracking-wider">
                  {event.event_type}
                </span>
                <span className="text-xs font-bold bg-blue-50 text-blue-500 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">
                  {event.role}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-cozy-text mb-2">{event.name}</h1>
              <div className="flex items-center gap-4 text-cozy-sage">
                <span className="flex items-center gap-1"><MapPin size={18} /> {event.venue}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={18} /> 
                  {new Date(event.event_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-2 transition-all ${getStatusColor(event.status)}`}
              >
                {updatingStatus ? 'Updating...' : event.status}
                <ChevronDown size={14} />
              </button>

              {/* Dropdown Menu */}
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <button onClick={() => handleStatusChange('planning')} className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-yellow-600 font-bold text-sm rounded-xl">
                      📝 Planning
                    </button>
                    <button onClick={() => handleStatusChange('active')} className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 font-bold text-sm rounded-xl">
                      🚀 Active
                    </button>
                    <button onClick={() => handleStatusChange('completed')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-500 font-bold text-sm rounded-xl">
                      ✅ Completed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MICE Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Run of Show (The Script) */}
        <Link href={`/dashboard/mice/${id}/run-of-show`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-purple-200 transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-cozy-text">Run of Show</h3>
            <p className="text-sm text-gray-400">Minute-by-minute program flow.</p>
          </div>
        </Link>

        {/* Module 2: Guest List (Attendees) */}
        <Link href={`/dashboard/mice/${id}/guests`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-orange-200 transition-all cursor-pointer group h-full">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-cozy-text">Guest List</h3>
            <p className="text-sm text-gray-400">Manage attendees & RSVPs.</p>
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
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 border-4 border-white ring-4 ring-green-100 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>

            <h3 className="text-xl font-bold text-cozy-text mb-2">Cancel Event?</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This will permanently delete <strong>{event.name}</strong> and all its timelines and guests.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
              >
                Keep Event
              </button>
              <button 
                onClick={handleDeleteEvent}
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