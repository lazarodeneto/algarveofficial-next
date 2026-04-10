'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const BASE_URL = 'https://algarveofficialgolf.base44.app'

function GolfLoadingState({ fullscreen = true }: { fullscreen?: boolean }) {
  const { t } = useTranslation()

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-20 flex flex-col items-center justify-center bg-black'
          : 'flex h-full w-full flex-col items-center justify-center bg-black'
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-medium tracking-wide">{t('golf.loadingTitle')}</p>
          <p className="mt-1 text-sm text-white/50">{t('golf.loadingDescription')}</p>
        </div>
      </div>
    </div>
  )
}

function GolfApp() {
  const { t } = useTranslation()
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
        <GolfLoadingState fullscreen={false} />
      </div>

      {/* Iframe */}
      <iframe
        src={iframeSrc}
        onLoad={() => setLoaded(true)}
        className={`h-[100dvh] w-full border-0 transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="geolocation; fullscreen"
        title={t('golf.iframeTitle')}
      />
    </div>
  )
}

export default function GolfPage() {
  return (
    <Suspense fallback={<GolfLoadingState />}>
      <GolfApp />
    </Suspense>
  )
}
