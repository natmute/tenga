-- Fix ftcmediaonline admin + dev access (profiles.id = auth user id)
-- Run this if ftcmediaonline@gmail.com still doesn't have admin/dev after 20260323000000
UPDATE public.profiles
SET role = 'admin', is_dev = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'ftcmediaonline@gmail.com' LIMIT 1);
