import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Globe, Phone, Mail, Instagram, Facebook, Linkedin, Youtube, Star, Loader2, RefreshCw, Twitter, MessageCircle, Send, AlertTriangle, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ListingFormData, ListingContact, ListingSocialLinks, ListingLocation } from "@/types/listing";
import { safeParseFloat } from "@/lib/forms/parse";
import { normalizeExternalUrlInput } from "@/lib/url-input";

// URL validation patterns for social media
const URL_PATTERNS: Record<string, { pattern: RegExp; message: string }> = {
  instagram: {
    pattern: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+$/i,
    message: "Must be a valid Instagram URL (e.g., https://instagram.com/username)",
  },
  facebook: {
    pattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i,
    message: "Must be a valid Facebook URL (e.g., https://facebook.com/page)",
  },
  linkedin: {
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/.+$/i,
    message: "Must be a valid LinkedIn URL (e.g., https://linkedin.com/company/name)",
  },
  youtube: {
    pattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
    message: "Must be a valid YouTube URL (e.g., https://youtube.com/@channel)",
  },
  twitter: {
    pattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/i,
    message: "Must be a valid X/Twitter URL (e.g., https://x.com/username)",
  },
  tiktok: {
    pattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+$/i,
    message: "Must be a valid TikTok URL (e.g., https://tiktok.com/@username)",
  },
  whatsapp: {
    pattern: /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/\d+.*$/i,
    message: "Must be a valid WhatsApp URL (e.g., https://wa.me/351912345678)",
  },
  telegram: {
    pattern: /^https?:\/\/(t\.me|telegram\.me)\/.+$/i,
    message: "Must be a valid Telegram URL (e.g., https://t.me/username)",
  },
  google_business: {
    pattern: /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|g\.page|maps\.app\.goo\.gl)\/.+$/i,
    message: "Must be a valid Google Maps/Business URL",
  },
  website: {
    pattern: /^https?:\/\/.+\..+$/i,
    message: "Must be a valid website URL (protocol optional)",
  },
};

// Extract lat/lng from Google Maps URL
const extractCoordsFromGoogleUrl = (url: string): { lat: number; lng: number } | null => {
  if (!url) return null;
  
  // Match @lat,lng pattern in Google Maps URLs
  const match = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    // Validate reasonable lat/lng ranges
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
};

interface ContactStepProps {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, value: unknown) => void;
  errors: Record<string, string>;
  listingId?: string;
  onGoogleRatingsFetched?: (rating: number | null, reviewCount: number | null) => void;
}

export function ContactStep({ data, onChange, errors, listingId, onGoogleRatingsFetched }: ContactStepProps) {
  const [isFetchingRatings, setIsFetchingRatings] = useState(false);
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});
  const processedUrlRef = useRef<string | null>(null);

  // Auto-extract coordinates from Google Business URL on form load
  useEffect(() => {
    const googleUrl = data.social_links?.google_business;
    const hasLat = data.location?.lat !== undefined && data.location?.lat !== null;
    const hasLng = data.location?.lng !== undefined && data.location?.lng !== null;
    
    // Only extract if URL exists, coords are missing, and we haven't processed this URL yet
    if (googleUrl && (!hasLat || !hasLng) && processedUrlRef.current !== googleUrl) {
      const coords = extractCoordsFromGoogleUrl(googleUrl);
      if (coords) {
        onChange("location", {
          ...data.location,
          lat: coords.lat,
          lng: coords.lng,
        });
        toast.success("Coordinates extracted from URL", {
          description: `Lat: ${coords.lat}, Lng: ${coords.lng}`,
        });
      }
      processedUrlRef.current = googleUrl;
    }
  }, [data.social_links?.google_business, data.location, onChange]);

  const validateUrl = useCallback((field: string, value: string): string | null => {
    if (!value || value.trim() === "") return null; // Empty is valid (optional fields)
    
    const validator = URL_PATTERNS[field];
    if (!validator) return null;

    const normalizedValue = normalizeExternalUrlInput(value);

    if (!validator.pattern.test(normalizedValue)) {
      return validator.message;
    }
    return null;
  }, []);

  const handleContactChange = (field: keyof ListingContact, value: string) => {
    // Validate website URL
    if (field === "website") {
      const error = validateUrl("website", value);
      setSocialErrors(prev => ({
        ...prev,
        [`contact.${field}`]: error ?? "",
      }));
    }
    
    onChange("contact", {
      ...data.contact,
      [field]: value.trim() ?? undefined,
    });
  };

  const handleSocialChange = (field: keyof ListingSocialLinks, value: string) => {
    // Validate on change
    const error = validateUrl(field, value);
    setSocialErrors(prev => ({
      ...prev,
      [field]: error ?? "",
    }));
    
    onChange("social_links", {
      ...data.social_links,
      [field]: value.trim() ?? undefined,
    });

    // Auto-extract coordinates from Google Business URL
    if (field === "google_business" && value && !error) {
      const coords = extractCoordsFromGoogleUrl(value);
      if (coords) {
        onChange("location", {
          ...data.location,
          lat: coords.lat,
          lng: coords.lng,
        });
        toast.success("Coordinates extracted from URL", {
          description: `Lat: ${coords.lat}, Lng: ${coords.lng}`,
        });
      }
    }
  };

  const handleLocationChange = (field: keyof ListingLocation, value: string | number) => {
    onChange("location", {
      ...data.location,
      [field]: value === "" ? undefined : value,
    });
  };

  const hasAnyContact =
    (data.contact?.phone || data.contact?.email) ?? data.contact?.website;
  
  const hasValidationErrors = Object.values(socialErrors).some(e => e !== "");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold font-serif">Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          At least one contact method is required for publishing
        </p>
      </div>

      {/* Primary Contact */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Contact Details
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={data.contact?.phone ?? ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              placeholder="+351 912 345 678"
              className={errors["contact.phone"] ? "border-destructive" : ""}
            />
            {errors["contact.phone"] && (
              <p className="text-xs text-destructive">{errors["contact.phone"]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={data.contact?.email ?? ""}
              onChange={(e) => handleContactChange("email", e.target.value)}
              placeholder="contact@example.com"
              className={errors["contact.email"] ? "border-destructive" : ""}
            />
            {errors["contact.email"] && (
              <p className="text-xs text-destructive">{errors["contact.email"]}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              type="text"
              value={data.contact?.website ?? ""}
              onChange={(e) => handleContactChange("website", e.target.value)}
              placeholder="https://www.example.com"
              className={errors["contact.website"] ?? socialErrors["contact.website"] ? "border-destructive" : ""}
            />
            {(errors["contact.website"] || socialErrors["contact.website"]) && (
              <p className="text-xs text-destructive">{errors["contact.website"] || socialErrors["contact.website"]}</p>
            )}
          </div>
        </div>

        {!hasAnyContact && (
          <p className="text-sm text-amber-500 inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            At least one contact method is required before publishing
          </p>
        )}
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Location (Optional)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={data.location?.address ?? ""}
              onChange={(e) => handleLocationChange("address", e.target.value)}
              placeholder="123 Avenida da Liberdade, Almancil"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={data.location?.lat ?? ""}
              onChange={(e) => {
                const parsed = safeParseFloat(e.target.value);
                handleLocationChange("lat", parsed === null ? "" : parsed);
              }}
              placeholder="37.0833"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={data.location?.lng ?? ""}
              onChange={(e) => {
                const parsed = safeParseFloat(e.target.value);
                handleLocationChange("lng", parsed === null ? "" : parsed);
              }}
              placeholder="-8.2500"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Social Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Social Media (Optional)
        </h4>
        {hasValidationErrors && (
          <p className="text-sm text-amber-500 inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Please fix URL format errors before saving
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={data.social_links?.instagram ?? ""}
              onChange={(e) => handleSocialChange("instagram", e.target.value)}
              placeholder="https://instagram.com/username"
              className={socialErrors.instagram ? "border-destructive" : ""}
            />
            {socialErrors.instagram && (
              <p className="text-xs text-destructive">{socialErrors.instagram}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={data.social_links?.facebook ?? ""}
              onChange={(e) => handleSocialChange("facebook", e.target.value)}
              placeholder="https://facebook.com/page"
              className={socialErrors.facebook ? "border-destructive" : ""}
            />
            {socialErrors.facebook && (
              <p className="text-xs text-destructive">{socialErrors.facebook}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={data.social_links?.linkedin ?? ""}
              onChange={(e) => handleSocialChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/name"
              className={socialErrors.linkedin ? "border-destructive" : ""}
            />
            {socialErrors.linkedin && (
              <p className="text-xs text-destructive">{socialErrors.linkedin}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </Label>
            <Input
              id="youtube"
              value={data.social_links?.youtube ?? ""}
              onChange={(e) => handleSocialChange("youtube", e.target.value)}
              placeholder="https://youtube.com/@channel"
              className={socialErrors.youtube ? "border-destructive" : ""}
            />
            {socialErrors.youtube && (
              <p className="text-xs text-destructive">{socialErrors.youtube}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              X (Twitter)
            </Label>
            <Input
              id="twitter"
              value={data.social_links?.twitter ?? ""}
              onChange={(e) => handleSocialChange("twitter", e.target.value)}
              placeholder="https://x.com/username"
              className={socialErrors.twitter ? "border-destructive" : ""}
            />
            {socialErrors.twitter && (
              <p className="text-xs text-destructive">{socialErrors.twitter}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              TikTok
            </Label>
            <Input
              id="tiktok"
              value={data.social_links?.tiktok ?? ""}
              onChange={(e) => handleSocialChange("tiktok", e.target.value)}
              placeholder="https://tiktok.com/@username"
              className={socialErrors.tiktok ? "border-destructive" : ""}
            />
            {socialErrors.tiktok && (
              <p className="text-xs text-destructive">{socialErrors.tiktok}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              value={data.social_links?.whatsapp ?? ""}
              onChange={(e) => handleSocialChange("whatsapp", e.target.value)}
              placeholder="https://wa.me/351912345678"
              className={socialErrors.whatsapp ? "border-destructive" : ""}
            />
            {socialErrors.whatsapp && (
              <p className="text-xs text-destructive">{socialErrors.whatsapp}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Format: https://wa.me/[country code][number] (no spaces or symbols)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Telegram
            </Label>
            <Input
              id="telegram"
              value={data.social_links?.telegram ?? ""}
              onChange={(e) => handleSocialChange("telegram", e.target.value)}
              placeholder="https://t.me/username"
              className={socialErrors.telegram ? "border-destructive" : ""}
            />
            {socialErrors.telegram && (
              <p className="text-xs text-destructive">{socialErrors.telegram}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="google_business" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Google Business Profile
            </Label>
            <div className="flex gap-2">
              <Input
                id="google_business"
                value={data.social_links?.google_business ?? ""}
                onChange={(e) => handleSocialChange("google_business", e.target.value)}
                placeholder="https://maps.google.com/..."
                className={`flex-1 ${socialErrors.google_business ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data.social_links?.google_business || isFetchingRatings || !!socialErrors.google_business}
                onClick={async () => {
                  if (!data.social_links?.google_business) {
                    toast.error("Please enter a Google Business URL first");
                    return;
                  }

                  const normalizedGoogleBusinessUrl = normalizeExternalUrlInput(
                    data.social_links.google_business,
                  );
                  
                  setIsFetchingRatings(true);
                  try {
                    const { data: result, error } = await supabase.functions.invoke(
                      "extract-google-ratings",
                      {
                        body: {
                          listing_id: listingId,
                          google_business_url: normalizedGoogleBusinessUrl,
                        },
                      }
                    );
                    
                    if (error) throw error;
                    
                    if (result.error) {
                      if (result.error.includes("API key not configured")) {
                        toast.error("Google Places API key not configured yet");
                      } else {
                        toast.error(result.error);
                      }
                      return;
                    }
                    
                    if (result.rating != null || result.review_count != null) {
                      toast.success(
                        `Found rating: ${result.rating ?? "N/A"} ⭐ (${result.review_count ?? 0} reviews)`
                      );
                      onGoogleRatingsFetched?.(result.rating, result.review_count);
                    } else {
                      toast.info("No rating data found for this business");
                    }
                  } catch (err) {
                    console.error("Error fetching ratings:", err);
                    toast.error("Failed to fetch Google ratings");
                  } finally {
                    setIsFetchingRatings(false);
                  }
                }}
              >
                {isFetchingRatings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Fetch Ratings</span>
              </Button>
            </div>
            {socialErrors.google_business && (
              <p className="text-xs text-destructive">{socialErrors.google_business}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Add your Google Business Profile URL to display ratings and reviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
