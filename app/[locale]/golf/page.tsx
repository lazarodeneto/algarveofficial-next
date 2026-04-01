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
    <div className="fixed inset-0 bg-black overflow-hidden">
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

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3.5 py-2 text-white/90 text-sm shadow-lg transition-colors hover:bg-black/60 active:bg-black/70"
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
        Back
      </button>

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
