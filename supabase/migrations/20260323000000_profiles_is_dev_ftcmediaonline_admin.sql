-- Add is_dev flag so specific users (e.g. ftcmediaonline) can have both admin and dev panel access
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_dev boolean NOT NULL DEFAULT false;

-- ftcmediaonline@gmail.com: admin + dev panel access
UPDATE public.profiles
SET role = 'admin', is_dev = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'ftcmediaonline@gmail.com' LIMIT 1);
