'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Coffee, Sparkles } from 'lucide-react'
import CozyAlert from '@/app/components/ui/CozyAlert' 
import LoveJar from '@/app/components/love-jar/LoveJar' // Import the Jar

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

  // STATE FOR CUSTOM ALERT
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, message: '', type: 'info' })

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertConfig({ isOpen: true, message, type })
  }

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Supabase Error:", error.message)
    } else if (data) {
      setEntries(data)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleSave = async () => {
    if (!newContent) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      showAlert("We need to know it's you! Please log in first. 🔒", 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('journal_entries')
      .insert([{ 
        content: newContent, 
        mood: selectedMood,
        user_id: user.id 
      }])

    if (error) {
      showAlert('Oh no! We couldn\'t save that: ' + error.message, 'error')
    } else {
      setNewContent('') 
      fetchEntries()
      showAlert('Memory safely tucked away! ☁️', 'success')
    }
    setLoading(false)
  }

  const moods = ['🌸', '☁️', '🍵', '✨', '💤']

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-20">
      
      <CozyAlert 
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 1. Header & LOVE JAR Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 mt-4 animate-fade-in">
        
        {/* The Love Jar sits here */}
        <div className="w-full py-4">
          <LoveJar onOpenNote={(msg) => showAlert(msg, 'success')} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-cozy-text flex items-center justify-center gap-2">
            Comfort Corner <Coffee className="text-cozy-sage" />
          </h1>
          <p className="text-cozy-sage text-sm">Tap the jar for a boost, or write your heart out below.</p>
        </div>
      </div>

      {/* 2. JOURNAL INPUT */}
      <div className="bg-cozy-paper rounded-3xl p-6 shadow-soft mx-4 animate-pop-up delay-100">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block text-center">
          How is your heart today?
        </label>
        
        <div className="flex justify-between gap-2 overflow-x-auto pb-4 no-scrollbar touch-pan-x">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 btn-tactile ${
                selectedMood === m 
                  ? 'bg-cozy-pink text-white shadow-lg scale-110' 
                  : 'bg-gray-50 text-gray-400 hover:bg-white hover:shadow-sm'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write it down, let it go..."
          className="w-full h-40 bg-gray-50 rounded-2xl p-4 text-cozy-text text-base shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-cozy-pink/50 resize-none transition-all placeholder:text-gray-300 mt-2"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={loading || !newContent}
            className="bg-cozy-pink text-white px-8 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg btn-tactile flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Keep Safe'} <Send size={16} />
          </button>
        </div>
      </div>

      {/* 3. ENTRIES LIST */}
      <div className="px-4 space-y-6">
        <h2 className="text-xl font-bold text-cozy-text ml-2 flex items-center gap-2">
          Memory Lane <Sparkles size={18} className="text-yellow-400"/>
        </h2>
        
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-3xl border-dashed border-2 border-cozy-sage/20 mx-4">
            <p className="text-gray-400">No memories yet. Start writing above! ☁️</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white p-6 rounded-3xl shadow-soft transition-all hover:-translate-y-1 duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl filter drop-shadow-sm">{entry.mood}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-cozy-text leading-relaxed whitespace-pre-wrap font-medium">
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