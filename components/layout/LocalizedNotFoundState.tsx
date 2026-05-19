import Link from "next/link";
import { Compass, Home, Map, Sun, Waves } from "lucide-react";

import { Button } from "@/components/ui/Button";

const NOT_FOUND_BACKGROUND_VIDEO =
  "https://videos.pexels.com/video-files/36749580/15574989_2560_1440_25fps.mp4";
const NOT_FOUND_BACKGROUND_POSTER = "/images/region-carvoeiro-800w-CVkjcyBE.webp";

interface LocalizedNotFoundStateProps {
  homeHref: string;
  beachesHref?: string;
  mapHref?: string;
  experiencesHref?: string;
  title?: string;
  description?: string;
  backHomeLabel?: string;
  beachesLabel?: string;
  mapLabel?: string;
  experiencesLabel?: string;
}

export function LocalizedNotFoundState({
  homeHref,
  beachesHref = "/beaches",
  mapHref = "/map",
  experiencesHref = "/experiences",
  title = "Oops! This page went off exploring the Algarve.",
  description = "The page you’re looking for may have moved, but there’s still plenty to discover.",
  backHomeLabel = "Go to Homepage",
  beachesLabel = "Explore Beaches",
  mapLabel = "Open Map",
  experiencesLabel = "View Experiences",
}: LocalizedNotFoundStateProps) {
  return (
    <main className="not-found-animated relative isolate min-h-[calc(100svh-1px)] overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes not-found-card-rise {
          from {
            opacity: 0;
            transform: translate3d(0, 22px, 0) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes not-found-video-drift {
          0%,
          100% {
            transform: scale(1.03) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.08) translate3d(-1.4%, -1%, 0);
          }
        }

        @keyframes not-found-card-glint {
          0%,
          18% {
            transform: translateX(-140%) skewX(-18deg);
            opacity: 0;
          }
          34% {
            opacity: 0.62;
          }
          52%,
          100% {
            transform: translateX(140%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes not-found-shimmer {
          0%,
          22% {
            background-position: 115% 50%;
          }
          58%,
          100% {
            background-position: -115% 50%;
          }
        }

        @keyframes not-found-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -7px, 0);
          }
        }

        @keyframes not-found-sun-pulse {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes not-found-waves-flow {
          from {
            transform: translateX(-3px);
          }
          to {
            transform: translateX(3px);
          }
        }

        @keyframes not-found-route-dash {
          to {
            stroke-dashoffset: -260;
          }
        }

        @keyframes not-found-route-glow {
          0% {
            stroke-dashoffset: 760;
            opacity: 0;
          }
          18%,
          54% {
            opacity: 0.68;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes not-found-wave-band {
          from {
            transform: translateX(-8%);
          }
          to {
            transform: translateX(8%);
          }
        }

        @keyframes not-found-orb-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -14px, 0) scale(1.05);
          }
        }

        .not-found-card {
          animation: not-found-card-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .not-found-bg-video {
          animation: not-found-video-drift 24s ease-in-out infinite;
        }

        .not-found-card::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          content: "";
          height: 100%;
          left: -30%;
          pointer-events: none;
          position: absolute;
          top: 0;
          width: 38%;
          animation: not-found-card-glint 7.5s ease-in-out 1s infinite;
        }

        .not-found-shimmer {
          animation: not-found-shimmer 6.5s ease-in-out 900ms infinite;
        }

        .not-found-float {
          animation: not-found-float 4.8s ease-in-out infinite;
        }

        .not-found-sun {
          animation: not-found-sun-pulse 3.8s ease-in-out infinite;
          transform-origin: center;
        }

        .not-found-waves {
          animation: not-found-waves-flow 2.6s ease-in-out infinite alternate;
        }

        .not-found-route-line {
          animation: not-found-route-dash 24s linear infinite;
          stroke-dasharray: 10 18;
        }

        .not-found-route-glow {
          animation: not-found-route-glow 9s ease-in-out infinite;
          stroke-dasharray: 760;
          stroke-dashoffset: 760;
        }

        .not-found-wave-band {
          animation: not-found-wave-band 16s ease-in-out infinite alternate;
        }

        .not-found-orb {
          animation: not-found-orb-drift 11s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .not-found-animated *,
          .not-found-animated *::before,
          .not-found-animated *::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 1ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/images/region-carvoeiro-800w-CVkjcyBE.webp')] bg-cover bg-center"
      />
      <video
        aria-hidden="true"
        autoPlay
        className="not-found-bg-video absolute inset-0 h-full w-full object-cover opacity-95"
        loop
        muted
        playsInline
        poster={NOT_FOUND_BACKGROUND_POSTER}
        preload="metadata"
      >
        <source src={NOT_FOUND_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(244,212,126,0.28),transparent_32%),linear-gradient(115deg,rgba(2,22,38,0.78)_0%,rgba(4,35,48,0.56)_44%,rgba(86,53,22,0.5)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/90 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -left-20 top-24 h-56 w-56 rounded-full border border-white/10 bg-white/5 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-24 h-72 w-72 rounded-full border border-[#D4A62A]/20 bg-[#D4A62A]/10 blur-3xl"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="not-found-orb absolute -left-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(244,212,126,0.38),rgba(212,166,42,0.16)_42%,transparent_70%)] blur-2xl" />
        <div className="not-found-orb absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(37,176,190,0.26),rgba(37,176,190,0.08)_48%,transparent_72%)] blur-2xl [animation-delay:-5s]" />
        <svg
          className="absolute left-1/2 top-[9%] h-[34rem] w-[62rem] -translate-x-1/2 opacity-55 sm:top-[7%]"
          viewBox="0 0 980 520"
          fill="none"
        >
          <path
            className="not-found-route-line"
            d="M36 396C155 265 238 463 351 304C465 144 548 191 635 238C736 293 768 111 934 126"
            stroke="rgba(244,212,126,0.38)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="not-found-route-glow"
            d="M36 396C155 265 238 463 351 304C465 144 548 191 635 238C736 293 768 111 934 126"
            stroke="rgba(255,255,255,0.64)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="36" cy="396" r="5" fill="rgba(244,212,126,0.78)" />
          <circle cx="934" cy="126" r="5" fill="rgba(255,255,255,0.68)" />
        </svg>
        <div className="not-found-wave-band absolute -bottom-16 left-[-10%] h-40 w-[120%] opacity-45 [background:repeating-radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0_1px,transparent_1px_18px)] [mask-image:linear-gradient(to_top,black,transparent)]" />
      </div>

      <section className="app-container relative z-10 flex min-h-[calc(100svh-1px)] items-center justify-center px-4 py-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-center sm:py-10 lg:py-12 lg:pb-12">
        <div className="not-found-card relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white/[0.12] p-4 shadow-[0_28px_110px_-42px_rgba(0,0,0,0.82)] backdrop-blur-2xl sm:p-6 lg:p-8">
          <div
            aria-hidden="true"
            className="not-found-float mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4A62A]/45 bg-[#D4A62A]/15 text-[#F4D47E] shadow-[0_0_34px_rgba(212,166,42,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] sm:h-14 sm:w-14"
          >
            <span className="relative flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9" aria-hidden="true">
              <Sun className="not-found-sun absolute left-1 top-0 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
              <Waves className="not-found-waves absolute bottom-1 h-5 w-7 sm:h-6 sm:w-8" strokeWidth={1.9} />
            </span>
          </div>

          <p className="not-found-shimmer mt-3 bg-[linear-gradient(110deg,#ffffff_0%,#fff7df_34%,#f4d47e_48%,#ffffff_62%,#ffffff_100%)] bg-[length:230%_100%] bg-clip-text font-serif text-6xl font-medium leading-none text-transparent sm:text-7xl lg:text-8xl">
            404
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-serif text-2xl font-medium leading-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base lg:text-lg">
            {description}
          </p>

          <div className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild size="lg" className="min-h-11 w-full transition-transform duration-300 hover:-translate-y-0.5">
              <Link href={homeHref}>
                <Home className="h-4 w-4" aria-hidden="true" />
                {backHomeLabel}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="heroOutline"
              className="min-h-11 w-full border-white/30 bg-white/15 text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Link href={beachesHref}>
                <Waves className="h-4 w-4" aria-hidden="true" />
                {beachesLabel}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="heroOutline"
              className="min-h-11 w-full border-white/30 bg-white/15 text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Link href={mapHref}>
                <Map className="h-4 w-4" aria-hidden="true" />
                {mapLabel}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="heroOutline"
              className="min-h-11 w-full border-white/30 bg-white/15 text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Link href={experiencesHref}>
                <Compass className="h-4 w-4" aria-hidden="true" />
                {experiencesLabel}
              </Link>
            </Button>
          </div>

          <div
            aria-hidden="true"
            className="mx-auto mt-6 hidden h-px max-w-md bg-gradient-to-r from-transparent via-white/30 to-transparent sm:block"
          />
        </div>
      </section>
    </main>
  );
}
