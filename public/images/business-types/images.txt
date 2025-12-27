-- Update Business Types with Image URLs
-- Run this in Supabase SQL Editor after uploading images to public/images/business-types/
-- Image naming convention: kebab-case matching business name (e.g., poultry-farming.jpg)

-- =============================================
-- AGRICULTURE & FARMING
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/poultry-farming.jpg' WHERE name = 'Poultry Farming';
UPDATE business_types SET image_url = '/images/business-types/fish-farming.jpg' WHERE name = 'Fish Farming';
UPDATE business_types SET image_url = '/images/business-types/vegetable-farming.jpg' WHERE name = 'Vegetable Farming';
UPDATE business_types SET image_url = '/images/business-types/snail-farming.jpg' WHERE name = 'Snail Farming';
UPDATE business_types SET image_url = '/images/business-types/mushroom-farming.jpg' WHERE name = 'Mushroom Farming';
UPDATE business_types SET image_url = '/images/business-types/bee-keeping.jpg' WHERE name = 'Bee Keeping';
UPDATE business_types SET image_url = '/images/business-types/rabbit-farming.jpg' WHERE name = 'Rabbit Farming';
UPDATE business_types SET image_url = '/images/business-types/pig-farming.jpg' WHERE name = 'Pig Farming';
UPDATE business_types SET image_url = '/images/business-types/goat-farming.jpg' WHERE name = 'Goat Farming';
UPDATE business_types SET image_url = '/images/business-types/cattle-rearing.jpg' WHERE name = 'Cattle Rearing';
UPDATE business_types SET image_url = '/images/business-types/grasscutter-farming.jpg' WHERE name = 'Grasscutter Farming';
UPDATE business_types SET image_url = '/images/business-types/plantain-banana-farming.jpg' WHERE name = 'Plantain/Banana Farming';
UPDATE business_types SET image_url = '/images/business-types/cassava-processing.jpg' WHERE name = 'Cassava Processing';
UPDATE business_types SET image_url = '/images/business-types/rice-farming.jpg' WHERE name = 'Rice Farming';
UPDATE business_types SET image_url = '/images/business-types/palm-oil-production.jpg' WHERE name = 'Palm Oil Production';
UPDATE business_types SET image_url = '/images/business-types/dairy-farming.jpg' WHERE name = 'Dairy Farming';
UPDATE business_types SET image_url = '/images/business-types/agro-input-shop.jpg' WHERE name = 'Agro-Input Shop';

-- =============================================
-- FOOD PROCESSING & HOSPITALITY
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/restaurant-food-joint.jpg' WHERE name = 'Restaurant/Food Joint';
UPDATE business_types SET image_url = '/images/business-types/bakery.jpg' WHERE name = 'Bakery';
UPDATE business_types SET image_url = '/images/business-types/catering-services.jpg' WHERE name = 'Catering Services';
UPDATE business_types SET image_url = '/images/business-types/food-truck.jpg' WHERE name = 'Food Truck';
UPDATE business_types SET image_url = '/images/business-types/juice-smoothie-bar.jpg' WHERE name = 'Juice/Smoothie Bar';
UPDATE business_types SET image_url = '/images/business-types/ice-cream-shop.jpg' WHERE name = 'Ice Cream Shop';
UPDATE business_types SET image_url = '/images/business-types/coffee-shop.jpg' WHERE name = 'Coffee Shop';
UPDATE business_types SET image_url = '/images/business-types/fast-food.jpg' WHERE name = 'Fast Food';
UPDATE business_types SET image_url = '/images/business-types/grains-processing.jpg' WHERE name = 'Grains Processing';
UPDATE business_types SET image_url = '/images/business-types/spice-production.jpg' WHERE name = 'Spice Production';
UPDATE business_types SET image_url = '/images/business-types/snacks-production.jpg' WHERE name = 'Snacks Production';
UPDATE business_types SET image_url = '/images/business-types/bottled-water.jpg' WHERE name = 'Bottled Water';
UPDATE business_types SET image_url = '/images/business-types/food-preservation.jpg' WHERE name = 'Food Preservation';
UPDATE business_types SET image_url = '/images/business-types/fast-food-stand.jpg' WHERE name = 'Fast Food Stand';
UPDATE business_types SET image_url = '/images/business-types/mobile-food-cart.jpg' WHERE name = 'Mobile Food Cart';
UPDATE business_types SET image_url = '/images/business-types/home-cooking-business.jpg' WHERE name = 'Home Cooking Business';

-- =============================================
-- RETAIL & TRADING
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/mini-supermarket.jpg' WHERE name = 'Mini Supermarket';
UPDATE business_types SET image_url = '/images/business-types/boutique-clothing-store.jpg' WHERE name = 'Boutique/Clothing Store';
UPDATE business_types SET image_url = '/images/business-types/cosmetics-shop.jpg' WHERE name = 'Cosmetics Shop';
UPDATE business_types SET image_url = '/images/business-types/phone-accessories.jpg' WHERE name = 'Phone & Accessories';
UPDATE business_types SET image_url = '/images/business-types/bookshop.jpg' WHERE name = 'Bookshop';
UPDATE business_types SET image_url = '/images/business-types/stationery-shop.jpg' WHERE name = 'Stationery Shop';
UPDATE business_types SET image_url = '/images/business-types/pharmacy.jpg' WHERE name = 'Pharmacy';
UPDATE business_types SET image_url = '/images/business-types/electronics-hardware-store.jpg' WHERE name = 'Electronics/Hardware Store';
UPDATE business_types SET image_url = '/images/business-types/auto-parts-store.jpg' WHERE name = 'Auto Parts Store';
UPDATE business_types SET image_url = '/images/business-types/furniture-shop.jpg' WHERE name = 'Furniture Shop';
UPDATE business_types SET image_url = '/images/business-types/building-materials.jpg' WHERE name = 'Building Materials';
UPDATE business_types SET image_url = '/images/business-types/wholesale-trading.jpg' WHERE name = 'Wholesale Trading';
UPDATE business_types SET image_url = '/images/business-types/import-export.jpg' WHERE name = 'Import/Export';
UPDATE business_types SET image_url = '/images/business-types/printing-photocopy-shop.jpg' WHERE name = 'Printing & Photocopy Shop';
UPDATE business_types SET image_url = '/images/business-types/general-store-kiosk.jpg' WHERE name = 'General Store/Kiosk';
UPDATE business_types SET image_url = '/images/business-types/mobile-money-airtime-vendor.jpg' WHERE name = 'Mobile Money/Airtime Vendor';

-- =============================================
-- SERVICES & PERSONAL CARE
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/hair-salon.jpg' WHERE name = 'Hair Salon';
UPDATE business_types SET image_url = '/images/business-types/barber-shop.jpg' WHERE name = 'Barber Shop';
UPDATE business_types SET image_url = '/images/business-types/spa-massage.jpg' WHERE name = 'Spa & Massage';
UPDATE business_types SET image_url = '/images/business-types/makeup-artist.jpg' WHERE name = 'Makeup Artist';
UPDATE business_types SET image_url = '/images/business-types/nail-technician.jpg' WHERE name = 'Nail Technician';
UPDATE business_types SET image_url = '/images/business-types/tailoring.jpg' WHERE name = 'Tailoring';
UPDATE business_types SET image_url = '/images/business-types/fashion-design.jpg' WHERE name = 'Fashion Design';
UPDATE business_types SET image_url = '/images/business-types/laundry-dry-cleaning.jpg' WHERE name = 'Laundry/Dry Cleaning';
UPDATE business_types SET image_url = '/images/business-types/car-wash.jpg' WHERE name = 'Car Wash';
UPDATE business_types SET image_url = '/images/business-types/event-planning.jpg' WHERE name = 'Event Planning';
UPDATE business_types SET image_url = '/images/business-types/photography.jpg' WHERE name = 'Photography';
UPDATE business_types SET image_url = '/images/business-types/cleaning-services.jpg' WHERE name = 'Cleaning Services';
UPDATE business_types SET image_url = '/images/business-types/gardening.jpg' WHERE name = 'Gardening';
UPDATE business_types SET image_url = '/images/business-types/security-services.jpg' WHERE name = 'Security Services';
UPDATE business_types SET image_url = '/images/business-types/tutoring.jpg' WHERE name = 'Tutoring';
UPDATE business_types SET image_url = '/images/business-types/shoe-repair.jpg' WHERE name = 'Shoe Repair';
UPDATE business_types SET image_url = '/images/business-types/shoe-polish.jpg' WHERE name = 'Shoe Polish';

-- =============================================
-- MANUFACTURING & CRAFTS
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/furniture-making.jpg' WHERE name = 'Furniture Making';
UPDATE business_types SET image_url = '/images/business-types/welding-fabrication.jpg' WHERE name = 'Welding/Fabrication';
UPDATE business_types SET image_url = '/images/business-types/leather-works.jpg' WHERE name = 'Leather Works';
UPDATE business_types SET image_url = '/images/business-types/jewelry-making.jpg' WHERE name = 'Jewelry Making';
UPDATE business_types SET image_url = '/images/business-types/pottery-ceramics.jpg' WHERE name = 'Pottery/Ceramics';
UPDATE business_types SET image_url = '/images/business-types/candle-making.jpg' WHERE name = 'Candle Making';
UPDATE business_types SET image_url = '/images/business-types/soap-detergent-production.jpg' WHERE name = 'Soap/Detergent Production';
UPDATE business_types SET image_url = '/images/business-types/cosmetics-production.jpg' WHERE name = 'Cosmetics Production';
UPDATE business_types SET image_url = '/images/business-types/block-moulding.jpg' WHERE name = 'Block Moulding';
UPDATE business_types SET image_url = '/images/business-types/packaging-business.jpg' WHERE name = 'Packaging Business';
UPDATE business_types SET image_url = '/images/business-types/printing-press.jpg' WHERE name = 'Printing Press';
UPDATE business_types SET image_url = '/images/business-types/shoe-making.jpg' WHERE name = 'Shoe Making';
UPDATE business_types SET image_url = '/images/business-types/bag-making.jpg' WHERE name = 'Bag Making';
UPDATE business_types SET image_url = '/images/business-types/art-decor.jpg' WHERE name = 'Art & Decor';
UPDATE business_types SET image_url = '/images/business-types/textile-adire.jpg' WHERE name = 'Textile/Adire';

-- =============================================
-- DIGITAL & CREATIVE
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/web-development.jpg' WHERE name = 'Web Development';
UPDATE business_types SET image_url = '/images/business-types/graphic-design.jpg' WHERE name = 'Graphic Design';
UPDATE business_types SET image_url = '/images/business-types/social-media-management.jpg' WHERE name = 'Social Media Management';
UPDATE business_types SET image_url = '/images/business-types/content-creation.jpg' WHERE name = 'Content Creation';
UPDATE business_types SET image_url = '/images/business-types/video-production.jpg' WHERE name = 'Video Production';
UPDATE business_types SET image_url = '/images/business-types/computer-repair.jpg' WHERE name = 'Computer Repair';
UPDATE business_types SET image_url = '/images/business-types/it-training.jpg' WHERE name = 'IT Training';
UPDATE business_types SET image_url = '/images/business-types/e-commerce.jpg' WHERE name = 'E-commerce';
UPDATE business_types SET image_url = '/images/business-types/app-development.jpg' WHERE name = 'App Development';
UPDATE business_types SET image_url = '/images/business-types/digital-marketing.jpg' WHERE name = 'Digital Marketing';
UPDATE business_types SET image_url = '/images/business-types/online-tutoring.jpg' WHERE name = 'Online Tutoring';
UPDATE business_types SET image_url = '/images/business-types/podcast-production.jpg' WHERE name = 'Podcast Production';
UPDATE business_types SET image_url = '/images/business-types/printing-branding.jpg' WHERE name = 'Printing & Branding';
UPDATE business_types SET image_url = '/images/business-types/cyber-cafe.jpg' WHERE name = 'Cyber Café';
UPDATE business_types SET image_url = '/images/business-types/online-store.jpg' WHERE name = 'Online Store';
UPDATE business_types SET image_url = '/images/business-types/drop-shipping.jpg' WHERE name = 'Drop-shipping';
UPDATE business_types SET image_url = '/images/business-types/delivery-logistics-service.jpg' WHERE name = 'Delivery/Logistics Service';

-- =============================================
-- TRANSPORT & LOGISTICS
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/taxi-ride-sharing.jpg' WHERE name = 'Taxi/Ride Sharing';
UPDATE business_types SET image_url = '/images/business-types/delivery-services.jpg' WHERE name = 'Delivery Services';
UPDATE business_types SET image_url = '/images/business-types/trucking-haulage.jpg' WHERE name = 'Trucking/Haulage';
UPDATE business_types SET image_url = '/images/business-types/motorcycle-courier.jpg' WHERE name = 'Motorcycle Courier';
UPDATE business_types SET image_url = '/images/business-types/bus-transport.jpg' WHERE name = 'Bus Transport';
UPDATE business_types SET image_url = '/images/business-types/car-rental.jpg' WHERE name = 'Car Rental';
UPDATE business_types SET image_url = '/images/business-types/logistics-company.jpg' WHERE name = 'Logistics Company';
UPDATE business_types SET image_url = '/images/business-types/moving-services.jpg' WHERE name = 'Moving Services';
UPDATE business_types SET image_url = '/images/business-types/bicycle-motorcycle-taxi.jpg' WHERE name = 'Bicycle/Motorcycle Taxi';
UPDATE business_types SET image_url = '/images/business-types/courier-service.jpg' WHERE name = 'Courier Service';

-- =============================================
-- CONSTRUCTION & REAL ESTATE
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/building-construction.jpg' WHERE name = 'Building Construction';
UPDATE business_types SET image_url = '/images/business-types/plumbing-services.jpg' WHERE name = 'Plumbing Services';
UPDATE business_types SET image_url = '/images/business-types/electrical-services.jpg' WHERE name = 'Electrical Services';
UPDATE business_types SET image_url = '/images/business-types/painting-services.jpg' WHERE name = 'Painting Services';
UPDATE business_types SET image_url = '/images/business-types/interior-design.jpg' WHERE name = 'Interior Design';
UPDATE business_types SET image_url = '/images/business-types/property-management.jpg' WHERE name = 'Property Management';
UPDATE business_types SET image_url = '/images/business-types/real-estate-agency.jpg' WHERE name = 'Real Estate Agency';
UPDATE business_types SET image_url = '/images/business-types/masonry.jpg' WHERE name = 'Masonry';
UPDATE business_types SET image_url = '/images/business-types/tiling-services.jpg' WHERE name = 'Tiling Services';
UPDATE business_types SET image_url = '/images/business-types/roofing-services.jpg' WHERE name = 'Roofing Services';

-- =============================================
-- GREEN & ENVIRONMENTAL
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/recycling-business.jpg' WHERE name = 'Recycling Business';
UPDATE business_types SET image_url = '/images/business-types/solar-installation.jpg' WHERE name = 'Solar Installation';
UPDATE business_types SET image_url = '/images/business-types/organic-farming.jpg' WHERE name = 'Organic Farming';
UPDATE business_types SET image_url = '/images/business-types/waste-management.jpg' WHERE name = 'Waste Management';
UPDATE business_types SET image_url = '/images/business-types/water-treatment.jpg' WHERE name = 'Water Treatment';
UPDATE business_types SET image_url = '/images/business-types/environmental-consulting.jpg' WHERE name = 'Environmental Consulting';
UPDATE business_types SET image_url = '/images/business-types/composting.jpg' WHERE name = 'Composting';
UPDATE business_types SET image_url = '/images/business-types/green-energy-products.jpg' WHERE name = 'Green Energy Products';
UPDATE business_types SET image_url = '/images/business-types/organic-products.jpg' WHERE name = 'Organic Products';
UPDATE business_types SET image_url = '/images/business-types/tree-nursery.jpg' WHERE name = 'Tree Nursery';

-- =============================================
-- HEALTH & SOCIAL SERVICES
-- =============================================
UPDATE business_types SET image_url = '/images/business-types/clinic-health-center.jpg' WHERE name = 'Clinic/Health Center';
UPDATE business_types SET image_url = '/images/business-types/pharmacy-health.jpg' WHERE name = 'Pharmacy' AND category = 'Health & Social Services';
UPDATE business_types SET image_url = '/images/business-types/diagnostic-center.jpg' WHERE name = 'Diagnostic Center';
UPDATE business_types SET image_url = '/images/business-types/physiotherapy.jpg' WHERE name = 'Physiotherapy';
UPDATE business_types SET image_url = '/images/business-types/home-care-services.jpg' WHERE name = 'Home Care Services';
UPDATE business_types SET image_url = '/images/business-types/daycare-creche.jpg' WHERE name = 'Daycare/Creche';
UPDATE business_types SET image_url = '/images/business-types/elderly-care.jpg' WHERE name = 'Elderly Care';
UPDATE business_types SET image_url = '/images/business-types/fitness-center.jpg' WHERE name = 'Fitness Center';
UPDATE business_types SET image_url = '/images/business-types/nutrition-consulting.jpg' WHERE name = 'Nutrition Consulting';
UPDATE business_types SET image_url = '/images/business-types/tutoring-education.jpg' WHERE name = 'Tutoring/Education';

-- =============================================
-- VERIFY UPDATES
-- =============================================
SELECT name, category, image_url 
FROM business_types 
WHERE image_url IS NOT NULL
ORDER BY category, name;

SELECT COUNT(*) as businesses_with_images FROM business_types WHERE image_url IS NOT NULL;
SELECT COUNT(*) as businesses_without_images FROM business_types WHERE image_url IS NULL;
