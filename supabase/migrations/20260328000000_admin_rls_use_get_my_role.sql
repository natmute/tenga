-- Helper: current user's role (works whether profiles use id or user_id for auth link)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  use_user_id boolean;
  r text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) INTO use_user_id;

  IF use_user_id THEN
    SELECT role INTO r FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  ELSE
    SELECT role INTO r FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  END IF;
  RETURN r;
END;
$$;

-- Helper: current user's is_dev (same idea)
CREATE OR REPLACE FUNCTION public.get_my_is_dev()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  use_user_id boolean;
  d boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
  ) INTO use_user_id;

  IF use_user_id THEN
    SELECT COALESCE(is_dev, false) INTO d FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  ELSE
    SELECT COALESCE(is_dev, false) INTO d FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  END IF;
  RETURN COALESCE(d, false);
END;
$$;

-- Recreate admin policies to use get_my_role() so RLS works for both id and user_id schemas
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
CREATE POLICY "Admins can select all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update shops" ON public.shops;
CREATE POLICY "Admins can update shops"
  ON public.shops FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;
CREATE POLICY "Admins can delete shops"
  ON public.shops FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can select all shops" ON public.shops;
CREATE POLICY "Admins can select all shops"
  ON public.shops FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can select all orders" ON public.orders;
CREATE POLICY "Admins can select all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can select all order items" ON public.order_items;
CREATE POLICY "Admins can select all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');
