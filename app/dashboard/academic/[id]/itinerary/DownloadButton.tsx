'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import ItineraryDocument from './ItineraryDocument'
import { useEffect, useState } from 'react'

export default function DownloadButton({ destination, activities }: { destination: string, activities: any[] }) {
  const [isClient, setIsClient] = useState(false)

  // Hydration fix: Ensure this only runs on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || activities.length === 0) return null

  return (
    <div className="mt-2">
      <PDFDownloadLink
        document={<ItineraryDocument destination={destination} activities={activities} />}
        fileName={`Itinerary_${destination}.pdf`}
      >
        {/* @ts-ignore - ReactPDF types can be finicky with children render props */}
        {({ loading }: { loading: boolean }) => (
          <button 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cozy-pink text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <FileDown size={16} />
            {loading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  )
}