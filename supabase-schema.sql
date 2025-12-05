-- BizStep Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- 0. USER PROFILES TABLE (Country, Currency, Phone)
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone TEXT,
  country_code CHAR(2) DEFAULT 'US',
  currency_code CHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
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
-- RLS POLICIES - User Profiles
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Business Types (Public Read)
-- =============================================
CREATE POLICY "Anyone can view business types"
  ON business_types FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - User Businesses
-- =============================================
CREATE POLICY "Users can view their own businesses"
  ON user_businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses"
  ON user_businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
  ON user_businesses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
  ON user_businesses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Business Steps (Public Read)
-- =============================================
CREATE POLICY "Anyone can view business steps"
  ON business_steps FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - Step Progress
-- =============================================
CREATE POLICY "Users can view their own step progress"
  ON step_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = step_progress.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own step progress"
  ON step_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = step_progress.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

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
CREATE POLICY "Users can view their own financial records"
  ON financial_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own financial records"
  ON financial_records FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own financial records"
  ON financial_records FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own financial records"
  ON financial_records FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = financial_records.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Personal Income
-- =============================================
CREATE POLICY "Users can manage their own income"
  ON personal_income FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Personal Expenses
-- =============================================
CREATE POLICY "Users can manage their own expenses"
  ON personal_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Personal Budgets
-- =============================================
CREATE POLICY "Users can manage their own budgets"
  ON personal_budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Savings Goals
-- =============================================
CREATE POLICY "Users can manage their own savings goals"
  ON savings_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Lenders (Public Read)
-- =============================================
CREATE POLICY "Anyone can view lenders"
  ON lenders FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - Loan Applications
-- =============================================
CREATE POLICY "Users can manage their own loan applications"
  ON loan_applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
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
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);

-- =============================================
-- SEED DATA - Insert the 119 Business Types
-- =============================================
-- This will be inserted via a separate script or manually
-- See: seed-business-types.sql
