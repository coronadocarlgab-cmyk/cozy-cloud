'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

type CozyAlertProps = {
  isOpen: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function CozyAlert({ isOpen, message, type = 'info', onClose }: CozyAlertProps) {
  const [show, setShow] = useState(false)

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setShow(true)
    } else {
      const timer = setTimeout(() => setShow(false), 300) // Wait for exit anim
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!show && !isOpen) return null

  // Colors based on type
  const getColors = () => {
    if (type === 'error') return 'bg-cozy-alert text-cozy-text border-red-200'
    if (type === 'success') return 'bg-green-50 text-green-800 border-green-200'
    return 'bg-white text-cozy-text border-cozy-pink/30'
  }

  const getIcon = () => {
    if (type === 'error') return '☁️' // Stormy cloud
    if (type === 'success') return '🌱' // Sprout
    return '✨' // Sparkles
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-cozy-text/20 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      
      {/* The Alert Card */}
      <div 
        className={`
          relative w-full max-w-sm rounded-3xl p-6 shadow-float border-2
          transform transition-all duration-300
          ${getColors()}
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-cozy-text transition-colors btn-tactile"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-4xl animate-bounce-slight">
            {getIcon()}
          </div>
          <p className="font-medium text-lg leading-relaxed">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="btn-tactile bg-white/50 border-2 border-current px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm hover:bg-white"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}