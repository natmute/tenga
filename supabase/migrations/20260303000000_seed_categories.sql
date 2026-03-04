-- Seed categories to match the Open Shop form (same as mockData)
-- Safe to run multiple times: only inserts when slug does not exist
INSERT INTO public.categories (name, slug, icon)
SELECT 'Fashion', 'fashion', '👗' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'fashion');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Electronics', 'electronics', '📱' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'electronics');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Home & Living', 'home-living', '🏠' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'home-living');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Beauty', 'beauty', '💄' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'beauty');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Sports', 'sports', '⚽' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sports');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Books', 'books', '📚' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'books');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Food & Drinks', 'food-drinks', '🍕' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'food-drinks');
INSERT INTO public.categories (name, slug, icon)
SELECT 'Art & Crafts', 'art-crafts', '🎨' WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'art-crafts');
