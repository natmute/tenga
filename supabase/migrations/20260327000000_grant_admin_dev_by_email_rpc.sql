-- One-off helper: grant admin + dev to a user by email (works for id or user_id schema)
-- Run in SQL Editor: SELECT public.grant_admin_dev_by_email('ftcmediaonline@gmail.com');
CREATE OR REPLACE FUNCTION public.grant_admin_dev_by_email(target_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user_id uuid;
  use_user_id boolean;
  rows_updated integer;
BEGIN
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = target_email
  LIMIT 1;

  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found with email %', target_email;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) INTO use_user_id;

  IF use_user_id THEN
    UPDATE public.profiles
    SET role = 'admin', is_dev = true
    WHERE user_id = auth_user_id;
  ELSE
    UPDATE public.profiles
    SET role = 'admin', is_dev = true
    WHERE id = auth_user_id;
  END IF;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_admin_dev_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_dev_by_email(text) TO service_role;
