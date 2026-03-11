-- Conversations between a customer and a shop (one thread per customer per shop)
CREATE TABLE public.shop_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id, customer_id)
);

-- Messages in a conversation
CREATE TABLE public.shop_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.shop_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_messages_conversation_id ON public.shop_messages(conversation_id);
CREATE INDEX idx_shop_conversations_shop_id ON public.shop_conversations(shop_id);
CREATE INDEX idx_shop_conversations_customer_id ON public.shop_conversations(customer_id);

ALTER TABLE public.shop_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_messages ENABLE ROW LEVEL SECURITY;

-- Users can see conversations where they are the customer
CREATE POLICY "Customers can select own conversations"
  ON public.shop_conversations FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- Shop owners can see conversations for their shop
CREATE POLICY "Shop owners can select shop conversations"
  ON public.shop_conversations FOR SELECT TO authenticated
  USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );

-- Customers can create a conversation with a shop (customer_id must be self)
CREATE POLICY "Customers can insert own conversation"
  ON public.shop_conversations FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Messages: select if user is participant (customer or shop owner of the conversation's shop)
CREATE POLICY "Participants can select messages"
  ON public.shop_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    )
  );

-- Participants can insert messages (sender must be self)
CREATE POLICY "Participants can insert messages"
  ON public.shop_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.shop_conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
    )
  );

-- Trigger to bump conversation updated_at on new message
CREATE OR REPLACE FUNCTION public.shop_conversation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.shop_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER shop_messages_updated_at
  AFTER INSERT ON public.shop_messages
  FOR EACH ROW EXECUTE FUNCTION public.shop_conversation_updated_at();
