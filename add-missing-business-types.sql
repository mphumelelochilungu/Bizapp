-- Add Missing Business Types
-- This script adds the business types from the user's list that are not yet in the database
-- Run this AFTER the initial seed-business-types.sql

-- =============================================
-- INSERT MISSING BUSINESS TYPES
-- =============================================

INSERT INTO business_types (name, category, startup_cost, monthly_profit, difficulty, description) VALUES

-- Agriculture & Farming (Missing)
('Dairy Farming', 'Agriculture & Farming', 12000, 2000, 'Hard', 'Milk production and dairy products. Steady demand.'),
('Agro-Input Shop', 'Agriculture & Farming', 5000, 1200, 'Medium', 'Retail shop for seeds, fertilizers, pesticides, and farming tools.'),

-- Food Processing & Hospitality (Missing)
('Fast Food Stand', 'Food Processing & Hospitality', 2000, 800, 'Easy', 'Quick-service food kiosk. Low overhead, high foot traffic.'),
('Mobile Food Cart', 'Food Processing & Hospitality', 3000, 900, 'Easy', 'Sell food from mobile cart or truck. Flexible location business.'),
('Home Cooking Business', 'Food Processing & Hospitality', 1000, 600, 'Easy', 'Cook meals from home for delivery. Low startup costs.'),

-- Retail & Trading (Missing)
('General Store/Kiosk', 'Retail & Trading', 3000, 800, 'Easy', 'Sell daily necessities and household items. Community retail.'),
('Mobile Money/Airtime Vendor', 'Retail & Trading', 500, 400, 'Easy', 'Sell mobile airtime and financial services. High-demand service.'),

-- Services & Personal Care (Missing)
('Shoe Repair', 'Services & Personal Care', 1000, 500, 'Easy', 'Fix and maintain footwear. Affordable service business.'),
('Shoe Polish', 'Services & Personal Care', 200, 300, 'Easy', 'Shoe cleaning and polishing services.'),

-- Digital & Creative (Missing)
('Printing & Branding', 'Digital & Creative', 4000, 1000, 'Medium', 'Print business cards, banners, t-shirts, and promotional materials.'),
('Cyber Café', 'Digital & Creative', 5000, 900, 'Medium', 'Internet access, printing, and computer services.'),
('Online Store', 'Digital & Creative', 1500, 800, 'Easy', 'E-commerce platform selling products online.'),
('Drop-shipping', 'Digital & Creative', 500, 600, 'Easy', 'Sell products online without holding inventory.'),
('Delivery/Logistics Service', 'Digital & Creative', 2000, 700, 'Easy', 'Last-mile delivery for e-commerce and businesses.'),

-- Transport & Logistics (Missing)
('Bicycle/Motorcycle Taxi', 'Transport & Logistics', 1500, 600, 'Easy', 'Affordable passenger transport. Low startup cost.'),
('Courier Service', 'Transport & Logistics', 2500, 800, 'Easy', 'Deliver packages and documents. Express delivery business.'),

-- Green & Environmental (Missing)
('Organic Products', 'Green & Environmental', 3000, 900, 'Easy', 'Produce and sell organic goods. Health-conscious market.'),
('Tree Nursery', 'Green & Environmental', 2000, 700, 'Easy', 'Grow and sell seedlings and plants. Environmental business.'),

-- Health & Social Services (Missing)
('Tutoring/Education', 'Health & Social Services', 500, 600, 'Easy', 'Private lessons and academic support. Education service.')

ON CONFLICT (name, category) DO NOTHING;

-- =============================================
-- VERIFY THE INSERTS
-- =============================================

-- Show count by category
SELECT category, COUNT(*) as count
FROM business_types
GROUP BY category
ORDER BY category;

-- Show total count
SELECT COUNT(*) as total_business_types FROM business_types;

-- Show newly added businesses (if you want to verify)
SELECT name, category, startup_cost, difficulty 
FROM business_types 
WHERE name IN (
  'Dairy Farming', 'Agro-Input Shop', 'Fast Food Stand', 'Mobile Food Cart', 
  'Home Cooking Business', 'General Store/Kiosk', 'Mobile Money/Airtime Vendor',
  'Shoe Repair', 'Shoe Polish', 'Printing & Branding', 'Cyber Café', 
  'Online Store', 'Drop-shipping', 'Delivery/Logistics Service',
  'Bicycle/Motorcycle Taxi', 'Courier Service', 'Organic Products', 
  'Tree Nursery', 'Tutoring/Education'
)
ORDER BY category, name;
