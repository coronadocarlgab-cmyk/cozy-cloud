'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import CozyDatePicker from '@/app/components/ui/CozyDatePicker' // <--- NEW IMPORT

export default function NewEvent() {
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    location: '',
    role: 'Organizer'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('mice_events')
        .insert([{
          ...formData,
          user_id: user.id,
          status: 'upcoming'
        }])
      
      if (!error) {
        router.push('/dashboard/mice')
      } else {
        alert('Error creating event: ' + error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/mice" className="inline-flex items-center gap-2 text-gray-400 hover:text-cozy-text mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to MICE Dashboard
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-50 rounded-2xl text-purple-400">
            <Calendar size={24} />
          </div>
          <h1 className="text-2xl font-bold text-cozy-text">New Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Event Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Event Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Gala 2024"
              className="w-full bg-gray-50 rounded-xl p-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              value={formData.event_name}
              onChange={(e) => setFormData({...formData, event_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Date (Replaced) */}
            <CozyDatePicker 
              label="Event Date"
              value={formData.event_date}
              onChange={(val) => setFormData({...formData, event_date: val})}
            />

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Grand Hall"
                  className="w-full bg-gray-50 rounded-xl py-3 pl-12 pr-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">My Role</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <select
                className="w-full bg-gray-50 rounded-xl py-3 pl-12 pr-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option>Organizer</option>
                <option>Volunteer</option>
                <option>Attendee</option>
                <option>Speaker</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-400 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Create Event 🎉'}
          </button>
        </form>
      </div>
    </div>
  )
}