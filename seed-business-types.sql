-- Seed Business Types Data
-- Run this AFTER creating the database schema
-- This inserts all 119 business types into the database

-- =============================================
-- ADD UNIQUE CONSTRAINT (if not exists)
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'business_types_name_category_key'
  ) THEN
    ALTER TABLE business_types 
    ADD CONSTRAINT business_types_name_category_key 
    UNIQUE (name, category);
  END IF;
END $$;

-- =============================================
-- INSERT BUSINESS TYPES
-- =============================================

INSERT INTO business_types (name, category, startup_cost, monthly_profit, difficulty, description) VALUES
-- Agriculture & Farming
('Poultry Farming', 'Agriculture & Farming', 5000, 1200, 'Medium', 'Raise chickens for eggs and meat production'),
('Fish Farming', 'Agriculture & Farming', 8000, 1500, 'Medium', 'Aquaculture business for commercial fish production'),
('Vegetable Farming', 'Agriculture & Farming', 2000, 800, 'Easy', 'Grow and sell fresh vegetables'),
('Snail Farming', 'Agriculture & Farming', 1500, 600, 'Easy', 'Breed snails for food and export'),
('Mushroom Farming', 'Agriculture & Farming', 2000, 700, 'Medium', 'Cultivate mushrooms for sale'),
('Bee Keeping', 'Agriculture & Farming', 3000, 900, 'Medium', 'Produce honey and beeswax products'),
('Rabbit Farming', 'Agriculture & Farming', 2500, 750, 'Easy', 'Breed rabbits for meat and fur'),
('Pig Farming', 'Agriculture & Farming', 6000, 1400, 'Medium', 'Raise pigs for pork production'),
('Goat Farming', 'Agriculture & Farming', 4000, 1000, 'Medium', 'Breed goats for meat and milk'),
('Cattle Rearing', 'Agriculture & Farming', 15000, 2500, 'Hard', 'Raise cattle for beef and dairy'),
('Grasscutter Farming', 'Agriculture & Farming', 2000, 650, 'Easy', 'Breed grasscutters for meat'),
('Plantain/Banana Farming', 'Agriculture & Farming', 3000, 900, 'Easy', 'Cultivate plantain and banana crops'),
('Cassava Processing', 'Agriculture & Farming', 4000, 1100, 'Medium', 'Process cassava into garri and flour'),
('Rice Farming', 'Agriculture & Farming', 5000, 1200, 'Medium', 'Cultivate rice for commercial sale'),
('Palm Oil Production', 'Agriculture & Farming', 8000, 1800, 'Hard', 'Process palm fruits into oil'),

-- Food Processing & Hospitality
('Restaurant/Food Joint', 'Food Processing & Hospitality', 5000, 1500, 'Medium', 'Serve meals and refreshments'),
('Bakery', 'Food Processing & Hospitality', 6000, 1400, 'Medium', 'Bake and sell bread, cakes, and pastries'),
('Catering Services', 'Food Processing & Hospitality', 3000, 1200, 'Easy', 'Provide food for events and parties'),
('Food Truck', 'Food Processing & Hospitality', 8000, 1800, 'Medium', 'Mobile food service business'),
('Juice/Smoothie Bar', 'Food Processing & Hospitality', 3500, 1000, 'Easy', 'Serve fresh juices and smoothies'),
('Ice Cream Shop', 'Food Processing & Hospitality', 4000, 1100, 'Easy', 'Sell ice cream and frozen treats'),
('Coffee Shop', 'Food Processing & Hospitality', 5000, 1300, 'Medium', 'Serve coffee and light refreshments'),
('Fast Food', 'Food Processing & Hospitality', 7000, 1600, 'Medium', 'Quick service restaurant'),
('Grains Processing', 'Food Processing & Hospitality', 4500, 1000, 'Medium', 'Process and package grains'),
('Spice Production', 'Food Processing & Hospitality', 2000, 700, 'Easy', 'Produce and package spices'),
('Snacks Production', 'Food Processing & Hospitality', 2500, 800, 'Easy', 'Make and sell packaged snacks'),
('Bottled Water', 'Food Processing & Hospitality', 10000, 2000, 'Hard', 'Bottle and distribute water'),
('Food Preservation', 'Food Processing & Hospitality', 3000, 850, 'Medium', 'Preserve and package food items'),

-- Retail & Trading
('Mini Supermarket', 'Retail & Trading', 10000, 2000, 'Medium', 'Sell groceries and household items'),
('Boutique/Clothing Store', 'Retail & Trading', 5000, 1200, 'Easy', 'Sell fashion and clothing items'),
('Cosmetics Shop', 'Retail & Trading', 4000, 1000, 'Easy', 'Retail beauty and cosmetic products'),
('Phone & Accessories', 'Retail & Trading', 3500, 900, 'Easy', 'Sell phones and accessories'),
('Bookshop', 'Retail & Trading', 4000, 800, 'Easy', 'Sell books and educational materials'),
('Stationery Shop', 'Retail & Trading', 3000, 750, 'Easy', 'Sell office and school supplies'),
('Pharmacy', 'Retail & Trading', 15000, 2500, 'Hard', 'Dispense medications and health products'),
('Electronics/Hardware Store', 'Retail & Trading', 10000, 1800, 'Medium', 'Sell electronics and hardware'),
('Auto Parts Store', 'Retail & Trading', 8000, 1500, 'Medium', 'Sell vehicle parts and accessories'),
('Furniture Shop', 'Retail & Trading', 12000, 2200, 'Medium', 'Sell home and office furniture'),
('Building Materials', 'Retail & Trading', 20000, 3000, 'Hard', 'Sell construction materials'),
('Wholesale Trading', 'Retail & Trading', 15000, 2500, 'Medium', 'Buy and sell goods in bulk'),
('Import/Export', 'Retail & Trading', 25000, 4000, 'Hard', 'International trade business'),
('Printing & Photocopy Shop', 'Retail & Trading', 3500, 850, 'Easy', 'Printing and document services'),

-- Services & Personal Care
('Hair Salon', 'Services & Personal Care', 3000, 1000, 'Easy', 'Hair styling and treatment services'),
('Barber Shop', 'Services & Personal Care', 2500, 800, 'Easy', 'Men''s grooming services'),
('Spa & Massage', 'Services & Personal Care', 5000, 1300, 'Medium', 'Relaxation and wellness services'),
('Makeup Artist', 'Services & Personal Care', 2000, 900, 'Easy', 'Professional makeup services'),
('Nail Technician', 'Services & Personal Care', 1500, 700, 'Easy', 'Manicure and pedicure services'),
('Tailoring', 'Services & Personal Care', 2000, 700, 'Easy', 'Sewing and alterations'),
('Fashion Design', 'Services & Personal Care', 3500, 1100, 'Medium', 'Custom clothing design'),
('Laundry/Dry Cleaning', 'Services & Personal Care', 4000, 1000, 'Medium', 'Clothes cleaning services'),
('Car Wash', 'Services & Personal Care', 3000, 900, 'Easy', 'Vehicle cleaning services'),
('Event Planning', 'Services & Personal Care', 2000, 1200, 'Easy', 'Organize events and parties'),
('Photography', 'Services & Personal Care', 4000, 1100, 'Medium', 'Professional photography services'),
('Cleaning Services', 'Services & Personal Care', 1500, 800, 'Easy', 'Home and office cleaning'),
('Gardening', 'Services & Personal Care', 2000, 750, 'Easy', 'Landscaping and garden maintenance'),
('Security Services', 'Services & Personal Care', 5000, 1500, 'Medium', 'Provide security personnel'),
('Tutoring', 'Services & Personal Care', 500, 600, 'Easy', 'Educational tutoring services'),

-- Manufacturing & Crafts
('Furniture Making', 'Manufacturing & Crafts', 5000, 1200, 'Medium', 'Craft custom furniture'),
('Welding/Fabrication', 'Manufacturing & Crafts', 4000, 1000, 'Medium', 'Metal fabrication services'),
('Leather Works', 'Manufacturing & Crafts', 3000, 900, 'Medium', 'Create leather products'),
('Jewelry Making', 'Manufacturing & Crafts', 2500, 850, 'Easy', 'Design and craft jewelry'),
('Pottery/Ceramics', 'Manufacturing & Crafts', 2000, 700, 'Medium', 'Create ceramic products'),
('Candle Making', 'Manufacturing & Crafts', 1500, 600, 'Easy', 'Produce decorative candles'),
('Soap/Detergent Production', 'Manufacturing & Crafts', 2500, 800, 'Easy', 'Manufacture cleaning products'),
('Cosmetics Production', 'Manufacturing & Crafts', 3000, 900, 'Medium', 'Produce beauty products'),
('Block Moulding', 'Manufacturing & Crafts', 4000, 1000, 'Medium', 'Manufacture building blocks'),
('Packaging Business', 'Manufacturing & Crafts', 3500, 850, 'Medium', 'Produce packaging materials'),
('Printing Press', 'Manufacturing & Crafts', 8000, 1500, 'Hard', 'Commercial printing services'),
('Shoe Making', 'Manufacturing & Crafts', 3000, 900, 'Medium', 'Craft custom footwear'),
('Bag Making', 'Manufacturing & Crafts', 2500, 800, 'Easy', 'Produce bags and purses'),
('Art & Decor', 'Manufacturing & Crafts', 1500, 700, 'Easy', 'Create decorative art pieces'),
('Textile/Adire', 'Manufacturing & Crafts', 2000, 750, 'Easy', 'Produce traditional textiles'),

-- Digital & Creative
('Web Development', 'Digital & Creative', 1000, 1500, 'Medium', 'Build websites and web apps'),
('Graphic Design', 'Digital & Creative', 1500, 1000, 'Easy', 'Create visual designs'),
('Social Media Management', 'Digital & Creative', 500, 800, 'Easy', 'Manage social media accounts'),
('Content Creation', 'Digital & Creative', 1000, 900, 'Easy', 'Create digital content'),
('Video Production', 'Digital & Creative', 5000, 1400, 'Medium', 'Produce video content'),
('Computer Repair', 'Digital & Creative', 3000, 900, 'Medium', 'Fix computers and devices'),
('IT Training', 'Digital & Creative', 3500, 1100, 'Medium', 'Teach technology skills'),
('E-commerce', 'Digital & Creative', 2000, 1200, 'Easy', 'Sell products online'),
('App Development', 'Digital & Creative', 2000, 2000, 'Hard', 'Build mobile applications'),
('Digital Marketing', 'Digital & Creative', 1000, 1100, 'Easy', 'Online marketing services'),
('Online Tutoring', 'Digital & Creative', 500, 700, 'Easy', 'Teach online courses'),
('Podcast Production', 'Digital & Creative', 2000, 800, 'Medium', 'Produce podcast content'),

-- Transport & Logistics
('Taxi/Ride Sharing', 'Transport & Logistics', 8000, 1200, 'Medium', 'Passenger transportation'),
('Delivery Services', 'Transport & Logistics', 3000, 900, 'Easy', 'Package delivery business'),
('Trucking/Haulage', 'Transport & Logistics', 25000, 3500, 'Hard', 'Heavy goods transportation'),
('Motorcycle Courier', 'Transport & Logistics', 2000, 700, 'Easy', 'Fast delivery service'),
('Bus Transport', 'Transport & Logistics', 30000, 4000, 'Hard', 'Public transportation service'),
('Car Rental', 'Transport & Logistics', 20000, 2500, 'Medium', 'Vehicle rental service'),
('Logistics Company', 'Transport & Logistics', 15000, 2000, 'Hard', 'Supply chain management'),
('Moving Services', 'Transport & Logistics', 5000, 1100, 'Medium', 'Relocation services'),

-- Construction & Real Estate
('Building Construction', 'Construction & Real Estate', 20000, 3500, 'Hard', 'Construction services'),
('Plumbing Services', 'Construction & Real Estate', 3000, 900, 'Medium', 'Plumbing installation and repair'),
('Electrical Services', 'Construction & Real Estate', 3500, 1000, 'Medium', 'Electrical work'),
('Painting Services', 'Construction & Real Estate', 2000, 800, 'Easy', 'Interior and exterior painting'),
('Interior Design', 'Construction & Real Estate', 5000, 1300, 'Medium', 'Space design services'),
('Property Management', 'Construction & Real Estate', 5000, 1500, 'Medium', 'Manage rental properties'),
('Real Estate Agency', 'Construction & Real Estate', 3000, 2000, 'Easy', 'Property sales and rentals'),
('Masonry', 'Construction & Real Estate', 3000, 1000, 'Medium', 'Bricklaying services'),
('Tiling Services', 'Construction & Real Estate', 2500, 900, 'Easy', 'Floor and wall tiling'),
('Roofing Services', 'Construction & Real Estate', 4000, 1100, 'Medium', 'Roof installation and repair'),

-- Green & Environmental
('Recycling Business', 'Green & Environmental', 5000, 1200, 'Medium', 'Waste recycling services'),
('Solar Installation', 'Green & Environmental', 10000, 2000, 'Hard', 'Install solar energy systems'),
('Organic Farming', 'Green & Environmental', 4000, 1100, 'Medium', 'Chemical-free agriculture'),
('Waste Management', 'Green & Environmental', 8000, 1500, 'Medium', 'Waste collection and disposal'),
('Water Treatment', 'Green & Environmental', 12000, 2200, 'Hard', 'Water purification services'),
('Environmental Consulting', 'Green & Environmental', 2000, 1000, 'Easy', 'Environmental advisory'),
('Composting', 'Green & Environmental', 3000, 800, 'Easy', 'Organic waste composting'),
('Green Energy Products', 'Green & Environmental', 6000, 1300, 'Medium', 'Sell eco-friendly products'),

-- Health & Social Services
('Clinic/Health Center', 'Health & Social Services', 30000, 5000, 'Hard', 'Medical care facility'),
('Pharmacy', 'Health & Social Services', 15000, 2500, 'Hard', 'Dispense medications'),
('Diagnostic Center', 'Health & Social Services', 50000, 6000, 'Hard', 'Medical testing facility'),
('Physiotherapy', 'Health & Social Services', 8000, 1800, 'Medium', 'Physical therapy services'),
('Home Care Services', 'Health & Social Services', 3000, 1200, 'Easy', 'In-home care for patients'),
('Daycare/Creche', 'Health & Social Services', 5000, 1500, 'Medium', 'Childcare services'),
('Elderly Care', 'Health & Social Services', 6000, 1400, 'Medium', 'Care for senior citizens'),
('Fitness Center', 'Health & Social Services', 10000, 2000, 'Medium', 'Gym and fitness facility'),
('Nutrition Consulting', 'Health & Social Services', 1500, 900, 'Easy', 'Dietary advice services')

ON CONFLICT (name, category) DO NOTHING;

-- Verify the insert
SELECT category, COUNT(*) as count
FROM business_types
GROUP BY category
ORDER BY category;

SELECT COUNT(*) as total_business_types FROM business_types;
