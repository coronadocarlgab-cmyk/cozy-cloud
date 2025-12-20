'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Phone, Mail, Star, Truck, Coffee, Home, User, Briefcase, Trash2, X } from 'lucide-react'
import Link from 'next/link'

type Supplier = {
  id: string
  business_name: string
  category: string
  contact_person: string
  contact_info: string
  email: string
  notes: string
  rating: number
}

const CATEGORIES = [
  { name: 'Transport', icon: <Truck size={14} />, color: 'bg-blue-100 text-blue-600' },
  { name: 'Accommodation', icon: <Home size={14} />, color: 'bg-purple-100 text-purple-600' },
  { name: 'Food & Bev', icon: <Coffee size={14} />, color: 'bg-orange-100 text-orange-600' },
  { name: 'Guide/Staff', icon: <User size={14} />, color: 'bg-green-100 text-green-600' },
  { name: 'Other', icon: <Briefcase size={14} />, color: 'bg-gray-100 text-gray-600' },
]

export default function DirectoryPage() {
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')

  // New Supplier Form State
  const [showForm, setShowForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    business_name: '',
    category: 'Transport',
    contact_person: '',
    contact_info: '',
    email: '',
    notes: '',
    rating: 0
  })

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('business_name', { ascending: true })

    if (data) setSuppliers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('suppliers').insert([{
      ...newSupplier,
      user_id: user.id
    }])

    if (!error) {
      setNewSupplier({ business_name: '', category: 'Transport', contact_person: '', contact_info: '', email: '', notes: '', rating: 0 })
      setShowForm(false)
      fetchSuppliers()
    } else {
      alert(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this contact?")) return
    await supabase.from('suppliers').delete().eq('id', id)
    fetchSuppliers()
  }

  // Filter Logic
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filter === 'All' || s.category === filter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Supplier Directory</h1>
          <p className="text-cozy-sage text-sm">Your little black book of partners.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/3">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or person..." 
            className="w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
          <button 
             onClick={() => setFilter('All')}
             className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'All' ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            All Contacts
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setFilter(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                filter === cat.name ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Empty State */}
        {filteredSuppliers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-gray-300">
            No contacts found. Add your first partner! 🤝
          </div>
        )}

        {filteredSuppliers.map((supplier) => {
          const catStyle = CATEGORIES.find(c => c.name === supplier.category) || CATEGORIES[4]
          return (
            <div key={supplier.id} className="bg-white p-6 rounded-3xl shadow-soft border border-transparent hover:border-purple-200 transition-all group relative">
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${catStyle.color}`}>
                  {catStyle.icon}
                </div>
                <div className="flex items-center gap-2">
                   {/* Rating Stars (Optional display) */}
                   {supplier.rating > 0 && (
                      <div className="flex gap-0.5 text-yellow-400">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold text-gray-400 ml-1">{supplier.rating}</span>
                      </div>
                   )}
                   <button 
                      onClick={() => handleDelete(supplier.id)}
                      className="text-gray-200 hover:text-red-400 transition-colors"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-cozy-text mb-1 truncate">{supplier.business_name}</h3>
              
              {supplier.contact_person && (
                <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1">
                   <User size={14} /> {supplier.contact_person}
                </p>
              )}

              <div className="space-y-2 border-t border-gray-50 pt-4">
                {supplier.contact_info && (
                   <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                     <Phone size={14} className="text-purple-400" /> {supplier.contact_info}
                   </div>
                )}
                {supplier.email && (
                   <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg truncate">
                     <Mail size={14} className="text-purple-400" /> {supplier.email}
                   </div>
                )}
              </div>

              {supplier.notes && (
                <div className="mt-4 text-xs text-gray-400 italic">
                  "{supplier.notes}"
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* --- ADD SUPPLIER MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative z-10 animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cozy-text">Add New Contact</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Business Name</label>
                    <input 
                      required
                      className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 mt-1"
                      value={newSupplier.business_name}
                      onChange={e => setNewSupplier({...newSupplier, business_name: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                        <select 
                          className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 mt-1 cursor-pointer"
                          value={newSupplier.category}
                          onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}
                        >
                            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Rating</label>
                        <input 
                          type="number" min="0" max="5"
                          className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 mt-1"
                          value={newSupplier.rating}
                          onChange={e => setNewSupplier({...newSupplier, rating: parseInt(e.target.value)})}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Contact Person</label>
                    <input 
                      className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 mt-1"
                      value={newSupplier.contact_person}
                      onChange={e => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Phone"
                      className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200"
                      value={newSupplier.contact_info}
                      onChange={e => setNewSupplier({...newSupplier, contact_info: e.target.value})}
                    />
                    <input 
                      placeholder="Email"
                      className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200"
                      value={newSupplier.email}
                      onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                </div>

                <textarea 
                  placeholder="Notes (e.g. Rates, Services)"
                  className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 resize-none h-20"
                  value={newSupplier.notes}
                  onChange={e => setNewSupplier({...newSupplier, notes: e.target.value})}
                />

                <button type="submit" className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-md mt-2">
                   Save Contact
                </button>
              </form>
           </div>
        </div>
      )}

    </div>
  )
}