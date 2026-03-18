import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "next/link";
import { renderToStaticMarkup } from "react-dom/server";
import { usePublishedListings } from "@/hooks/useListings";
import { useCities, useCategories } from "@/hooks/useReferenceData";
import { MapPin, LandPlot, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// City coordinates for Algarve
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "almancil": { lat: 37.0833, lng: -8.0333 },
  "quinta-do-lago": { lat: 37.0500, lng: -8.0167 },
  "vale-do-lobo": { lat: 37.0500, lng: -8.0667 },
  "vilamoura": { lat: 37.0775, lng: -8.1161 },
  "quarteira": { lat: 37.0692, lng: -8.0997 },
  "albufeira": { lat: 37.0889, lng: -8.2500 },
  "lagoa": { lat: 37.1333, lng: -8.4500 },
  "carvoeiro": { lat: 37.0944, lng: -8.4722 },
  "portimao": { lat: 37.1386, lng: -8.5372 },
  "lagos": { lat: 37.1028, lng: -8.6731 },
  "sagres": { lat: 37.0092, lng: -8.9414 },
  "tavira": { lat: 37.1275, lng: -7.6506 },
  "olhao": { lat: 37.0256, lng: -7.8411 },
  "faro": { lat: 37.0194, lng: -7.9322 },
};

// Custom marker icons
const goldMarker = L.divIcon({
  className: "custom-marker",
  html: `<div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg border-2 border-white">
    ${renderToStaticMarkup(<LandPlot size={16} color="black" strokeWidth={2.2} />)}
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const verifiedMarker = L.divIcon({
  className: "custom-marker",
  html: `<div class="flex items-center justify-center w-7 h-7 bg-green-500 rounded-full shadow-lg border-2 border-white">
    ${renderToStaticMarkup(<Star size={14} color="white" strokeWidth={2.2} />)}
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const defaultMarker = L.divIcon({
  className: "custom-marker",
  html: `<div class="flex items-center justify-center w-6 h-6 bg-muted rounded-full shadow-md border-2 border-white">
    ${renderToStaticMarkup(<MapPin size={12} color="currentColor" strokeWidth={2.25} />)}
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

interface DirectoryMapViewProps {
  filteredListingIds?: string[];
}

export function DirectoryMapView({ filteredListingIds }: DirectoryMapViewProps) {
  const { data: listings = [] } = usePublishedListings();
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();

  // Get listings with coordinates
  const listingsWithCoords = useMemo(() => {
    const filtered = filteredListingIds 
      ? listings.filter((l) => filteredListingIds.includes(l.id))
      : listings;

    return filtered
      .map((listing) => {
        const city = cities.find((c) => c.id === listing.city_id);
        const category = categories.find((c) => c.id === listing.category_id);
        const coords = city?.slug ? cityCoordinates[city.slug] : null;
        
        if (!coords) return null;
        
        // Add slight random offset to prevent exact overlaps
        const lat = coords.lat + (Math.random() - 0.5) * 0.01;
        const lng = coords.lng + (Math.random() - 0.5) * 0.01;
        
        return {
          ...listing,
          cityName: city?.name,
          categoryName: category?.name,
          categorySlug: category?.slug,
          categoryImageUrl: category?.image_url,
          lat,
          lng,
        };
      })
      .filter(Boolean);
  }, [filteredListingIds, listings, cities, categories]);

  // Calculate map center
  const center = useMemo(() => {
    if (listingsWithCoords.length === 0) {
      return { lat: 37.08, lng: -8.25 }; // Default Algarve center
    }
    const sumLat = listingsWithCoords.reduce((sum, l) => sum + (l?.lat || 0), 0);
    const sumLng = listingsWithCoords.reduce((sum, l) => sum + (l?.lng || 0), 0);
    return {
      lat: sumLat / listingsWithCoords.length,
      lng: sumLng / listingsWithCoords.length,
    };
  }, [listingsWithCoords]);

  const getMarkerIcon = (tier: string) => {
    switch (tier) {
      case "signature":
        return goldMarker;
      case "verified":
        return verifiedMarker;
      default:
        return defaultMarker;
    }
  };

  return (
    <div className="h-[600px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listingsWithCoords.map((listing) => listing && (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={getMarkerIcon(listing.tier || 'unverified')}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px] p-1">
                <ListingImage
                  src={listing.featured_image_url}
                  category={listing.categorySlug}
                  categoryImageUrl={listing.categoryImageUrl}
                  listingId={listing.id}
                  alt={listing.name || ''}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <div className="space-y-1">
                  {listing.tier !== "unverified" && (
                    <ListingTierBadge tier={listing.tier} size="sm" />
                  )}
                  <h3 className="font-medium text-foreground line-clamp-1">{listing.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.cityName}
                  </p>
                  <p className="text-xs text-muted-foreground">{listing.categoryName}</p>
                  <Link href={`/listing/${listing.slug}`}>
                    <Button size="sm" className="w-full mt-2">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
