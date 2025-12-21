'use client'

import { useEffect, useState } from 'react'

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string; duration: string }[]>([])

  useEffect(() => {
    // Create 15 random hearts
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,        // Random horizontal position
      delay: `${Math.random() * 15}s`,        // Random start time
      duration: `${15 + Math.random() * 10}s` // Random speed (15-25s)
    }))
    setHearts(newHearts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          // Changed color to 'text-pink-400' for a visible, cute pink!
          className="absolute text-pink-400 text-4xl animate-float-up"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            top: '100%', // Start below screen
          }}
        >
          ♥
        </div>
      ))}
    </div>
  )
}