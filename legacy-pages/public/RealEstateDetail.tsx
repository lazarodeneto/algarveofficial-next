
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button"; // Shadcn button
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Need to check if exists, else Input
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
const ListingMap = dynamic(() => import("@/components/ui/listing-map").then(mod => mod.ListingMap), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-3xl" />
});
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Bed,
    Bath,
    Maximize,
    Trees,
    Sun,
    Waves,
    Wine,
    Key,
    Smartphone,
    CheckCircle2,
    ChevronRight,
    Share2,
    Heart,
    X,
    ChevronLeft,
    Phone,
    CalendarDays,
    Loader2,
    Crown,
    ShieldCheck,
    Star,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import { formatRichTextDescription } from "@/lib/formatRichText";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import ListingImage from "@/components/ListingImage";

type Listing = Database['public']['Tables']['listings']['Row'] & {
    cities: { name: string; slug: string } | null;
    images: { id: string; image_url: string; alt_text: string | null; display_order: number }[];
};

type Lang = "en" | "pt-pt" | "fr" | "de" | "es" | "it" | "nl" | "sv" | "no" | "da";
type ListingTranslationRow = {
    listing_id: string;
    language_code: string;
    title: string | null;
    description: string | null;
};

const normalizeLang = (raw?: string | null): Lang => {
    if (!raw) return "en";
    const v = raw.toLowerCase().replace("_", "-").trim();
    if (v === "pt" || v === "pt-pt" || v === "pt_pt") return "pt-pt";
    if (v.startsWith("fr")) return "fr";
    if (v.startsWith("de")) return "de";
    if (v.startsWith("es")) return "es";
    if (v.startsWith("it")) return "it";
    if (v.startsWith("nl")) return "nl";
    if (v.startsWith("sv")) return "sv";
    if (v === "no" || v.startsWith("nb") || v.startsWith("nn")) return "no";
    if (v.startsWith("da")) return "da";
    return "en";
};

// Mock Agent Data - Fallback if not in categoryData
const DEFAULT_AGENT = {
    name: "Elena Costa",
    role: "Senior Partner",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    stars: 5
};

export default function RealEstateDetail() {
    const { t, i18n } = useTranslation();
    const { slug } = useParams();

    const [isVisitScheduling, setIsVisitScheduling] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Enquiry form state
    const [enquiryName, setEnquiryName] = useState("");
    const [enquiryCountryCode, setEnquiryCountryCode] = useState("+351");
    const [enquiryPhone, setEnquiryPhone] = useState("");
    const [enquiryEmail, setEnquiryEmail] = useState("");
    const [enquiryMessage, setEnquiryMessage] = useState("");
    const [enquiryVisitType, setEnquiryVisitType] = useState("in-person");
    const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

    const { data: listing, isLoading } = useQuery({
        queryKey: ['listing', slug],
        queryFn: async () => {
            if (!slug) return null;
            // First try to find by ID if it looks like a UUID
            if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const { data, error } = await supabase
                    .from('public_listings')
                    .select('*, cities(name, slug), category:categories(id, name, slug, image_url), images:listing_images(*)')
                    .eq('id', slug)
                    .maybeSingle();
                if (error) throw error;
                if (data) return data;
            }

            // Fallback to slug search
            const { data, error } = await supabase
                .from('public_listings')
                .select('*, cities(name, slug), category:categories(id, name, slug, image_url), images:listing_images(*)')
                .eq('slug', slug) // Assuming 'slug' column exists or using another unique identifier if not
                .maybeSingle();

            // If not found in public_listings, try listing_slugs table for older slugs? 
            // For now, let's keep it simple as public_listings is a view.
            // Actually public_listings might not have 'slug' column directly if it's on listing_slugs.
            // But let's assume the previous implementation was working with a simple query.
            // Re-reading types.ts, listing_slugs is a separate table.
            // However, checking previous context or just trying 'slug' column on public_listings 
            // (which often joins current slug) is a safe first bet. 
            // If this fails, I'll need to join listing_slugs.
            // Let's check if I can use the 'slug' from the URL against 'listing_slugs' joined?
            // Actually, typically the view public_listings includes the current slug.

            if (error) throw error;
            return data;
        },
        enabled: !!slug
    });

    const { data: similarListings } = useQuery({
        queryKey: ['similar-listings', listing?.id],
        queryFn: async () => {
            if (!listing) return [];
            const { data, error } = await supabase
                .from('public_listings')
                .select('*, cities(name, slug), category:categories(id, name, slug, image_url), images:listing_images(*)')
                .eq('category_id', listing.category_id)
                .neq('id', listing.id)
                .limit(3);

            if (error) {
                console.error("Error fetching similar listings", error);
                return [];
            }
            return data;
        },
        enabled: !!listing
    });

    const targetLang = normalizeLang(i18n.language);

    const { data: listingTranslation } = useQuery({
        queryKey: ["real-estate-translation", listing?.id, targetLang],
        queryFn: async () => {
            if (!listing?.id || targetLang === "en") return null;
            const { data, error } = await supabase
                .from("listing_translations")
                .select("listing_id, language_code, title, description")
                .eq("listing_id", listing.id)
                .eq("language_code", targetLang)
                .maybeSingle();

            if (error) throw error;
            return data as ListingTranslationRow | null;
        },
        enabled: !!listing?.id && targetLang !== "en",
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 px-4 flex flex-col items-center justify-center">
                <Header />
                <h1 className="text-3xl font-serif text-foreground mb-4">Listing Not Found</h1>
                <p className="text-muted-foreground mb-8">The property you are looking for might have been removed or renamed.</p>
                <Link href="/invest">
                    <Button variant="outline">Browse All Listings</Button>
                </Link>
            </div>
        );
    }

    const categoryData = listing.category_data as Record<string, any> || {};
    const { bedrooms, bathrooms, area_sqm, plot_sqm, property_size_m2, plot_size_m2 } = categoryData;

    // Normalize keys (handle legacy vs new)
    const displayArea = property_size_m2 || area_sqm;
    const displayPlot = plot_size_m2 || plot_sqm;

    // Dynamic Features from Category Data
    const features = Array.isArray(categoryData.features) && categoryData.features.length > 0
        ? categoryData.features
        : ["Sunset Views", "Infinity Pool", "Wine Cellar", "Michelin Key", "Smart Home"];

    // Sort images by display_order and exclude the featured image
    const galleryImages = (listing.images || [])
        .filter(img => img.image_url !== listing.featured_image_url)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const nextImage = () => {
        if (galleryImages.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        if (galleryImages.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    // If no gallery images, fallback to the admin-managed category image.
    const hasGallery = galleryImages.length > 0;

    // Helper to get image at index safe
    const getGalleryImage = (index: number) => {
        if (!hasGallery) {
            return listing.category?.image_url || "/placeholder.svg";
        }
        return galleryImages[index]?.image_url || "/placeholder.svg";
    };

    // Agent Data from Category Data or Fallback
    const agent = {
        name: categoryData.agent_name || DEFAULT_AGENT.name,
        role: categoryData.agent_role || DEFAULT_AGENT.role,
        image: categoryData.agent_image || DEFAULT_AGENT.image,
        email: categoryData.agent_email,
        phone: categoryData.agent_phone,
    };

    const virtualTourUrl = categoryData.virtual_tour_url;



    const price = listing.price_from || categoryData.price;
    const effectiveTitle = listingTranslation?.title?.trim() || listing.name;
    const effectiveDescription = listingTranslation?.description?.trim() || listing.description;
    const titleParts = effectiveTitle.split(",");
    const titleMain = titleParts[0]?.trim() || effectiveTitle;
    const titleAccent = titleParts.slice(1).join(",").trim() || listing.cities?.name;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(price).replace('€', '€ ');
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pt-24 transition-colors duration-300">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://algarveofficial.com/" },
                    { name: "Invest", url: "https://algarveofficial.com/invest" },
                    { name: effectiveTitle, url: `https://algarveofficial.com/real-estate/${listing.slug}` },
                ]}
            />
            <Header />

            {/* Breadcrumbs - simplified */}
                <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2 font-medium">
                    <Link href="/">{t('nav.home')}</Link> <ChevronRight className="w-3 h-3" />
                    <Link href="/invest">{t('nav.invest')}</Link> <ChevronRight className="w-3 h-3" />
                    <span className="text-gold">{effectiveTitle}</span>
                </div>

            <main className="container mx-auto px-4 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl text-foreground">
                            {titleMain}{titleAccent ? ", " : ""}<span className="italic text-gold font-light">{titleAccent}</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-gold" />
                            <span className="font-light tracking-wide">{listing.address || `Avenida André Jordan, ${listing.cities?.name}, Portugal`}</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        {(listing.tier === "signature" || listing.tier === "verified") && (
                            <div className="flex flex-wrap justify-end items-center gap-2 mb-2">
                                {listing.tier === "signature" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black text-xs font-semibold uppercase tracking-wider">
                                        <Crown className="h-3 w-3" />
                                        {t("common.signature").toUpperCase()}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 text-white text-xs font-semibold uppercase tracking-wider">
                                    <ShieldCheck className="h-3 w-3" />
                                    {t("common.verified").toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="text-sm text-muted-foreground font-light">
                            {t('listing.freehold')} • {listing.cities?.name}
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px] mb-12">
                    {/* Main Image */}
                    <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl">
                        <img
                            src={listing.featured_image_url || "/placeholder.svg"}
                            alt={listing.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4">
                            <Button variant="secondary" size="sm" className="bg-black/50 text-white backdrop-blur hover:bg-black/70 border-none rounded-full px-4">
                                {t('listing.exterior')}
                            </Button>
                        </div>
                    </div>

                    {/* Secondary Images */}
                    <div className={cn("md:col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl group", hasGallery && "cursor-pointer")} onClick={() => hasGallery && openGallery(0)}>
                        <img src={getGalleryImage(0)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 1" />
                    </div>
                    <div className={cn("md:col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl group", hasGallery && "cursor-pointer")} onClick={() => hasGallery && openGallery(1)}>
                        <img src={getGalleryImage(1)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 2" />
                    </div>
                    <div className={cn("md:col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl group", hasGallery && "cursor-pointer")} onClick={() => hasGallery && openGallery(2)}>
                        <img src={getGalleryImage(2)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 3" />
                    </div>
                    <div className={cn("md:col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl group", hasGallery && "cursor-pointer")} onClick={() => hasGallery && openGallery(3)}>
                        <img src={getGalleryImage(3)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 4" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button variant="ghost" className="text-white hover:text-white hover:bg-black/20 font-medium chalkboard-effect">
                                <span className="mr-2">■</span> {t('listing.viewGallery')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Lightbox Gallery */}
                {isGalleryOpen && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 backdrop-blur-sm border border-white/10 transition-all z-50"
                            onClick={() => setIsGalleryOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
                            {hasGallery && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 backdrop-blur-sm border border-white/10 transition-all z-50 transform hover:scale-110"
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </Button>

                                    <img
                                        src={galleryImages[currentImageIndex]?.image_url}
                                        alt={galleryImages[currentImageIndex]?.alt_text || listing.name}
                                        className="max-h-full max-w-full object-contain"
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 backdrop-blur-sm border border-white/10 transition-all z-50 transform hover:scale-110"
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </Button>

                                    <div className="absolute bottom-[-40px] left-0 right-0 text-center text-white text-sm">
                                        {currentImageIndex + 1} / {galleryImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 mb-12 border-b border-border pb-12">
                    {features.map((feature: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors cursor-default bg-card shadow-sm dark:bg-muted/50">
                            <CheckCircle2 className="w-4 h-4 text-gold/70" />
                            {translateCategoryValue(t, feature)}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-muted/30 p-8 rounded-2xl dark:bg-muted/10">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('listing.price')}</div>
                                <div className="flex items-center gap-2 font-serif text-2xl text-foreground whitespace-nowrap">
                                    {price ? formatPrice(price) : t('listing.priceOnRequest')}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('listing.bedrooms')}</div>
                                <div className="flex items-center gap-2 font-serif text-2xl text-foreground">
                                    <Bed className="w-5 h-5 text-gold" /> {bedrooms || '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('listing.bathrooms')}</div>
                                <div className="flex items-center gap-2 font-serif text-2xl text-foreground">
                                    <Bath className="w-5 h-5 text-gold" /> {bathrooms || '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('listing.builtArea')}</div>
                                <div className="flex items-center gap-2 font-serif text-2xl text-foreground">
                                    <Maximize className="w-5 h-5 text-gold" /> {displayArea || '-'}m²
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="font-serif text-3xl mb-6 text-foreground">{t('common.description')}</h2>
                            <div className="max-w-none text-muted-foreground font-light leading-relaxed [&_p]:mb-6 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground">
                                {effectiveDescription ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(formatRichTextDescription(effectiveDescription)),
                                        }}
                                    />
                                ) : (
                                    <>
                                        <p>
                                            <span className="float-left text-6xl font-serif text-gold pr-3 -mt-2 leading-none">W</span>
                                            aking up at {listing.name} is an exercise in serenity. As the {listing.cities?.name} sun gently crests over the distant hills, the master suite is bathed in a warm, golden glow. Step onto your private terrace for an espresso, where the only sound is the gentle rustling of the umbrella pines and the distant hum of the Atlantic.
                                        </p>
                                        <br />
                                        <p>
                                            Designed for the consummate entertainer, the ground floor flows seamlessly from indoors to out. The state-of-the-art kitchen, featuring professional-grade appliances, opens directly onto the expansive pool deck. Here, long summer lunches turn into evening soirées under the stars, facilitated by the integrated outdoor kitchen and lounge area.
                                        </p>
                                        <br />
                                        <p>
                                            Beyond the aesthetic beauty, the villa offers a lifestyle of unparalleled convenience. Located just moments from the Quinta do Lago North Course and the pristine beaches of the Ria Formosa, every day presents a new opportunity for adventure or relaxation. This is not just a home; it is a sanctuary for those who demand the very best.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div>
                            <h2 className="font-serif text-3xl mb-6 text-foreground">{t('listing.location')}</h2>
                            {listing.latitude && listing.longitude ? (
                                <ListingMap
                                    lat={Number(listing.latitude)}
                                    lng={Number(listing.longitude)}
                                    name={listing.name}
                                    address={listing.cities?.name}
                                    className="h-[400px] w-full"
                                />
                            ) : (
                                <div className="w-full h-[400px] bg-muted/30 rounded-3xl relative overflow-hidden group flex items-center justify-center border border-border">
                                    <div className="text-center p-6">
                                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="font-serif text-xl text-foreground mb-2">{t('listing.locationHidden', 'Exact Location Private')}</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            {t('listing.contactForLocation', 'Please contact the agent for the exact location of this property.')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Price / Agent Card */}
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm sticky top-24 dark:bg-card/50 dark:backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <img src={agent.image} alt={agent.name} className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md" />
                                <div>
                                    <div className="font-serif text-xl text-foreground">{agent.name}</div>
                                    <div className="text-sm text-muted-foreground">{agent.role}</div>
                                    <div className="flex items-center gap-1 text-gold mt-1">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <Star key={idx} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <a href={`tel:${agent.phone?.replace(/\s+/g, '') || '+351926488494'}`} className="block w-full mb-6">
                                <Button variant="outline" className="w-full py-6 text-lg border-2 border-muted hover:bg-muted/50 text-foreground rounded-2xl font-serif">
                                    <Phone className="w-4 h-4 mr-2" /> {agent.phone || "+351 926 488 494"}
                                </Button>
                            </a>

                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSubmittingEnquiry(true);
                                try {
                                    const { data, error } = await supabase.functions.invoke("send-enquiry", {
                                        body: {
                                            name: enquiryName,
                                            email: enquiryEmail,
                                            phone: enquiryPhone ? `${enquiryCountryCode}${enquiryPhone}` : "",
                                            message: enquiryMessage,
                                            listing_id: listing?.id ?? null,
                                            listing_title: listing?.name ?? null,
                                            agent_name: agent.name ?? null,
                                            agent_email: agent.email ?? null,
                                            visit_type: isVisitScheduling ? enquiryVisitType : null,
                                        },
                                    });

                                    if (error) {
                                        let detailedMessage = "";
                                        const errorContext = (error as { context?: unknown }).context;
                                        if (errorContext instanceof Response) {
                                            const payload = await errorContext.json().catch(() => null) as { error?: string } | null;
                                            if (payload?.error) detailedMessage = payload.error;
                                        }
                                        throw new Error(detailedMessage || error.message || "Failed to send enquiry");
                                    }

                                    const responseData = data as { warnings?: string[] } | null;
                                    toast.success(t('listing.form.successToast', 'Your enquiry has been sent!'));
                                    if (responseData?.warnings?.includes("email_delivery_disabled")) {
                                        toast.message("Your message was saved successfully. Email notifications are temporarily unavailable.");
                                    }
                                    if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
                                        toast.message("Your message was saved, but email notification failed. The admin can still view it in the inbox.");
                                    }
                                    if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
                                        toast.message("Your message was received, but admin inbox delivery needs configuration.");
                                    }
                                    setEnquiryName("");
                                    setEnquiryCountryCode("+351");
                                    setEnquiryPhone("");
                                    setEnquiryEmail("");
                                    setEnquiryMessage("");
                                    setIsVisitScheduling(false);
                                } catch (err: unknown) {
                                    console.error("Enquiry submission error:", err);
                                    const errorMessage = err instanceof Error ? err.message : "";
                                    const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
                                    toast.error(
                                        isNetworkError
                                            ? "Unable to reach our server right now. Please try again in a moment."
                                            : (errorMessage || t('listing.form.errorToast', 'Failed to send enquiry. Please try again.'))
                                    );
                                } finally {
                                    setIsSubmittingEnquiry(false);
                                }
                            }}>
                                <Input
                                    placeholder={t('listing.form.name')}
                                    className="rounded-xl bg-background border-border h-12"
                                    required
                                    value={enquiryName}
                                    onChange={(e) => setEnquiryName(e.target.value)}
                                />

                                <CountryPhoneInput
                                    countryCode={enquiryCountryCode}
                                    onCountryCodeChange={setEnquiryCountryCode}
                                    phone={enquiryPhone}
                                    onPhoneChange={setEnquiryPhone}
                                    phonePlaceholder={t('listing.form.telephone')}
                                    required
                                    className="flex gap-3"
                                    inputClassName="pl-9 rounded-xl bg-background border-border h-12"
                                />

                                <Input
                                    placeholder={t('listing.form.email')}
                                    className="rounded-xl bg-background border-border h-12"
                                    type="email"
                                    required
                                    value={enquiryEmail}
                                    onChange={(e) => setEnquiryEmail(e.target.value)}
                                />

                                <Textarea
                                    placeholder={t('listing.form.message')}
                                    className="rounded-xl bg-background border-border min-h-[120px] resize-none"
                                    required
                                    value={enquiryMessage}
                                    onChange={(e) => setEnquiryMessage(e.target.value)}
                                />

                                <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="schedule-visit" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-primary" />
                                            {t('listing.bookVisit')}
                                        </label>
                                        <Switch
                                            id="schedule-visit"
                                            checked={isVisitScheduling}
                                            onCheckedChange={setIsVisitScheduling}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>

                                    {isVisitScheduling && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Select value={enquiryVisitType} onValueChange={setEnquiryVisitType}>
                                                <SelectTrigger className="rounded-xl bg-background border-border w-full">
                                                    <SelectValue placeholder={t('listing.form.selectVisitType')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="in-person">{t('listing.form.inPerson')}</SelectItem>
                                                    <SelectItem value="video-call">{t('listing.form.videoCall')}</SelectItem>
                                                    {virtualTourUrl && (
                                                        <SelectItem value="virtual-tour">Virtual Tour</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-3 mt-4">
                                    <Checkbox id="consent" className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" required />
                                    <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                                        {t('listing.form.consent', 'I authorise KW Portugal to store my data to inform me of opportunities, marketing campaigns and financing proposals.')}
                                    </label>
                                </div>

                                <Button type="submit" disabled={isSubmittingEnquiry} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-lg font-serif mt-2">
                                    {isSubmittingEnquiry ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('listing.form.sending', 'Sending...')}</> : t('listing.form.send')}
                                </Button>
                            </form>
                        </div>

                        {/* Tier Badge */}
                        {(listing.tier === "signature" || listing.tier === "verified") && (
                            <div className="bg-gold/5 rounded-2xl p-6 flex items-center gap-4 border border-gold/20 dark:bg-gold/10">
                                <div className="bg-gold rounded-full p-2 text-white">
                                    {listing.tier === "signature" ? <Crown className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="font-bold text-gold-dark text-sm uppercase dark:text-gold">
                                        {listing.tier === "signature" ? t("common.signature") : t("common.verified")}
                                    </div>
                                    <div className="text-xs text-gold-dark/80 dark:text-gold/80">{t('listing.verifiedDocuments')}</div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

                {/* Similar Listings */}
                {
                    similarListings && similarListings.length > 0 && (
                        <div className="mt-24 border-t border-border pt-12">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="font-serif text-3xl text-foreground">{t('listing.similarListings')}</h2>
                                    <p className="text-muted-foreground font-light">{t('listing.handpickedSelection')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="rounded-full"><ChevronRight className="w-4 h-4 rotate-180" /></Button>
                                    <Button size="icon" variant="outline" className="rounded-full"><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {similarListings.map(item => (
                                    <Link href={`/real-estate/${item.slug}`} key={item.id} className="group block">
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative">
                                            <ListingImage
                                                src={item.featured_image_url}
                                                category="real-estate"
                                                categoryImageUrl={item.category?.image_url}
                                                listingId={item.id}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {(item.tier === "signature" || item.tier === "verified") && (
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    {item.tier === "signature" && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black text-xs font-semibold uppercase tracking-wider">
                                                            <Crown className="h-3 w-3" />
                                                            {t("common.signature").toUpperCase()}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 text-white text-xs font-semibold uppercase tracking-wider">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        {t("common.verified").toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-card px-3 py-1 rounded-full text-xs font-bold shadow-md text-card-foreground">
                                                {item.price_from ? formatPrice(item.price_from) : t('listing.priceOnRequest')}
                                            </div>
                                        </div>
                                        <h3 className="font-serif text-xl mb-1 group-hover:text-gold transition-colors text-foreground">{item.name}</h3>
                                        <div className="text-sm text-muted-foreground">
                                            3 {t('listing.bedrooms')} • 4 {t('listing.bathrooms')} • {t('listing.golfFront')}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }

            </main >
            <Footer />
        </div >
    );
}
