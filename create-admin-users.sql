-- Create Admin Users in Supabase
-- Run this in Supabase SQL Editor AFTER users have registered

-- =============================================
-- IMPORTANT: Users must register first through the app
-- Then run this script to upgrade them to admin
-- =============================================

-- Update user metadata to set role as 'admin'
-- Replace 'admin@bizstep.com' with the actual email of the user you want to make admin

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bizstep.com';

-- You can also update multiple users at once:
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{role}',
--   '"admin"'
-- )
-- WHERE email IN ('admin@bizstep.com', 'another-admin@example.com');

-- Verify the update
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE email = 'admin@bizstep.com';

-- =============================================
-- To create a regular user (default):
-- Users are automatically created with role='user' when they register
-- No SQL needed - just register through the app
-- =============================================

-- To downgrade an admin back to user:
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{role}',
--   '"user"'
-- )
-- WHERE email = 'user@example.com';
