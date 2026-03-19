-- Run this in your Supabase SQL Editor to allow the login page to verify player accounts

-- 1. Enable RLS on the table (usually enabled by default)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows anyone (including anonymous login users) to SELECT rows from 'users'
DROP POLICY IF EXISTS "Allow public read access to users for login lookup" ON public.users;
CREATE POLICY "Allow public read access to users for login lookup"
  ON public.users
  FOR SELECT
  USING (true);
  