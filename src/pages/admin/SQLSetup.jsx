import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Copy, CheckCircle2, ExternalLink, Shield, Database, AlertCircle } from 'lucide-react'

const SQL_SCHEMA = `-- BizStep Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- Dashboard: https://app.supabase.com/project/itegkamzyvjchhstmuao/sql

-- =============================================
-- 1. BUSINESS TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS business_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  startup_cost INTEGER NOT NULL,
  monthly_profit INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category)
);

-- =============================================
-- 2. USER BUSINESSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_businesses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type_id BIGINT REFERENCES business_types(id),
  name TEXT NOT NULL,
  budget DECIMAL(10,2),
  capex_budget DECIMAL(10,2),
  opex_budget DECIMAL(10,2),
  start_date DATE,
  expected_monthly_profit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. BUSINESS STEPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS business_steps (
  id BIGSERIAL PRIMARY KEY,
  business_type_id BIGINT REFERENCES business_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(10,2),
  video_url TEXT,
  order_index INTEGER NOT NULL,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. STEP PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS step_progress (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  step_id BIGINT REFERENCES business_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, step_id)
);

-- =============================================
-- 5. FINANCIAL RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS financial_records (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CAPEX', 'OPEX', 'Revenue')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. PERSONAL INCOME TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS personal_income (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('Monthly', 'Weekly', 'One-time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. PERSONAL EXPENSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS personal_expenses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. PERSONAL BUDGETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS personal_budgets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);

-- =============================================
-- 9. SAVINGS GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. LENDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lenders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  max_amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term TEXT NOT NULL,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. LOAN APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS loan_applications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lender_id BIGINT REFERENCES lenders(id),
  amount DECIMAL(10,2) NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Business Types (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view business types" ON business_types;
CREATE POLICY "Anyone can view business types"
  ON business_types FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - User Businesses
-- =============================================
DROP POLICY IF EXISTS "Users can view their own businesses" ON user_businesses;
CREATE POLICY "Users can view their own businesses"
  ON user_businesses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own businesses" ON user_businesses;
CREATE POLICY "Users can insert their own businesses"
  ON user_businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own businesses" ON user_businesses;
CREATE POLICY "Users can update their own businesses"
  ON user_businesses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own businesses" ON user_businesses;
CREATE POLICY "Users can delete their own businesses"
  ON user_businesses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Business Steps (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view business steps" ON business_steps;
CREATE POLICY "Anyone can view business steps"
  ON business_steps FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - Step Progress
-- =============================================
DROP POLICY IF EXISTS "Users can view their own step progress" ON step_progress;
CREATE POLICY "Users can view their own step progress"
  ON step_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = step_progress.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own step progress" ON step_progress;
CREATE POLICY "Users can insert their own step progress"
  ON step_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = step_progress.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own step progress" ON step_progress;
CREATE POLICY "Users can update their own step progress"
  ON step_progress FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = step_progress.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Financial Records
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own financial records" ON financial_records;
CREATE POLICY "Users can manage their own financial records"
  ON financial_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Personal Finance
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own income" ON personal_income;
CREATE POLICY "Users can manage their own income"
  ON personal_income FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own expenses" ON personal_expenses;
CREATE POLICY "Users can manage their own expenses"
  ON personal_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own budgets" ON personal_budgets;
CREATE POLICY "Users can manage their own budgets"
  ON personal_budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own savings goals" ON savings_goals;
CREATE POLICY "Users can manage their own savings goals"
  ON savings_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Lenders (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view lenders" ON lenders;
CREATE POLICY "Anyone can view lenders"
  ON lenders FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - Loan Applications
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own loan applications" ON loan_applications;
CREATE POLICY "Users can manage their own loan applications"
  ON loan_applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_businesses_user_id ON user_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_business_steps_business_type_id ON business_steps(business_type_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_user_business_id ON step_progress(user_business_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_user_business_id ON financial_records(user_business_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_personal_income_user_id ON personal_income(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_user_id ON personal_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_date ON personal_expenses(date);
CREATE INDEX IF NOT EXISTS idx_personal_budgets_user_id ON personal_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);`

const ADMIN_SQL = `-- Create Admin Users
-- Run this AFTER users have registered through the app

-- Make a user an admin (replace email)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bizstep.com';

-- Verify the update
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'admin@bizstep.com';`

const CLEANUP_SQL = `-- Cleanup Duplicate Business Types
-- Run this FIRST if you have duplicates

-- Show duplicates
SELECT name, category, COUNT(*) as count
FROM business_types
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- Delete duplicates, keeping the one with lowest ID
DELETE FROM business_types
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY id) as row_num
    FROM business_types
  ) t
  WHERE t.row_num > 1
);

-- Verify - should return no rows
SELECT name, category, COUNT(*) as count
FROM business_types
GROUP BY name, category
HAVING COUNT(*) > 1;`

const SEED_SQL = `-- Seed Business Types Data
-- Run this AFTER creating the database schema
-- This inserts all 119 business types into the database

-- Add unique constraint to prevent duplicates
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

SELECT COUNT(*) as total_business_types FROM business_types;`

export function SQLSetup() {
  const [copied, setCopied] = useState(false)
  const [copiedAdmin, setCopiedAdmin] = useState(false)
  const [copiedSeed, setCopiedSeed] = useState(false)
  const [copiedCleanup, setCopiedCleanup] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAdminSQL = () => {
    navigator.clipboard.writeText(ADMIN_SQL)
    setCopiedAdmin(true)
    setTimeout(() => setCopiedAdmin(false), 2000)
  }

  const copySeedSQL = () => {
    navigator.clipboard.writeText(SEED_SQL)
    setCopiedSeed(true)
    setTimeout(() => setCopiedSeed(false), 2000)
  }

  const copyCleanupSQL = () => {
    navigator.clipboard.writeText(CLEANUP_SQL)
    setCopiedCleanup(true)
    setTimeout(() => setCopiedCleanup(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          SQL Database Setup
        </h1>
        <p className="text-slate-600">
          Copy and paste this SQL schema into your Supabase SQL Editor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">11</div>
            <div className="text-sm text-slate-600">Database Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
            <div className="text-sm text-slate-600">Row Level Security</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">11</div>
            <div className="text-sm text-slate-600">Performance Indexes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complete Database Schema</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={copyToClipboard}
                variant={copied ? 'secondary' : 'primary'}
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy SQL</span>
                  </>
                )}
              </Button>
              <a
                href="https://app.supabase.com/project/itegkamzyvjchhstmuao/sql"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Open SQL Editor</span>
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-100 font-mono whitespace-pre">
              {SQL_SCHEMA}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📚 Complete Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Step-by-Step Setup:</h3>
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                  <div>
                    <strong>Copy & Run Database Schema</strong>
                    <p className="text-slate-600 mt-1">Click "Copy SQL" above, paste in Supabase SQL Editor, and run to create all 11 tables</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                  <div>
                    <strong>Seed Business Types</strong>
                    <p className="text-slate-600 mt-1">Copy the seed SQL below and run it to insert 119 business types across 10 categories</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                  <div>
                    <strong>Create Admin User</strong>
                    <p className="text-slate-600 mt-1">Register a user, then run the admin SQL below to upgrade them to admin role</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">4</span>
                  <div>
                    <strong>Test & Verify</strong>
                    <p className="text-slate-600 mt-1">Go to "Test Supabase" to verify connection and data</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-900 mb-3">✨ Dynamic Features:</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div>
                    <strong>Categories are dynamic</strong> - Automatically extracted from business types, no separate category table needed
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div>
                    <strong>Create categories on-the-fly</strong> - Add new categories when creating business types or via Manage Categories page
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div>
                    <strong>Rename categories</strong> - Updates all business types automatically
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div>
                    <strong>Protected deletes</strong> - Can't delete categories that are in use
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Safe to Re-run</h3>
            <p className="text-sm text-yellow-800">
              This SQL uses <code className="bg-yellow-100 px-1 rounded">IF NOT EXISTS</code> and <code className="bg-yellow-100 px-1 rounded">DROP POLICY IF EXISTS</code> 
              so it's safe to run multiple times. It will update policies but won't delete your data.
            </p>
          </div>
        </div>
      </div>

      {/* Admin User Creation */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Create Admin Users</CardTitle>
            </div>
            <Button
              onClick={copyAdminSQL}
              variant={copiedAdmin ? 'secondary' : 'primary'}
              size="sm"
              className="flex items-center space-x-2"
            >
              {copiedAdmin ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy SQL</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">
              Run this SQL to upgrade a registered user to admin role. User must register through the app first.
            </p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-100 font-mono whitespace-pre">
              {ADMIN_SQL}
            </pre>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Steps:</strong> 1) User registers at /register → 2) Run SQL above → 3) User logs out and back in
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Duplicates */}
      <Card className="mt-6 border-2 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">⚠️ Cleanup Duplicates (If Needed)</CardTitle>
            </div>
            <Button
              onClick={copyCleanupSQL}
              variant={copiedCleanup ? 'secondary' : 'primary'}
              size="sm"
              className="flex items-center space-x-2"
            >
              {copiedCleanup ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Cleanup SQL</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 mb-2">
              <strong>Run this ONLY if you see duplicate business types.</strong>
            </p>
            <p className="text-sm text-red-700">
              This will remove all duplicates, keeping only one copy of each business type.
            </p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-64">
            <pre className="text-sm text-slate-100 font-mono whitespace-pre">
              {CLEANUP_SQL}
            </pre>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>After cleanup:</strong> Run the seed SQL below to add the unique constraint and prevent future duplicates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seed Business Types */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <CardTitle>Seed Business Types (119 Records)</CardTitle>
            </div>
            <a
              href="https://app.supabase.com/project/itegkamzyvjchhstmuao/sql"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Open SQL Editor</span>
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Run this AFTER creating the schema to populate the database with all 119 business types across 10 categories.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>✓ Duplicate Prevention:</strong> This SQL adds a unique constraint and uses <code className="bg-blue-100 px-1 rounded">ON CONFLICT</code> to prevent duplicates. Safe to run multiple times!
                </p>
              </div>
            </div>
            <Button
              onClick={copySeedSQL}
              variant={copiedSeed ? 'secondary' : 'primary'}
              size="sm"
              className="flex items-center space-x-2 mb-4"
            >
              {copiedSeed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Seed SQL</span>
                </>
              )}
            </Button>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
              <pre className="text-sm text-slate-100 font-mono whitespace-pre">
                {SEED_SQL}
              </pre>
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 mb-2">
                <strong>Includes:</strong> All 119 business types with startup costs, monthly profits, difficulty levels, and descriptions
              </p>
              <p className="text-sm text-green-700">
                <strong>Protection:</strong> Unique constraint on (name, category) prevents duplicate entries
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">119</div>
                <div className="text-xs text-slate-600">Business Types</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-xs text-slate-600">Categories</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">✓</div>
                <div className="text-xs text-slate-600">Ready to Use</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
