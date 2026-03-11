-- Admins can add products to any shop
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

-- Admins can remove products from any shop
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');
