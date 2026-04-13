# Explore More Destinations - Backend Management Guide

## Overview

The "Explore More Destinations" section on your destinations page displays images and information about regions and cities. This document explains where these are managed in the backend/admin dashboard.

---

## Frontend Display Location

**Page:** https://algarveofficial.com/en/destinations/
**Alternate:** https://algarveofficial.com/en/destinations/almancil (city pages)

**Components:**
- `app/[locale]/destinations/page.tsx` - Server-side page
- `components/destinations/DestinationsClient.tsx` - Client-side rendering (loads data from Supabase)

---

## Database Tables

Data is stored in Supabase with these tables:

### 1. **regions** table
Stores regional destinations (e.g., Golden Triangle, Vilamoura, Carveiro, Lagos, Tavira)

**Key columns:**
- `id` - Unique identifier
- `name` - Region name (displayed on cards)
- `slug` - URL slug (e.g., "vilamoura")
- `image_url` - List view/thumbnail image
- `hero_image_url` - Full-width banner image for detail pages
- `short_description` - Brief description on cards
- `description` - Full description for detail pages
- `is_featured` - Shows in "Featured Regions" section (homepage + destinations)
- `is_visible_destinations` - Shows on the destinations page
- `is_active` - General active/inactive flag
- `display_order` - Sort order (1-based numbering)

### 2. **cities** table
Stores individual city/town destinations

**Key columns:** (same structure as regions)
- `id`, `name`, `slug`, `image_url`, `hero_image_url`
- `short_description`, `description`
- `is_featured` - Shows in featured city hubs section
- `is_active` - Active/inactive
- `display_order` - Sort order
- `latitude`, `longitude` - For mapping features

---

## Admin Dashboard Management

### Access the Admin Dashboard
- URL: `https://algarveofficial.com/admin/` (or `/en/admin/`)
- Requires: Admin or Editor role

### Managing Regions

#### Page: `/admin/content/regions` 
**File:** `legacy-pages/admin/cms/AdminCmsRegions.tsx`

**What you can do:**
1. ✅ Create new regions
2. ✅ Edit existing regions:
   - Name, slug, descriptions
   - **Upload or link region images** (thumbnail for cards)
   - **Upload or link hero images** (full-width banners)
   - Toggle "Featured" status
   - Toggle "Visible on Destinations" status
   - Set SEO titles and descriptions
3. ✅ Reorder regions (drag-and-drop)
4. ✅ Delete regions
5. ✅ Activate/deactivate regions

**Image Upload Details:**
- **Region Image (thumbnail):** 800x600px recommended
- **Hero Image (banner):** 1920x600px recommended
- Format: Automatically converted to WebP
- Storage: Uploaded to Supabase Storage (`media/regions/` folder)

#### Page: `/admin/content/destinations`
**File:** `legacy-pages/admin/cms/AdminCmsDestinations.tsx`

**What you can do:**
- Toggle which regions appear on the destinations page (`is_visible_destinations`)
- Reorder regions (drag-and-drop)
- Quick links to edit full region details
- View published destination pages

---

### Managing Cities

#### Page: `/admin/content/cities`
**File:** `legacy-pages/admin/cms/AdminCmsCities.tsx`

**Similar structure to regions:**
1. Create/edit/delete cities
2. Upload thumbnail and hero images
3. Toggle featured/active status
4. Reorder cities (drag-and-drop)
5. Set SEO metadata

---

## How Images Appear on the Frontend

The `DestinationsClient.tsx` component displays images in this hierarchy:

### Featured Regions Section
```tsx
// Lines 277-350: "Featured Regions" - shows regions with is_featured = true
{featuredRegions.map((region) => (
  <Image src={region.hero_image_url || region.image_url} />
))}
```
✅ Uses: `hero_image_url` first, falls back to `image_url`

### Other Regions Section ("Explore More Destinations")
```tsx
// Lines 352-395: "More Destinations" - shows regions with is_featured = false
{otherRegions.map((region) => (
  <div>{region.name}</div>
  <p>{region.short_description}</p>
))}
```
✅ Uses: Text only (no image in this section - just name and description)

### Featured Cities Hub Section
```tsx
// Lines 121-153: Featured city with large banner
<Image src={highlightedCity.hero_image_url || highlightedCity.image_url} />
```

### City Index Grid
```tsx
// Lines 176-204: All cities in grid
{cities.map((city) => (
  <Icon> {/* Building icon, not image */}
  {city.name}
))}
```

### Active City Hubs ("City Showcases")
```tsx
// Lines 207-275: Featured cities with images
{cities.filter((c) => c.is_featured).map((city) => (
  <Image src={city.hero_image_url || city.image_url} />
))}
```

---

## Content Structure

### Destinations Page Sections (in order):

1. **Page Header** - Title and description (static)

2. **Featured City Hub** - Large hero banner
   - Uses first featured city with hero image
   - Configurable via CMS block settings

3. **City Index** - Grid of all cities
   - Shows: Building icons + city names + descriptions
   - All cities from `cities` table where `is_active = true`

4. **Active City Hubs** - Showcase featured cities with images
   - Shows: `is_featured = true` cities with hero images
   - Large cards with gradient overlays

5. **Featured Regions** - Premium regions showcase
   - Shows: `is_featured = true` regions with images
   - Large cards with descriptions and hover effects

6. **Other Regions** - "Explore More Destinations"
   - Shows: `is_featured = false` regions
   - Simple text cards (no images)
   - Filtered by `is_visible_destinations = true`

7. **CTA Section** - "Need help choosing?" call-to-action

---

## API Endpoints

### Taxonomy API
**Endpoint:** `/api/admin/taxonomy/[entity]`

Where `[entity]` can be: `regions`, `cities`, or `categories`

**Methods:**
- `POST` - Create a new item
- `PATCH` - Update an existing item
- `DELETE` - Delete an item
- `PUT` - Reorder items

**Schema validation:** `lib/forms/admin-schemas.ts`

**Implementation:** `lib/admin/taxonomy-client.ts` - helper function `callAdminTaxonomyApi()`

---

## File Structure Reference

```
Backend Management Files:
├── legacy-pages/admin/cms/
│   ├── AdminCmsDestinations.tsx    ← Manage destinations page regions
│   ├── AdminCmsRegions.tsx         ← Edit regions (images, details)
│   └── AdminCmsCities.tsx          ← Edit cities (images, details)
├── app/api/admin/taxonomy/[entity]/route.ts  ← API endpoint
├── lib/admin/
│   ├── taxonomy-contract.ts        ← Entity definitions
│   └── taxonomy-client.ts          ← API helper
└── lib/forms/admin-schemas.ts      ← Validation schemas

Frontend Display Files:
├── app/[locale]/destinations/page.tsx
├── app/[locale]/destinations/[slug]/page.tsx
└── components/destinations/DestinationsClient.tsx
```

---

## Key Configuration Fields

When editing a region or city in the admin:

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Display name | "Vilamoura" |
| `slug` | URL identifier | "vilamoura" |
| `image_url` | Thumbnail image | Supabase URL |
| `hero_image_url` | Full-width banner | Supabase URL |
| `short_description` | Card description | "Luxury beach resort..." |
| `description` | Full description | Longer detailed text |
| `is_featured` | Show on homepage carousel | true/false |
| `is_visible_destinations` | Show on destinations page | true/false |
| `is_active` | Generally visible | true/false |
| `display_order` | Sort priority | 1, 2, 3... |

---

## Common Tasks

### Upload a new region image
1. Go to `/admin/content/regions`
2. Click "Edit Region" on existing region, or "New Region"
3. Click "Upload Image" button
4. Select image file (auto-converts to WebP)
5. Click "Save"

### Reorder regions on destinations page
1. Go to `/admin/content/destinations`
2. Drag regions to new positions
3. Changes save automatically

### Hide a region from destinations page
1. Go to `/admin/content/destinations`
2. Toggle off the switch next to the region
3. Changes save immediately

### Make a region "Featured"
1. Go to `/admin/content/regions`
2. Edit the region
3. Toggle "Featured on Homepage"
4. Save
5. Now appears in homepage carousel AND featured section on destinations

### View a region's published page
1. Go to `/admin/content/regions` or `/admin/content/destinations`
2. Click "View Page" from the dropdown menu
3. Opens in new tab

---

## Image Optimization Notes

- All images are auto-converted to **WebP format** for better compression
- Recommended dimensions:
  - **Thumbnail images:** 800×600px
  - **Hero images:** 1920×600px (or similar widescreen aspect ratio)
- Images are cached at CDN level (31536000 seconds = 1 year)
- Supabase Storage bucket: `media`
- Path structure: `regions/[filename]` or `cities/[filename]`

---

## Related Documentation

- Supabase Types: `integrations/supabase/types.ts`
- Component Props: See `DestinationsClient.tsx` for props interface
- I18n Config: `lib/i18n/config.ts` (for locale-specific routes)

---

Generated: April 2026
Last Updated: Based on current codebase structure
