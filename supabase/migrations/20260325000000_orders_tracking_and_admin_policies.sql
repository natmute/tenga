-- Order tracking: add tracking number and carrier to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_carrier text;

-- Admins can view all orders (for order tracking in admin panel)
DROP POLICY IF EXISTS "Admins can select all orders" ON public.orders;
CREATE POLICY "Admins can select all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Admins can update any order (status, tracking)
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (true);

-- Admins can view all order_items (to show order details in admin)
DROP POLICY IF EXISTS "Admins can select all order items" ON public.order_items;
CREATE POLICY "Admins can select all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
