-- RPC: list profiles for dev panel (only callable by users with is_dev = true)
CREATE OR REPLACE FUNCTION public.get_profiles_for_dev()
RETURNS TABLE (id uuid, full_name text, username text, is_dev boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_dev boolean;
  use_user_id boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) INTO use_user_id;

  IF use_user_id THEN
    SELECT p.is_dev INTO caller_is_dev FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1;
  ELSE
    SELECT p.is_dev INTO caller_is_dev FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1;
  END IF;

  IF caller_is_dev IS NOT TRUE THEN
    RAISE EXCEPTION 'Only users with dev access can list profiles';
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name, p.username, COALESCE(p.is_dev, false)
  FROM public.profiles p
  ORDER BY p.full_name NULLS LAST, p.username;
END;
$$;

-- RPC: set is_dev for a user (only callable by users with is_dev = true)
CREATE OR REPLACE FUNCTION public.set_user_dev(target_profile_id uuid, new_is_dev boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_dev boolean;
  use_user_id boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) INTO use_user_id;

  IF use_user_id THEN
    SELECT p.is_dev INTO caller_is_dev FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1;
  ELSE
    SELECT p.is_dev INTO caller_is_dev FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1;
  END IF;

  IF caller_is_dev IS NOT TRUE THEN
    RAISE EXCEPTION 'Only users with dev access can grant or revoke dev access';
  END IF;

  UPDATE public.profiles SET is_dev = new_is_dev WHERE public.profiles.id = target_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles_for_dev() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_dev(uuid, boolean) TO authenticated;
