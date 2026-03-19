"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DivIcon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom gold marker icon using Lucide
const goldMarkerHtml = `
<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:linear-gradient(135deg,#ffd966 0%,#c49b37 55%,#8f6b1f 100%);box-shadow:0 6px 16px rgba(0,0,0,0.28);border:1px solid #8f6b1f;">
  ${renderToStaticMarkup(<MapPin size={16} color="#111827" strokeWidth={2.25} />)}
</div>
`;

const goldIcon = new DivIcon({
  html: goldMarkerHtml,
  className: "gold-marker-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

// Tile layer URLs for different themes
const TILE_LAYERS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

interface ListingMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  className?: string;
}

export function ListingMap({ lat, lng, name, address, className = "" }: ListingMapProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Wait for hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme detection: rely on Tailwind's `dark` class on <html>
  // (works regardless of whether the app uses next-themes or a custom ThemeContext).
  useEffect(() => {
    if (!mounted) return;

    const getIsDark = () => document.documentElement.classList.contains("dark");
    setIsDark(getIsDark());

    const obs = new MutationObserver(() => {
      setIsDark(getIsDark());
    });

    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => obs.disconnect();
  }, [mounted]);

  const tileUrl = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;
  const mapKey = useMemo(
    () => `map-${isDark ? "dark" : "light"}-${lat}-${lng}`,
    [isDark, lat, lng]
  );

  if (!mounted) {
    // Return placeholder while hydrating
    return (
      <div className={`rounded-xl overflow-hidden border border-border bg-muted ${className}`}>
        <div className="h-full w-full min-h-[250px] flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading map...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-xl overflow-hidden border border-border relative z-0 ${className}`}>
      <MapContainer
        key={mapKey}
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full min-h-[250px]"
        style={{ background: "hsl(var(--muted))" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <Marker position={[lat, lng]} icon={goldIcon}>
          <Popup>
            <div className="text-charcoal">
              <strong className="text-sm">{name}</strong>
              {address && <p className="text-xs text-charcoal/70 mt-1">{address}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
