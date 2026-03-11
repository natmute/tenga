-- Dev-curated Discover page: which shops and products appear on /discover
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS is_on_discover boolean NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_on_discover boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.shops.is_on_discover IS 'When true, all products from this shop appear on the Discover page (dev-controlled).';
COMMENT ON COLUMN public.products.is_on_discover IS 'When true, this product appears on the Discover page (dev-controlled).';

-- RPC: set shop is_on_discover (only callable by is_dev)
CREATE OR REPLACE FUNCTION public.set_shop_on_discover(p_shop_id uuid, p_on_discover boolean)
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
    RAISE EXCEPTION 'Only dev users can set discover visibility.';
  END IF;
  UPDATE public.shops SET is_on_discover = p_on_discover WHERE id = p_shop_id;
END;
$$;

-- RPC: set product is_on_discover (only callable by is_dev)
CREATE OR REPLACE FUNCTION public.set_product_on_discover(p_product_id uuid, p_on_discover boolean)
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
    RAISE EXCEPTION 'Only dev users can set discover visibility.';
  END IF;
  UPDATE public.products SET is_on_discover = p_on_discover WHERE id = p_product_id;
END;
$$;

-- Allow devs to read verified shops and products for the Discover curation UI.
DROP POLICY IF EXISTS "Devs can select verified shops" ON public.shops;
CREATE POLICY "Devs can select verified shops"
  ON public.shops FOR SELECT
  TO authenticated
  USING (is_verified = true AND public.get_my_is_dev() = true);

DROP POLICY IF EXISTS "Devs can select products for discover" ON public.products;
CREATE POLICY "Devs can select products for discover"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.get_my_is_dev() = true);
