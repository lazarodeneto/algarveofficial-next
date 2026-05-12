-- Atomic admin review workflow for owner-submitted listing change requests.

ALTER TABLE public.listing_change_requests
  ALTER COLUMN requested_value DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.admin_review_listing_change_request(
  _request_id uuid,
  _action text,
  _admin_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid := auth.uid();
  _request public.listing_change_requests%ROWTYPE;
  _listing public.listings%ROWTYPE;
  _now timestamptz := now();
  _note text := NULLIF(btrim(COALESCE(_admin_note, '')), '');
  _requested_json jsonb;
  _requested_text text;
  _category_data jsonb;
BEGIN
  IF _actor_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin authentication required');
  END IF;

  IF NOT public.has_role(_actor_id, 'admin'::public.app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can review listing change requests');
  END IF;

  SELECT *
    INTO _request
    FROM public.listing_change_requests
    WHERE id = _request_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing change request not found');
  END IF;

  IF _request.status <> 'pending'::public.listing_change_request_status THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pending listing change requests can be reviewed');
  END IF;

  SELECT *
    INTO _listing
    FROM public.listings
    WHERE id = _request.listing_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Linked listing not found');
  END IF;

  IF _action = 'reject' THEN
    UPDATE public.listing_change_requests
       SET status = 'rejected'::public.listing_change_request_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           admin_note = _note,
           updated_at = _now
     WHERE id = _request_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', _action,
      'request_id', _request_id,
      'listing_id', _request.listing_id,
      'field_name', _request.field_name
    );
  END IF;

  IF _action <> 'approve' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unsupported listing change review action');
  END IF;

  IF _request.field_name NOT IN (
    'name',
    'short_description',
    'description',
    'contact_phone',
    'contact_email',
    'website_url',
    'address',
    'opening_hours',
    'instagram_url',
    'facebook_url',
    'twitter_url',
    'youtube_url',
    'linkedin_url',
    'tiktok_url',
    'featured_image_url'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unsupported listing field');
  END IF;

  _requested_json := _request.requested_value;

  IF _requested_json IS NULL OR _requested_json = 'null'::jsonb THEN
    _requested_text := NULL;
  ELSIF jsonb_typeof(_requested_json) = 'string' THEN
    _requested_text := _requested_json #>> '{}';
  ELSE
    _requested_text := _requested_json::text;
  END IF;

  IF _requested_text IS NOT NULL AND length(_requested_text) > 5000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested value is too long');
  END IF;

  IF _request.field_name = 'name' AND (_requested_text IS NULL OR length(_requested_text) < 2) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business name cannot be empty');
  END IF;

  IF _request.field_name = 'contact_email'
     AND _requested_text IS NOT NULL
     AND _requested_text !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested email is not valid');
  END IF;

  IF _request.field_name = 'contact_phone'
     AND _requested_text IS NOT NULL
     AND _requested_text !~ '^[0-9+().[:space:]-]{5,50}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested phone number is not valid');
  END IF;

  IF _request.field_name IN (
      'website_url',
      'instagram_url',
      'facebook_url',
      'twitter_url',
      'youtube_url',
      'linkedin_url',
      'tiktok_url',
      'featured_image_url'
    )
     AND _requested_text IS NOT NULL
     AND _requested_text !~* '^(https?://[^[:space:]<>]+|/[^/[:space:]<>][^[:space:]<>]*)$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested URL must be an http(s) URL or a safe site path');
  END IF;

  IF _request.field_name = 'opening_hours' THEN
    _category_data := COALESCE(_listing.category_data, '{}'::jsonb);

    IF _requested_text IS NULL THEN
      _category_data := _category_data - 'opening_hours';
      IF jsonb_typeof(_category_data -> 'business_details') = 'object' THEN
        _category_data := jsonb_set(
          _category_data,
          '{business_details}',
          (_category_data -> 'business_details') - 'opening_hours',
          true
        );
      END IF;
    ELSE
      _category_data := jsonb_set(_category_data, '{opening_hours}', to_jsonb(_requested_text), true);
    END IF;
  ELSE
    _category_data := _listing.category_data;
  END IF;

  UPDATE public.listings
     SET name = CASE WHEN _request.field_name = 'name' THEN _requested_text ELSE name END,
         short_description = CASE WHEN _request.field_name = 'short_description' THEN _requested_text ELSE short_description END,
         description = CASE WHEN _request.field_name = 'description' THEN _requested_text ELSE description END,
         contact_phone = CASE WHEN _request.field_name = 'contact_phone' THEN _requested_text ELSE contact_phone END,
         contact_email = CASE WHEN _request.field_name = 'contact_email' THEN _requested_text ELSE contact_email END,
         website_url = CASE WHEN _request.field_name = 'website_url' THEN _requested_text ELSE website_url END,
         address = CASE WHEN _request.field_name = 'address' THEN _requested_text ELSE address END,
         instagram_url = CASE WHEN _request.field_name = 'instagram_url' THEN _requested_text ELSE instagram_url END,
         facebook_url = CASE WHEN _request.field_name = 'facebook_url' THEN _requested_text ELSE facebook_url END,
         twitter_url = CASE WHEN _request.field_name = 'twitter_url' THEN _requested_text ELSE twitter_url END,
         youtube_url = CASE WHEN _request.field_name = 'youtube_url' THEN _requested_text ELSE youtube_url END,
         linkedin_url = CASE WHEN _request.field_name = 'linkedin_url' THEN _requested_text ELSE linkedin_url END,
         tiktok_url = CASE WHEN _request.field_name = 'tiktok_url' THEN _requested_text ELSE tiktok_url END,
         featured_image_url = CASE WHEN _request.field_name = 'featured_image_url' THEN _requested_text ELSE featured_image_url END,
         category_data = _category_data,
         updated_at = _now
   WHERE id = _request.listing_id;

  UPDATE public.listing_change_requests
     SET status = 'approved'::public.listing_change_request_status,
         reviewed_by = _actor_id,
         reviewed_at = _now,
         admin_note = _note,
         updated_at = _now
   WHERE id = _request_id;

  RETURN jsonb_build_object(
    'success', true,
    'action', _action,
    'request_id', _request_id,
    'listing_id', _request.listing_id,
    'field_name', _request.field_name
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_review_listing_change_request(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_review_listing_change_request(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_review_listing_change_request(uuid, text, text) TO authenticated, service_role;

COMMENT ON FUNCTION public.admin_review_listing_change_request(uuid, text, text)
  IS 'Atomically reviews an owner listing change request and applies approved values to the linked listing.';

