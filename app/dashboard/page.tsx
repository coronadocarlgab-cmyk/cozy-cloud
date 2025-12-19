'use client'

import { Sparkles, Map, Camera, PenTool } from 'lucide-react'

export default function DashboardHome() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Welcome Header */}
      <header className="bg-white p-8 rounded-3xl shadow-soft border border-cozy-pink/20 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-cozy-text mb-2 flex items-center gap-2">
            Welcome Home, Love <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
          </h1>
          <p className="text-cozy-sage">Ready to organize your day?</p>
        </div>
        
        {/* Decorative Background Blob */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-cozy-pink/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </header>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-400">
              <Map size={24} />
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-500 px-2 py-1 rounded-full">Upcoming</span>
          </div>
          <h3 className="text-lg font-bold text-gray-600">Next Trip</h3>
          <p className="text-sm text-gray-400">No trips planned yet.</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-green-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-2xl text-green-400">
              <PenTool size={24} />
            </div>
            <span className="text-xs font-bold bg-green-100 text-green-500 px-2 py-1 rounded-full">Events</span>
          </div>
          <h3 className="text-lg font-bold text-gray-600">Active Events</h3>
          <p className="text-sm text-gray-400">0 MICE projects active.</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-b-4 border-cozy-pink">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-50 rounded-2xl text-cozy-pink">
              <Camera size={24} />
            </div>
            <span className="text-xs font-bold bg-pink-100 text-cozy-pink px-2 py-1 rounded-full">Journal</span>
          </div>
          <h3 className="text-lg font-bold text-gray-600">Daily Mood</h3>
          <p className="text-sm text-gray-400">How are you feeling?</p>
        </div>
      </div>

    </div>
  )
}