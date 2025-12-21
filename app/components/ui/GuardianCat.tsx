'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function GuardianCat() {
  const [isAwake, setIsAwake] = useState(false)

  return (
    <div 
      // CHANGE: z-50 -> z-30 (So menus can float over it)
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 cursor-pointer group"
      onMouseEnter={() => setIsAwake(true)}
      onMouseLeave={() => setIsAwake(false)}
      onClick={() => setIsAwake(!isAwake)}
    >
      {/* Speech Bubble */}
      <div className={`
        absolute -top-16 right-0 bg-white border-2 border-pink-400 rounded-xl px-4 py-2 
        text-xs font-bold text-pink-500 whitespace-nowrap shadow-float
        transition-all duration-200 transform origin-bottom-right z-10
        ${isAwake ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
      `}>
        {isAwake ? "I'm watching over you! 🛡️" : "Zzz..."}
        <div className="absolute -bottom-2 right-4 w-3 h-3 bg-white border-b-2 border-r-2 border-pink-400 transform rotate-45" />
      </div>

      {/* Zzz Animation */}
      {!isAwake && (
        <div className="absolute -top-10 right-4 flex flex-col items-end pointer-events-none z-20 w-12 h-16">
          <span className="absolute bottom-0 right-4 text-pink-300 font-bold text-xs animate-float-sleep" style={{ animationDelay: '0s' }}>z</span>
          <span className="absolute bottom-2 right-1 text-pink-400 font-bold text-sm animate-float-sleep" style={{ animationDelay: '1s' }}>z</span>
          <span className="absolute bottom-6 right-0 text-pink-500 font-bold text-lg animate-float-sleep" style={{ animationDelay: '2s' }}>Z</span>
        </div>
      )}

      {/* IMAGE CONTAINER */}
      <div className={`relative w-24 h-24 transition-transform duration-200 group-hover:-translate-y-2 ${isAwake ? 'animate-bounce-slight' : ''}`}>
        <Image
          src="/guardian-cat.png"
          alt="Guardian Cat"
          width={96}
          height={96}
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>
    </div>
  )
}