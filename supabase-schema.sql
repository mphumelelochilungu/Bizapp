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
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add profile_completed column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'profile_completed') THEN
    ALTER TABLE user_profiles ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

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
  -- Overview fields
  overview_content TEXT,
  overview_video_url TEXT,
  overview_web_url TEXT,
  overview_pdf_url TEXT,
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
  phase TEXT NOT NULL DEFAULT 'Launch & Operations' CHECK (phase IN ('Market Research', 'Licenses & Registration', 'Setup Location', 'Marketing & Branding', 'Launch & Operations')),
  title TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(10,2),
  video_url TEXT,
  supplier_url TEXT,
  supplier_name TEXT,
  order_index INTEGER NOT NULL,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. COUNTRY LICENSING AUTHORITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS country_authorities (
  id BIGSERIAL PRIMARY KEY,
  country_code CHAR(2) NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  authority_name TEXT NOT NULL,
  authority_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. STEP PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS step_progress (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  step_id BIGINT REFERENCES business_steps(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  step_title TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  checklist_status JSONB,
  actual_cost DECIMAL(10,2),
  expense_type TEXT CHECK (expense_type IN ('CAPEX', 'OPEX')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, step_number)
);

-- Add new columns if they don't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'step_number') THEN
    ALTER TABLE step_progress ADD COLUMN step_number INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'step_title') THEN
    ALTER TABLE step_progress ADD COLUMN step_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'notes') THEN
    ALTER TABLE step_progress ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'checklist_status') THEN
    ALTER TABLE step_progress ADD COLUMN checklist_status JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'actual_cost') THEN
    ALTER TABLE step_progress ADD COLUMN actual_cost DECIMAL(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'expense_type') THEN
    ALTER TABLE step_progress ADD COLUMN expense_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'step_progress' AND column_name = 'updated_at') THEN
    ALTER TABLE step_progress ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

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
-- 12. APP SETTINGS TABLE (Admin-managed settings)
-- =============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
ALTER TABLE country_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

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
-- RLS POLICIES - Business Types (Public Read, Admin Write)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view business types" ON business_types;
CREATE POLICY "Anyone can view business types"
  ON business_types FOR SELECT
  TO authenticated, anon
  USING (true);

-- Admin policies for business_types (authenticated users can manage)
DROP POLICY IF EXISTS "Authenticated users can insert business types" ON business_types;
CREATE POLICY "Authenticated users can insert business types"
  ON business_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update business types" ON business_types;
CREATE POLICY "Authenticated users can update business types"
  ON business_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete business types" ON business_types;
CREATE POLICY "Authenticated users can delete business types"
  ON business_types FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - Business Steps (Public Read, Admin Write)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert business steps" ON business_steps;
CREATE POLICY "Authenticated users can insert business steps"
  ON business_steps FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update business steps" ON business_steps;
CREATE POLICY "Authenticated users can update business steps"
  ON business_steps FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete business steps" ON business_steps;
CREATE POLICY "Authenticated users can delete business steps"
  ON business_steps FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - Country Authorities (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view country authorities" ON country_authorities;
CREATE POLICY "Anyone can view country authorities"
  ON country_authorities FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage country authorities" ON country_authorities;
CREATE POLICY "Authenticated users can manage country authorities"
  ON country_authorities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- RLS POLICIES - User Businesses
-- =============================================
DROP POLICY IF EXISTS "Users can view their own businesses" ON user_businesses;
DROP POLICY IF EXISTS "Users can insert their own businesses" ON user_businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON user_businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON user_businesses;

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
DROP POLICY IF EXISTS "Anyone can view business steps" ON business_steps;
CREATE POLICY "Anyone can view business steps"
  ON business_steps FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- RLS POLICIES - Step Progress
-- =============================================
DROP POLICY IF EXISTS "Users can view their own step progress" ON step_progress;
DROP POLICY IF EXISTS "Users can insert their own step progress" ON step_progress;
DROP POLICY IF EXISTS "Users can update their own step progress" ON step_progress;

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
DROP POLICY IF EXISTS "Users can view their own financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can insert their own financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can update their own financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can delete their own financial records" ON financial_records;

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
DROP POLICY IF EXISTS "Users can manage their own income" ON personal_income;
CREATE POLICY "Users can manage their own income"
  ON personal_income FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Personal Expenses
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own expenses" ON personal_expenses;
CREATE POLICY "Users can manage their own expenses"
  ON personal_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Personal Budgets
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own budgets" ON personal_budgets;
CREATE POLICY "Users can manage their own budgets"
  ON personal_budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Savings Goals
-- =============================================
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
-- RLS POLICIES - App Settings (Public read, Admin write)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view app settings" ON app_settings;
CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage app settings" ON app_settings;
CREATE POLICY "Authenticated users can manage app settings"
  ON app_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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
-- MIGRATION: Add overview fields to business_types (for existing databases)
-- =============================================
ALTER TABLE business_types ADD COLUMN IF NOT EXISTS overview_content TEXT;
ALTER TABLE business_types ADD COLUMN IF NOT EXISTS overview_video_url TEXT;
ALTER TABLE business_types ADD COLUMN IF NOT EXISTS overview_web_url TEXT;
ALTER TABLE business_types ADD COLUMN IF NOT EXISTS overview_pdf_url TEXT;

-- =============================================
-- MIGRATION: Add phase and supplier fields to business_steps (for existing databases)
-- =============================================
ALTER TABLE business_steps ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'Launch & Operations';
ALTER TABLE business_steps ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE business_steps ADD COLUMN IF NOT EXISTS supplier_url TEXT;

-- =============================================
-- DOUBLE-ENTRY ACCOUNTING TABLES
-- =============================================

-- ACCOUNT TYPE CONFIGURATION (numbering ranges and display info)
CREATE TABLE IF NOT EXISTS account_type_config (
  id BIGSERIAL PRIMARY KEY,
  account_type TEXT NOT NULL UNIQUE CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense')),
  number_range_start INTEGER NOT NULL,
  number_range_end INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default account type configurations
INSERT INTO account_type_config (account_type, number_range_start, number_range_end, display_name, description, display_order) VALUES
('Asset', 1000, 1999, 'Assets', 'What the business owns or controls', 1),
('Liability', 2000, 2999, 'Liabilities', 'What the business owes', 2),
('Equity', 3000, 3999, 'Equity', 'Owner''s claim on the business', 3),
('Revenue', 4000, 4999, 'Revenue', 'Money earned from normal operations', 4),
('COGS', 5000, 5999, 'Cost of Goods Sold', 'Direct costs to produce goods/services', 5),
('Expense', 6000, 6999, 'Expenses', 'Costs incurred to run the business', 6),
('Other Income', 7000, 7499, 'Other Income', 'Non-core income activities', 7),
('Other Expense', 7500, 7999, 'Other Expenses', 'Non-core expense activities', 8)
ON CONFLICT (account_type) DO NOTHING;

-- ACCOUNT SUBCATEGORIES (for organizing chart of accounts)
CREATE TABLE IF NOT EXISTS account_subcategories (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense')),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, account_type, name)
);

-- CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense')),
  subcategory TEXT,
  parent_id BIGINT REFERENCES accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, code)
);

-- JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT NOT NULL,
  is_posted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOURNAL ENTRY LINES
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id BIGSERIAL PRIMARY KEY,
  journal_entry_id BIGINT REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
  debit_amount DECIMAL(12,2) DEFAULT 0,
  credit_amount DECIMAL(12,2) DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT debit_or_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0) OR
    (debit_amount = 0 AND credit_amount = 0)
  )
);

-- =============================================
-- TAX SYSTEM TABLES
-- =============================================

-- TAX RATES CONFIGURATION
CREATE TABLE IF NOT EXISTS tax_rates (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('sales_tax', 'income_tax', 'withholding_tax', 'payroll_tax', 'other')),
  rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  effective_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, name)
);

-- TAX TRANSACTIONS (linked to journal entries)
CREATE TABLE IF NOT EXISTS tax_transactions (
  id BIGSERIAL PRIMARY KEY,
  journal_entry_id BIGINT REFERENCES journal_entries(id) ON DELETE CASCADE,
  tax_rate_id BIGINT REFERENCES tax_rates(id) ON DELETE SET NULL,
  tax_type TEXT NOT NULL,
  taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TAX PERIODS (for tracking and filing)
CREATE TABLE IF NOT EXISTS tax_periods (
  id BIGSERIAL PRIMARY KEY,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL,
  period_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filed', 'paid')),
  total_tax_collected DECIMAL(12,2) DEFAULT 0,
  total_tax_paid DECIMAL(12,2) DEFAULT 0,
  net_tax_due DECIMAL(12,2) DEFAULT 0,
  filing_date DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, tax_type, period_start, period_end)
);

-- =============================================
-- ENABLE RLS FOR ACCOUNTING TABLES
-- =============================================
ALTER TABLE account_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_periods ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Account Subcategories
-- =============================================
DROP POLICY IF EXISTS "Users can view their own subcategories" ON account_subcategories;
CREATE POLICY "Users can view their own subcategories"
  ON account_subcategories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = account_subcategories.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own subcategories" ON account_subcategories;
CREATE POLICY "Users can insert their own subcategories"
  ON account_subcategories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = account_subcategories.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own subcategories" ON account_subcategories;
CREATE POLICY "Users can update their own subcategories"
  ON account_subcategories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = account_subcategories.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own subcategories" ON account_subcategories;
CREATE POLICY "Users can delete their own subcategories"
  ON account_subcategories FOR DELETE
  USING (
    is_system = FALSE AND
    EXISTS (
      SELECT 1 FROM user_businesses 
      WHERE user_businesses.id = account_subcategories.user_business_id 
      AND user_businesses.user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - Accounts
-- ==============================================
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = accounts.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = accounts.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = accounts.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = accounts.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Journal Entries
-- =============================================
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = journal_entries.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = journal_entries.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = journal_entries.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;
CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = journal_entries.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Journal Entry Lines
-- =============================================
DROP POLICY IF EXISTS "Users can view their own journal entry lines" ON journal_entry_lines;
CREATE POLICY "Users can view their own journal entry lines"
  ON journal_entry_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = journal_entry_lines.journal_entry_id 
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own journal entry lines" ON journal_entry_lines;
CREATE POLICY "Users can insert their own journal entry lines"
  ON journal_entry_lines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = journal_entry_lines.journal_entry_id 
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own journal entry lines" ON journal_entry_lines;
CREATE POLICY "Users can update their own journal entry lines"
  ON journal_entry_lines FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = journal_entry_lines.journal_entry_id 
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own journal entry lines" ON journal_entry_lines;
CREATE POLICY "Users can delete their own journal entry lines"
  ON journal_entry_lines FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = journal_entry_lines.journal_entry_id 
    AND ub.user_id = auth.uid()
  ));

-- =============================================
-- INDEXES FOR ACCOUNTING TABLES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_business_id ON accounts(user_business_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_business_id ON journal_entries(user_business_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);

-- =============================================
-- AUTO-CREATE CHART OF ACCOUNTS FOR NEW BUSINESSES
-- =============================================

-- Function to insert default subcategories and accounts when a new business is created
CREATE OR REPLACE FUNCTION create_default_chart_of_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- First, insert subcategories
  INSERT INTO account_subcategories (user_business_id, account_type, name, display_order, is_system) VALUES
  -- Assets
  (NEW.id, 'Asset', 'Current Assets', 1, true),
  (NEW.id, 'Asset', 'Non-Current Assets', 2, true),
  -- Liabilities
  (NEW.id, 'Liability', 'Current Liabilities', 1, true),
  (NEW.id, 'Liability', 'Non-Current Liabilities', 2, true),
  -- Equity
  (NEW.id, 'Equity', 'Owner''s Equity', 1, true),
  -- Revenue
  (NEW.id, 'Revenue', 'Operating Income', 1, true),
  -- COGS
  (NEW.id, 'COGS', 'Direct Costs', 1, true),
  -- Expenses
  (NEW.id, 'Expense', 'Operating Expenses', 1, true),
  (NEW.id, 'Expense', 'Non-Operating Expenses', 2, true),
  -- Other Income/Expenses
  (NEW.id, 'Other Income', 'Non-Operating Income', 1, true),
  (NEW.id, 'Other Expense', 'Non-Operating Expenses', 1, true)
  ON CONFLICT (user_business_id, account_type, name) DO NOTHING;

  -- Then, insert essential accounts with numbers
  INSERT INTO accounts (user_business_id, code, name, account_type, subcategory) VALUES
  -- Assets (1000-1999)
  (NEW.id, '1000', 'Cash', 'Asset', 'Current Assets'),
  (NEW.id, '1010', 'Petty Cash', 'Asset', 'Current Assets'),
  (NEW.id, '1020', 'Bank - Checking Account', 'Asset', 'Current Assets'),
  (NEW.id, '1030', 'Bank - Savings Account', 'Asset', 'Current Assets'),
  (NEW.id, '1100', 'Accounts Receivable', 'Asset', 'Current Assets'),
  (NEW.id, '1200', 'Inventory (Raw Materials, WIP, Finished Goods)', 'Asset', 'Current Assets'),
  (NEW.id, '1300', 'Prepaid Expenses (Rent, Insurance)', 'Asset', 'Current Assets'),
  (NEW.id, '1500', 'Property, Plant & Equipment (Land, Buildings, Machinery)', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1510', 'Land', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1520', 'Buildings', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1530', 'Equipment (Machinery, Vehicles, Furniture, Computers)', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1540', 'Vehicles', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1600', 'Accumulated Depreciation (Buildings, Equipment, Vehicles)', 'Asset', 'Non-Current Assets'),
  (NEW.id, '1700', 'Intangible Assets (Software, Patents, Trademarks, Goodwill)', 'Asset', 'Non-Current Assets'),
  
  -- Liabilities (2000-2999)
  (NEW.id, '2000', 'Accounts Payable', 'Liability', 'Current Liabilities'),
  (NEW.id, '2100', 'Accrued Expenses (Salaries, Interest, Utilities)', 'Liability', 'Current Liabilities'),
  (NEW.id, '2200', 'Taxes Payable (Income, Sales, Payroll)', 'Liability', 'Current Liabilities'),
  (NEW.id, '2210', 'Sales Tax Payable', 'Liability', 'Current Liabilities'),
  (NEW.id, '2220', 'Income Tax Payable', 'Liability', 'Current Liabilities'),
  (NEW.id, '2230', 'Withholding Tax Payable', 'Liability', 'Current Liabilities'),
  (NEW.id, '2240', 'Payroll Tax Payable', 'Liability', 'Current Liabilities'),
  (NEW.id, '2300', 'Short-term Loans', 'Liability', 'Current Liabilities'),
  (NEW.id, '2500', 'Long-term Loans', 'Liability', 'Non-Current Liabilities'),
  (NEW.id, '2600', 'Mortgages Payable', 'Liability', 'Non-Current Liabilities'),
  
  -- Equity (3000-3999)
  (NEW.id, '3000', 'Owner''s Capital', 'Equity', 'Owner''s Equity'),
  (NEW.id, '3100', 'Share Capital', 'Equity', 'Owner''s Equity'),
  (NEW.id, '3200', 'Retained Earnings', 'Equity', 'Owner''s Equity'),
  (NEW.id, '3300', 'Owner''s Drawings', 'Equity', 'Owner''s Equity'),
  (NEW.id, '3400', 'Current Year Profit/Loss', 'Equity', 'Owner''s Equity'),
  
  -- Revenue (4000-4999)
  (NEW.id, '4000', 'Sales Revenue (Products, Merchandise)', 'Revenue', 'Operating Income'),
  (NEW.id, '4100', 'Service Revenue (Consulting, Professional Fees)', 'Revenue', 'Operating Income'),
  (NEW.id, '4200', 'Interest Income', 'Revenue', 'Operating Income'),
  (NEW.id, '4300', 'Rental Income', 'Revenue', 'Operating Income'),
  
  -- COGS (5000-5999)
  (NEW.id, '5000', 'Cost of Goods Sold', 'COGS', 'Direct Costs'),
  (NEW.id, '5100', 'Purchases (Raw Materials, Merchandise)', 'COGS', 'Direct Costs'),
  (NEW.id, '5200', 'Direct Labor', 'COGS', 'Direct Costs'),
  (NEW.id, '5300', 'Freight In', 'COGS', 'Direct Costs'),
  
  -- Expenses (6000-6999)
  (NEW.id, '6000', 'Rent Expense', 'Expense', 'Operating Expenses'),
  (NEW.id, '6100', 'Salaries & Wages', 'Expense', 'Operating Expenses'),
  (NEW.id, '6200', 'Utilities (Electricity, Water, Gas, Internet)', 'Expense', 'Operating Expenses'),
  (NEW.id, '6210', 'Electricity', 'Expense', 'Operating Expenses'),
  (NEW.id, '6220', 'Water', 'Expense', 'Operating Expenses'),
  (NEW.id, '6230', 'Internet & Phone', 'Expense', 'Operating Expenses'),
  (NEW.id, '6300', 'Office Supplies', 'Expense', 'Operating Expenses'),
  (NEW.id, '6400', 'Marketing & Advertising', 'Expense', 'Operating Expenses'),
  (NEW.id, '6500', 'Insurance', 'Expense', 'Operating Expenses'),
  (NEW.id, '6600', 'Repairs & Maintenance', 'Expense', 'Operating Expenses'),
  (NEW.id, '6700', 'Professional Fees (Legal, Accounting, Consulting)', 'Expense', 'Operating Expenses'),
  (NEW.id, '6800', 'Interest Expense', 'Expense', 'Non-Operating Expenses'),
  (NEW.id, '6810', 'Bank Charges', 'Expense', 'Non-Operating Expenses'),
  (NEW.id, '6850', 'Income Tax Expense', 'Expense', 'Non-Operating Expenses'),
  (NEW.id, '6860', 'Payroll Tax Expense', 'Expense', 'Operating Expenses'),
  (NEW.id, '6900', 'Depreciation Expense', 'Expense', 'Non-Operating Expenses'),
  
  -- Other Income (7000-7499)
  (NEW.id, '7000', 'Other Income', 'Other Income', 'Non-Operating Income'),
  (NEW.id, '7100', 'Gain on Asset Disposal', 'Other Income', 'Non-Operating Income'),
  (NEW.id, '7200', 'Foreign Exchange Gains', 'Other Income', 'Non-Operating Income'),
  
  -- Other Expenses (7500-7999)
  (NEW.id, '7500', 'Other Expenses', 'Other Expense', 'Non-Operating Expenses'),
  (NEW.id, '7600', 'Loss on Asset Disposal', 'Other Expense', 'Non-Operating Expenses'),
  (NEW.id, '7700', 'Foreign Exchange Losses', 'Other Expense', 'Non-Operating Expenses'),
  (NEW.id, '7801', 'Penalties & Fines', 'Other Expense', 'Non-Operating Expenses')
  ON CONFLICT (user_business_id, code) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_businesses table
DROP TRIGGER IF EXISTS trigger_create_default_chart_of_accounts ON user_businesses;
CREATE TRIGGER trigger_create_default_chart_of_accounts
  AFTER INSERT ON user_businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_default_chart_of_accounts();

-- =============================================
-- RLS POLICIES - Tax Tables
-- =============================================

-- Tax Rates Policies
DROP POLICY IF EXISTS "Users can view their own tax rates" ON tax_rates;
CREATE POLICY "Users can view their own tax rates"
  ON tax_rates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_rates.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own tax rates" ON tax_rates;
CREATE POLICY "Users can insert their own tax rates"
  ON tax_rates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_rates.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own tax rates" ON tax_rates;
CREATE POLICY "Users can update their own tax rates"
  ON tax_rates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_rates.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own tax rates" ON tax_rates;
CREATE POLICY "Users can delete their own tax rates"
  ON tax_rates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_rates.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- Tax Transactions Policies
DROP POLICY IF EXISTS "Users can view their own tax transactions" ON tax_transactions;
CREATE POLICY "Users can view their own tax transactions"
  ON tax_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = tax_transactions.journal_entry_id
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own tax transactions" ON tax_transactions;
CREATE POLICY "Users can insert their own tax transactions"
  ON tax_transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = tax_transactions.journal_entry_id
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own tax transactions" ON tax_transactions;
CREATE POLICY "Users can update their own tax transactions"
  ON tax_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = tax_transactions.journal_entry_id
    AND ub.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own tax transactions" ON tax_transactions;
CREATE POLICY "Users can delete their own tax transactions"
  ON tax_transactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    JOIN user_businesses ub ON ub.id = je.user_business_id
    WHERE je.id = tax_transactions.journal_entry_id
    AND ub.user_id = auth.uid()
  ));

-- Tax Periods Policies
DROP POLICY IF EXISTS "Users can view their own tax periods" ON tax_periods;
CREATE POLICY "Users can view their own tax periods"
  ON tax_periods FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_periods.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own tax periods" ON tax_periods;
CREATE POLICY "Users can insert their own tax periods"
  ON tax_periods FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_periods.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own tax periods" ON tax_periods;
CREATE POLICY "Users can update their own tax periods"
  ON tax_periods FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_periods.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own tax periods" ON tax_periods;
CREATE POLICY "Users can delete their own tax periods"
  ON tax_periods FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_businesses 
    WHERE user_businesses.id = tax_periods.user_business_id 
    AND user_businesses.user_id = auth.uid()
  ));

-- =============================================
-- SEED DATA - Insert the 119 Business Types
-- =============================================
-- This will be inserted via a separate script or manually
-- See: seed-business-types.sql
