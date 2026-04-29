-- Create partner_settings table for CMS-editable partner page
CREATE TABLE public.partner_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  -- Hero Section
  hero_title TEXT DEFAULT 'Become a Partner',
  hero_subtitle TEXT DEFAULT 'Join the Algarve''s premier premium directory and connect with discerning travelers seeking premium experiences.',
  
  -- Option Cards
  new_listing_title TEXT DEFAULT 'Apply for New Listing',
  new_listing_description TEXT DEFAULT 'Register your business to be featured in our curated collection of premium experiences.',
  new_listing_cta TEXT DEFAULT 'Apply Now',
  
  claim_business_title TEXT DEFAULT 'Claim Existing Business',
  claim_business_description TEXT DEFAULT 'Already listed? Verify ownership and take control of your business profile.',
  claim_business_cta TEXT DEFAULT 'Claim Your Business',
  
  -- Form Section
  form_title TEXT DEFAULT 'Get Started',
  success_message TEXT DEFAULT 'Thank you! Your request has been submitted. We''ll contact you within 2-3 business days.',
  
  -- Benefits Section
  benefits_title TEXT DEFAULT 'Why Partner With Us',
  benefit_1_title TEXT DEFAULT 'Increased Visibility',
  benefit_1_description TEXT DEFAULT 'Reach thousands of discerning travelers actively seeking premium Algarve experiences.',
  benefit_2_title TEXT DEFAULT 'Premium Positioning',
  benefit_2_description TEXT DEFAULT 'Stand out with verified and signature tier badges that build trust with customers.',
  benefit_3_title TEXT DEFAULT 'Direct Contact',
  benefit_3_description TEXT DEFAULT 'Receive inquiries directly from interested customers through our messaging system.',
  
  -- FAQ Section (stored as JSONB array for flexibility)
  faq_title TEXT DEFAULT 'Frequently Asked Questions',
  faqs JSONB DEFAULT '[
    {"question": "How do I get my business listed?", "answer": "Submit your application through the form above. Our team will review your business and contact you within 2-3 business days."},
    {"question": "What are the different listing tiers?", "answer": "We offer three tiers: Unverified (free basic listing), Verified (enhanced visibility with trust badge), and Signature (premium placement with Curated Excellence eligibility)."},
    {"question": "How long does the approval process take?", "answer": "Initial review typically takes 2-3 business days. Once approved, your listing goes live immediately."},
    {"question": "Is there a cost to be listed?", "answer": "Basic listings are free. Verified and Signature tiers have monthly fees with additional benefits. Contact us for current pricing."}
  ]'::jsonb,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.partner_settings ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "Anyone can view partner settings"
  ON public.partner_settings FOR SELECT
  USING (true);
CREATE POLICY "Admins can manage partner settings"
  ON public.partner_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Insert default row
INSERT INTO public.partner_settings (id) VALUES ('default');
-- Create trigger for updated_at
CREATE TRIGGER update_partner_settings_updated_at
  BEFORE UPDATE ON public.partner_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
