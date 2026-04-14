-- Admin-only RPC to set a user's primary role safely.
-- This bypasses direct table RLS issues while still enforcing admin access.

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  _target_user_id uuid,
  _new_role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _acting_user_id uuid := auth.uid();
  _admin_count integer := 0;
BEGIN
  IF _acting_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user is required';
  END IF;

  IF _new_role IS NULL THEN
    RAISE EXCEPTION 'New role is required';
  END IF;

  IF NOT public.has_role(_acting_user_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Prevent accidentally removing the final admin account.
  IF public.has_role(_target_user_id, 'admin'::public.app_role)
     AND _new_role <> 'admin'::public.app_role THEN
    SELECT COUNT(DISTINCT user_id)
    INTO _admin_count
    FROM public.user_roles
    WHERE role = 'admin'::public.app_role;

    IF _admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  END IF;

  -- Keep one explicit role per user, matching the current Admin UI model.
  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _new_role);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;
