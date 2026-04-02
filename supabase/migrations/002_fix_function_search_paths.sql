-- Fix Function Search Path Mutable warnings
-- Adds explicit search_path to prevent search path injection attacks
-- Safe: does not change function behavior

ALTER FUNCTION public._mark_header_menu_item_trans_needs_review SET search_path = public;
ALTER FUNCTION public._mark_homepage_settings_trans_needs_review SET search_path = public;
ALTER FUNCTION public.set_listing_reviews_updated_at SET search_path = public;
ALTER FUNCTION public.queue_cms_text_for_translation SET search_path = public;
ALTER FUNCTION public.mark_category_translations_needs_review SET search_path = public;
ALTER FUNCTION public.mark_city_translations_needs_review SET search_path = public;
ALTER FUNCTION public.mark_region_translations_needs_review SET search_path = public;
ALTER FUNCTION public.mark_footer_section_translations_needs_review SET search_path = public;
ALTER FUNCTION public.mark_footer_link_translations_needs_review SET search_path = public;
ALTER FUNCTION public.mark_blog_post_translations_needs_review SET search_path = public;
