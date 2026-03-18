/**
 * Event Category Templates - defines category-specific fields for each event type
 * Similar to listing category templates but tailored for events
 */

export interface EventCategoryField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'tags' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
}

export interface EventCategoryTemplate {
  category: string;
  label: string;
  icon: string;
  fields: EventCategoryField[];
}

export const eventCategoryTemplates: Record<string, EventCategoryTemplate> = {
  festival: {
    category: 'festival',
    label: 'Festival',
    icon: 'PartyPopper',
    fields: [
      {
        name: 'festival_type',
        label: 'Festival Type',
        type: 'select',
        options: [
          { value: 'music', label: 'Music Festival' },
          { value: 'food_wine', label: 'Food & Wine Festival' },
          { value: 'cultural', label: 'Cultural Festival' },
          { value: 'art', label: 'Art Festival' },
          { value: 'religious', label: 'Religious Festival' },
          { value: 'film', label: 'Film Festival' },
        ],
      },
      {
        name: 'expected_attendance',
        label: 'Expected Attendance',
        type: 'number',
        placeholder: 'Estimated visitor count',
      },
      {
        name: 'headline_performers',
        label: 'Headline Performers / Acts',
        type: 'tags',
        placeholder: 'Add main artists or acts...',
      },
      {
        name: 'stages_count',
        label: 'Number of Stages / Areas',
        type: 'number',
        placeholder: 'e.g., 3',
      },
      {
        name: 'camping_available',
        label: 'Camping Available',
        type: 'checkbox',
        description: 'Camping facilities are available on-site',
      },
      {
        name: 'family_friendly',
        label: 'Family Friendly',
        type: 'checkbox',
        description: 'Suitable for families with children',
      },
      {
        name: 'age_restriction',
        label: 'Age Restriction',
        type: 'text',
        placeholder: 'e.g., 18+ after 10pm',
      },
    ],
  },

  market: {
    category: 'market',
    label: 'Market',
    icon: 'Store',
    fields: [
      {
        name: 'market_type',
        label: 'Market Type',
        type: 'select',
        options: [
          { value: 'farmers', label: 'Farmers Market' },
          { value: 'artisan', label: 'Artisan Market' },
          { value: 'flea', label: 'Flea Market' },
          { value: 'christmas', label: 'Christmas Market' },
          { value: 'night', label: 'Night Market' },
          { value: 'antique', label: 'Antique Market' },
        ],
      },
      {
        name: 'vendor_count',
        label: 'Number of Vendors',
        type: 'number',
        placeholder: 'Approximate vendor count',
      },
      {
        name: 'product_categories',
        label: 'Product Categories',
        type: 'multiselect',
        options: [
          { value: 'food', label: 'Fresh Food' },
          { value: 'crafts', label: 'Handmade Crafts' },
          { value: 'antiques', label: 'Antiques' },
          { value: 'clothing', label: 'Clothing & Textiles' },
          { value: 'jewelry', label: 'Jewelry' },
          { value: 'art', label: 'Art & Paintings' },
          { value: 'plants', label: 'Plants & Flowers' },
          { value: 'home', label: 'Home Decor' },
        ],
      },
      {
        name: 'frequency',
        label: 'Frequency',
        type: 'select',
        options: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'biweekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: 'Annual' },
          { value: 'one_time', label: 'One-time' },
        ],
      },
      {
        name: 'outdoor_indoor',
        label: 'Location Type',
        type: 'select',
        options: [
          { value: 'outdoor', label: 'Outdoor' },
          { value: 'indoor', label: 'Indoor' },
          { value: 'mixed', label: 'Mixed' },
        ],
      },
      {
        name: 'payment_methods',
        label: 'Payment Methods Accepted',
        type: 'multiselect',
        options: [
          { value: 'cash', label: 'Cash' },
          { value: 'card', label: 'Credit/Debit Card' },
          { value: 'mobile', label: 'Mobile Payment' },
          { value: 'mbway', label: 'MB Way' },
        ],
      },
    ],
  },

  'golf-tournament': {
    category: 'golf-tournament',
    label: 'Golf Tournament',
    icon: 'Flag',
    fields: [
      {
        name: 'tournament_level',
        label: 'Tournament Level',
        type: 'select',
        options: [
          { value: 'professional', label: 'Professional' },
          { value: 'amateur', label: 'Amateur' },
          { value: 'charity', label: 'Charity' },
          { value: 'corporate', label: 'Corporate' },
          { value: 'club', label: 'Club Championship' },
        ],
      },
      {
        name: 'course_name',
        label: 'Golf Course',
        type: 'text',
        placeholder: 'Name of the host course',
      },
      {
        name: 'format',
        label: 'Tournament Format',
        type: 'select',
        options: [
          { value: 'stroke', label: 'Stroke Play' },
          { value: 'match', label: 'Match Play' },
          { value: 'scramble', label: 'Scramble' },
          { value: 'stableford', label: 'Stableford' },
          { value: 'foursome', label: 'Foursome' },
          { value: 'fourball', label: 'Fourball' },
        ],
      },
      {
        name: 'handicap_limit',
        label: 'Maximum Handicap',
        type: 'number',
        placeholder: 'e.g., 24',
      },
      {
        name: 'entry_fee',
        label: 'Entry Fee (€)',
        type: 'number',
        placeholder: 'Registration cost',
      },
      {
        name: 'prize_pool',
        label: 'Prize Pool / Awards',
        type: 'text',
        placeholder: 'e.g., €10,000 prize pool',
      },
      {
        name: 'spectator_tickets',
        label: 'Spectators Allowed',
        type: 'checkbox',
        description: 'Public spectating is available',
      },
      {
        name: 'caddie_required',
        label: 'Caddie Required',
        type: 'checkbox',
        description: 'Players must use caddies',
      },
    ],
  },

  gastronomy: {
    category: 'gastronomy',
    label: 'Gastronomy',
    icon: 'ChefHat',
    fields: [
      {
        name: 'gastro_type',
        label: 'Event Type',
        type: 'select',
        options: [
          { value: 'food_festival', label: 'Food Festival' },
          { value: 'wine_tasting', label: 'Wine Tasting' },
          { value: 'cooking_class', label: 'Cooking Class' },
          { value: 'gourmet_dinner', label: 'Gourmet Dinner' },
          { value: 'chef_table', label: "Chef's Table Experience" },
          { value: 'food_tour', label: 'Food Tour' },
        ],
      },
      {
        name: 'cuisine_focus',
        label: 'Cuisine Focus',
        type: 'multiselect',
        options: [
          { value: 'portuguese', label: 'Portuguese' },
          { value: 'seafood', label: 'Seafood' },
          { value: 'wine', label: 'Wine' },
          { value: 'olive_oil', label: 'Olive Oil' },
          { value: 'mediterranean', label: 'Mediterranean' },
          { value: 'international', label: 'International' },
          { value: 'fusion', label: 'Fusion' },
        ],
      },
      {
        name: 'participating_chefs',
        label: 'Participating Chefs',
        type: 'tags',
        placeholder: 'Add chef names...',
      },
      {
        name: 'michelin_presence',
        label: 'Michelin Star Chefs',
        type: 'checkbox',
        description: 'Features Michelin-starred chefs',
      },
      {
        name: 'tasting_included',
        label: 'Tastings Included',
        type: 'checkbox',
        description: 'Food/wine tastings are included in admission',
      },
      {
        name: 'pairing_menu',
        label: 'Pairing Menu Available',
        type: 'checkbox',
        description: 'Wine or food pairing menu offered',
      },
      {
        name: 'dietary_options',
        label: 'Dietary Options',
        type: 'multiselect',
        options: [
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'gluten_free', label: 'Gluten-Free' },
          { value: 'halal', label: 'Halal' },
          { value: 'kosher', label: 'Kosher' },
        ],
      },
    ],
  },

  music: {
    category: 'music',
    label: 'Music & Concerts',
    icon: 'Music',
    fields: [
      {
        name: 'music_genre',
        label: 'Music Genre',
        type: 'multiselect',
        options: [
          { value: 'classical', label: 'Classical' },
          { value: 'jazz', label: 'Jazz' },
          { value: 'rock', label: 'Rock' },
          { value: 'pop', label: 'Pop' },
          { value: 'electronic', label: 'Electronic' },
          { value: 'fado', label: 'Fado' },
          { value: 'world', label: 'World Music' },
          { value: 'folk', label: 'Folk' },
        ],
      },
      {
        name: 'performance_type',
        label: 'Performance Type',
        type: 'select',
        options: [
          { value: 'concert', label: 'Concert' },
          { value: 'festival', label: 'Festival' },
          { value: 'orchestra', label: 'Orchestra' },
          { value: 'dj_set', label: 'DJ Set' },
          { value: 'intimate', label: 'Intimate Performance' },
          { value: 'open_air', label: 'Open Air' },
        ],
      },
      {
        name: 'artists',
        label: 'Performing Artists',
        type: 'tags',
        placeholder: 'Add artist names...',
      },
      {
        name: 'venue_type',
        label: 'Venue Type',
        type: 'select',
        options: [
          { value: 'amphitheater', label: 'Amphitheater' },
          { value: 'arena', label: 'Arena' },
          { value: 'beach', label: 'Beach' },
          { value: 'club', label: 'Club' },
          { value: 'winery', label: 'Winery' },
          { value: 'theater', label: 'Theater' },
          { value: 'church', label: 'Church' },
        ],
      },
      {
        name: 'seating_type',
        label: 'Seating Type',
        type: 'select',
        options: [
          { value: 'seated', label: 'Seated' },
          { value: 'standing', label: 'Standing' },
          { value: 'mixed', label: 'Mixed' },
        ],
      },
      {
        name: 'vip_packages',
        label: 'VIP Packages Available',
        type: 'checkbox',
        description: 'VIP tickets or experiences are available',
      },
      {
        name: 'sound_check_access',
        label: 'Sound Check Experience',
        type: 'checkbox',
        description: 'Sound check viewing available',
      },
    ],
  },

  cultural: {
    category: 'cultural',
    label: 'Cultural Events',
    icon: 'Landmark',
    fields: [
      {
        name: 'cultural_type',
        label: 'Event Type',
        type: 'select',
        options: [
          { value: 'exhibition', label: 'Exhibition' },
          { value: 'museum', label: 'Museum Event' },
          { value: 'historical', label: 'Historical Reenactment' },
          { value: 'theater', label: 'Theater' },
          { value: 'dance', label: 'Dance Performance' },
          { value: 'literary', label: 'Literary Event' },
        ],
      },
      {
        name: 'exhibition_theme',
        label: 'Theme / Subject',
        type: 'text',
        placeholder: 'Main theme or subject matter',
      },
      {
        name: 'guided_tours',
        label: 'Guided Tours',
        type: 'checkbox',
        description: 'Guided tours are available',
      },
      {
        name: 'languages_offered',
        label: 'Languages Available',
        type: 'multiselect',
        options: [
          { value: 'portuguese', label: 'Portuguese' },
          { value: 'english', label: 'English' },
          { value: 'spanish', label: 'Spanish' },
          { value: 'french', label: 'French' },
          { value: 'german', label: 'German' },
        ],
      },
      {
        name: 'interactive_elements',
        label: 'Interactive Elements',
        type: 'checkbox',
        description: 'Includes hands-on or interactive activities',
      },
      {
        name: 'accessibility_features',
        label: 'Accessibility Features',
        type: 'multiselect',
        options: [
          { value: 'wheelchair', label: 'Wheelchair Accessible' },
          { value: 'audio_guide', label: 'Audio Guide' },
          { value: 'sign_language', label: 'Sign Language' },
          { value: 'braille', label: 'Braille Materials' },
        ],
      },
    ],
  },

  sporting: {
    category: 'sporting',
    label: 'Sporting Events',
    icon: 'Trophy',
    fields: [
      {
        name: 'sport_type',
        label: 'Sport Type',
        type: 'select',
        options: [
          { value: 'running', label: 'Running' },
          { value: 'cycling', label: 'Cycling' },
          { value: 'triathlon', label: 'Triathlon' },
          { value: 'sailing', label: 'Sailing' },
          { value: 'tennis', label: 'Tennis' },
          { value: 'swimming', label: 'Swimming' },
          { value: 'football', label: 'Football' },
          { value: 'surfing', label: 'Surfing' },
        ],
      },
      {
        name: 'competition_level',
        label: 'Competition Level',
        type: 'select',
        options: [
          { value: 'international', label: 'International' },
          { value: 'national', label: 'National' },
          { value: 'regional', label: 'Regional' },
          { value: 'amateur', label: 'Amateur' },
          { value: 'fun_run', label: 'Fun/Charity' },
        ],
      },
      {
        name: 'participant_limit',
        label: 'Participant Limit',
        type: 'number',
        placeholder: 'Maximum participants',
      },
      {
        name: 'distance_category',
        label: 'Distance / Category',
        type: 'text',
        placeholder: 'e.g., 5K, 10K, Half Marathon',
      },
      {
        name: 'age_groups',
        label: 'Age Groups',
        type: 'multiselect',
        options: [
          { value: 'under_18', label: 'Under 18' },
          { value: '18_29', label: '18-29' },
          { value: '30_39', label: '30-39' },
          { value: '40_49', label: '40-49' },
          { value: '50_plus', label: '50+' },
          { value: 'open', label: 'Open Category' },
        ],
      },
      {
        name: 'timing_chip',
        label: 'Electronic Timing',
        type: 'checkbox',
        description: 'Chip timing for accurate results',
      },
      {
        name: 'medal_finishers',
        label: 'Finisher Medals',
        type: 'checkbox',
        description: 'All finishers receive medals',
      },
    ],
  },

  seasonal: {
    category: 'seasonal',
    label: 'Seasonal Highlights',
    icon: 'Sun',
    fields: [
      {
        name: 'season',
        label: 'Season',
        type: 'select',
        options: [
          { value: 'spring', label: 'Spring' },
          { value: 'summer', label: 'Summer' },
          { value: 'autumn', label: 'Autumn' },
          { value: 'winter', label: 'Winter' },
        ],
      },
      {
        name: 'seasonal_theme',
        label: 'Theme',
        type: 'text',
        placeholder: 'Event theme or focus',
      },
      {
        name: 'activities_included',
        label: 'Activities Included',
        type: 'multiselect',
        options: [
          { value: 'beach', label: 'Beach Activities' },
          { value: 'hiking', label: 'Hiking' },
          { value: 'wine_harvest', label: 'Wine Harvest' },
          { value: 'birdwatching', label: 'Birdwatching' },
          { value: 'whale_watching', label: 'Whale Watching' },
          { value: 'flower_viewing', label: 'Flower Viewing' },
          { value: 'sunset_experience', label: 'Sunset Experience' },
        ],
      },
      {
        name: 'weather_dependent',
        label: 'Weather Dependent',
        type: 'checkbox',
        description: 'Event may be affected by weather',
      },
      {
        name: 'sunset_viewing',
        label: 'Sunset Experience',
        type: 'checkbox',
        description: 'Includes sunset viewing',
      },
      {
        name: 'seasonal_products',
        label: 'Featured Seasonal Products',
        type: 'tags',
        placeholder: 'Add seasonal items...',
      },
    ],
  },
};

// Get template for a category
export function getEventCategoryTemplate(category: string): EventCategoryTemplate | null {
  return eventCategoryTemplates[category] || null;
}

// Get all category template keys
export function getEventCategoryKeys(): string[] {
  return Object.keys(eventCategoryTemplates);
}
