'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, Trash2, Users, UserCheck, Utensils, Mail, Star, ChevronDown, Check } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Guest = {
  id: string
  name: string
  role: string
  status: string
  contact_info: string
  dietary_restrictions: string
}

export default function GuestList() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  
  // Track which guest's menu is currently open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Form State
  const [newGuest, setNewGuest] = useState({
    name: '',
    role: 'Attendee',
    status: 'Invited',
    contact_info: '',
    dietary_restrictions: ''
  })

  // --- FETCH GUESTS ---
  const fetchGuests = async () => {
    const { data } = await supabase
      .from('event_guests')
      .select('*')
      .eq('event_id', id)
      .order('name', { ascending: true })

    if (data) setGuests(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGuests()
  }, [id])

  // --- ADD GUEST ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('event_guests')
      .insert([{
        ...newGuest,
        event_id: id,
        user_id: user.id
      }])

    if (error) alert(error.message)
    else {
      setNewGuest({ ...newGuest, name: '', contact_info: '', dietary_restrictions: '' })
      fetchGuests()
    }
  }

  // --- DELETE GUEST ---
  const handleDelete = async (guestId: string) => {
    if(!confirm("Remove this guest from the list?")) return
    await supabase.from('event_guests').delete().eq('id', guestId)
    fetchGuests()
  }

  // --- UPDATE STATUS (New Feature) ---
  const handleStatusUpdate = async (guestId: string, newStatus: string) => {
    // 1. Optimistic Update (Update UI immediately for speed)
    setGuests(guests.map(g => g.id === guestId ? { ...g, status: newStatus } : g))
    setOpenMenuId(null) // Close menu

    // 2. Database Update
    await supabase
      .from('event_guests')
      .update({ status: newStatus })
      .eq('id', guestId)
  }

  // --- STATS CALCULATION ---
  const totalGuests = guests.length
  const confirmedCount = guests.filter(g => g.status === 'Confirmed' || g.status === 'Checked In').length
  const pendingCount = guests.filter(g => g.status === 'Invited').length
  const dietaryCount = guests.filter(g => g.dietary_restrictions).length

  // Helper for Badge Colors
  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'Confirmed': return 'bg-green-100 text-green-600 hover:bg-green-200'
        case 'Checked In': return 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        case 'Declined': return 'bg-red-50 text-red-400 hover:bg-red-100'
        default: return 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" onClick={() => setOpenMenuId(null)}>
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/mice/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-cozy-sage" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Guest List</h1>
          <p className="text-cozy-sage text-sm">Manage attendees and RSVPs.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-blue-200">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Total Invited</div>
          <div className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <Users size={20} className="text-blue-400" /> {totalGuests}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-green-200">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <UserCheck size={20} className="text-green-400" /> {confirmedCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-orange-200">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Pending</div>
          <div className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <Mail size={20} className="text-orange-400" /> {pendingCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-red-200">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Dietary Notes</div>
          <div className="text-2xl font-bold text-cozy-text flex items-center gap-2">
            <Utensils size={20} className="text-red-400" /> {dietaryCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Add Guest Form */}
        <div className="lg:col-span-1" onClick={e => e.stopPropagation()}>
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-orange-100 sticky top-8">
            <h3 className="font-bold text-cozy-text mb-4 flex items-center gap-2">
              <Plus size={18} className="text-orange-400" /> Add Guest
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <input 
                  type="text" placeholder="e.g. Maria Clara" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  value={newGuest.name}
                  onChange={e => setNewGuest({...newGuest, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                  <select 
                    className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-200 outline-none cursor-pointer"
                    value={newGuest.role}
                    onChange={e => setNewGuest({...newGuest, role: e.target.value})}
                  >
                    <option>Attendee</option>
                    <option>VIP</option>
                    <option>Speaker</option>
                    <option>Staff</option>
                    <option>Media</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                  <select 
                    className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-200 outline-none cursor-pointer"
                    value={newGuest.status}
                    onChange={e => setNewGuest({...newGuest, status: e.target.value})}
                  >
                    <option>Invited</option>
                    <option>Confirmed</option>
                    <option>Declined</option>
                    <option>Checked In</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Contact (Optional)</label>
                <input 
                  type="text" placeholder="Email or Phone"
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  value={newGuest.contact_info}
                  onChange={e => setNewGuest({...newGuest, contact_info: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                   Dietary / Notes <Utensils size={12} />
                </label>
                <input 
                  type="text" placeholder="e.g. No seafood, Vegan"
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  value={newGuest.dietary_restrictions}
                  onChange={e => setNewGuest({...newGuest, dietary_restrictions: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-orange-400 text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-md">
                Add to List
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Guest List */}
        <div className="lg:col-span-2 space-y-4">
          {guests.length === 0 ? (
            <div className="text-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-3xl">
              No guests yet. Start inviting people! 💌
            </div>
          ) : (
            guests.map((guest) => (
              <div key={guest.id} className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-orange-100 group transition-all relative">
                <div className="flex justify-between items-center">
                  
                  {/* Name & Role */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      guest.role === 'VIP' ? 'bg-yellow-100 text-yellow-600' : 
                      guest.role === 'Speaker' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {guest.role === 'VIP' ? <Star size={16} /> : guest.name.charAt(0)}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-cozy-text flex items-center gap-2">
                        {guest.name}
                        {guest.dietary_restrictions && (
                          <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1" title={guest.dietary_restrictions}>
                            <Utensils size={10} /> {guest.dietary_restrictions}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">{guest.contact_info || 'No contact info'}</p>
                    </div>
                  </div>

                  {/* Status Dropdown & Delete */}
                  <div className="flex items-center gap-3">
                    
                    {/* STATUS DROPDOWN CONTAINER */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === guest.id ? null : guest.id)
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${getStatusStyle(guest.status)}`}
                      >
                        {guest.status} <ChevronDown size={12} />
                      </button>

                      {/* THE MENU POPUP */}
                      {openMenuId === guest.id && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                           <div className="p-1">
                              {['Invited', 'Confirmed', 'Checked In', 'Declined'].map((option) => (
                                <button
                                  key={option}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusUpdate(guest.id, option)
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-bold text-gray-600 rounded-lg flex items-center justify-between"
                                >
                                  {option}
                                  {guest.status === option && <Check size={12} className="text-green-500" />}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDelete(guest.id)}
                      className="text-gray-200 hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}