'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Coffee } from 'lucide-react'

// Define the shape of our data
type JournalEntry = {
  id: string
  mood: string
  content: string
  created_at: string
}

export default function ComfortCorner() {
  const supabase = createClient()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newContent, setNewContent] = useState('')
  const [selectedMood, setSelectedMood] = useState('🌸')
  const [loading, setLoading] = useState(false)

  // --- FIX 1: Define the function FIRST ---
  const fetchEntries = async () => {
    console.log("Fetching entries...") // Debugging log
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Supabase Error:", error.message)
      alert("Error fetching: " + error.message)
    } else if (data) {
      setEntries(data)
    }
  }

  // --- FIX 2: Call it AFTER it is defined ---
  useEffect(() => {
    fetchEntries()
  }, [])

  const handleSave = async () => {
    if (!newContent) return
    setLoading(true)

    // 1. Get the current user so we know who is writing this
    const { data: { user } } = await supabase.auth.getUser()

    // Safety check: Are they logged in?
    if (!user) {
      alert("You must be logged in to save a memory!")
      setLoading(false)
      return
    }

    // 2. Insert with the user_id included
    const { error } = await supabase
      .from('journal_entries')
      .insert([{ 
        content: newContent, 
        mood: selectedMood,
        user_id: user.id  // <--- THE FIX: Signing the entry
      }])

    if (error) {
      console.error("Save Error:", error)
      alert('Save failed: ' + error.message)
    } else {
      setNewContent('') 
      fetchEntries()
    }
    setLoading(false)
  }

  const moods = ['🌸', '☁️', '🍵', '✨', '💤']

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cozy-text flex items-center gap-2">
            Comfort Corner <Coffee className="text-cozy-sage" />
          </h1>
          <p className="text-cozy-sage text-sm">A safe space for your thoughts.</p>
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-cozy-pink/10">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
          How are you feeling today?
        </label>
        
        {/* Mood Selector */}
        <div className="flex gap-4 overflow-x-auto pb-2 mb-4">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`text-2xl p-4 rounded-2xl transition-all hover:scale-110 active:scale-95 ${
                selectedMood === m 
                  ? 'bg-cozy-pink/20 ring-2 ring-cozy-pink shadow-inner' 
                  : 'bg-gray-50 hover:bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Dear diary..."
          className="w-full h-32 bg-cozy-cream/30 rounded-2xl p-4 text-cozy-text focus:outline-none focus:ring-2 focus:ring-cozy-pink/50 resize-none transition-all placeholder:text-gray-300"
        />

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={loading || !newContent}
            className="bg-cozy-pink text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Memory'} <Send size={16} />
          </button>
        </div>
      </div>

      {/* ENTRIES GRID */}
      <div>
        <h2 className="text-xl font-bold text-cozy-text mb-4 ml-2">Memory Lane</h2>
        
        {entries.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-dashed border-2 border-cozy-sage/20">
            <p className="text-gray-400">No memories yet. Start writing above! ☁️</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-cozy-pink/30 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl">{entry.mood}</span>
                  <span className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-cozy-text leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}