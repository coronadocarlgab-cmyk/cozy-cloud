import Link from 'next/link'
import { Cloud, Heart, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cozy-cream p-8 text-center">
      
      {/* Decorative Icons */}
      <div className="flex gap-4 mb-6 animate-bounce">
        <Star className="text-cozy-sage" size={24} />
        <Cloud className="text-cozy-pink" size={48} fill="#FFD1DC" />
        <Star className="text-cozy-sage" size={24} />
      </div>

      {/* Main Title */}
      <h1 className="text-5xl font-bold text-cozy-text mb-4 tracking-tight">
        Cozy Cloud
      </h1>
      
      <p className="text-xl text-cozy-text/70 mb-10 max-w-md">
        Your personal digital sanctuary for studying, planning, and dreaming.
      </p>

      {/* Action Button */}
      <Link 
        href="/login" 
        className="group bg-white border-2 border-cozy-pink text-cozy-text px-8 py-4 rounded-3xl shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold"
      >
        <Heart className="group-hover:fill-cozy-pink text-cozy-pink transition-colors" />
        Enter Sanctuary
      </Link>

      {/* Footer */}
      <div className="absolute bottom-8 text-sm text-gray-400">
        © 2025 Cozy Cloud • Built with Love
      </div>
    </div>
  )
}