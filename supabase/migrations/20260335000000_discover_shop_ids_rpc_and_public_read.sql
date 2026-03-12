-- Discover page: use RPC as single source of truth for which shops are on discover,
-- and allow public to read verified shops so the Discover page works for all users.

-- RPC: returns shop IDs that are on discover (bypasses RLS, so Discover page always gets correct list)
CREATE OR REPLACE FUNCTION public.get_discover_shop_ids()
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(array_agg(id) FILTER (WHERE id IS NOT NULL), ARRAY[]::uuid[])
  FROM public.shops
  WHERE is_verified = true AND is_on_discover = true;
$$;

-- Allow anyone to read verified shops (for Discover page and shop links)
DROP POLICY IF EXISTS "Public can read verified shops" ON public.shops;
CREATE POLICY "Public can read verified shops"
  ON public.shops FOR SELECT
  USING (is_verified = true);
