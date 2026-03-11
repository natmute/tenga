-- Admins can view all shop conversations (customer–seller threads)
CREATE POLICY "Admins can select all shop conversations"
  ON public.shop_conversations FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

-- Admins can view all shop messages
CREATE POLICY "Admins can select all shop messages"
  ON public.shop_messages FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');
