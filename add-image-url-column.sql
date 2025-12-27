-- Add image_url column to business_types table
-- Run this in Supabase SQL Editor

-- Add the image_url column if it doesn't exist
ALTER TABLE business_types 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Test: Update Agro-Input Shop with an image URL
-- Replace this URL with your actual image URL after uploading to Supabase Storage or a CDN
UPDATE business_types 
SET image_url = 'https://your-supabase-project.supabase.co/storage/v1/object/public/business-images/agro-input-shop.jpg'
WHERE name = 'Agro-Input Shop';

-- Verify the column was added
SELECT name, category, image_url 
FROM business_types 
WHERE image_url IS NOT NULL;
