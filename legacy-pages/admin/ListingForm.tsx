import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormStepIndicator } from "@/components/admin/listings/FormStepIndicator";
import { FormActionBar } from "@/components/admin/listings/FormActionBar";
import { BasicsStep } from "@/components/admin/form-steps/BasicsStep";
import { MediaStep } from "@/components/admin/form-steps/MediaStep";
import { DetailsStep } from "@/components/admin/form-steps/DetailsStep";
import { ContactStep } from "@/components/admin/form-steps/ContactStep";
import { PublishingStep } from "@/components/admin/form-steps/PublishingStep";
import { useAllCities, useAllRegions, useAllCategories } from "@/hooks/useReferenceData";
import { useAdminListing } from "@/hooks/useListings";
import { useCreateListing, useUpdateListing } from "@/hooks/useListingMutations";
import { getDefaultDetails } from "@/lib/categoryTemplates";
import { extractIdParam } from "@/lib/routeParams";
import { LISTING_FORM_STEPS, type ListingFormData } from "@/types/listing";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

const getEmptyFormData = (): ListingFormData => ({
  name: "",
  slug: "",
  short_description: "",
  category_id: "",
  city_id: "",
  full_description: "",
  luxury_region_id: undefined,
  tags: [],
  contact: {},
  location: undefined,
  social_links: undefined,
  images: [],
  details: {},
  tier: "unverified",
  is_curated: false,
  published_status: "draft",
  owner_id: undefined,
});

export default function ListingForm() {
  const params = useParams<Record<string, string | string[] | undefined>>();
  const pathname = usePathname() ?? "";
  const id = useMemo(() => {
    const fromParams = extractIdParam(params);
    if (fromParams) return fromParams;

    const match = pathname.match(/\/admin\/listings\/([^/]+)\/edit$/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  }, [params, pathname]);
  const router = useRouter();
  const l = useLocalizedHref();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(getEmptyFormData());
  const [initialData, setInitialData] = useState<ListingFormData>(getEmptyFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Role checks
  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';

  // Fetch reference data (all records including inactive for admin)
  const { data: cities = [] } = useAllCities();
  const { data: regions = [] } = useAllRegions();
  const { data: categories = [] } = useAllCategories();

  // Fetch existing listing for edit mode
  const { data: existingListing, isLoading: listingLoading } = useAdminListing(id);

  // Mutations
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const isSaving = createListing.isPending || updateListing.isPending;

  // Load existing listing data for edit mode
  useEffect(() => {
    if (isEditMode && existingListing) {
      const dbImages = Array.isArray(existingListing.images)
        ? [...existingListing.images]
            .filter((img: any) => img?.image_url)
            .sort((a: any, b: any) => {
              const ao = typeof a?.display_order === "number" ? a.display_order : Number.MAX_SAFE_INTEGER;
              const bo = typeof b?.display_order === "number" ? b.display_order : Number.MAX_SAFE_INTEGER;
              return ao - bo;
            })
        : [];

      const normalizedImages = dbImages.length > 0
        ? dbImages.map((img: any, i: number) => ({
            id: img.id || `img-${i}`,
            url: img.image_url,
            alt: img.alt_text || "",
            is_featured: Boolean(img.is_featured) || i === 0,
            order: typeof img.display_order === "number" ? img.display_order : i,
          }))
        : (existingListing.featured_image_url
            ? [{
                id: "featured-fallback",
                url: existingListing.featured_image_url,
                alt: "",
                is_featured: true,
                order: 0,
              }]
            : []);

      const loadedData: ListingFormData = {
        name: existingListing.name,
        slug: existingListing.slug,
        short_description: existingListing.short_description || "",
        category_id: existingListing.category_id,
        city_id: existingListing.city_id,
        full_description: existingListing.description || "",
        luxury_region_id: existingListing.region_id || undefined,
        tags: existingListing.tags || [],
        contact: {
          phone: existingListing.contact_phone || undefined,
          email: existingListing.contact_email || undefined,
          website: existingListing.website_url || undefined,
        },
        location: existingListing.latitude && existingListing.longitude ? {
          address: existingListing.address || undefined,
          lat: Number(existingListing.latitude),
          lng: Number(existingListing.longitude),
        } : undefined,
        social_links: {
          instagram: existingListing.instagram_url || undefined,
          facebook: existingListing.facebook_url || undefined,
          google_business: existingListing.google_business_url || undefined,
          twitter: existingListing.twitter_url || undefined,
          linkedin: existingListing.linkedin_url || undefined,
          youtube: existingListing.youtube_url || undefined,
          tiktok: existingListing.tiktok_url || undefined,
          telegram: existingListing.telegram_url || undefined,
          whatsapp: existingListing.whatsapp_number || undefined,
        },
        images: normalizedImages,
        details: (typeof existingListing.category_data === 'object' && existingListing.category_data !== null && !Array.isArray(existingListing.category_data))
          ? existingListing.category_data as Record<string, unknown>
          : getDefaultDetails(existingListing.category_id),
        tier: existingListing.tier as 'unverified' | 'verified' | 'signature',
        is_curated: existingListing.is_curated,
        published_status: existingListing.status as 'draft' | 'pending_review' | 'published' | 'rejected',
        owner_id: existingListing.owner_id,
      };
      setFormData(loadedData);
      setInitialData(loadedData);
    }
  }, [existingListing, isEditMode]);

  // Update details when category changes (only for new listings)
  useEffect(() => {
    if (formData.category_id && !isEditMode && !existingListing) {
      setFormData((prev) => ({
        ...prev,
        details: getDefaultDetails(formData.category_id),
      }));
    }
  }, [formData.category_id, isEditMode, existingListing]);

  const handleChange = (field: keyof ListingFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.slug.trim()) newErrors.slug = "Slug is required";
      if (!formData.short_description.trim()) newErrors.short_description = "Short description is required";
      if (!formData.category_id) newErrors.category_id = "Category is required";
      if (!formData.city_id) newErrors.city_id = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, LISTING_FORM_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const isFormValid = (): boolean => {
    return Boolean(
      formData.name.trim() &&
      formData.slug.trim() &&
      formData.short_description.trim() &&
      formData.category_id &&
      formData.city_id &&
      (formData.contact?.phone || formData.contact?.email || formData.contact?.website)
    );
  };

  const handleSave = async (status?: "draft" | "pending_review" | "published") => {
    if (!user) {
      toast.error("You must be logged in to save a listing");
      return;
    }

    const finalStatus = status || formData.published_status;

    // Prepare listing data for Supabase
    const listingData: Record<string, unknown> = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      short_description: formData.short_description.trim(),
      description: formData.full_description?.trim() || null,
      category_id: formData.category_id,
      city_id: formData.city_id,
      region_id: formData.luxury_region_id || null,
      owner_id: formData.owner_id || user.id,
      tags: formData.tags || [],
      contact_phone: formData.contact?.phone || null,
      contact_email: formData.contact?.email || null,
      website_url: formData.contact?.website || null,
      address: formData.location?.address || null,
      latitude: formData.location?.lat || null,
      longitude: formData.location?.lng || null,
      instagram_url: formData.social_links?.instagram || null,
      facebook_url: formData.social_links?.facebook || null,
      google_business_url: formData.social_links?.google_business || null,
      twitter_url: formData.social_links?.twitter || null,
      linkedin_url: formData.social_links?.linkedin || null,
      youtube_url: formData.social_links?.youtube || null,
      tiktok_url: formData.social_links?.tiktok || null,
      telegram_url: formData.social_links?.telegram || null,
      whatsapp_number: formData.social_links?.whatsapp || null,
      featured_image_url: formData.images.find(img => img.is_featured)?.url || formData.images[0]?.url || null,
      category_data: formData.details || {},
      tier: formData.tier,
      is_curated: formData.is_curated,
      status: finalStatus,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      price_from: (formData.details as any)?.price || null,
    };

    // Prepare images data - include _file for new uploads
    const imagesData = formData.images.map((img, index) => ({
      url: img.url,
      alt_text: img.alt || undefined,
      is_featured: img.is_featured,
      display_order: img.order ?? index,
      // Pass the file for new images that need uploading
      _file: (img as any)._file as File | undefined,
    }));

    try {
      if (isEditMode && id) {
        await updateListing.mutateAsync({
          id,
          listing: listingData,
          images: imagesData,
        });
        const updatedData = { ...formData, published_status: finalStatus };
        setFormData(updatedData);
        setInitialData(updatedData);
      } else {
        await createListing.mutateAsync({
          listing: listingData as any,
          images: imagesData,
        });
        router.push(l("/admin/listings"));
      }
    } catch (error) {
      // Error is handled by mutation
      console.error('Save error:', error);
    }
  };

  // Convert Supabase data to form-compatible format
  const formCities = cities.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    municipality: undefined,
    is_active: c.is_active,
    created_at: c.created_at,
  }));

  const formRegions = regions.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || "",
    is_featured: r.is_featured,
    cities: [], // We don't need this for the form
    created_at: r.created_at,
  }));

  const formCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    icon: c.icon || "Star",
    subcategories: [],
    created_at: c.created_at,
  }));

  // Fetch ALL users for owner selection (admin only)
  const { data: ownerCandidates = [] } = useQuery({
    queryKey: ['admin-all-user-candidates'],
    queryFn: async () => {
      // Get all profiles (users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('full_name');

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      // Get roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map profiles with their highest role
      return profiles.map(p => {
        const userRoles = roles?.filter(r => r.user_id === p.id) || [];
        const highestRole = userRoles.find(r => r.role === 'admin')?.role
          || userRoles.find(r => r.role === 'editor')?.role
          || userRoles.find(r => r.role === 'owner')?.role
          || 'viewer_logged';

        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name || p.email,
          role: highestRole,
          created_at: p.created_at,
        };
      });
    },
    enabled: isAdmin,
  });

  if (listingLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicsStep
            data={formData}
            onChange={handleChange}
            cities={formCities}
            regions={formRegions}
            categories={formCategories}
            errors={errors}
            isAdmin={isAdmin}
          />
        );
      case 1:
        return <MediaStep data={formData} onChange={handleChange} errors={errors} />;
      case 2:
        return <DetailsStep data={formData} onChange={handleChange} errors={errors} categoryId={formData.category_id} categories={formCategories} />;
      case 3:
        return (
          <ContactStep
            data={formData}
            onChange={handleChange}
            errors={errors}
            listingId={id}
            onGoogleRatingsFetched={(rating, reviewCount) => {
              // Update form data with fetched ratings (optional local state)
              console.log("Fetched ratings:", rating, reviewCount);
            }}
          />
        );
      case 4:
        return (
          <PublishingStep
            data={formData}
            onChange={handleChange}
            errors={errors}
            isAdmin={isAdmin}
            isEditor={isEditor}
            users={ownerCandidates as any}
            listingId={id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={l("/admin/listings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </Button>
        <h1 className="text-2xl font-medium font-serif">
          {isEditMode ? "Edit Listing" : "Create Listing"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? "Update listing information" : "Add a new business listing"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <FormStepIndicator
          steps={LISTING_FORM_STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Form content */}
      <div className="bg-card rounded-lg border border-border p-6">
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep < LISTING_FORM_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Action bar */}
      <FormActionBar
        status={formData.published_status}
        tier={formData.tier}
        isAdmin={isAdmin}
        isSaving={isSaving}
        hasChanges={hasChanges}
        isValid={isFormValid()}
        onSaveDraft={() => handleSave("draft")}
        onSubmitReview={() => handleSave("pending_review")}
        onPublish={() => handleSave()}
        onPreview={() => {
          if (isEditMode && id) {
            window.open(`/listing/${formData.slug || id}`, '_blank');
          } else {
            toast.info("Save the listing first to preview");
          }
        }}
      />
    </div>
  );
}
