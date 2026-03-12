-- RPC: set shop is_featured (only callable by is_dev, for dev panel Featured tab)
CREATE OR REPLACE FUNCTION public.set_shop_featured(p_shop_id uuid, p_featured boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_dev boolean;
BEGIN
  SELECT COALESCE(is_dev, false) INTO caller_is_dev FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF caller_is_dev IS NOT TRUE THEN
    SELECT COALESCE(is_dev, false) INTO caller_is_dev FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  END IF;
  IF caller_is_dev IS NOT TRUE THEN
    RAISE EXCEPTION 'Only dev users can set featured shops.';
  END IF;
  UPDATE public.shops SET is_featured = p_featured WHERE id = p_shop_id;
END;
$$;
