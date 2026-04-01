'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const BASE_URL = 'https://algarveofficialgolf.base44.app'

function GolfApp() {
  const searchParams = useSearchParams()
  const [loaded, setLoaded] = useState(false)

  const iframeSrc = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `${BASE_URL}?${qs}` : BASE_URL
  }, [searchParams])

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white text-lg font-medium tracking-wide">Loading Golf</p>
            <p className="text-white/50 text-sm mt-1">Preparing your round…</p>
          </div>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        src={iframeSrc}
        onLoad={() => setLoaded(true)}
        className={`h-[100dvh] w-full border-0 transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="geolocation; fullscreen"
        title="AlgarveOfficial Golf"
      />
    </div>
  )
}

export default function GolfPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-medium tracking-wide">Loading Golf</p>
              <p className="text-white/50 text-sm mt-1">Preparing your round…</p>
            </div>
          </div>
        </div>
      }
    >
      <GolfApp />
    </Suspense>
  )
}
