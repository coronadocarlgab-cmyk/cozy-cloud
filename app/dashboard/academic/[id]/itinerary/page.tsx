'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, Trash2, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Activity = {
  id: string
  day_number: number
  start_time: string
  activity_name: string
  location: string
  notes: string
}

export default function ItineraryBuilder() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    day_number: 1,
    start_time: '',
    activity_name: '',
    location: '',
  })

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('itinerary_activities')
      .select('*')
      .eq('itinerary_id', id)
      .order('day_number', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) setActivities(data)
  }

  useEffect(() => {
    fetchActivities()
  }, [id])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate Time
    if (!newActivity.start_time) {
        alert("Please select a time!")
        return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('itinerary_activities')
      .insert([{
        ...newActivity,
        itinerary_id: id,
        user_id: user.id
      }])

    if (error) alert(error.message)
    else {
      setNewActivity({ ...newActivity, activity_name: '', location: '', start_time: '' }) 
      fetchActivities()
    }
  }

  const handleDelete = async (activityId: string) => {
    if(!confirm("Remove this activity?")) return
    await supabase.from('itinerary_activities').delete().eq('id', activityId)
    fetchActivities()
  }

  // Group activities by Day
  const groupedActivities = activities.reduce((acc, curr) => {
    const day = curr.day_number
    if (!acc[day]) acc[day] = []
    acc[day].push(curr)
    return acc
  }, {} as Record<number, Activity[]>)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/academic/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-cozy-sage" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Itinerary Planner</h1>
          <p className="text-cozy-sage text-sm">Drafting the master plan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: The Form */}
        <div className="lg:col-span-1 relative z-20"> 
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-blue-100 sticky top-8">
            <h3 className="font-bold text-cozy-text mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-400" /> Add Activity
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Day #</label>
                <input 
                  type="number" min="1" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                  value={newActivity.day_number}
                  onChange={e => setNewActivity({...newActivity, day_number: parseInt(e.target.value)})}
                />
              </div>

              {/* --- MANUAL TIME INPUT ONLY --- */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Time</label>
                <input 
                    type="time" 
                    required
                    className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none text-cozy-text"
                    value={newActivity.start_time}
                    onChange={(e) => setNewActivity({...newActivity, start_time: e.target.value})}
                />
              </div>
              {/* ------------------------------ */}

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Activity</label>
                <input 
                  type="text" placeholder="e.g. Visit Louvre" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                  value={newActivity.activity_name}
                  onChange={e => setNewActivity({...newActivity, activity_name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                <input 
                  type="text" placeholder="Optional"
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                  value={newActivity.location}
                  onChange={e => setNewActivity({...newActivity, location: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-blue-400 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors shadow-md cursor-pointer">
                Add to Schedule
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: The Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="text-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-3xl">
              Start adding activities on the left! 👈
            </div>
          ) : (
            Object.keys(groupedActivities).map((day: any) => (
              <div key={day} className="relative">
                {/* Day Header */}
                <div className="sticky top-0 z-10 bg-cozy-cream/95 backdrop-blur-sm py-2 mb-4">
                  <span className="bg-blue-100 text-blue-600 font-bold px-4 py-1 rounded-full text-sm">
                    Day {day}
                  </span>
                </div>

                {/* Activities List */}
                <div className="space-y-4 border-l-2 border-blue-100 ml-4 pl-6 relative">
                  {groupedActivities[day].map((activity) => (
                    <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-100 group transition-all relative">
                      
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-white border-4 border-blue-200"></div>

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                            <Clock size={12} /> {activity.start_time}
                          </div>
                          <h4 className="font-bold text-cozy-text">{activity.activity_name}</h4>
                          {activity.location && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin size={12} /> {activity.location}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDelete(activity.id)}
                          className="text-gray-200 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}