-- Insert the Premier Events category
INSERT INTO public.categories (
  name,
  slug,
  description,
  short_description,
  icon,
  display_order,
  is_active,
  is_featured,
  template_fields
)
VALUES (
  'Premier Events',
  'premier-events',
  'Premier Events showcases the most distinguished events in the Algarve — selected for their quality, exclusivity, and exceptional experience.',
  'Exclusive, invitation-worthy events',
  'Sparkles',
  13,
  true,
  true,
  '[
    {"name": "event_type", "label": "Event Type", "type": "select", "required": true, "options": [
      {"value": "private", "label": "Private Event"},
      {"value": "invitation_only", "label": "Invitation-Only"},
      {"value": "cultural_art", "label": "Cultural & Art"},
      {"value": "gastronomy_wine", "label": "Gastronomy & Wine"},
      {"value": "real_estate", "label": "Luxury Real Estate Events"},
      {"value": "yachting_maritime", "label": "Yachting & Maritime"},
      {"value": "golf_sports", "label": "Golf & Sports"},
      {"value": "brand_launch", "label": "Brand Launches"},
      {"value": "charity_philanthropy", "label": "Charity & Philanthropy"}
    ]},
    {"name": "event_date", "label": "Event Date", "type": "text", "required": true, "placeholder": "e.g., 15 March 2026"},
    {"name": "event_end_date", "label": "End Date (if multi-day)", "type": "text", "required": false, "placeholder": "e.g., 17 March 2026"},
    {"name": "start_time", "label": "Start Time", "type": "text", "required": false, "placeholder": "e.g., 19:00"},
    {"name": "end_time", "label": "End Time", "type": "text", "required": false, "placeholder": "e.g., 23:00"},
    {"name": "venue_name", "label": "Venue Name", "type": "text", "required": true, "placeholder": "e.g., Conrad Algarve"},
    {"name": "access_type", "label": "Access Type", "type": "select", "required": true, "options": [
      {"value": "public", "label": "Public"},
      {"value": "private", "label": "Private"},
      {"value": "invitation_only", "label": "Invitation-Only"}
    ]},
    {"name": "capacity", "label": "Capacity", "type": "number", "required": false, "min": 1, "placeholder": "Maximum attendees"},
    {"name": "dress_code", "label": "Dress Code", "type": "text", "required": false, "placeholder": "e.g., Black Tie, Smart Casual"},
    {"name": "booking_url", "label": "Booking/RSVP URL", "type": "text", "required": false, "placeholder": "https://..."},
    {"name": "ticket_price_from", "label": "Ticket Price From (€)", "type": "number", "required": false, "min": 0},
    {"name": "ticket_price_to", "label": "Ticket Price To (€)", "type": "number", "required": false, "min": 0},
    {"name": "highlights", "label": "Event Highlights", "type": "tags", "required": false, "placeholder": "e.g., Live Music, Champagne Reception"},
    {"name": "featured_guests", "label": "Featured Guests/Speakers", "type": "tags", "required": false, "placeholder": "e.g., Chef José Avillez"},
    {"name": "organizer_name", "label": "Organizer Name", "type": "text", "required": false},
    {"name": "recurring", "label": "Recurring Event", "type": "checkbox", "required": false},
    {"name": "recurrence_pattern", "label": "Recurrence Pattern", "type": "select", "required": false, "options": [
      {"value": "weekly", "label": "Weekly"},
      {"value": "monthly", "label": "Monthly"},
      {"value": "yearly", "label": "Yearly"}
    ]}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  template_fields = EXCLUDED.template_fields,
  updated_at = now();
