-- Run this in your Supabase Dashboard SQL Editor
-- This will create an auth.users account for every student in the public.users table who doesn't have one.
-- Default password: Sparkle123!

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, email FROM public.users LOOP
        -- check if user already exists in auth.users
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
            -- Insert into auth.users with a crypted password, bypass email confirmation
            INSERT INTO auth.users (
                id,
                instance_id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            )
            VALUES (
                r.id,
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                'authenticated',
                r.email,
                crypt('Sparkle123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                now(),
                now(),
                '',
                '',
                '',
                ''
            );
            
            -- Insert into auth.identities so they bypass identity login requirement exceptions
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            )
            VALUES (
                gen_random_uuid(),
                r.id,
                format('{"sub":"%s","email":"%s"}', r.id, r.email)::jsonb,
                'email',
                now(),
                now(),
                now()
            );
        END IF;
    END LOOP;
END;
$$;
