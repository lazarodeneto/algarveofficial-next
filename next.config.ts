import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://tagmanager.google.com https://www.google.com https://accounts.google.com https://apis.google.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https: https://*.supabase.co https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.ytimg.com https://*.unsplash.com`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://analytics.tiktok.com https://*.onetrust.com https://geolocation.onetrust.com https://cdn.cookie-script.com`,
  `media-src 'self' blob: https:`,
  `frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://algarveofficialgolf.base44.app`,
  `frame-ancestors 'self' https://algarveofficial.com https://*.algarveofficial.com`,
  `upgrade-insecure-requests`,
].join("; ");

const cspReportOnly = cspDirectives.replace("default-src 'self'", "default-src 'none'").concat(
  "; report-uri https://algarveofficial.com/api/csp-report"
);

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
];

const reportOnlyHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspReportOnly,
  },
];

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 70, 75, 80],
    deviceSizes: [360, 420, 640, 768, 960, 1200, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "algarveofficial.com" },
      { protocol: "https", hostname: "www.algarveofficial.com" },
      { protocol: "https", hostname: "niylxpvafywjonrphddp.supabase.co" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "**.google.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/(.*)",
        headers: reportOnlyHeaders,
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Legacy category redirects (301 permanent)
      { source: "/visit/:city/vip-transportation", destination: "/visit/:city/transportation", permanent: true },
      { source: "/visit/:city/premier-events", destination: "/visit/:city/events", permanent: true },
      { source: "/visit/:city/luxury-accommodation", destination: "/visit/:city/accommodation", permanent: true },
      { source: "/visit/:city/luxury-experiences", destination: "/visit/:city/experiences", permanent: true },
      { source: "/visit/:city/architecture-decoration", destination: "/visit/:city/architecture-design", permanent: true },
      { source: "/visit/:city/beaches-clubs", destination: "/visit/:city/beach-clubs", permanent: true },
      { source: "/visit/:city/vip-concierge", destination: "/visit/:city/concierge-services", permanent: true },
      { source: "/visit/:city/family-fun", destination: "/visit/:city/family-attractions", permanent: true },
      { source: "/visit/:city/protection-services", destination: "/visit/:city/security-services", permanent: true },
      { source: "/visit/:city/shopping-boutiques", destination: "/visit/:city/shopping", permanent: true },
      { source: "/visit/:city/private-chefs", destination: "/visit/:city/restaurants", permanent: true },
      // Legacy slug variations
      { source: "/visit/:city/places-to-stay", destination: "/visit/:city/accommodation", permanent: true },
      { source: "/visit/:city/things-to-do", destination: "/visit/:city/experiences", permanent: true },
      { source: "/visit/:city/whats-on", destination: "/visit/:city/events", permanent: true },
      { source: "/visit/:city/algarve-services", destination: "/visit/:city/concierge-services", permanent: true },
      { source: "/visit/:city/fine-dining", destination: "/visit/:city/restaurants", permanent: true },
      { source: "/visit/:city/golf-tournaments", destination: "/visit/:city/golf", permanent: true },
      { source: "/visit/:city/prime-real-estate", destination: "/visit/:city/real-estate", permanent: true },
    ];
  },

  // ✅ Experimental features (modern Next.js 16)
  experimental: {
    scrollRestoration: true,
  },
};

export default withBundleAnalyzer(nextConfig);
