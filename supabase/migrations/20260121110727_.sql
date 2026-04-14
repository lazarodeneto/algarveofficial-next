-- Insert new Architecture & Decoration category
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
) VALUES (
  'Architecture & Decoration',
  'architecture-decoration',
  'Architecture & Decoration highlights distinguished architects, interior designers, and decoration studios shaping exceptional living spaces across the Algarve.',
  'Distinguished architects, interior designers, and decoration studios',
  'Ruler',
  14,
  true,
  true,
  '[
    {"name": "service_focus", "label": "Service Focus", "type": "select", "required": true, "options": ["Architecture Studios", "Interior Design", "Decoration & Styling", "Landscape Architecture", "Lighting Design", "Bespoke Furniture", "Mixed Services"]},
    {"name": "project_types", "label": "Project Types", "type": "multiselect", "required": true, "options": ["Residential Villas", "Luxury Apartments", "Hospitality", "Commercial", "Boutique Hotels", "Private Estates", "Renovation Projects"]},
    {"name": "design_style", "label": "Design Style", "type": "multiselect", "required": true, "options": ["Modern", "Contemporary", "Mediterranean", "Minimalist", "Classic", "Bespoke", "Sustainable", "Coastal", "Rustic Luxury"]},
    {"name": "service_scope", "label": "Service Scope", "type": "select", "required": true, "options": ["Concept & Design Only", "Full Project Management", "Turnkey Solutions", "Consultation Services"]},
    {"name": "years_experience", "label": "Years of Experience", "type": "number", "required": false},
    {"name": "awards_recognition", "label": "Awards & Recognition", "type": "textarea", "required": false, "placeholder": "List notable awards, publications, or recognitions"},
    {"name": "portfolio_highlights", "label": "Portfolio Highlights", "type": "textarea", "required": false, "placeholder": "Describe notable projects or achievements"},
    {"name": "sustainability_focus", "label": "Sustainability Focus", "type": "boolean", "required": false},
    {"name": "languages", "label": "Languages Spoken", "type": "multiselect", "required": false, "options": ["Portuguese", "English", "French", "German", "Spanish", "Italian", "Dutch", "Russian"]},
    {"name": "service_area", "label": "Service Area", "type": "multiselect", "required": false, "options": ["Golden Triangle", "Vilamoura", "Lagos", "Tavira", "Carvoeiro", "Portimão", "Sagres", "All Algarve", "International"]},
    {"name": "certifications", "label": "Professional Certifications", "type": "text", "required": false},
    {"name": "team_size", "label": "Team Size", "type": "select", "required": false, "options": ["Solo Practice", "Small Studio (2-5)", "Medium Studio (6-15)", "Large Firm (15+)"]},
    {"name": "consultation_available", "label": "Free Consultation Available", "type": "boolean", "required": false},
    {"name": "virtual_services", "label": "Virtual/Remote Services", "type": "boolean", "required": false}
  ]'::jsonb
);;
