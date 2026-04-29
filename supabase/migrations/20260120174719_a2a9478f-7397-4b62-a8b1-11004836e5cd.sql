-- ═══════════════════════════════════════════════════════════════════════════
-- ALGARVEOFFICIAL - COMPLETE BACKEND SCHEMA
-- Multi-city premium CMS portal for Algarve, Portugal
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: EXTENSIONS & ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Role enum (separate from profiles per security requirements)
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'owner', 'viewer_logged');
-- Listing tier enum
CREATE TYPE public.listing_tier AS ENUM ('unverified', 'verified', 'signature');
-- Listing status enum
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'archived');
-- Message status enum
CREATE TYPE public.message_status AS ENUM ('unread', 'read', 'replied', 'archived');
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: PROFILES & ROLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- User roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: GEOGRAPHY - CITIES & REGIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Premium Regions (editorial groupings)
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  hero_image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Cities (real localities in Algarve)
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  hero_image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- City-Region mapping (many-to-many)
CREATE TABLE public.city_region_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (city_id, region_id)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  icon TEXT, -- Lucide icon name
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Category-specific template fields (JSON schema for dynamic forms)
  template_fields JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 5: LISTINGS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  
  -- Geography
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Category
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  
  -- Tier & Status
  tier listing_tier NOT NULL DEFAULT 'unverified',
  status listing_status NOT NULL DEFAULT 'draft',
  is_curated BOOLEAN NOT NULL DEFAULT false,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  whatsapp_number TEXT,
  
  -- Social
  instagram_url TEXT,
  facebook_url TEXT,
  
  -- Media
  featured_image_url TEXT,
  
  -- Category-specific data (flexible JSON)
  category_data JSONB DEFAULT '{}'::jsonb,
  
  -- Tags & search
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing (optional)
  price_from DECIMAL(10, 2),
  price_to DECIMAL(10, 2),
  price_currency TEXT DEFAULT 'EUR',
  
  -- Publishing
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejection_notes TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats
  view_count INT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Listing images
CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 6: FAVORITES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Polymorphic favorites
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure at least one reference is set
  CONSTRAINT favorites_one_reference CHECK (
    (listing_id IS NOT NULL)::int +
    (region_id IS NOT NULL)::int +
    (city_id IS NOT NULL)::int +
    (category_id IS NOT NULL)::int = 1
  ),
  -- Prevent duplicates
  UNIQUE (user_id, listing_id),
  UNIQUE (user_id, region_id),
  UNIQUE (user_id, city_id),
  UNIQUE (user_id, category_id)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 7: MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════

-- Conversations between users and listing owners
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_unread_count INT NOT NULL DEFAULT 0,
  owner_unread_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, user_id)
);
-- Individual messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 8: CMS PAGES & CONTENT BLOCKS
-- ═══════════════════════════════════════════════════════════════════════════

-- Pages (About, Terms, Privacy, etc.)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Homepage settings
CREATE TABLE public.homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_video_url TEXT,
  hero_youtube_url TEXT,
  hero_poster_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_primary_text TEXT,
  hero_cta_primary_link TEXT,
  hero_cta_secondary_text TEXT,
  hero_cta_secondary_link TEXT,
  -- Section visibility
  show_regions_section BOOLEAN NOT NULL DEFAULT true,
  show_categories_section BOOLEAN NOT NULL DEFAULT true,
  show_cities_section BOOLEAN NOT NULL DEFAULT true,
  show_vip_section BOOLEAN NOT NULL DEFAULT true,
  show_curated_section BOOLEAN NOT NULL DEFAULT true,
  show_all_listings_section BOOLEAN NOT NULL DEFAULT true,
  show_cta_section BOOLEAN NOT NULL DEFAULT true,
  -- Section order (JSON array of section IDs)
  section_order JSONB DEFAULT '["regions","categories","cities","vip","curated","all_listings","cta"]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Curated Excellence assignments
CREATE TABLE public.curated_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  -- Context: null = homepage, or specific region/city/category
  context_type TEXT CHECK (context_type IN ('homepage', 'region', 'city', 'category')),
  context_id UUID, -- references region_id, city_id, or category_id depending on context_type
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Only one curated listing per context
  UNIQUE (context_type, context_id)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 9: MEDIA LIBRARY
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT,
  alt_text TEXT,
  folder TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 10: ANALYTICS & EVENTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Daily aggregated stats
CREATE TABLE public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  views INT NOT NULL DEFAULT 0,
  unique_views INT NOT NULL DEFAULT 0,
  favorites INT NOT NULL DEFAULT 0,
  inquiries INT NOT NULL DEFAULT 0,
  UNIQUE (date, listing_id)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 11: EMAIL MARKETING FOUNDATIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_subscribed BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT, -- 'signup', 'newsletter', 'inquiry', etc.
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 12: REVIEWS (Optional)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, user_id)
);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 13: INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- Listings indexes
CREATE INDEX idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX idx_listings_city_id ON public.listings(city_id);
CREATE INDEX idx_listings_region_id ON public.listings(region_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_tier ON public.listings(tier);
CREATE INDEX idx_listings_is_curated ON public.listings(is_curated) WHERE is_curated = true;
CREATE INDEX idx_listings_published ON public.listings(status, tier, is_curated) WHERE status = 'published';
CREATE INDEX idx_listings_tags ON public.listings USING GIN(tags);
-- Geography indexes
CREATE INDEX idx_cities_slug ON public.cities(slug);
CREATE INDEX idx_regions_slug ON public.regions(slug);
CREATE INDEX idx_city_region_mapping_city ON public.city_region_mapping(city_id);
CREATE INDEX idx_city_region_mapping_region ON public.city_region_mapping(region_id);
-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON public.favorites(listing_id) WHERE listing_id IS NOT NULL;
-- Messages indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_owner_id ON public.conversations(owner_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
-- Analytics indexes
CREATE INDEX idx_analytics_events_listing_id ON public.analytics_events(listing_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_daily_date ON public.analytics_daily(date);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 14: FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
-- Check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;
-- Check if user is listing owner
CREATE OR REPLACE FUNCTION public.is_listing_owner(_user_id UUID, _listing_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND owner_id = _user_id
  )
$$;
-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'owner' THEN 3
      WHEN 'viewer_logged' THEN 4
    END
  LIMIT 1
$$;
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Default role is viewer_logged
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer_logged');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Increment listing view count
CREATE OR REPLACE FUNCTION public.increment_listing_views(_listing_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = _listing_id;
$$;
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 15: TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON public.regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Auto-create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 16: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_region_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- USER_ROLES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- REGIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view active regions"
  ON public.regions FOR SELECT
  USING (is_active = true);
CREATE POLICY "Admins and editors can manage regions"
  ON public.regions FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- CITIES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view active cities"
  ON public.cities FOR SELECT
  USING (is_active = true);
CREATE POLICY "Admins and editors can manage cities"
  ON public.cities FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- CITY_REGION_MAPPING POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view city-region mappings"
  ON public.city_region_mapping FOR SELECT
  USING (true);
CREATE POLICY "Admins and editors can manage mappings"
  ON public.city_region_mapping FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORIES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);
CREATE POLICY "Admins and editors can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- LISTINGS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Public can view published listings
CREATE POLICY "Anyone can view published listings"
  ON public.listings FOR SELECT
  USING (status = 'published');
-- Owners can view their own listings
CREATE POLICY "Owners can view their own listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());
-- Owners can create listings
CREATE POLICY "Owners can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    public.has_role(auth.uid(), 'owner')
  );
-- Owners can update their own listings (but not tier or is_curated)
CREATE POLICY "Owners can update their own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
-- Owners can delete their own draft listings
CREATE POLICY "Owners can delete their own draft listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid() AND status = 'draft');
-- Admins and editors can manage all listings
CREATE POLICY "Admins and editors can manage all listings"
  ON public.listings FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- LISTING_IMAGES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view listing images"
  ON public.listing_images FOR SELECT
  USING (true);
CREATE POLICY "Owners can manage their listing images"
  ON public.listing_images FOR ALL
  TO authenticated
  USING (public.is_listing_owner(auth.uid(), listing_id));
CREATE POLICY "Admins and editors can manage all listing images"
  ON public.listing_images FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- FAVORITES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- ═══════════════════════════════════════════════════════════════════════════
-- CONVERSATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR owner_id = auth.uid());
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR owner_id = auth.uid());
-- ═══════════════════════════════════════════════════════════════════════════
-- MESSAGES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );
CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );
CREATE POLICY "Message sender can update their messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());
-- ═══════════════════════════════════════════════════════════════════════════
-- PAGES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view published pages"
  ON public.pages FOR SELECT
  USING (is_published = true);
CREATE POLICY "Admins and editors can manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- HOMEPAGE_SETTINGS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view homepage settings"
  ON public.homepage_settings FOR SELECT
  USING (true);
CREATE POLICY "Admins can manage homepage settings"
  ON public.homepage_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- CURATED_ASSIGNMENTS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view curated assignments"
  ON public.curated_assignments FOR SELECT
  USING (true);
CREATE POLICY "Admins can manage curated assignments"
  ON public.curated_assignments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA_LIBRARY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view media"
  ON public.media_library FOR SELECT
  USING (true);
CREATE POLICY "Admins and editors can manage media"
  ON public.media_library FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- ═══════════════════════════════════════════════════════════════════════════
-- ANALYTICS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can view their listing analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (
    listing_id IS NOT NULL AND
    public.is_listing_owner(auth.uid(), listing_id)
  );
CREATE POLICY "Admins can view daily analytics"
  ON public.analytics_daily FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can manage daily analytics"
  ON public.analytics_daily FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- EMAIL_SUBSCRIBERS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can manage subscribers"
  ON public.email_subscribers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- REVIEWS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 17: STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listings', 'listings', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Listings bucket policies
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listings');
CREATE POLICY "Users can update their own listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Media bucket policies
CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
CREATE POLICY "Admins and editors can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));
-- Avatars bucket policies
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ═══════════════════════════════════════════════════════════════════════════
-- PART 18: INITIAL HOMEPAGE SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.homepage_settings (
  id,
  hero_title,
  hero_subtitle,
  hero_cta_primary_text,
  hero_cta_primary_link,
  hero_cta_secondary_text,
  hero_cta_secondary_link
) VALUES (
  gen_random_uuid(),
  'Discover Algarve''s Finest',
  'Curated premium experiences across Portugal''s most prestigious coastal destination',
  'Explore Regions',
  '#regions',
  'Curated Excellence',
  '#curated'
);
