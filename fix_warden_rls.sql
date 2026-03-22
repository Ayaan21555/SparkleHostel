-- Run this in your Supabase Dashboard SQL Editor
-- This fixes the Warden Edit Student bug by bypassing the default recursive user RLS update restriction.

CREATE OR REPLACE FUNCTION is_warden()
RETURNS BOOLEAN AS $$
  SELECT role = 'warden' FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "Wardens can edit all users" ON public.users;

CREATE POLICY "Wardens can edit all users"
ON public.users
FOR UPDATE
USING (is_warden());
