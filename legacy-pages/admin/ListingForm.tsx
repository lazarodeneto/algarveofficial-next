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
import { GolfStep } from "@/components/admin/form-steps/GolfStep";
import { useAllCities, useAllRegions, useAllCategories } from "@/hooks/useReferenceData";
import { useAdminListing } from "@/hooks/useListings";
import { useCreateListing, useUpdateListing } from "@/hooks/useListingMutations";
import {
  useAdminListingGolf,
  useUpsertAdminListingGolf,
  type AdminGolfData,
} from "@/hooks/useAdminListingGolf";
import { getCategoryTemplate, getDefaultDetails } from "@/lib/categoryTemplates";
import { extractIdParam } from "@/lib/routeParams";
import {
  LISTING_FORM_STEPS,
  type ListingFormData,
  type ListingGolfDetailsForm,
  type ListingGolfFormData,
  type ListingGolfHoleForm,
} from "@/types/listing";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocalePath } from "@/hooks/useLocalePath";
import { resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";
import { normalizeExternalUrlForStorage } from "@/lib/url-input";

const getEmptyFormData = (): ListingFormData => ({
  name: "",
  slug: "",
  short_description: "",
  category_id: "",
  city_id: "",
  full_description: "",
  premium_region_id: undefined,
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

const getEmptyGolfDetails = (): ListingGolfDetailsForm => ({
  holes_count: 18,
  architect: "",
  course_rating: null,
  slope_rating: null,
  booking_url: "",
  scorecard_image_url: "",
  scorecard_pdf_url: "",
  map_image_url: "",
});

const getEmptyGolfState = (): ListingGolfFormData => ({
  structure: "single",
  details: getEmptyGolfDetails(),
  courses: [
    {
      id: "default-course",
      name: "Main Course",
      holes_count: 18,
      is_default: true,
      holes: [],
    },
  ],
  status: "missing",
});

const createHoleDraft = (holeNumber: number): ListingGolfHoleForm => ({
  hole_number: holeNumber,
  par: null,
  stroke_index: holeNumber,
  distance_white: null,
  distance_yellow: null,
  distance_red: null,
});

const normalizeGolfDetailsForCategoryData = (
  details: ListingGolfDetailsForm,
  structure: ListingGolfFormData["structure"],
): Record<string, unknown> => ({
  course_structure: structure,
  holes_count: details.holes_count,
  holes: details.holes_count,
  architect: details.architect || null,
  course_rating: details.course_rating,
  slope_rating: details.slope_rating,
  booking_url: details.booking_url || null,
  scorecard_image_url: details.scorecard_image_url || null,
  scorecard_pdf_url: details.scorecard_pdf_url || null,
  map_image_url: details.map_image_url || null,
});

const formatSaveTimestamp = (date = new Date()): string =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

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
  const l = useLocalePath();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(getEmptyFormData());
  const [initialData, setInitialData] = useState<ListingFormData>(getEmptyFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [golfForm, setGolfForm] = useState<ListingGolfFormData>(getEmptyGolfState());
  const [golfErrors, setGolfErrors] = useState<Record<string, string>>({});
  const [golfSaveNotice, setGolfSaveNotice] = useState<{
    type: "success" | "warning";
    text: string;
    savedAt?: string;
  } | null>(null);

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
            url: resolveSupabaseBucketImageUrl(img.image_url, "listing-images") || img.image_url,
            alt: img.alt_text || "",
            is_featured: Boolean(img.is_featured) || i === 0,
            order: typeof img.display_order === "number" ? img.display_order : i,
          }))
        : (existingListing.featured_image_url
            ? [{
                id: "featured-fallback",
                url:
                  resolveSupabaseBucketImageUrl(
                    existingListing.featured_image_url,
                    "listing-images",
                  ) || existingListing.featured_image_url,
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
        premium_region_id: existingListing.region_id || undefined,
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

  const selectedCategorySlug = useMemo(() => {
    if (!formData.category_id) return "";
    const selectedCategory = categories.find((category) => category.id === formData.category_id);
    return selectedCategory?.slug ?? "";
  }, [categories, formData.category_id]);

  const isGolfCategory = selectedCategorySlug.toLowerCase() === "golf";
  const showGolfSetup = isGolfCategory && isAdmin;
  const golfDetailsFieldsOwnedByGolfSetup = showGolfSetup ? ["holes", "booking_url"] : [];

  const {
    data: golfRemoteData,
    isLoading: golfLoading,
  } = useAdminListingGolf(id, Boolean(isEditMode && id && showGolfSetup));

  const upsertGolfSetup = useUpsertAdminListingGolf(id);

  useEffect(() => {
    if (!showGolfSetup) {
      setGolfErrors({});
      setGolfSaveNotice(null);
      return;
    }

    if (golfRemoteData) {
      setGolfForm(golfRemoteData as AdminGolfData);
    } else if (!isEditMode) {
      setGolfForm(getEmptyGolfState());
    }
  }, [golfRemoteData, isEditMode, showGolfSetup]);

  const syncGolfDetailsToListingDetails = (nextGolf: ListingGolfFormData) => {
    const primaryCourse = nextGolf.courses[0];
    const normalizedDetails: ListingGolfDetailsForm = {
      ...nextGolf.details,
      holes_count:
        nextGolf.structure === "multi"
          ? null
          : primaryCourse?.holes_count ?? nextGolf.details.holes_count ?? 18,
    };

    setFormData((prev) => ({
      ...prev,
      details: {
        ...(prev.details ?? {}),
        ...normalizeGolfDetailsForCategoryData(normalizedDetails, nextGolf.structure),
      },
    }));
  };

  useEffect(() => {
    if (!showGolfSetup || !golfRemoteData) return;
    syncGolfDetailsToListingDetails(golfRemoteData);
  }, [golfRemoteData, showGolfSetup]);

  const handleGolfChange = (next: ListingGolfFormData) => {
    setGolfForm(next);
    setGolfSaveNotice(null);
    syncGolfDetailsToListingDetails(next);
  };

  const validateGolfCourses = (golf: ListingGolfFormData) => {
    const validation: Record<string, string> = {};

    if (golf.structure !== "multi" && golf.courses.length !== 1) {
      validation["structure"] = "Single and custom layouts must have exactly one course.";
    }

    for (const course of golf.courses) {
      if (!course.name.trim()) {
        validation[`course.${course.id}.name`] = "Course name is required.";
      }

      if (!Number.isInteger(course.holes_count) || course.holes_count < 1) {
        validation[`course.${course.id}.holes_count`] = "Holes count is required.";
      }

      if (course.holes_count > 18 && golf.structure !== "multi") {
        validation[`course.${course.id}.holes_count`] =
          "Holes above 18 require Multi-Course Resort mode.";
      }

      const holes = [...course.holes].sort((a, b) => a.hole_number - b.hole_number);

      const seen = new Set<number>();
      for (const hole of holes) {
        const keyBase = `course.${course.id}.hole.${hole.hole_number}`;

        if (!Number.isInteger(hole.hole_number) || hole.hole_number < 1 || hole.hole_number > 18) {
          validation[`${keyBase}.hole_number`] = "Hole number must be between 1 and 18.";
        } else if (seen.has(hole.hole_number)) {
          validation[`${keyBase}.hole_number`] = "Duplicate hole number.";
        } else {
          seen.add(hole.hole_number);
        }

        if (
          hole.par !== null &&
          (!Number.isInteger(hole.par) || hole.par < 1)
        ) {
          validation[`${keyBase}.par`] = "Par must be 1 or higher.";
        }

        if (
          hole.stroke_index !== null &&
          (!Number.isInteger(hole.stroke_index) || hole.stroke_index < 1 || hole.stroke_index > 18)
        ) {
          validation[`${keyBase}.stroke_index`] = "Stroke index must be between 1 and 18.";
        }

        for (const distanceField of ["distance_white", "distance_yellow", "distance_red"] as const) {
          const distance = hole[distanceField];
          if (distance !== null && (!Number.isFinite(distance) || distance < 0)) {
            validation[`${keyBase}.${distanceField}`] = "Distance must be 0 or greater.";
          }
        }
      }
    }

    return validation;
  };

  const handleGolfClearHoles = async () => {
    if (!id) {
      toast.info("Save the listing first, then configure hole-by-hole data.");
      return;
    }

    const shouldClear = window.confirm(
      "Clear all hole rows for this listing? This cannot be undone.",
    );
    if (!shouldClear) return;

    try {
      const updated = await upsertGolfSetup.mutateAsync({
        clear_courses: true,
      });
      setGolfForm(updated);
      setGolfErrors({});
      setGolfSaveNotice({
        type: "success",
        text: "Saved. All hole rows were cleared.",
        savedAt: formatSaveTimestamp(),
      });
      syncGolfDetailsToListingDetails(updated);
      toast.success("Hole rows cleared.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to clear holes.";
      toast.error(message);
    }
  };

  const handleGolfSaveChanges = async () => {
    if (!id) {
      toast.info("Save the listing first, then configure hole-by-hole data.");
      return;
    }

    const nextErrors = validateGolfCourses(golfForm);
    setGolfErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Fix validation errors before saving golf setup.");
      return;
    }

    try {
      let incompleteHolesAutoCompleted = 0;
      const payloadCourses = golfForm.courses.map((course) => {
        const boundedHoles = [...course.holes]
          .sort((a, b) => a.hole_number - b.hole_number)
          .slice(0, course.holes_count);
        const holeByNumber = new Map<number, ListingGolfHoleForm>();
        for (const hole of boundedHoles) {
          if (
            Number.isInteger(hole.hole_number) &&
            hole.hole_number >= 1 &&
            hole.hole_number <= course.holes_count &&
            !holeByNumber.has(hole.hole_number)
          ) {
            holeByNumber.set(hole.hole_number, hole);
          }
        }

        const completeHoles = Array.from({ length: course.holes_count }, (_, index) => {
          const holeNumber = index + 1;
          const hole = holeByNumber.get(holeNumber);
          const par =
            hole && Number.isInteger(hole.par) && (hole.par ?? 0) > 0
              ? (hole.par as number)
              : 4;
          if (!hole || !Number.isInteger(hole.par) || (hole.par ?? 0) < 1) {
            incompleteHolesAutoCompleted += 1;
          }

          const strokeIndex =
            hole && Number.isInteger(hole.stroke_index) && (hole.stroke_index ?? 0) >= 1 && (hole.stroke_index ?? 0) <= 18
              ? (hole.stroke_index as number)
              : holeNumber;

          return {
            hole_number: holeNumber,
            par,
            stroke_index: strokeIndex,
            distance_white:
              hole && typeof hole.distance_white === "number" && Number.isFinite(hole.distance_white) && hole.distance_white >= 0
                ? hole.distance_white
                : null,
            distance_yellow:
              hole && typeof hole.distance_yellow === "number" && Number.isFinite(hole.distance_yellow) && hole.distance_yellow >= 0
                ? hole.distance_yellow
                : null,
            distance_red:
              hole && typeof hole.distance_red === "number" && Number.isFinite(hole.distance_red) && hole.distance_red >= 0
                ? hole.distance_red
                : null,
          };
        });

        return {
          ...course,
          name: course.name.trim(),
          holes: completeHoles.map((hole) => ({
            hole_number: hole.hole_number,
            par: hole.par,
            stroke_index: hole.stroke_index,
            distance_white: hole.distance_white,
            distance_yellow: hole.distance_yellow,
            distance_red: hole.distance_red,
          })),
        };
      });

      const updated = await upsertGolfSetup.mutateAsync({
        structure: golfForm.structure,
        details: golfForm.details,
        courses: payloadCourses,
      });
      setGolfForm(updated);
      setGolfErrors({});
      syncGolfDetailsToListingDetails(updated);
      if (incompleteHolesAutoCompleted > 0) {
        const autoCompletedLabel =
          incompleteHolesAutoCompleted === 1
            ? "Saved. 1 incomplete hole was auto-completed (par 4)."
            : `Saved. ${incompleteHolesAutoCompleted} incomplete holes were auto-completed (par 4).`;
        setGolfSaveNotice({
          type: "warning",
          text: autoCompletedLabel,
          savedAt: formatSaveTimestamp(),
        });
        toast.success(autoCompletedLabel);
      } else {
        const successLabel = "Saved. All provided golf entries were stored.";
        setGolfSaveNotice({
          type: "success",
          text: successLabel,
          savedAt: formatSaveTimestamp(),
        });
        toast.success(successLabel);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save golf setup.";
      toast.error(message);
    }
  };

  const shouldShowDetailsStep = useMemo(() => {
    if (!formData.category_id) return true;

    // Keep Details visible until categories are loaded for the selected id.
    if (!selectedCategorySlug) return true;

    return Boolean(getCategoryTemplate(selectedCategorySlug));
  }, [formData.category_id, selectedCategorySlug]);

  const visibleSteps = useMemo(() => {
    if (shouldShowDetailsStep) return LISTING_FORM_STEPS;
    return LISTING_FORM_STEPS.filter((step) => step.id !== "details");
  }, [shouldShowDetailsStep]);

  const completedSteps = useMemo(
    () =>
      visibleSteps.reduce<number[]>((acc, step, index) => {
        if (completedStepIds.includes(step.id)) {
          acc.push(index);
        }
        return acc;
      }, []),
    [completedStepIds, visibleSteps],
  );

  const currentStepId = visibleSteps[currentStep]?.id;

  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, Math.max(visibleSteps.length - 1, 0)));
  }, [visibleSteps.length]);

  const validateStep = (stepId: string | undefined): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepId === "basics") {
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
    const stepId = visibleSteps[currentStep]?.id;
    if (validateStep(stepId)) {
      if (stepId) {
        setCompletedStepIds((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
      }
      setCurrentStep((prev) => Math.min(prev + 1, visibleSteps.length - 1));
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
    const maxTierImages = getListingTierMaxGalleryImages(formData.tier);
    const normalizedImages = [...formData.images]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, maxTierImages)
      .map((img, index) => ({
        ...img,
        order: index,
      }));

    if (normalizedImages.length > 0 && !normalizedImages.some((img) => img.is_featured)) {
      normalizedImages[0].is_featured = true;
    }

    // Prepare listing data for Supabase
    const listingData: Record<string, unknown> = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      short_description: formData.short_description.trim(),
      description: formData.full_description?.trim() || null,
      category_id: formData.category_id,
      city_id: formData.city_id,
      region_id: formData.premium_region_id || null,
      owner_id: formData.owner_id || user.id,
      tags: formData.tags || [],
      contact_phone: formData.contact?.phone || null,
      contact_email: formData.contact?.email || null,
      website_url: normalizeExternalUrlForStorage(formData.contact?.website) || null,
      address: formData.location?.address || null,
      latitude: formData.location?.lat || null,
      longitude: formData.location?.lng || null,
      instagram_url: normalizeExternalUrlForStorage(formData.social_links?.instagram) || null,
      facebook_url: normalizeExternalUrlForStorage(formData.social_links?.facebook) || null,
      google_business_url: normalizeExternalUrlForStorage(formData.social_links?.google_business) || null,
      twitter_url: normalizeExternalUrlForStorage(formData.social_links?.twitter) || null,
      linkedin_url: normalizeExternalUrlForStorage(formData.social_links?.linkedin) || null,
      youtube_url: normalizeExternalUrlForStorage(formData.social_links?.youtube) || null,
      tiktok_url: normalizeExternalUrlForStorage(formData.social_links?.tiktok) || null,
      telegram_url: normalizeExternalUrlForStorage(formData.social_links?.telegram) || null,
      whatsapp_number: formData.social_links?.whatsapp || null,
      featured_image_url: normalizedImages.find((img) => img.is_featured)?.url || normalizedImages[0]?.url || null,
      category_data: formData.details || {},
      tier: formData.tier,
      is_curated: formData.is_curated,
      status: finalStatus,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      price_from: (formData.details as any)?.price || null,
    };

    // Prepare images data - include _file for new uploads
    const imagesData = normalizedImages.map((img, index) => ({
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
        const updatedData = { ...formData, images: normalizedImages, published_status: finalStatus };
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
    switch (currentStepId) {
      case "basics":
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
      case "media":
        return <MediaStep data={formData} onChange={handleChange} errors={errors} />;
      case "details":
        return (
          <div className="space-y-8">
            <DetailsStep
              data={formData}
              onChange={handleChange}
              errors={errors}
              categoryId={formData.category_id}
              categories={formCategories}
              excludeFieldNames={golfDetailsFieldsOwnedByGolfSetup}
            />

            {showGolfSetup ? (
              <GolfStep
                golf={golfForm}
                validationErrors={golfErrors}
                canSave={Boolean(id)}
                isLoading={golfLoading}
                isSaving={upsertGolfSetup.isPending}
                saveNotice={golfSaveNotice}
                onGolfChange={handleGolfChange}
                onClearHoles={handleGolfClearHoles}
                onSaveChanges={handleGolfSaveChanges}
              />
            ) : null}
          </div>
        );
      case "contact":
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
      case "publishing":
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
          steps={visibleSteps}
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
          {currentStep < visibleSteps.length - 1 ? (
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
