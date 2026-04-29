export type CategorySlug = string;

export interface ListingImage {
  id: string;
  url: string;
  alt?: string;
  is_featured: boolean;
  order: number;
  _file?: File;
}

export interface ListingContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface ListingSocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  google_business?: string;
}

export interface ListingLocation {
  address?: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  [key: string]: string | number | undefined;
}

export type GolfHoleDataStatus = "missing" | "incomplete" | "configured";
export type GolfCourseStructure = "single" | "multi" | "custom";

export interface ListingGolfDetailsForm {
  holes_count: number | null;
  architect: string;
  course_rating: number | null;
  slope_rating: number | null;
  booking_url: string;
  scorecard_image_url: string;
  scorecard_pdf_url: string;
  map_image_url: string;
}

export interface ListingGolfHoleForm {
  hole_number: number;
  par: number | null;
  stroke_index: number | null;
  distance_white: number | null;
  distance_yellow: number | null;
  distance_red: number | null;
}

export interface ListingGolfCourseForm {
  id: string;
  name: string;
  holes_count: number;
  is_default: boolean;
  holes: ListingGolfHoleForm[];
}

export interface ListingGolfFormData {
  structure: GolfCourseStructure;
  details: ListingGolfDetailsForm;
  courses: ListingGolfCourseForm[];
  status: GolfHoleDataStatus;
}

export interface ListingFormData {
  name: string;
  slug: string;
  short_description: string;
  full_description?: string;
  category_id: string;
  city_id: string;
  premium_region_id?: string;
  owner_id?: string;
  tier: "unverified" | "verified" | "signature";
  published_status: "draft" | "pending_review" | "published" | "rejected" | "archived";
  is_curated?: boolean;
  details?: Record<string, unknown>;
  images: ListingImage[];
  contact?: ListingContact;
  social_links?: ListingSocialLinks;
  location?: ListingLocation;
  tags?: string[];
  golf?: ListingGolfFormData;
  [key: string]: unknown;
}

export interface FormStep {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export const LISTING_FORM_STEPS: FormStep[] = [
  { id: "basics", label: "Basics", description: "Name, descriptions, and location", icon: "FileText" },
  { id: "media", label: "Media", description: "Images and gallery", icon: "Image" },
  { id: "details", label: "Details", description: "Category-specific information", icon: "Settings" },
  { id: "contact", label: "Contact", description: "Phone, email, and social", icon: "Phone" },
  { id: "publishing", label: "Publishing", description: "Tier and status (admin only)", icon: "Send" },
];
