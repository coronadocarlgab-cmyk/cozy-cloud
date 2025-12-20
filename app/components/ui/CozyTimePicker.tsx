'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Clock, Check, X } from 'lucide-react'

type CozyTimePickerProps = {
  value: string // Expects "HH:mm" (24-hour format)
  onChange: (value: string) => void
  label?: string
}

export default function CozyTimePicker({ value, onChange, label }: CozyTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'hour' | 'minute'>('hour')
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal State
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // Sync internal state with external value prop
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      let hNum = parseInt(h)
      const p = hNum >= 12 ? 'PM' : 'AM'
      
      if (hNum > 12) hNum -= 12
      if (hNum === 0) hNum = 12

      setHour(hNum.toString().padStart(2, '0'))
      setMinute(m)
      setPeriod(p)
    }
  }, [value])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setMode('hour')
    setIsOpen(true)
  }

  // --- MANUAL INPUT HANDLERS ---
  const handleManualHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '') // Numbers only
    if (val.length > 2) val = val.slice(0, 2)
    
    // Logic: If user types > 12, force it (or let them fix it). 
    // We'll trust the user while typing and validate on blur/confirm.
    setHour(val)
  }

  const handleManualMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) val = val.slice(0, 2)
    setMinute(val)
  }

  const validateAndFormat = () => {
    // Validate Hour
    let hNum = parseInt(hour)
    if (isNaN(hNum) || hNum < 1) hNum = 12
    if (hNum > 12) hNum = 12
    const hStr = hNum.toString().padStart(2, '0')

    // Validate Minute
    let mNum = parseInt(minute)
    if (isNaN(mNum) || mNum < 0) mNum = 0
    if (mNum > 59) mNum = 59
    const mStr = mNum.toString().padStart(2, '0')

    setHour(hStr)
    setMinute(mStr)
    
    return { hStr, mStr }
  }

  const confirmTime = () => {
    const { hStr, mStr } = validateAndFormat()
    let hNum = parseInt(hStr)

    // Convert to 24h for saving
    if (period === 'PM' && hNum !== 12) hNum += 12
    if (period === 'AM' && hNum === 12) hNum = 0

    onChange(`${hNum.toString().padStart(2, '0')}:${mStr}`)
    setIsOpen(false)
  }

  // Grid Selection Handlers
  const selectHour = (h: string) => {
    setHour(h)
    setMode('minute') // Auto-jump to minute
  }
  const selectMinute = (m: string) => {
    setMinute(m)
  }

  const hoursGrid = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const minutesGrid = ['00','05','10','15','20','25','30','35','40','45','50','55']

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{label}</label>}
      
      {/* TRIGGER INPUT */}
      <div 
        onClick={handleOpen}
        className={`w-full bg-gray-50 rounded-xl p-3 text-sm flex items-center justify-between cursor-pointer transition-all border-2 ${isOpen ? 'border-purple-200 bg-white ring-2 ring-purple-100' : 'border-transparent hover:bg-gray-100'}`}
      >
        <div className="flex items-center gap-2 text-cozy-text font-bold">
          <Clock size={16} className="text-purple-400" />
          {value ? `${hour}:${minute} ${period}` : <span className="text-gray-400 font-normal">-- : --</span>}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* POPUP (Compact & Responsive) */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsOpen(false)}></div>
          
          {/* The Picker Card */}
          <div className="fixed md:absolute top-1/2 md:top-full left-1/2 md:left-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-2 z-[70] w-[280px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-bold">
            
            {/* HEADER: Manual Inputs */}
            <div className="bg-purple-50 p-4 text-center border-b border-purple-100">
              <div className="flex justify-center items-center gap-1 text-3xl text-cozy-text">
                
                {/* Manual Hour Input */}
                <input 
                  type="text" 
                  value={hour}
                  onChange={handleManualHourChange}
                  onFocus={() => setMode('hour')}
                  onBlur={validateAndFormat}
                  className={`w-16 bg-transparent text-center outline-none transition-colors border-b-2 ${mode === 'hour' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400'}`}
                />
                
                <span className="text-gray-300 pb-1">:</span>
                
                {/* Manual Minute Input */}
                <input 
                  type="text" 
                  value={minute}
                  onChange={handleManualMinuteChange}
                  onFocus={() => setMode('minute')}
                  onBlur={validateAndFormat}
                  className={`w-16 bg-transparent text-center outline-none transition-colors border-b-2 ${mode === 'minute' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400'}`}
                />
              </div>
              
              {/* AM/PM Toggles */}
              <div className="flex justify-center gap-2 mt-3">
                 {['AM', 'PM'].map((p) => (
                   <button
                     key={p} type="button" onClick={() => setPeriod(p as 'AM' | 'PM')}
                     className={`px-3 py-1 rounded-full text-xs transition-all ${
                       period === p ? 'bg-orange-100 text-orange-500 shadow-sm' : 'text-gray-400 hover:bg-gray-100'
                     }`}
                   >
                     {p}
                   </button>
                 ))}
              </div>
            </div>

            {/* BODY: Compact Grid */}
            <div className="p-4 bg-white">
              <div className="text-center text-[10px] font-bold text-gray-300 uppercase mb-3">
                Select {mode === 'hour' ? 'Hour' : 'Minute'}
              </div>
              
              <div className="grid grid-cols-4 gap-2 place-items-center">
                {(mode === 'hour' ? hoursGrid : minutesGrid).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => mode === 'hour' ? selectHour(num) : selectMinute(num)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                      (mode === 'hour' ? hour : minute) === num 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* FOOTER: Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
               <button 
                 type="button" onClick={() => setIsOpen(false)}
                 className="flex-1 py-2 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-100 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="button" onClick={confirmTime}
                 className="flex-1 bg-purple-500 text-white py-2 rounded-xl text-xs font-bold shadow-md hover:bg-purple-600 transition-transform active:scale-95 flex items-center justify-center gap-1"
               >
                 <Check size={14} /> Set
               </button>
            </div>

          </div>
        </>
      )}
    </div>
  )
}