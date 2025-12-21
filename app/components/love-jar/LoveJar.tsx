'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Heart } from 'lucide-react'

type LoveJarProps = {
  onOpenNote: (message: string) => void
}

export default function LoveJar({ onOpenNote }: LoveJarProps) {
  const [isShaking, setIsShaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const openJar = async () => {
    if (loading) return
    setIsShaking(true)
    setLoading(true)

    // 1. Simulate "shuffling" delay for visual effect
    setTimeout(async () => {
      
      // 2. Fetch all notes
      const { data, error } = await supabase
        .from('love_notes')
        .select('content')
      
      setIsShaking(false)
      setLoading(false)

      // Fallback if empty or error
      if (error || !data || data.length === 0) {
        onOpenNote("I love you! (Database couldn't find a note, but this one is true!)")
        return
      }

      // 3. Pick random index locally
      const randomIndex = Math.floor(Math.random() * data.length)
      onOpenNote(data[randomIndex].content)

    }, 1500) // 1.5s shake duration
  }

  return (
    <div className="relative group cursor-pointer" onClick={openJar}>
      
      {/* Sparkles Effect on Hover */}
      <div className="absolute -top-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="text-yellow-400 animate-bounce-slight" />
      </div>

      {/* The Jar Container */}
      <div className={`
        relative w-32 h-40 mx-auto bg-white/40 border-4 border-white rounded-3xl
        shadow-float backdrop-blur-sm overflow-hidden
        transition-transform duration-100
        ${isShaking ? 'animate-[wiggle_0.3s_ease-in-out_infinite]' : 'hover:scale-105'}
      `}>
        
        {/* Jar Lid */}
        <div className="absolute -top-2 left-0 right-0 h-4 bg-cozy-pink/50 border-b-2 border-white/50" />

        {/* The "Contents" (Paper Stars) */}
        <div className="absolute bottom-0 w-full p-2 flex flex-wrap gap-1 justify-center items-end h-3/4">
          {/* We generate random colorful "folded stars" visually */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={`
                w-6 h-6 rounded-md shadow-sm transform rotate-${i * 45}
                ${i % 3 === 0 ? 'bg-pink-200' : i % 3 === 1 ? 'bg-yellow-200' : 'bg-blue-200'}
                opacity-80
              `}
            />
          ))}
        </div>

        {/* Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
          <span className="text-[10px] font-bold text-cozy-text flex items-center gap-1">
            <Heart size={10} className="text-cozy-pink fill-cozy-pink"/> Love Jar
          </span>
        </div>
      </div>

      {/* Shelf Shadow */}
      <div className="w-24 h-2 bg-black/10 rounded-full mx-auto mt-4 blur-sm" />
      
      {/* Helper Text */}
      <p className="text-center text-xs text-cozy-sage mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        {loading ? 'Picking a memory...' : 'Tap for a boost'}
      </p>

      {/* Custom Wiggle Animation */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  )
}