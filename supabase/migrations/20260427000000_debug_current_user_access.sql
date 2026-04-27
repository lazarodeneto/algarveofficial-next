CREATE OR REPLACE FUNCTION public.debug_current_user_access()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_role TEXT;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN json_build_object(
      'uid', NULL,
      'role', NULL,
      'is_admin', FALSE,
      'note', 'no authenticated session'
    );
  END IF;

  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = v_uid;

  v_is_admin := (v_role = 'admin');

  RETURN json_build_object(
    'uid', v_uid,
    'role', COALESCE(v_role, 'null'),
    'is_admin', v_is_admin
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_current_user_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_current_user_access() TO anon;