'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const BASE_URL = 'https://algarveofficialgolf.base44.app'

function GolfApp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loaded, setLoaded] = useState(false)

  const iframeSrc = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `${BASE_URL}?${qs}` : BASE_URL
  }, [searchParams])

  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-[100dvh] z-50 bg-black overflow-hidden flex flex-col">
      {/* Header with app name and back button */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-black/0">
        <div className="flex items-center gap-3 flex-1">
          <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.8"/>
          </svg>
          <div>
            <p className="text-white text-sm font-semibold">AlgarveOfficial Golf App</p>
            <p className="text-white/50 text-xs">algarveofficial.com/golf</p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm px-3 py-2 text-white/90 text-sm font-medium transition-colors"
          aria-label="Back to previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          BACK
        </button>
      </div>

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

      {/* Iframe - responsive and mobile-safe */}
      <iframe
        src={iframeSrc}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 top-14 left-0 right-0 bottom-0 w-full border-0 transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="geolocation; fullscreen; accelerometer; gyroscope"
        title="AlgarveOfficial Golf"
      />
    </div>
  )
}

export default function GolfPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 top-0 left-0 w-screen h-[100dvh] z-50 bg-black flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-black/0">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.2"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.8"/>
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">AlgarveOfficial Golf App</p>
                <p className="text-white/50 text-xs">algarveofficial.com/golf</p>
              </div>
            </div>
          </div>
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
