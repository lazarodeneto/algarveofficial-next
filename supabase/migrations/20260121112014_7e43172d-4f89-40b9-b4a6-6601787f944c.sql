-- Insert new Protection Services category
INSERT INTO public.categories (
  name,
  slug,
  description,
  short_description,
  icon,
  is_active,
  is_featured,
  display_order,
  template_fields
)
VALUES (
  'Protection Services',
  'protection-services',
  'Protection Services features discreet, professional protection solutions for individuals, residences, estates, and high-profile events across the Algarve.',
  'Discreet, professional protection solutions',
  'Shield',
  true,
  false,
  15,
  '[
    {"name": "protection_type", "label": "Protection Type", "type": "select", "required": true, "options": [{"value": "executive", "label": "Executive Protection"}, {"value": "personal", "label": "Personal Protection"}, {"value": "estate", "label": "Estate Protection"}, {"value": "event", "label": "Event Protection"}, {"value": "mixed", "label": "Mixed Services"}]},
    {"name": "service_scope", "label": "Service Scope", "type": "select", "required": true, "options": [{"value": "individual", "label": "Individual"}, {"value": "family", "label": "Family"}, {"value": "property", "label": "Property"}, {"value": "event", "label": "Event"}]},
    {"name": "licensing_certification", "label": "Licensing & Certification", "type": "text", "required": true, "placeholder": "e.g., PSP Licensed, CPP Certified"},
    {"name": "languages_supported", "label": "Languages Supported", "type": "tags", "required": true, "placeholder": "e.g., English, Portuguese, French"},
    {"name": "service_area", "label": "Service Area", "type": "tags", "required": true, "placeholder": "e.g., Golden Triangle, Vilamoura, All Algarve"},
    {"name": "team_experience_years", "label": "Team Experience (Years)", "type": "number", "required": false, "min": 0},
    {"name": "background_profile", "label": "Background Profile", "type": "select", "required": false, "options": [{"value": "law_enforcement", "label": "Law Enforcement"}, {"value": "military", "label": "Military"}, {"value": "private", "label": "Private Sector"}, {"value": "mixed", "label": "Mixed Background"}]},
    {"name": "discreet_uniform", "label": "Discreet Uniform Available", "type": "checkbox", "required": false},
    {"name": "secure_transport_available", "label": "Secure Transportation Available", "type": "checkbox", "required": false},
    {"name": "coordination_with_concierge", "label": "Coordination with Concierge Services", "type": "checkbox", "required": false}
  ]'::jsonb
);
