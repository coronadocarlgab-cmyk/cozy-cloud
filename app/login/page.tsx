'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, Cloud, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Oh no! ' + error.message) // Gentle error message
      setLoading(false)
    } else {
      router.push('/dashboard') // Go to home page
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert('Oops! ' + error.message)
      setLoading(false)
    } else {
      alert('Yay! Check your email to confirm the signup! 💌')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cozy-cream p-6">
      
      {/* 1. The Header Section */}
      <div className="mb-8 text-center space-y-3 animate-pulse">
        <div className="flex justify-center">
          <Cloud size={64} className="text-cozy-pink fill-cozy-pink/20" />
        </div>
        <h1 className="text-5xl font-bold text-cozy-text tracking-tight">
          Cozy Cloud
        </h1>
        <p className="text-cozy-sage font-medium flex items-center justify-center gap-2">
          <Sparkles size={16} /> Your Digital Sanctuary <Sparkles size={16} />
        </p>
      </div>

      {/* 2. The Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border-4 border-white ring-1 ring-cozy-pink/30">
        <div className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-cozy-text ml-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="student@tourism.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white focus:outline-none rounded-2xl p-4 text-cozy-text placeholder:text-gray-300 transition-all duration-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-cozy-text ml-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cozy-cream/30 border-2 border-transparent focus:border-cozy-pink focus:bg-white focus:outline-none rounded-2xl p-4 text-cozy-text placeholder:text-gray-300 transition-all duration-300"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 space-y-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-cozy-pink hover:bg-pink-300 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-3"
            >
              {loading ? 'Opening...' : 'Enter Sanctuary'}
              {!loading && <Heart size={20} fill="currentColor" />}
            </button>
            
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-transparent hover:bg-cozy-cream/50 text-cozy-sage font-semibold py-3 rounded-2xl transition-colors text-sm flex justify-center items-center gap-2"
            >
              New here? Create Account <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* 3. Footer */}
      <p className="mt-8 text-xs text-gray-300 font-medium">
        Designed with ❤️ for her
      </p>
    </div>
  )
}