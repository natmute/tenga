-- Shop followers: users follow shops (no duplicate follows per user/shop)
CREATE TABLE IF NOT EXISTS public.shop_followers (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, shop_id)
);

-- RLS
ALTER TABLE public.shop_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for counts and "is following" checks)
DROP POLICY IF EXISTS "Anyone can read shop_followers" ON public.shop_followers;
CREATE POLICY "Anyone can read shop_followers"
  ON public.shop_followers FOR SELECT
  USING (true);

-- Authenticated users can follow (insert own row)
DROP POLICY IF EXISTS "Users can follow shops" ON public.shop_followers;
CREATE POLICY "Users can follow shops"
  ON public.shop_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unfollow (delete own row)
DROP POLICY IF EXISTS "Users can unfollow shops" ON public.shop_followers;
CREATE POLICY "Users can unfollow shops"
  ON public.shop_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
