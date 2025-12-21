'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plane, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import CozyDatePicker from '@/app/components/ui/CozyDatePicker' // <--- NEW IMPORT

export default function NewTrip() {
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    notes: ''
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
        .from('itineraries')
        .insert([{
          ...formData,
          user_id: user.id,
          status: 'planning'
        }])
      
      if (!error) {
        router.push('/dashboard/academic')
      } else {
        alert('Error creating trip: ' + error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/academic" className="inline-flex items-center gap-2 text-gray-400 hover:text-cozy-text mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Academic Hub
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-400">
            <Plane size={24} />
          </div>
          <h1 className="text-2xl font-bold text-cozy-text">Plan a New Adventure</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Destination */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Where to?</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. Paris, France"
                className="w-full bg-gray-50 rounded-xl py-3 pl-12 pr-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
            </div>
          </div>

          {/* DATES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Start Date */}
            <CozyDatePicker 
              label="Start Date"
              value={formData.start_date}
              onChange={(val) => setFormData({...formData, start_date: val})}
            />

            {/* End Date */}
            <CozyDatePicker 
              label="End Date"
              value={formData.end_date}
              onChange={(val) => setFormData({...formData, end_date: val})}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quick Notes</label>
            <textarea
              rows={4}
              placeholder="Main goals for this trip..."
              className="w-full bg-gray-50 rounded-xl p-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cozy-pink text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Planning ✈️'}
          </button>
        </form>
      </div>
    </div>
  )
}