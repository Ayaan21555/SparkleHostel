-- Run this in your Supabase SQL Editor to securely upgrade the passwords.

-- Supabase recently upgraded their security systems to reject any passwords hashed with a "cost" lower than 10.
-- This script safely updates all your hostel accounts to use the accepted cryptographic cost level (10) for the exact same password!

UPDATE auth.users
SET encrypted_password = crypt('Hostel@2024', gen_salt('bf', 10))
WHERE email LIKE '%@sparklehostel.com';
