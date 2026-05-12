import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Eye,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { ClaimStatusBadgeOwner } from "@/components/owner/ClaimStatusBadgeOwner";
import { StatusBadgeOwner } from "@/components/owner/StatusBadgeOwner";
import { TierBadgeOwner } from "@/components/owner/TierBadgeOwner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import type { Database, Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useLocalePath } from "@/hooks/useLocalePath";
import { extractIdParam } from "@/lib/routeParams";
import { isUuid } from "@/lib/slugify";

type ListingChangeRequestStatus = Database["public"]["Enums"]["listing_change_request_status"];

type EditableFieldName =
  | "name"
  | "short_description"
  | "description"
  | "contact_phone"
  | "contact_email"
  | "website_url"
  | "address"
  | "opening_hours"
  | "instagram_url"
  | "facebook_url"
  | "twitter_url"
  | "youtube_url"
  | "linkedin_url"
  | "tiktok_url"
  | "featured_image_url";

type OwnerEditFormData = Record<EditableFieldName, string>;

interface ChangeRequestRow {
  id: string;
  field_name: string;
  old_value: Json | null;
  requested_value: Json;
  status: ListingChangeRequestStatus;
  reviewed_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

interface RequestFieldDefinition {
  name: EditableFieldName;
  label: string;
  description?: string;
  placeholder?: string;
  multiline?: boolean;
  sensitive?: boolean;
}

const REQUEST_FIELDS: RequestFieldDefinition[] = [
  {
    name: "name",
    label: "Business name",
    placeholder: "Official business name",
    sensitive: true,
  },
  {
    name: "short_description",
    label: "Short description",
    placeholder: "Brief tagline for your listing",
  },
  {
    name: "description",
    label: "Full description",
    description: "Full descriptions require editorial review before publication.",
    placeholder: "Describe your business...",
    multiline: true,
    sensitive: true,
  },
  {
    name: "contact_phone",
    label: "Phone",
    placeholder: "+351 xxx xxx xxx",
  },
  {
    name: "contact_email",
    label: "Primary contact email",
    placeholder: "contact@example.com",
    sensitive: true,
  },
  {
    name: "website_url",
    label: "Website",
    placeholder: "https://www.example.com",
  },
  {
    name: "address",
    label: "Address correction",
    placeholder: "Street, postal code, city",
    multiline: true,
  },
  {
    name: "opening_hours",
    label: "Opening hours",
    placeholder: "Monday-Friday 09:00-18:00",
    multiline: true,
  },
  {
    name: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
  },
  {
    name: "facebook_url",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    name: "twitter_url",
    label: "X / Twitter",
    placeholder: "https://x.com/yourhandle",
  },
  {
    name: "youtube_url",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
  },
  {
    name: "linkedin_url",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourcompany",
  },
  {
    name: "tiktok_url",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    name: "featured_image_url",
    label: "Featured image URL",
    description: "Featured image changes are reviewed before replacing the public listing image.",
    placeholder: "https://...",
    sensitive: true,
  },
];

const emptyFormData = REQUEST_FIELDS.reduce((acc, field) => {
  acc[field.name] = "";
  return acc;
}, {} as OwnerEditFormData);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readName(value: unknown): string | null {
  if (isRecord(value) && typeof value.name === "string") {
    return value.name;
  }
  return null;
}

function readOpeningHours(categoryData: Json | null) {
  if (!isRecord(categoryData)) return "";

  if (typeof categoryData.opening_hours === "string") {
    return categoryData.opening_hours;
  }

  const businessDetails = categoryData.business_details;
  if (isRecord(businessDetails) && typeof businessDetails.opening_hours === "string") {
    return businessDetails.opening_hours;
  }

  return "";
}

function valueToDisplay(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function getCurrentFormData(listing: Database["public"]["Tables"]["listings"]["Row"]): OwnerEditFormData {
  return {
    name: listing.name || "",
    short_description: listing.short_description || "",
    description: listing.description || "",
    contact_phone: listing.contact_phone || "",
    contact_email: listing.contact_email || "",
    website_url: listing.website_url || "",
    address: listing.address || "",
    opening_hours: readOpeningHours(listing.category_data),
    instagram_url: listing.instagram_url || "",
    facebook_url: listing.facebook_url || "",
    twitter_url: listing.twitter_url || "",
    youtube_url: listing.youtube_url || "",
    linkedin_url: listing.linkedin_url || "",
    tiktok_url: listing.tiktok_url || "",
    featured_image_url: listing.featured_image_url || "",
  };
}

function normalizeForComparison(value: string) {
  return value.trim();
}

function FieldIcon({ name }: { name: EditableFieldName }) {
  const className = "h-4 w-4";
  if (name.includes("phone")) return <Phone className={className} />;
  if (name.includes("email")) return <Mail className={className} />;
  if (name.includes("url") || name === "website_url") return <Globe className={className} />;
  if (name === "address") return <MapPin className={className} />;
  if (name === "featured_image_url") return <ImageIcon className={className} />;
  return <Clock className={className} />;
}

function StatusPill({ status }: { status: ListingChangeRequestStatus }) {
  const config: Record<ListingChangeRequestStatus, string> = {
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rejected: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${config[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value || "Unknown"}</span>
    </div>
  );
}

export default function OwnerListingEdit() {
  const params = useParams<Record<string, string | string[] | undefined>>();
  const id = extractIdParam(params);
  const router = useRouter();
  const l = useLocalePath();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState<OwnerEditFormData>(emptyFormData);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["owner-listing", user?.id, id],
    queryFn: async () => {
      if (!id || !user?.id || !isUuid(id)) return null;
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          cities:city_id(id, name),
          categories:category_id(id, name),
          regions:region_id(id, name)
        `)
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
    staleTime: 0,
  });

  const pendingRequests = useQuery({
    queryKey: ["owner-listing-change-requests", user?.id, id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`/api/owner/listing-change-requests?listingId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const json = (await response.json()) as {
        ok?: boolean;
        data?: ChangeRequestRow[];
        error?: { message?: string };
      };

      if (!response.ok || json.ok === false) {
        throw new Error(json.error?.message ?? "Failed to load pending requests.");
      }

      return json.data ?? [];
    },
    enabled: !!id && !!user?.id && isUuid(id ?? ""),
    staleTime: 0,
  });

  useEffect(() => {
    if (listing) {
      setFormData(getCurrentFormData(listing));
    }
  }, [listing]);

  const currentData = useMemo(() => (listing ? getCurrentFormData(listing) : emptyFormData), [listing]);

  const changedFields = useMemo(
    () =>
      REQUEST_FIELDS.filter(
        (field) => normalizeForComparison(formData[field.name]) !== normalizeForComparison(currentData[field.name]),
      ),
    [currentData, formData],
  );

  const submitChangeRequests = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) {
        throw new Error("Owner authentication required");
      }

      const response = await fetch("/api/owner/listing-change-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: id,
          changes: changedFields.map((field) => ({
            fieldName: field.name,
            requestedValue: formData[field.name],
          })),
        }),
      });

      const json = (await response.json()) as {
        ok?: boolean;
        data?: unknown;
        error?: { message?: string; details?: unknown };
      };

      if (!response.ok || json.ok === false) {
        throw new Error(json.error?.message ?? "Failed to submit change requests.");
      }

      return json.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner-listing-change-requests", user?.id, id] });
      toast.success("Change request submitted for admin review");
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const updateField = (field: EditableFieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-muted-foreground">Listing not found</p>
        <Button onClick={() => router.push(l("/owner/listings"))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </div>
    );
  }

  const city = readName(listing.cities);
  const category = readName(listing.categories);
  const region = readName(listing.regions);
  const isClaimed = listing.claim_status === "claimed";
  const isSubmitting = submitChangeRequests.isPending;
  const hasChanges = changedFields.length > 0;
  const requestByField = new Map(
    (pendingRequests.data ?? [])
      .filter((request) => request.status === "pending")
      .map((request) => [request.field_name, request]),
  );

  return (
    <div className="space-y-6 pb-24">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(l("/owner/listings"))}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">Request listing changes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit structured updates for admin approval. Public listing data is not changed instantly.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TierBadgeOwner tier={listing.tier} size="sm" />
              <StatusBadgeOwner status={listing.status} size="sm" />
              <ClaimStatusBadgeOwner status={listing.claim_status} size="sm" />
              {listing.is_curated && (
                <span className="rounded-full border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs text-primary">
                  Signature Selection
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={l(`/listing/${listing.slug}`)} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
          </div>
        </div>
      </m.div>

      <Card className="border-border bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <InfoRow label="Location" value={city} icon={<MapPin className="h-4 w-4" />} />
            <Separator orientation="vertical" className="h-5" />
            <InfoRow label="Category" value={category} />
            {region && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <InfoRow label="Region" value={region} />
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            City, category, slug and ownership changes remain protected and are handled by admin review.
          </p>
        </CardContent>
      </Card>

      {!isClaimed ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex gap-3 p-4 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Change requests require an approved claim.</p>
              <p className="mt-1">
                This listing is assigned to your account but is not marked as claimed yet. Complete admin claim
                approval before submitting owner edits.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Requested updates</CardTitle>
              <CardDescription>
                Every changed field below is saved as a pending request. Admin approval is required before public
                content changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {REQUEST_FIELDS.map((field) => {
                const pending = requestByField.get(field.name);
                const fieldId = `owner-edit-${field.name}`;
                return (
                  <div key={field.name} className="space-y-2 rounded-lg border border-border/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label htmlFor={fieldId} className="flex items-center gap-2">
                        <FieldIcon name={field.name} />
                        {field.label}
                      </Label>
                      <div className="flex flex-wrap items-center gap-2">
                        {field.sensitive ? (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                            Admin review
                          </span>
                        ) : null}
                        {pending ? <StatusPill status={pending.status} /> : null}
                      </div>
                    </div>
                    {field.multiline ? (
                      <Textarea
                        id={fieldId}
                        value={formData[field.name]}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        rows={field.name === "description" ? 5 : 3}
                        disabled={!isClaimed || Boolean(pending)}
                      />
                    ) : (
                      <Input
                        id={fieldId}
                        value={formData[field.name]}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        disabled={!isClaimed || Boolean(pending)}
                      />
                    )}
                    {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
                    {pending ? (
                      <p className="text-xs text-muted-foreground">
                        A pending request already exists for this field. Requested value:{" "}
                        <span className="font-medium text-foreground">{valueToDisplay(pending.requested_value)}</span>
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Pending requests</CardTitle>
              <CardDescription>Requests already submitted for this listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading requests...
                </div>
              ) : (pendingRequests.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No change requests yet.</p>
              ) : (
                (pendingRequests.data ?? []).map((request) => (
                  <div key={request.id} className="rounded-lg border border-border/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {REQUEST_FIELDS.find((field) => field.name === request.field_name)?.label ??
                            request.field_name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusPill status={request.status} />
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <p>
                        <span className="text-muted-foreground">Current:</span>{" "}
                        <span className="text-foreground">{valueToDisplay(request.old_value)}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Requested:</span>{" "}
                        <span className="text-foreground">{valueToDisplay(request.requested_value)}</span>
                      </p>
                      {request.admin_note ? (
                        <p>
                          <span className="text-muted-foreground">Admin note:</span>{" "}
                          <span className="text-foreground">{request.admin_note}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Review policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Low-risk and sensitive fields are both routed through manual review in this phase to keep listing
                quality consistent.
              </p>
              <p>
                Sensitive changes include business name, full description, featured image, primary email and ownership
                details.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-col justify-end gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => router.push(l(`/owner/listings/${listing.id}`))}>
            Cancel
          </Button>
          <Button
            onClick={() => submitChangeRequests.mutate()}
            disabled={!isClaimed || !hasChanges || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit {changedFields.length > 0 ? changedFields.length : ""} change request
            {changedFields.length === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}
