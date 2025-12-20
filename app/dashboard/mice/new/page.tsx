'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { PenTool, MapPin, Calendar, ArrowLeft, Save, Users, Mic } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Conference',
    role: 'Organizer',
    venue: '',
    event_date: ''
  })

  const EVENT_TYPES = ['Conference', 'Meeting', 'Incentive Trip', 'Exhibition', 'Wedding', 'Party', 'Other']
  const ROLES = ['Organizer', 'Coordinator', 'Host/Emcee', 'Volunteer', 'Attendee']

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Please log in first!')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('events')
      .insert([{
        user_id: user.id,
        name: formData.name,
        event_type: formData.event_type,
        role: formData.role,
        venue: formData.venue,
        event_date: formData.event_date,
        status: 'planning'
      }])

    if (error) {
      alert('Error creating event: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/mice')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/mice" 
        className="inline-flex items-center text-cozy-sage hover:text-cozy-text mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Toolkit
      </Link>

      <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-50 p-8 border-b border-green-100">
          <h1 className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <PenTool className="text-green-500" /> New MICE Project
          </h1>
          <p className="text-cozy-sage text-sm mt-1">Let's plan something memorable.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Event Name</label>
            <input
              required
              type="text"
              placeholder="e.g., Annual Tourism Summit 2025"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-green-300 focus:bg-white rounded-2xl p-4 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Users size={14} /> Event Type
              </label>
              <select
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-300 focus:bg-white rounded-2xl p-4 outline-none transition-all appearance-none cursor-pointer"
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value})}
              >
                {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mic size={14} /> My Role
              </label>
              <select
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-300 focus:bg-white rounded-2xl p-4 outline-none transition-all appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>

          {/* Venue Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={14} /> Venue
            </label>
            <input
              required
              type="text"
              placeholder="e.g., SMX Convention Center"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-green-300 focus:bg-white rounded-2xl p-4 outline-none transition-all"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
            />
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={14} /> Event Date
            </label>
            <input
              required
              type="date"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-green-300 focus:bg-white rounded-2xl p-4 outline-none transition-all text-cozy-text"
              value={formData.event_date}
              onChange={(e) => setFormData({...formData, event_date: e.target.value})}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cozy-text text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-700 hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Initialize Event'} <Save size={18} />
          </button>

        </form>
      </div>
    </div>
  )
}