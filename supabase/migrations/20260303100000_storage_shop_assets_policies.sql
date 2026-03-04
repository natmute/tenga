-- Storage policies for the shop-assets bucket (logos and banners).
-- Create the bucket first in Dashboard: Storage → New bucket → name: shop-assets, set Public: ON.
-- Then run this migration (SQL Editor or supabase db push).

-- Allow authenticated users to upload (INSERT) to shop-assets
CREATE POLICY "Allow authenticated uploads to shop-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-assets');

-- Allow public read (SELECT) so logo/banner URLs work for everyone
CREATE POLICY "Allow public read shop-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shop-assets');
