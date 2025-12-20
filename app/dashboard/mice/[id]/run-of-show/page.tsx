'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, Trash2, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// Ensure this path matches your folder structure (app/components/ui)
import CozyTimePicker from '@/app/components/ui/CozyTimePicker'

type ScriptItem = {
  id: string
  day_number: number
  start_time: string
  end_time: string
  activity: string
  personnel: string
  notes: string
}

export default function RunOfShow() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [items, setItems] = useState<ScriptItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [newItem, setNewItem] = useState({
    day_number: 1,
    start_time: '',
    end_time: '',
    activity: '',
    personnel: '',
    notes: ''
  })

  const fetchScript = async () => {
    const { data } = await supabase
      .from('run_of_show')
      .select('*')
      .eq('event_id', id)
      .order('day_number', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchScript()
  }, [id])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('run_of_show')
      .insert([{
        ...newItem,
        event_id: id,
        user_id: user.id
      }])

    if (error) alert(error.message)
    else {
      // Reset form
      setNewItem({ ...newItem, activity: '', personnel: '', notes: '', start_time: '', end_time: '' })
      fetchScript()
    }
  }

  const handleDelete = async (itemId: string) => {
    if(!confirm("Remove this cue from the script?")) return
    await supabase.from('run_of_show').delete().eq('id', itemId)
    fetchScript()
  }

  // Group by Day
  const groupedItems = items.reduce((acc, curr) => {
    const day = curr.day_number
    if (!acc[day]) acc[day] = []
    acc[day].push(curr)
    return acc
  }, {} as Record<number, ScriptItem[]>)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/mice/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-cozy-sage" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Run of Show</h1>
          <p className="text-cozy-sage text-sm">The master script for the event.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT: Add Item Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-purple-100 sticky top-8">
            <h3 className="font-bold text-cozy-text mb-4 flex items-center gap-2">
              <Plus size={18} className="text-purple-400" /> Add Cue
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Day #</label>
                <input 
                  type="number" min="1" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                  value={newItem.day_number}
                  onChange={e => setNewItem({...newItem, day_number: parseInt(e.target.value)})}
                />
              </div>

              {/* NEW COZY TIME PICKERS */}
              <div className="grid grid-cols-2 gap-4">
                <CozyTimePicker 
                  label="Start"
                  value={newItem.start_time}
                  onChange={(val) => setNewItem({...newItem, start_time: val})}
                />
                <CozyTimePicker 
                  label="End"
                  value={newItem.end_time}
                  onChange={(val) => setNewItem({...newItem, end_time: val})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Activity / Segment</label>
                <input 
                  type="text" placeholder="e.g. National Anthem" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                  value={newItem.activity}
                  onChange={e => setNewItem({...newItem, activity: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Person / Tech</label>
                <input 
                  type="text" placeholder="e.g. Host / Play Video A"
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                  value={newItem.personnel}
                  onChange={e => setNewItem({...newItem, personnel: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Notes</label>
                <textarea 
                  placeholder="e.g. Make sure mic is ON"
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none h-20 resize-none"
                  value={newItem.notes}
                  onChange={e => setNewItem({...newItem, notes: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-md cursor-pointer">
                Add to Script
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: The Script Table */}
        <div className="lg:col-span-3 space-y-8">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-3xl">
              <PlayCircle size={48} className="mx-auto mb-2 text-purple-200" />
              Start building the show flow! 🎬
            </div>
          ) : (
            Object.keys(groupedItems).map((day: any) => (
              <div key={day} className="relative">
                <h3 className="font-bold text-purple-600 bg-purple-50 inline-block px-4 py-1 rounded-full text-sm mb-4 border border-purple-100">
                  Day {day} Schedule
                </h3>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-32">Time</th>
                        <th className="p-4">Activity</th>
                        <th className="p-4 w-48 hidden md:table-cell">Personnel / Tech</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groupedItems[day].map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/30 transition-colors group">
                          
                          {/* Time Column */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-cozy-text flex items-center gap-1">
                              {item.start_time}
                            </div>
                            {item.end_time && (
                              <div className="text-xs text-gray-400 mt-1 pl-1 border-l-2 border-purple-200">
                                to {item.end_time}
                              </div>
                            )}
                          </td>

                          {/* Activity Column */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-gray-800 text-base">{item.activity}</div>
                            {item.notes && (
                                <div className="text-xs text-orange-500 mt-1 italic flex items-center gap-1 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                  Note: {item.notes}
                                </div>
                            )}
                            {/* Mobile View Personnel */}
                            <div className="md:hidden text-xs text-blue-500 mt-2 font-bold">
                                👤 {item.personnel}
                            </div>
                          </td>

                          {/* Personnel Column (Desktop) */}
                          <td className="p-4 align-top hidden md:table-cell">
                             {item.personnel && (
                               <div className="text-sm text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                 {item.personnel}
                                </div>
                             )}
                          </td>

                          {/* Action */}
                          <td className="p-4 align-top text-right">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-gray-300 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}