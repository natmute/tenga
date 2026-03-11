-- Track unique user engagement per product (wishlist or cart = 1 like, never decreases)
CREATE TABLE IF NOT EXISTS public.product_engagement (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- RLS: users can only insert their own engagement (no delete = count never goes down)
ALTER TABLE public.product_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own product engagement"
ON public.product_engagement
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow reading own rows (optional, for debugging)
CREATE POLICY "Users can view own product engagement"
ON public.product_engagement
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Function to refresh product like_count from engagement count (runs with elevated privileges)
CREATE OR REPLACE FUNCTION public.refresh_product_like_count(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET like_count = (
    SELECT count(*)::int
    FROM public.product_engagement
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;
END;
$$;

-- Trigger: after insert into product_engagement, refresh that product's like_count
CREATE OR REPLACE FUNCTION public.on_product_engagement_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_product_like_count(NEW.product_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_engagement_refresh_like_count ON public.product_engagement;
CREATE TRIGGER product_engagement_refresh_like_count
  AFTER INSERT ON public.product_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.on_product_engagement_insert();

-- Backfill like_count from existing product_likes (wishlist) so current wishlists count as likes
INSERT INTO public.product_engagement (user_id, product_id)
SELECT user_id, product_id
FROM public.product_likes
ON CONFLICT (user_id, product_id) DO NOTHING;
