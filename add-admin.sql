-- Script to add yourself as an admin user
-- Run this in Supabase SQL Editor

-- Step 1: Find your user ID (replace 'your-email@example.com' with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Copy the ID from above and use it in the INSERT below
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Step 1
-- Replace 'your-email@example.com' with your actual email

INSERT INTO admin_users (user_id, email)
VALUES ('YOUR_USER_ID_HERE', 'your-email@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Verify the admin was added
SELECT * FROM admin_users;
