-- Run this in your Supabase Dashboard SQL Editor
-- This will create the public.users table (if it doesn't exist), insert 180 students, and create auth.users for them.
-- Default password: Sparkle123!

-- 1. Create the public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure year and room columns exist in case the table was created previously without them
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS room TEXT;

-- 2. Insert all 180 students into a temporary table to process
CREATE TEMP TABLE temp_students (
  no INT,
  name TEXT,
  year TEXT,
  room TEXT
);

INSERT INTO temp_students (no, name, year, room) VALUES
(1, 'Suheda Zara', 'II', 'B-02'),
(2, 'Diana Zara', 'III', 'B-02'),
(3, 'Arondi S', 'III', 'B-02'),
(4, 'Fasna', 'III', 'B-03'),
(5, 'Lubna', 'III', 'B-03'),
(6, 'Naja Fathima', 'III', 'B-03'),
(7, 'Jayalakshmi Nair', 'III', 'B-04'),
(8, 'Sneha Alex', 'III', 'B-04'),
(9, 'Deepa', 'III', 'B-04'),
(10, 'Fathima Rasha', 'III', 'B-05'),
(11, 'Shoyara', 'III', 'B-05'),
(12, 'Shamna', 'III', 'B-05'),
(13, 'Mareena', 'III', 'B-06'),
(14, 'Sreemanda', 'III', 'B-06'),
(15, 'Sruthi Joseph', 'III', 'B-06'),
(16, 'Shiva Ganga', 'III', 'B-06'),
(17, 'Aida Roohi', 'III', 'B-11'),
(18, 'Zakiya Aziz', 'III', 'B-11'),
(19, 'Flavita', 'III', 'B-08'),
(20, 'Nisha', 'III', 'B-08'),
(21, 'Gana', 'III', 'B-08'),
(22, 'Mayogha', 'I', 'B-09'),
(23, 'Fathima Zarah', 'I', 'B-09'),
(24, 'P. Muskan', 'I', 'B-09'),
(25, 'Ridha', 'I', 'B-10'),
(26, 'Nefrin Azfia M.S.', 'I', 'B-10'),
(27, 'Shana Fathima', 'I', 'B-10'),
(28, 'Harshitha L', 'III', 'B-07'),
(29, 'Samruddhi', 'III', 'B-07'),
(30, 'Sinchana', 'III', 'B-07'),
(31, 'Srusti', 'III', 'B-07'),
(32, 'Manya', 'III', 'B-12'),
(33, 'Srusti', 'III', 'B-12'),
(34, 'Sanidya', 'III', 'B-12'),
(35, 'Lena Aysha', 'III', 'G-001'),
(36, 'Aysha Ashfaqua', 'III', 'G-001'),
(37, 'Fathima Naja', 'III', 'G-002'),
(38, 'Aysha P.B.', 'III', 'G-002'),
(39, 'Tasmiya', 'I', 'G-002'),
(40, 'Aysha Nida', 'III', 'G-003'),
(41, 'Ziya Mariyam', 'I', 'G-003'),
(42, 'Aysha Sahala', 'I', 'G-003'),
(43, 'Zanifa Khalid', 'I', 'G-005'),
(44, 'Naira Zeeba', 'I', 'G-005'),
(45, 'Ayisha Falak', 'I', 'G-005'),
(46, 'Shilpa S.S.', 'III', 'G-007'),
(47, 'Aishwarya', 'III', 'G-007'),
(48, 'Shilpa L.M.', 'III', 'G-007'),
(49, 'Siyana Banu', 'I', 'G-10'),
(50, 'Kadeeja Thasniya', 'II', 'G-10'),
(51, 'Zehra Abdul', 'II', 'G-10'),
(52, 'Samrudhi', 'I', 'G-11'),
(53, 'Harsha', 'I', 'G-11'),
(54, 'Sreya', 'I', 'G-11'),
(55, 'Krupa', 'II', 'G-12'),
(56, 'Soumya', 'I', 'G-12'),
(57, 'Ananya K.P.', 'I', 'S-003'),
(58, 'Annapooma', 'III', 'F-09'),
(59, 'Varna Shetty', 'III', 'F-09'),
(60, 'Ananya', 'III', 'F-09'),
(61, 'Shravya', 'III', 'F-09'),
(62, 'Sushmitha', 'III', 'F-09'),
(63, 'Sona', 'II', 'F-10'),
(64, 'Samartha', 'III', 'F-10'),
(65, 'Keerthana C', 'II', 'F-10'),
(66, 'Deeksha', 'III', 'F-10'),
(67, 'Archana', 'III', 'F-10'),
(68, 'Nida Naj', 'I', 'F-11'),
(69, 'Bibi Aysha', 'I', 'F-11'),
(70, 'Parvathy S', 'I', 'F-11'),
(71, 'Apeksha', 'III', 'F-13'),
(72, 'Hemalatha', 'III', 'F-13'),
(73, 'Deepa', 'III', 'F-13'),
(74, 'Salma Sharma', 'III', 'F-14'),
(75, 'Khan Shilath', 'III', 'F-14'),
(76, 'Bibi Umayya', 'III', 'F-14'),
(77, 'Rafa', 'III', 'F-14'),
(78, 'Fathimath Efa', 'I', 'F-14'),
(79, 'Shaza', 'II', 'F-14'),
(80, 'Yathaswini', 'I', 'S-001'),
(81, 'Pragathi', 'I', 'S-001'),
(82, 'Rashmi', 'I', 'S-001'),
(83, 'Harshitha', 'III', 'S-002'),
(84, 'Poorvi e pragna', 'III', 'S-005'),
(85, 'Razmiya', 'III', 'S-005'),
(86, 'Miswa Z', 'III', 'S-003'),
(87, 'Fida', 'III', 'S-008'),
(88, 'Rakshitha', 'III', 'S-008'),
(89, 'Anupama', 'III', 'S-11'),
(90, 'Muneera', 'III', 'S-11'),
(91, 'Ashwathi', 'III', 'S-11'),
(92, 'Greeshma', 'III', 'S-11'),
(93, 'Fathima R N', 'III', 'S-12'),
(94, 'Rifa Fathima', 'I', 'S-12'),
(95, 'Shaniya shamren', 'I', 'S-12'),
(96, 'Afreen a', 'I', 'S-12'),
(97, 'Fathima Liyana', 'II', 'S-13'),
(98, 'Shida Yasmin', 'II', 'S-13'),
(99, 'Neha', 'II', 'S-13'),
(100, 'Shravya', 'II', 'S-13'),
(101, 'Spoorthi', 'I', 'S-14'),
(102, 'Manya', 'I', 'S-14'),
(103, 'Amulya', 'I', 'S-14'),
(104, 'Bibi Saniya', 'I', 'S-14'),
(105, 'Sushmitha', 'I', 'S-14'),
(106, 'Riham', 'I', 'S-14'),
(107, 'Asha', 'III', 'T-303'),
(108, 'Theja', 'III', 'T-303'),
(109, 'Surekha', 'II', 'T-303'),
(110, 'Seema', 'II', 'T-303'),
(111, 'Bhagyashree', 'III', 'T-302'),
(112, 'Shreeprada', 'III', 'T-302'),
(113, 'Preethika', 'III', 'T-302'),
(114, 'Supreetha Shetty', 'III', 'T-302'),
(115, 'Khushi', 'III', 'T-05'),
(116, 'Gagana', 'III', 'T-05'),
(117, 'Moulya', 'III', 'T-05'),
(118, 'Pallavi', 'III', 'T-05'),
(119, 'Spoorthi', 'III', 'T-12'),
(120, 'Sandya', 'III', 'T-12'),
(121, 'Shania', 'III', 'T-09'),
(122, 'Ankitha', 'III', 'T-09'),
(123, 'Aqsa Banu', 'III', 'T-09'),
(124, 'Naveena', 'III', 'T-09'),
(125, 'Razweena', 'III', 'T-09'),
(126, 'Ardra mohan', 'II', 'T-14'),
(127, 'Sneha Sahadevan', 'II', 'T-14'),
(128, 'Neha Mischa', 'II', 'T-14'),
(129, 'Fathima Zahara', 'III', 'T-14'),
(130, 'Akansha', 'III', 'T-14'),
(131, 'Vandana C.', 'III', 'T-14'),
(132, 'Sridevi', 'II', 'T-07'),
(133, 'Mythri', 'II', 'S-002'),
(134, 'Pavithra', 'II', 'Fo-02'),
(135, 'Suchaitra', 'II', 'F-o02'),
(136, 'Renuka', 'III', 'Fo-02'),
(137, 'Kavana', 'II', 'T-07'),
(138, 'Vanchitha', 'III', 'S-002'),
(139, 'Monisha', 'III', 'Fo-02'),
(140, 'Pavithra V.', 'III', 'Fo-03'),
(141, 'Misba', 'IV', 'Fo-03'),
(142, 'Ameena', 'II', 'Fo-03'),
(143, 'Moksha', 'IV', 'Fo-03'),
(144, 'Deena', 'II', 'Fi-04'),
(145, 'Prachetha', 'II', 'Fo-012'),
(146, 'Ashwini', 'II', 'T-07'),
(147, 'Soumyashree', 'III', 'S-005'),
(148, 'Laxmi', 'II', 'T-12'),
(149, 'Sinchana shetty', 'I', 'T-12'),
(150, 'Disha', 'II', 'Fo-06'),
(151, 'Savitha', 'II', 'Fo-06'),
(152, 'Uma Mali', 'II', 'Fo-06'),
(153, 'Prajna', 'IV', 'Fo-06'),
(154, 'Nethra', 'II', 'Fo-09'),
(155, 'Lakshmi', 'II', 'Fo-09'),
(156, 'Shravya', 'III', 'Fo-09'),
(157, 'Ranjitha', 'II', 'Fo-09'),
(158, 'Divya N.', 'II', 'Fo-09'),
(159, 'Jyothi Lakshmi', 'II', 'Fi-14'),
(160, 'Meghana', 'I', 'Fo-11'),
(161, 'Vijayalakshmi', 'I', 'T-07'),
(162, 'Sneha Pawar', 'I', 'Fo-11'),
(163, 'Prathibha', 'I', 'Fo-11'),
(164, 'Bhagyalakshmi', 'II', 'Fo-11'),
(165, 'Shamiya', 'II', 'Fo-14'),
(166, 'Khushi', 'I', 'Fo-12'),
(167, 'Ashmitha', 'I', 'Fo-12'),
(168, 'Sanjana', 'I', 'Fo-12'),
(169, 'Manya', 'II', 'Fo-13'),
(170, 'Akshatha', 'II', 'Fo-13'),
(171, 'Riya Lokesh', 'II', 'Fo-13'),
(172, 'Inchana', 'II', 'Fo-13'),
(173, 'Shaziya', 'I', 'Fo-14'),
(174, 'Rashmi VP', 'I', 'Fo-14'),
(175, 'Sarah', 'IV', 'Fo-14'),
(176, 'Shaista', 'I', 'Fo-14'),
(177, 'Durga Prasanna', 'IV', 'Fi-14'),
(178, 'Amrutha', 'III', 'Fi-14'),
(179, 'Deekshitha', 'III', 'Fi-14'),
(180, 'Stuti', 'III', 'Fi-14');

-- 3. Loop through temp table to insert/update users and auth
DO $$
DECLARE
    r RECORD;
    new_user_id UUID;
    gen_email TEXT;
BEGIN
    FOR r IN SELECT * FROM temp_students LOOP
        -- Generate formatted email: student<No>@sparklehostel.com
        gen_email := 'student' || r.no || '@sparklehostel.com';
        
        -- Check if email exists in public.users to avoid duplicates if run multiple times
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = gen_email) THEN
            new_user_id := gen_random_uuid();
            
            -- Insert into public.users
            INSERT INTO public.users (id, name, year, room, email)
            VALUES (new_user_id, r.name, r.year, r.room, gen_email);

            -- Check if user already exists in auth.users
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = gen_email) THEN
                -- Insert into auth.users with a crypted password
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
                    new_user_id,
                    '00000000-0000-0000-0000-000000000000',
                    'authenticated',
                    'authenticated',
                    gen_email,
                    crypt('Sparkle123!', gen_salt('bf')),
                    now(),
                    '{"provider":"email","providers":["email"]}',
                    jsonb_build_object('name', r.name, 'full_name', r.name),
                    now(),
                    now(),
                    '',
                    '',
                    '',
                    ''
                );
                
                -- Insert into auth.identities
                INSERT INTO auth.identities (
                    id,
                    user_id,
                    provider_id,
                    identity_data,
                    provider,
                    last_sign_in_at,
                    created_at,
                    updated_at
                )
                VALUES (
                    gen_random_uuid(),
                    new_user_id,
                    gen_email,
                    format('{"sub":"%s","email":"%s"}', new_user_id, gen_email)::jsonb,
                    'email',
                    now(),
                    now(),
                    now()
                );
            END IF;
        END IF;
    END LOOP;
    
    -- Ensure Warden Account Exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'warden@sparklehostel.com') THEN
        new_user_id := gen_random_uuid();
        
        -- Insert Warden into public.users
        INSERT INTO public.users (id, name, year, room, email, role)
        VALUES (new_user_id, 'Warden Priya', 'Staff', 'Office', 'warden@sparklehostel.com', 'warden');
        
        -- Insert Warden into auth.users bypass confirmation
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'warden@sparklehostel.com', crypt('Hostel@2024', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('name', 'Warden Priya', 'full_name', 'Warden Priya'), now(), now(), '', '', '', '');
        
        -- Insert Warden into auth.identities
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), new_user_id, 'warden@sparklehostel.com', format('{"sub":"%s","email":"%s"}', new_user_id, 'warden@sparklehostel.com')::jsonb, 'email', now(), now(), now());
    END IF;
END;
$$;

-- Clean up
DROP TABLE temp_students;
