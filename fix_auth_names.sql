-- Run this in your Supabase SQL Editor to fix the blank display names for users you already created!

UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('name', u.name, 'full_name', u.name)
FROM public.users u
WHERE auth.users.email = u.email;

-- This specifically fixes the Warden's name as well
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('name', 'Warden Priya', 'full_name', 'Warden Priya')
WHERE email = 'warden@sparklehostel.com';
