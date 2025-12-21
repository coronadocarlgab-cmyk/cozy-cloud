'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

type CozyDatePickerProps = {
  label?: string
  value?: string
  onChange: (date: string) => void
}

export default function CozyDatePicker({ label, value, onChange }: CozyDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const initialDate = value ? new Date(value) : new Date()
  const [viewDate, setViewDate] = useState(initialDate)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    const mStr = String(month + 1).padStart(2, '0')
    const dStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${mStr}-${dStr}`
    onChange(dateStr)
    setIsOpen(false)
  }

  const daysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>}
      
      {/* INPUT TRIGGER */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-gray-50 rounded-xl p-3 text-sm cursor-pointer flex items-center gap-3
          border-2 transition-all select-none
          ${isOpen ? 'border-cozy-pink shadow-md bg-white' : 'border-transparent hover:bg-white hover:shadow-sm'}
        `}
      >
        <CalendarIcon className="text-cozy-pink" size={18} />
        <span className={value ? 'text-cozy-text font-medium' : 'text-gray-400'}>
          {value || 'Pick a date...'}
        </span>
      </div>

      {/* DROPDOWN CALENDAR */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-3xl shadow-float p-4 z-[60] w-72 animate-pop-up border border-pink-100">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4 px-1">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-pink-50 rounded-full text-gray-400 hover:text-cozy-pink transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-cozy-text">
              {monthNames[month]} {year}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-pink-50 rounded-full text-gray-400 hover:text-cozy-pink transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {daysShort.map(d => (
              <span key={d} className="text-[10px] font-bold text-gray-300 uppercase">{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: getFirstDayOfMonth(year, month) }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: getDaysInMonth(year, month) }).map((_, i) => {
              const day = i + 1
              const mStr = String(month + 1).padStart(2, '0')
              const dStr = String(day).padStart(2, '0')
              const dateStr = `${year}-${mStr}-${dStr}`
              const isSelected = value === dateStr
              
              const today = new Date()
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`
                    h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-cozy-pink text-white shadow-md scale-110' 
                      : isToday 
                        ? 'text-cozy-pink border border-pink-200 bg-pink-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}