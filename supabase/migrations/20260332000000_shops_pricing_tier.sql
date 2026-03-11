-- Add pricing tier to shops (Starter / Growth / Enterprise from pricing page)
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS pricing_tier text NOT NULL DEFAULT 'starter';

COMMENT ON COLUMN public.shops.pricing_tier IS 'Pricing plan: starter, growth, or enterprise';
