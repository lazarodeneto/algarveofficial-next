// Category Template Registry for AlgarveOfficial CMS
// Maps category slugs to their default details and validation rules

// CategorySlug supports canonical SEO aliases (e.g. things-to-do, places-to-stay, whats-on)
import type { CategorySlug } from '@/types/listing';

export interface CategoryFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'tags' | 'image';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

export interface CategoryTemplate {
  slug: CategorySlug;
  name: string;
  description: string;
  fields: CategoryFieldConfig[];
  defaultDetails: Record<string, unknown>;
}

// ============= CATEGORY TEMPLATES =============

export const premiumAccommodationTemplate: CategoryTemplate = {
  slug: 'premium-accommodation',
  name: 'Places to Stay',
  description: 'Hotels, Resorts, Villas, Penthouses',
  fields: [
    {
      name: 'accommodation_type',
      label: 'Accommodation Type',
      type: 'select',
      required: true,
      options: [
        { value: 'hotel', label: 'Hotel' },
        { value: 'resort', label: 'Resort' },
        { value: 'villa', label: 'Villa' },
        { value: 'penthouse', label: 'Penthouse' },
      ],
    },
    { name: 'number_of_units', label: 'Number of Units/Rooms', type: 'number', required: true, min: 1 },
    {
      name: 'amenities',
      label: 'Amenities',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'pool', label: 'Pool' },
        { value: 'spa', label: 'Spa' },
        { value: 'gym', label: 'Gym' },
        { value: 'beach_access', label: 'Beach Access' },
        { value: 'golf_access', label: 'Golf Access' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'concierge', label: 'Concierge' },
        { value: 'wifi', label: 'WiFi' },
        { value: 'parking', label: 'Parking' },
        { value: 'helipad', label: 'Helipad' },
      ],
    },
    {
      name: 'suitable_for',
      label: 'Suitable For',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'couples', label: 'Couples' },
        { value: 'families', label: 'Families' },
        { value: 'groups', label: 'Groups' },
        { value: 'business', label: 'Business' },
        { value: 'events', label: 'Events' },
      ],
    },
    {
      name: 'star_rating',
      label: 'Star Rating',
      type: 'select',
      required: false,
      options: [
        { value: '3', label: '3 Stars' },
        { value: '4', label: '4 Stars' },
        { value: '5', label: '5 Stars' },
        { value: '5_plus', label: '5+ Stars (Palace)' },
      ],
    },
    { name: 'concierge_available', label: 'Concierge Available', type: 'checkbox', required: false },
    { name: 'private_staff', label: 'Private Staff', type: 'checkbox', required: false },
    { name: 'pet_friendly', label: 'Pet Friendly', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://booking.example.com/...' },
  ],
  defaultDetails: {
    accommodation_type: 'villa',
    number_of_units: 1,
    amenities: [],
    suitable_for: [],
  },
};

export const restaurantsTemplate: CategoryTemplate = {
  slug: 'restaurants',
  name: 'Restaurants',
  description: 'Michelin, Ocean View, Private Dining',
  fields: [
    {
      name: 'dining_type',
      label: 'Dining Type',
      type: 'select',
      required: true,
      options: [
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'private_dining', label: 'Private Dining' },
      ],
    },
    { name: 'cuisine_type', label: 'Cuisine Type', type: 'text', required: true, placeholder: 'e.g., Mediterranean, Portuguese, French' },
    {
      name: 'dining_experience',
      label: 'Dining Experience',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'michelin', label: 'Michelin Star' },
        { value: 'ocean_view', label: 'Ocean View' },
        { value: 'private', label: 'Private Dining' },
        { value: 'rooftop', label: 'Rooftop' },
        { value: 'garden', label: 'Garden Setting' },
      ],
    },
    { name: 'chef_name', label: 'Chef Name', type: 'text', required: false, placeholder: 'Executive Chef name' },
    { name: 'tasting_menu_available', label: 'Tasting Menu Available', type: 'checkbox', required: false },
    { name: 'dress_code', label: 'Dress Code', type: 'text', required: false, placeholder: 'e.g., Smart Casual, Formal' },
    { name: 'reservation_required', label: 'Reservation Required', type: 'checkbox', required: false },
    { name: 'wine_pairing', label: 'Wine Pairing Available', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Reservation/Affiliate URL', type: 'text', required: false, placeholder: 'https://thefork.pt/...' },
  ],
  defaultDetails: {
    dining_type: 'restaurant',
    cuisine_type: '',
    dining_experience: [],
  },
};

export const golfTemplate: CategoryTemplate = {
  slug: 'golf',
  name: 'Golf & Tournaments',
  description: 'Championship, Ocean View, Lessons',
  fields: [
    {
      name: 'golf_type',
      label: 'Golf Type',
      type: 'select',
      required: true,
      options: [
        { value: 'course', label: 'Golf Course' },
        { value: 'academy', label: 'Golf Academy' },
        { value: 'lessons', label: 'Private Lessons' },
      ],
    },
    {
      name: 'holes',
      label: 'Number of Holes',
      type: 'select',
      required: false,
      options: [
        { value: '9', label: '9 Holes' },
        { value: '18', label: '18 Holes' },
        { value: '27', label: '27 Holes' },
        { value: '36', label: '36 Holes' },
      ],
    },
    {
      name: 'course_style',
      label: 'Course Style',
      type: 'select',
      required: false,
      options: [
        { value: 'championship', label: 'Championship' },
        { value: 'links', label: 'Links' },
        { value: 'resort', label: 'Resort' },
      ],
    },
    { name: 'ocean_view', label: 'Ocean View', type: 'checkbox', required: true },
    { name: 'designer', label: 'Course Designer', type: 'text', required: false, placeholder: 'e.g., Sir Henry Cotton' },
    { name: 'handicap_required', label: 'Handicap Required', type: 'checkbox', required: false },
    { name: 'lessons_available', label: 'Lessons Available', type: 'checkbox', required: false },
    { name: 'equipment_rental', label: 'Equipment Rental', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Tee Time Booking URL', type: 'text', required: false, placeholder: 'https://teetime.example.com/...' },
  ],
  defaultDetails: {
    golf_type: 'course',
    ocean_view: false,
  },
};

export const beachClubTemplate: CategoryTemplate = {
  slug: 'beaches-clubs',
  name: 'Beaches & Beach Clubs',
  description: 'VIP, DJ & Sunset, Balinese',
  fields: [
    {
      name: 'place_type',
      label: 'Place Type',
      type: 'select',
      required: true,
      options: [
        { value: 'beach', label: 'Beach' },
        { value: 'beach_club', label: 'Beach Club' },
      ],
    },
    {
      name: 'atmosphere',
      label: 'Atmosphere',
      type: 'select',
      required: true,
      options: [
        { value: 'relaxed', label: 'Relaxed' },
        { value: 'party', label: 'Party' },
        { value: 'family', label: 'Family-Friendly' },
      ],
    },
    { name: 'sunbeds_available', label: 'Sunbeds Available', type: 'checkbox', required: true },
    { name: 'dj_schedule', label: 'DJ Schedule', type: 'text', required: false, placeholder: 'e.g., Weekends from 4pm' },
    { name: 'vip_areas', label: 'VIP Areas', type: 'checkbox', required: false },
    { name: 'balinese_beds', label: 'Balinese Beds', type: 'checkbox', required: false },
    { name: 'sunset_view', label: 'Sunset View', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Reservation/Affiliate URL', type: 'text', required: false, placeholder: 'https://booking.example.com/...' },
  ],
  defaultDetails: {
    place_type: 'beach_club',
    atmosphere: 'relaxed',
    sunbeds_available: true,
  },
};

export const beachesTemplate: CategoryTemplate = {
  slug: 'beaches',
  name: 'Beaches',
  description: 'Cliffs, Family, Hidden',
  fields: [
    {
      name: 'place_type',
      label: 'Beach Type',
      type: 'select',
      required: true,
      options: [
        { value: 'beach', label: 'Beach' },
        { value: 'cove', label: 'Cove' },
        { value: 'cliff_beach', label: 'Cliff Beach' },
      ],
    },
    {
      name: 'atmosphere',
      label: 'Atmosphere',
      type: 'select',
      required: true,
      options: [
        { value: 'relaxed', label: 'Relaxed' },
        { value: 'family', label: 'Family-Friendly' },
        { value: 'secluded', label: 'Secluded' },
      ],
    },
    { name: 'sunbeds_available', label: 'Sunbeds Available', type: 'checkbox', required: false },
    { name: 'lifeguard', label: 'Lifeguard on Duty', type: 'checkbox', required: false },
    { name: 'parking_available', label: 'Parking Available', type: 'checkbox', required: false },
    { name: 'restaurant_nearby', label: 'Restaurant Nearby', type: 'checkbox', required: false },
    { name: 'blue_flag', label: 'Blue Flag Beach', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://booking.example.com/...' },
  ],
  defaultDetails: {
    place_type: 'beach',
    atmosphere: 'relaxed',
  },
};

export const wellnessTemplate: CategoryTemplate = {
  slug: 'wellness-spas',
  name: 'Wellness & Spas',
  description: 'Thalasso, Thermal, In-Villa',
  fields: [
    {
      name: 'wellness_type',
      label: 'Wellness Type',
      type: 'select',
      required: true,
      options: [
        { value: 'spa', label: 'Spa' },
        { value: 'retreat', label: 'Wellness Retreat' },
        { value: 'in_villa', label: 'In-Villa Services' },
      ],
    },
    {
      name: 'treatments_offered',
      label: 'Treatments Offered',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'massage', label: 'Massage' },
        { value: 'facial', label: 'Facial' },
        { value: 'body_treatment', label: 'Body Treatment' },
        { value: 'thalasso', label: 'Thalassotherapy' },
        { value: 'thermal', label: 'Thermal Baths' },
        { value: 'hammam', label: 'Hammam' },
        { value: 'sauna', label: 'Sauna' },
        { value: 'cryotherapy', label: 'Cryotherapy' },
      ],
    },
    { name: 'therapist_certifications', label: 'Therapist Certifications', type: 'tags', required: true, placeholder: 'Add certifications...' },
    { name: 'medical_supervision', label: 'Medical Supervision', type: 'checkbox', required: false },
    { name: 'detox_programs', label: 'Detox Programs', type: 'checkbox', required: false },
    { name: 'yoga_meditation', label: 'Yoga & Meditation', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Treatment Booking URL', type: 'text', required: false, placeholder: 'https://spa-booking.example.com/...' },
  ],
  defaultDetails: {
    wellness_type: 'spa',
    treatments_offered: [],
    therapist_certifications: [],
  },
};

export const privateChefTemplate: CategoryTemplate = {
  slug: 'private-chefs',
  name: 'Restaurants',
  description: 'Menus €300+',
  fields: [
    {
      name: 'cuisine_styles',
      label: 'Cuisine Styles',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'portuguese', label: 'Portuguese' },
        { value: 'mediterranean', label: 'Mediterranean' },
        { value: 'french', label: 'French' },
        { value: 'italian', label: 'Italian' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'fusion', label: 'Fusion' },
        { value: 'vegan', label: 'Vegan/Vegetarian' },
      ],
    },
    {
      name: 'service_types',
      label: 'Service Types',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'in_villa', label: 'In-Villa Dining' },
        { value: 'events', label: 'Private Events' },
        { value: 'weekly', label: 'Weekly Service' },
        { value: 'yacht', label: 'Yacht Catering' },
      ],
    },
    { name: 'minimum_menu_price', label: 'Minimum Menu Price (€)', type: 'number', required: true, min: 300 },
    { name: 'sample_menus', label: 'Sample Menus', type: 'tags', required: false, placeholder: 'Add menu names...' },
    { name: 'dietary_options', label: 'Dietary Options', type: 'tags', required: false, placeholder: 'e.g., Gluten-free, Halal...' },
    { name: 'languages', label: 'Languages Spoken', type: 'tags', required: false },
    { name: 'service_area', label: 'Service Area (Cities)', type: 'tags', required: false },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://booking.example.com/...' },
  ],
  defaultDetails: {
    cuisine_styles: [],
    service_types: [],
    minimum_menu_price: 300,
  },
};

export const vipConciergeTemplate: CategoryTemplate = {
  slug: 'vip-concierge',
  name: 'Algarve Services',
  description: 'Butler, Sommelier, Jet',
  fields: [
    {
      name: 'concierge_services',
      label: 'Services Offered',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'butler', label: 'Butler Service' },
        { value: 'sommelier', label: 'Private Sommelier' },
        { value: 'jet', label: 'Private Jet Booking' },
        { value: 'yacht', label: 'Yacht Charter' },
        { value: 'reservations', label: 'Restaurant Reservations' },
        { value: 'events', label: 'Event Planning' },
        { value: 'shopping', label: 'Personal Shopping' },
        { value: 'real_estate', label: 'Real Estate' },
        { value: 'security', label: 'Security Services' },
      ],
    },
    {
      name: 'availability',
      label: 'Availability',
      type: 'select',
      required: true,
      options: [
        { value: '24_7', label: '24/7' },
        { value: 'on_demand', label: 'On Demand' },
        { value: 'business_hours', label: 'Business Hours' },
      ],
    },
    { name: 'languages', label: 'Languages', type: 'tags', required: false },
    { name: 'response_time', label: 'Response Time', type: 'text', required: false, placeholder: 'e.g., Within 1 hour' },
    { name: 'dedicated_manager', label: 'Dedicated Manager', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://concierge.example.com/...' },
  ],
  defaultDetails: {
    concierge_services: [],
    availability: '24_7',
  },
};

export const premiumExperienceTemplate: CategoryTemplate = {
  slug: 'premium-experiences',
  name: 'Things to Do',
  description: 'Yacht, Helicopter, Bespoke Tours',
  fields: [
    {
      name: 'experience_type',
      label: 'Experience Type',
      type: 'select',
      required: true,
      options: [
        { value: 'yacht', label: 'Yacht Charter' },
        { value: 'helicopter', label: 'Helicopter Tour' },
        { value: 'tour', label: 'Bespoke Tour' },
        { value: 'other', label: 'Other Experience' },
      ],
    },
    { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 4 hours, Full day' },
    {
      name: 'private_or_shared',
      label: 'Private or Shared',
      type: 'select',
      required: true,
      options: [
        { value: 'private', label: 'Private Only' },
        { value: 'shared', label: 'Shared' },
        { value: 'both', label: 'Both Available' },
      ],
    },
    { name: 'capacity', label: 'Maximum Capacity', type: 'number', required: false, min: 1 },
    {
      name: 'customization_level',
      label: 'Customization Level',
      type: 'select',
      required: false,
      options: [
        { value: 'full', label: 'Fully Customizable' },
        { value: 'partial', label: 'Partially Customizable' },
        { value: 'fixed', label: 'Fixed Itinerary' },
      ],
    },
    { name: 'departure_locations', label: 'Departure Locations', type: 'tags', required: false },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://viator.com/...' },
  ],
  defaultDetails: {
    experience_type: 'tour',
    duration: '',
    private_or_shared: 'private',
  },
};

export const familyFunTemplate: CategoryTemplate = {
  slug: 'family-fun',
  name: 'Things to Do',
  description: 'Water Parks, Premium Tickets',
  fields: [
    { name: 'attraction_type', label: 'Attraction Type', type: 'text', required: true, placeholder: 'e.g., Water Park, Theme Park' },
    { name: 'age_range', label: 'Age Range', type: 'text', required: true, placeholder: 'e.g., 4-12 years, All ages' },
    {
      name: 'ticket_type',
      label: 'Ticket Type',
      type: 'select',
      required: true,
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'premium', label: 'Premium' },
        { value: 'vip', label: 'VIP' },
      ],
    },
    { name: 'fast_track', label: 'Fast Track Available', type: 'checkbox', required: false },
    { name: 'group_discounts', label: 'Group Discounts', type: 'checkbox', required: false },
    { name: 'seasonal_availability', label: 'Seasonal Availability', type: 'text', required: false, placeholder: 'e.g., April-October' },
    { name: 'booking_url', label: 'Ticket/Affiliate URL', type: 'text', required: false, placeholder: 'https://tickets.example.com/...' },
  ],
  defaultDetails: {
    attraction_type: '',
    age_range: '',
    ticket_type: 'standard',
  },
};

export const vipTransportationTemplate: CategoryTemplate = {
  slug: 'vip-transportation',
  name: 'Algarve Services',
  description: 'Cars, Yachts, Helicopter',
  fields: [
    {
      name: 'transport_type',
      label: 'Transport Type',
      type: 'select',
      required: true,
      options: [
        { value: 'car', label: 'Premium Car' },
        { value: 'yacht', label: 'Yacht' },
        { value: 'helicopter', label: 'Helicopter' },
        { value: 'jet', label: 'Private Jet' },
      ],
    },
    { name: 'capacity', label: 'Passenger Capacity', type: 'number', required: true, min: 1 },
    { name: 'with_driver_or_pilot', label: 'With Driver/Pilot', type: 'checkbox', required: true },
    { name: 'vehicle_models', label: 'Vehicle Models', type: 'tags', required: false, placeholder: 'e.g., Mercedes S-Class, Rolls Royce' },
    { name: 'onboard_services', label: 'Onboard Services', type: 'tags', required: false, placeholder: 'e.g., WiFi, Champagne' },
    {
      name: 'hourly_or_daily',
      label: 'Rental Type',
      type: 'select',
      required: false,
      options: [
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'both', label: 'Both' },
      ],
    },
    { name: 'booking_url', label: 'Booking/Affiliate URL', type: 'text', required: false, placeholder: 'https://rental.example.com/...' },
  ],
  defaultDetails: {
    transport_type: 'car',
    capacity: 4,
    with_driver_or_pilot: true,
  },
};

export const realEstateTemplate: CategoryTemplate = {
  slug: 'real-estate',
  name: 'Algarve Services',
  description: 'Villas, Golf, Beachfront',
  fields: [
    {
      name: 'property_type',
      label: 'Property Type',
      type: 'select',
      required: true,
      options: [
        { value: 'villa', label: 'Villa' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'penthouse', label: 'Penthouse' },
        { value: 'land', label: 'Land' },
      ],
    },
    {
      name: 'transaction_type',
      label: 'Transaction Type',
      type: 'select',
      required: true,
      options: [
        { value: 'sale', label: 'For Sale' },
        { value: 'rent', label: 'For Rent' },
        { value: 'both', label: 'Sale & Rent' },
      ],
    },
    { name: 'bedrooms', label: 'Bedrooms', type: 'number', required: true, min: 0 },
    { name: 'bathrooms', label: 'Bathrooms', type: 'number', required: true, min: 0 },
    { name: 'property_size_m2', label: 'Property Size (m²)', type: 'number', required: true, min: 1 },
    { name: 'plot_size_m2', label: 'Plot Size (m²)', type: 'number', required: false, min: 0 },
    { name: 'price', label: 'Price (€)', type: 'number', required: false, min: 0 },
    {
      name: 'price_unit',
      label: 'Price Unit',
      type: 'select',
      required: false,
      options: [
        { value: 'total', label: 'Total' },
        { value: 'per_month', label: 'Per Month' },
        { value: 'per_week', label: 'Per Week' },
      ],
    },
    { name: 'sea_view', label: 'Sea View', type: 'checkbox', required: false },
    { name: 'golf_front', label: 'Golf Front', type: 'checkbox', required: false },
    { name: 'gated_community', label: 'Gated Community', type: 'checkbox', required: false },
    { name: 'features', label: 'Features & Amenities', type: 'tags', required: false, placeholder: 'e.g., Infinity Pool, Wine Cellar, Smart Home' },

    // Agent Details
    { name: 'agent_name', label: 'Agent Name', type: 'text', required: false, placeholder: 'e.g., Elena Costa' },
    { name: 'agent_role', label: 'Agent Role', type: 'text', required: false, placeholder: 'e.g., Senior Partner' },
    { name: 'agent_image', label: 'Agent Photo', type: 'image', required: false },
    { name: 'agent_email', label: 'Agent Email', type: 'text', required: false },
    { name: 'agent_phone', label: 'Agent Phone', type: 'text', required: false },

    { name: 'booking_url', label: 'Viewing/Inquiry URL', type: 'text', required: false, placeholder: 'https://realestate.example.com/...' },
    { name: 'virtual_tour_url', label: 'Virtual Tour URL (Video/360)', type: 'text', required: false, placeholder: 'https://youtube.com/... or https://matterport.com/...' },
  ],
  defaultDetails: {
    property_type: 'villa',
    transaction_type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    property_size_m2: 200,
    features: [],
  },
};

// ============= PREMIER EVENTS TEMPLATE =============

export const premierEventsTemplate: CategoryTemplate = {
  slug: 'premier-events',
  name: "What's On",
  description: 'Exclusive, invitation-worthy events',
  fields: [
    {
      name: 'event_type',
      label: 'Event Type',
      type: 'select',
      required: true,
      options: [
        { value: 'private', label: 'Private Event' },
        { value: 'invitation_only', label: 'Invitation-Only' },
        { value: 'cultural_art', label: 'Cultural & Art' },
        { value: 'gastronomy_wine', label: 'Gastronomy & Wine' },
        { value: 'real_estate', label: 'Premium Real Estate Events' },
        { value: 'yachting_maritime', label: 'Yachting & Maritime' },
        { value: 'golf_sports', label: 'Golf & Sports' },
        { value: 'brand_launch', label: 'Brand Launches' },
        { value: 'charity_philanthropy', label: 'Charity & Philanthropy' },
      ],
    },
    { name: 'event_date', label: 'Event Date', type: 'text', required: true, placeholder: 'e.g., 15 March 2026' },
    { name: 'event_end_date', label: 'End Date (if multi-day)', type: 'text', required: false, placeholder: 'e.g., 17 March 2026' },
    { name: 'start_time', label: 'Start Time', type: 'text', required: false, placeholder: 'e.g., 19:00' },
    { name: 'end_time', label: 'End Time', type: 'text', required: false, placeholder: 'e.g., 23:00' },
    { name: 'venue_name', label: 'Venue Name', type: 'text', required: true, placeholder: 'e.g., Conrad Algarve' },
    {
      name: 'access_type',
      label: 'Access Type',
      type: 'select',
      required: true,
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
        { value: 'invitation_only', label: 'Invitation-Only' },
      ],
    },
    { name: 'capacity', label: 'Capacity', type: 'number', required: false, min: 1 },
    { name: 'dress_code', label: 'Dress Code', type: 'text', required: false, placeholder: 'e.g., Black Tie, Smart Casual' },
    { name: 'booking_url', label: 'Booking/RSVP URL', type: 'text', required: false, placeholder: 'https://...' },
    { name: 'ticket_price_from', label: 'Ticket Price From (€)', type: 'number', required: false, min: 0 },
    { name: 'ticket_price_to', label: 'Ticket Price To (€)', type: 'number', required: false, min: 0 },
    { name: 'highlights', label: 'Event Highlights', type: 'tags', required: false, placeholder: 'e.g., Live Music, Champagne Reception' },
    { name: 'featured_guests', label: 'Featured Guests/Speakers', type: 'tags', required: false, placeholder: 'e.g., Chef José Avillez' },
    { name: 'organizer_name', label: 'Organizer Name', type: 'text', required: false },
    { name: 'recurring', label: 'Recurring Event', type: 'checkbox', required: false },
    {
      name: 'recurrence_pattern',
      label: 'Recurrence Pattern',
      type: 'select',
      required: false,
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ],
    },
  ],
  defaultDetails: {
    event_type: 'cultural_art',
    access_type: 'public',
    venue_name: '',
    event_date: '',
  },
};

// ============= ARCHITECTURE & DECORATION =============

export const architectureDecorationTemplate: CategoryTemplate = {
  slug: 'architecture-decoration',
  name: 'Algarve Services',
  description: 'Distinguished architects, interior designers, and decoration studios shaping exceptional living spaces across the Algarve.',
  fields: [
    {
      name: 'service_focus',
      label: 'Service Focus',
      type: 'select',
      required: true,
      options: [
        { value: 'Architecture Studios', label: 'Architecture Studios' },
        { value: 'Interior Design', label: 'Interior Design' },
        { value: 'Decoration & Styling', label: 'Decoration & Styling' },
        { value: 'Landscape Architecture', label: 'Landscape Architecture' },
        { value: 'Lighting Design', label: 'Lighting Design' },
        { value: 'Bespoke Furniture', label: 'Bespoke Furniture' },
        { value: 'Mixed Services', label: 'Mixed Services' },
      ],
    },
    {
      name: 'project_types',
      label: 'Project Types',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'Residential Villas', label: 'Residential Villas' },
        { value: 'Premium Apartments', label: 'Premium Apartments' },
        { value: 'Hospitality', label: 'Hospitality' },
        { value: 'Commercial', label: 'Commercial' },
        { value: 'Boutique Hotels', label: 'Boutique Hotels' },
        { value: 'Private Estates', label: 'Private Estates' },
        { value: 'Renovation Projects', label: 'Renovation Projects' },
      ],
    },
    {
      name: 'design_style',
      label: 'Design Style',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'Modern', label: 'Modern' },
        { value: 'Contemporary', label: 'Contemporary' },
        { value: 'Mediterranean', label: 'Mediterranean' },
        { value: 'Minimalist', label: 'Minimalist' },
        { value: 'Classic', label: 'Classic' },
        { value: 'Bespoke', label: 'Bespoke' },
        { value: 'Sustainable', label: 'Sustainable' },
        { value: 'Coastal', label: 'Coastal' },
        { value: 'Rustic Premium', label: 'Rustic Premium' },
      ],
    },
    {
      name: 'service_scope',
      label: 'Service Scope',
      type: 'select',
      required: true,
      options: [
        { value: 'Concept & Design Only', label: 'Concept & Design Only' },
        { value: 'Full Project Management', label: 'Full Project Management' },
        { value: 'Turnkey Solutions', label: 'Turnkey Solutions' },
        { value: 'Consultation Services', label: 'Consultation Services' },
      ],
    },
    { name: 'years_experience', label: 'Years of Experience', type: 'number', required: false, min: 0 },
    { name: 'awards_recognition', label: 'Awards & Recognition', type: 'textarea', required: false, placeholder: 'List notable awards, publications, or recognitions' },
    { name: 'portfolio_highlights', label: 'Portfolio Highlights', type: 'textarea', required: false, placeholder: 'Describe notable projects or achievements' },
    { name: 'sustainability_focus', label: 'Sustainability Focus', type: 'checkbox', required: false },
    {
      name: 'languages',
      label: 'Languages Spoken',
      type: 'multiselect',
      required: false,
      options: [
        { value: 'Portuguese', label: 'Portuguese' },
        { value: 'English', label: 'English' },
        { value: 'French', label: 'French' },
        { value: 'German', label: 'German' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'Italian', label: 'Italian' },
        { value: 'Dutch', label: 'Dutch' },
        { value: 'Russian', label: 'Russian' },
      ],
    },
    {
      name: 'service_area',
      label: 'Service Area',
      type: 'multiselect',
      required: false,
      options: [
        { value: 'Golden Triangle', label: 'Golden Triangle' },
        { value: 'Vilamoura', label: 'Vilamoura' },
        { value: 'Lagos', label: 'Lagos' },
        { value: 'Tavira', label: 'Tavira' },
        { value: 'Carvoeiro', label: 'Carvoeiro' },
        { value: 'Portimão', label: 'Portimão' },
        { value: 'Sagres', label: 'Sagres' },
        { value: 'All Algarve', label: 'All Algarve' },
        { value: 'International', label: 'International' },
      ],
    },
    { name: 'certifications', label: 'Professional Certifications', type: 'text', required: false },
    {
      name: 'team_size',
      label: 'Team Size',
      type: 'select',
      required: false,
      options: [
        { value: 'Solo Practice', label: 'Solo Practice' },
        { value: 'Small Studio (2-5)', label: 'Small Studio (2-5)' },
        { value: 'Medium Studio (6-15)', label: 'Medium Studio (6-15)' },
        { value: 'Large Firm (15+)', label: 'Large Firm (15+)' },
      ],
    },
    { name: 'consultation_available', label: 'Free Consultation Available', type: 'checkbox', required: false },
    { name: 'virtual_services', label: 'Virtual/Remote Services', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Consultation Booking URL', type: 'text', required: false, placeholder: 'https://calendly.com/...' },
  ],
  defaultDetails: {
    service_focus: 'Interior Design',
    project_types: [],
    design_style: [],
    service_scope: 'Full Project Management',
  },
};

// ============= SHOPPING & BOUTIQUES TEMPLATE =============

export const shoppingBoutiquesTemplate: CategoryTemplate = {
  slug: 'shopping-boutiques',
  name: 'Shopping & Boutiques',
  description: 'Premium boutiques, designer stores, and exclusive shopping experiences.',
  fields: [
    {
      name: 'shop_type',
      label: 'Shop Type',
      type: 'select',
      required: true,
      options: [
        { value: 'boutique', label: 'Boutique' },
        { value: 'concept_store', label: 'Concept Store' },
        { value: 'jewelry', label: 'Jewelry & Watches' },
        { value: 'fashion', label: 'Fashion & Accessories' },
        { value: 'art_gallery', label: 'Art Gallery' },
        { value: 'home_decor', label: 'Home Décor' },
        { value: 'gourmet', label: 'Gourmet & Delicatessen' },
      ],
    },
    {
      name: 'product_categories',
      label: 'Product Categories',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'fashion', label: 'Fashion' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'watches', label: 'Watches' },
        { value: 'art', label: 'Art' },
        { value: 'home', label: 'Home & Living' },
        { value: 'beauty', label: 'Beauty & Wellness' },
        { value: 'gourmet', label: 'Gourmet Products' },
        { value: 'wine', label: 'Wine & Spirits' },
      ],
    },
    { name: 'brands_carried', label: 'Featured Brands', type: 'tags', required: false, placeholder: 'e.g., Gucci, Hermès, Local Artisans' },
    { name: 'personal_shopping', label: 'Personal Shopping Service', type: 'checkbox', required: false },
    { name: 'appointment_only', label: 'By Appointment Only', type: 'checkbox', required: false },
    { name: 'tax_free', label: 'Tax-Free Shopping', type: 'checkbox', required: false },
    { name: 'online_shop', label: 'Online Shop Available', type: 'checkbox', required: false },
    { name: 'languages', label: 'Languages Spoken', type: 'tags', required: false, placeholder: 'e.g., English, Portuguese, French' },
    { name: 'exclusive_collections', label: 'Exclusive Collections', type: 'checkbox', required: false },
    { name: 'gift_wrapping', label: 'Gift Wrapping Service', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Personal Shopping/Appointment URL', type: 'text', required: false, placeholder: 'https://booking.example.com/...' },
  ],
  defaultDetails: {
    shop_type: 'boutique',
    product_categories: [],
    brands_carried: [],
    languages: [],
  },
};

// ============= EVENTS TEMPLATE =============

export const eventsTemplate: CategoryTemplate = {
  slug: 'events',
  name: 'Events',
  description: 'Local events, festivals, and cultural happenings across the Algarve.',
  fields: [
    {
      name: 'event_category',
      label: 'Event Category',
      type: 'select',
      required: true,
      options: [
        { value: 'festival', label: 'Festival' },
        { value: 'concert', label: 'Concert & Music' },
        { value: 'cultural', label: 'Cultural & Art' },
        { value: 'sports', label: 'Sports & Fitness' },
        { value: 'food_wine', label: 'Food & Wine' },
        { value: 'market', label: 'Market & Fair' },
        { value: 'family', label: 'Family & Kids' },
        { value: 'nightlife', label: 'Nightlife & Party' },
        { value: 'wellness', label: 'Wellness & Retreat' },
        { value: 'business', label: 'Business & Networking' },
      ],
    },
    {
      name: 'frequency',
      label: 'Event Frequency',
      type: 'select',
      required: true,
      options: [
        { value: 'one_time', label: 'One-Time Event' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'seasonal', label: 'Seasonal' },
        { value: 'annual', label: 'Annual' },
      ],
    },
    {
      name: 'venue_type',
      label: 'Venue Type',
      type: 'select',
      required: true,
      options: [
        { value: 'indoor', label: 'Indoor' },
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'beach', label: 'Beach' },
        { value: 'mixed', label: 'Mixed' },
      ],
    },
    { name: 'capacity', label: 'Capacity', type: 'number', required: false, min: 1 },
    { name: 'ticket_required', label: 'Ticket Required', type: 'checkbox', required: false },
    { name: 'free_entry', label: 'Free Entry', type: 'checkbox', required: false },
    {
      name: 'age_restriction',
      label: 'Age Restriction',
      type: 'select',
      required: false,
      options: [
        { value: 'all_ages', label: 'All Ages' },
        { value: '16_plus', label: '16+' },
        { value: '18_plus', label: '18+' },
        { value: '21_plus', label: '21+' },
      ],
    },
    {
      name: 'accessibility',
      label: 'Accessibility Features',
      type: 'multiselect',
      required: false,
      options: [
        { value: 'wheelchair', label: 'Wheelchair Accessible' },
        { value: 'parking', label: 'Accessible Parking' },
        { value: 'audio', label: 'Audio Assistance' },
        { value: 'visual', label: 'Visual Assistance' },
        { value: 'restrooms', label: 'Accessible Restrooms' },
      ],
    },
    { name: 'pet_friendly', label: 'Pet Friendly', type: 'checkbox', required: false },
    { name: 'parking_available', label: 'Parking Available', type: 'checkbox', required: false },
  ],
  defaultDetails: {
    event_category: 'cultural',
    frequency: 'one_time',
    venue_type: 'outdoor',
    accessibility: [],
  },
};

// ============= PROTECTION SERVICES TEMPLATE =============

export const protectionServicesTemplate: CategoryTemplate = {
  slug: 'protection-services',
  name: 'Algarve Services',
  description: 'Discreet, professional protection solutions for individuals, residences, estates, and high-profile events.',
  fields: [
    {
      name: 'protection_type',
      label: 'Protection Type',
      type: 'select',
      required: true,
      options: [
        { value: 'executive', label: 'Executive Protection' },
        { value: 'personal', label: 'Personal Protection' },
        { value: 'estate', label: 'Estate Protection' },
        { value: 'event', label: 'Event Protection' },
        { value: 'mixed', label: 'Mixed Services' },
      ],
    },
    {
      name: 'service_scope',
      label: 'Service Scope',
      type: 'select',
      required: true,
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'family', label: 'Family' },
        { value: 'property', label: 'Property' },
        { value: 'event', label: 'Event' },
      ],
    },
    { name: 'licensing_certification', label: 'Licensing & Certification', type: 'text', required: true, placeholder: 'e.g., PSP Licensed, CPP Certified' },
    { name: 'languages_supported', label: 'Languages Supported', type: 'tags', required: true, placeholder: 'e.g., English, Portuguese, French' },
    { name: 'service_area', label: 'Service Area', type: 'tags', required: true, placeholder: 'e.g., Golden Triangle, Vilamoura, All Algarve' },
    { name: 'team_experience_years', label: 'Team Experience (Years)', type: 'number', required: false, min: 0 },
    {
      name: 'background_profile',
      label: 'Background Profile',
      type: 'select',
      required: false,
      options: [
        { value: 'law_enforcement', label: 'Law Enforcement' },
        { value: 'military', label: 'Military' },
        { value: 'private', label: 'Private Sector' },
        { value: 'mixed', label: 'Mixed Background' },
      ],
    },
    { name: 'discreet_uniform', label: 'Discreet Uniform Available', type: 'checkbox', required: false },
    { name: 'secure_transport_available', label: 'Secure Transportation Available', type: 'checkbox', required: false },
    { name: 'coordination_with_concierge', label: 'Coordination with Concierge Services', type: 'checkbox', required: false },
    { name: 'booking_url', label: 'Assessment/Consultation URL', type: 'text', required: false, placeholder: 'https://protection.example.com/...' },
  ],
  defaultDetails: {
    protection_type: 'executive',
    service_scope: 'individual',
    licensing_certification: '',
    languages_supported: [],
    service_area: [],
  },
};

// ============= TEMPLATE REGISTRY =============

export const categoryTemplates: Record<string, CategoryTemplate> = {
  'places-to-stay': premiumAccommodationTemplate,
  'premium-accommodation': premiumAccommodationTemplate,
  '1': premiumAccommodationTemplate, // Also map by ID for convenience
  'fine-dining': restaurantsTemplate, // Legacy alias
  'restaurants': restaurantsTemplate,
  '2': restaurantsTemplate,
  'golf': golfTemplate,
  '3': golfTemplate,
  'beaches-clubs': beachClubTemplate,
  '4': beachClubTemplate,
  'beaches': beachesTemplate,
  '5': beachesTemplate,
  'wellness-spas': wellnessTemplate,
  '6': wellnessTemplate,
  'private-chefs': privateChefTemplate,
  '7': privateChefTemplate,
  'vip-concierge': vipConciergeTemplate,
  '8': vipConciergeTemplate,
  'things-to-do': premiumExperienceTemplate,
  'premium-experiences': premiumExperienceTemplate,
  '9': premiumExperienceTemplate,
  'family-fun': familyFunTemplate,
  '10': familyFunTemplate,
  'vip-transportation': vipTransportationTemplate,
  '11': vipTransportationTemplate,
  'real-estate': realEstateTemplate,
  '12': realEstateTemplate,
  'algarve-services': vipConciergeTemplate,
  'whats-on': premierEventsTemplate,
  'premier-events': premierEventsTemplate,
  '13': premierEventsTemplate,
  'architecture-decoration': architectureDecorationTemplate,
  '14': architectureDecorationTemplate,
  'protection-services': protectionServicesTemplate,
  '15': protectionServicesTemplate,
  'shopping-boutiques': shoppingBoutiquesTemplate,
  '16': shoppingBoutiquesTemplate,
};

export function getCategoryTemplate(categoryIdOrSlug: string): CategoryTemplate | undefined {
  return categoryTemplates[categoryIdOrSlug];
}

export function getDefaultDetails(categoryIdOrSlug: string): Record<string, unknown> {
  const template = getCategoryTemplate(categoryIdOrSlug);
  return template?.defaultDetails ?? {};
}
