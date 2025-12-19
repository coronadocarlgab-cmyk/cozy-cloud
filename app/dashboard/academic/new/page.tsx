'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plane, MapPin, Calendar, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewTripPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: ''
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Please log in first!')
      setLoading(false)
      return
    }

    // 2. Insert data into 'itineraries' table
    const { error } = await supabase
      .from('itineraries')
      .insert([{
        user_id: user.id,
        title: formData.title,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'planning'
      }])

    if (error) {
      alert('Error creating trip: ' + error.message)
      setLoading(false)
    } else {
      // 3. Success! Redirect back to Academic Hub
      router.push('/dashboard/academic')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/academic" 
        className="inline-flex items-center text-cozy-sage hover:text-cozy-text mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Hub
      </Link>

      <div className="bg-white rounded-3xl shadow-lg border border-cozy-pink/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-cozy-pink/10 p-8 border-b border-cozy-pink/20">
          <h1 className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <Plane className="text-cozy-pink" /> Plan New Adventure
          </h1>
          <p className="text-cozy-sage text-sm mt-1">Where are we going next?</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trip Name</label>
            <input
              required
              type="text"
              placeholder="e.g., Palawan Field Trip 2025"
              className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white rounded-2xl p-4 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Destination Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={14} /> Destination
            </label>
            <input
              required
              type="text"
              placeholder="e.g., El Nido, Palawan"
              className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white rounded-2xl p-4 outline-none transition-all"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> Start Date
              </label>
              <input
                required
                type="date"
                className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white rounded-2xl p-4 outline-none transition-all text-cozy-text"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> End Date
              </label>
              <input
                required
                type="date"
                className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white rounded-2xl p-4 outline-none transition-all text-cozy-text"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cozy-text text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-700 hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Itinerary'} <Save size={18} />
          </button>

        </form>
      </div>
    </div>
  )
}