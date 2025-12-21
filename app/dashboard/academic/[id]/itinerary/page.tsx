'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, Check, X, Pencil } from 'lucide-react' // <--- Added Pencil here
import Link from 'next/link'
import { useParams } from 'next/navigation'
import CozyTimePicker from '@/app/components/ui/CozyTimePicker'
import DownloadButton from './DownloadButton'
import DraggableActivityList from './DraggableActivityList'

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
  const [destinationName, setDestinationName] = useState('Unknown')
  
  // EDIT MODE STATE
  const [editingId, setEditingId] = useState<string | null>(null) // If null, we are adding new
  const [formData, setFormData] = useState({
    day_number: 1,
    start_time: '',
    activity_name: '',
    location: '',
  })

  const fetchData = async () => {
    const { data: itin } = await supabase.from('itineraries').select('destination').eq('id', id).single()
    if (itin) setDestinationName(itin.destination)

    const { data } = await supabase
      .from('itinerary_activities')
      .select('*')
      .eq('itinerary_id', id)
      .order('day_number', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) setActivities(data)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // --- ACTIONS ---

  const handleEditClick = (activity: any) => {
    setEditingId(activity.id)
    setFormData({
      day_number: activity.day_number,
      start_time: activity.start_time,
      activity_name: activity.activity_name,
      location: activity.location || '',
    })
    // Scroll to top/form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ day_number: 1, start_time: '', activity_name: '', location: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.start_time) { alert("Please select a time!"); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      // UPDATE EXISTING
      const { error } = await supabase
        .from('itinerary_activities')
        .update({ ...formData })
        .eq('id', editingId)

      if (error) alert(error.message)
      else {
        handleCancelEdit() // Reset form
        fetchData()
      }
    } else {
      // CREATE NEW
      const { error } = await supabase
        .from('itinerary_activities')
        .insert([{ ...formData, itinerary_id: id, user_id: user.id }])

      if (error) alert(error.message)
      else {
        setFormData({ ...formData, activity_name: '', location: '', start_time: '' }) 
        fetchData()
      }
    }
  }

  const handleDelete = async (activityId: string) => {
    if(!confirm("Remove this activity?")) return
    await supabase.from('itinerary_activities').delete().eq('id', activityId)
    setActivities(prev => prev.filter(a => a.id !== activityId))
  }

  const handleReorder = (dayNumber: number, newOrder: Activity[]) => {
    setActivities(prev => {
      const others = prev.filter(a => a.day_number !== dayNumber)
      return [...others, ...newOrder]
    })
  }

  const groupedActivities = activities.reduce((acc, curr) => {
    const day = curr.day_number
    if (!acc[day]) acc[day] = []
    acc[day].push(curr)
    return acc
  }, {} as Record<number, Activity[]>)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/academic/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm">
            <ArrowLeft size={20} className="text-cozy-sage" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-cozy-text">Itinerary Planner</h1>
            <p className="text-cozy-sage text-sm">Drafting the master plan for {destinationName}.</p>
          </div>
        </div>
        <DownloadButton destination={destinationName} activities={activities} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: FORM (Create OR Edit) */}
        <div className="lg:col-span-1 relative z-20"> 
          <div className={`
            p-6 rounded-3xl shadow-soft border sticky top-8 transition-colors
            ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-blue-100'}
          `}>
            <h3 className="font-bold text-cozy-text mb-4 flex items-center gap-2">
              {editingId ? <><Pencil size={18} className="text-blue-500"/> Edit Activity</> : <><Plus size={18} className="text-blue-400"/> Add Activity</>}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Day #</label>
                <input type="number" min="1" required className="w-full bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none shadow-inner-soft" value={formData.day_number} onChange={e => setFormData({...formData, day_number: parseInt(e.target.value)})} />
              </div>
              
              <CozyTimePicker label="Start Time" value={formData.start_time} onChange={(val) => setFormData({...formData, start_time: val})} />
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Activity</label>
                <input type="text" placeholder="e.g. Visit Louvre" required className="w-full bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none shadow-inner-soft" value={formData.activity_name} onChange={e => setFormData({...formData, activity_name: e.target.value})} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                <input type="text" placeholder="Optional" className="w-full bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none shadow-inner-soft" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-400 text-white font-bold py-3 rounded-xl hover:bg-blue-500 shadow-md cursor-pointer btn-tactile flex items-center justify-center gap-2">
                  {editingId ? <><Check size={18}/> Update</> : 'Add to Schedule'}
                </button>
                
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="px-4 bg-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-300">
                    <X size={18}/>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: TIMELINE */}
        <div className="lg:col-span-2 space-y-8">
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="text-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-3xl">Start adding activities on the left! 👈</div>
          ) : (
            Object.keys(groupedActivities).map((day: any) => (
              <div key={day} className="relative animate-fade-in">
                <div className="sticky top-0 z-10 bg-cozy-cream/95 backdrop-blur-sm py-2 mb-4">
                  <span className="bg-blue-100 text-blue-600 font-bold px-4 py-1 rounded-full text-sm shadow-sm">Day {day}</span>
                </div>
                
                <DraggableActivityList 
                  dayNumber={parseInt(day)}
                  activities={groupedActivities[day]}
                  onReorder={handleReorder}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}