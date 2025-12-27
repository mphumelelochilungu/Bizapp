-- =============================================
-- MIGRATION: Add Tax System to Existing Database
-- =============================================
-- This migration adds comprehensive tax functionality including:
-- - Tax rates configuration
-- - Tax transactions tracking
-- - Tax periods management
-- - Additional tax accounts

-- =============================================
-- CREATE TAX TABLES
-- =============================================

-- Tax Rates Configuration
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

-- Tax Transactions (linked to journal entries)
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

-- Tax Periods (for tracking and filing)
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
-- ENABLE RLS FOR TAX TABLES
-- =============================================
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_periods ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Tax Rates
-- =============================================
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

-- =============================================
-- RLS POLICIES - Tax Transactions
-- =============================================
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

-- =============================================
-- RLS POLICIES - Tax Periods
-- =============================================
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
-- ADD TAX ACCOUNTS TO EXISTING BUSINESSES
-- =============================================
-- Add additional tax liability accounts
INSERT INTO accounts (user_business_id, code, name, account_type, subcategory)
SELECT 
  ub.id,
  '2230',
  'Withholding Tax Payable',
  'Liability',
  'Current Liabilities'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_business_id = ub.id 
  AND a.code = '2230'
);

INSERT INTO accounts (user_business_id, code, name, account_type, subcategory)
SELECT 
  ub.id,
  '2240',
  'Payroll Tax Payable',
  'Liability',
  'Current Liabilities'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_business_id = ub.id 
  AND a.code = '2240'
);

-- Add tax expense accounts
INSERT INTO accounts (user_business_id, code, name, account_type, subcategory)
SELECT 
  ub.id,
  '6850',
  'Income Tax Expense',
  'Expense',
  'Non-Operating Expenses'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_business_id = ub.id 
  AND a.code = '6850'
);

INSERT INTO accounts (user_business_id, code, name, account_type, subcategory)
SELECT 
  ub.id,
  '6860',
  'Payroll Tax Expense',
  'Expense',
  'Operating Expenses'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_business_id = ub.id 
  AND a.code = '6860'
);

-- =============================================
-- INSERT DEFAULT TAX RATES FOR EXISTING BUSINESSES
-- =============================================
-- Insert common tax rates (adjust rates based on your jurisdiction)
INSERT INTO tax_rates (user_business_id, name, tax_type, rate, description)
SELECT 
  ub.id,
  'VAT/Sales Tax 16%',
  'sales_tax',
  16.00,
  'Standard VAT/Sales Tax Rate'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM tax_rates tr 
  WHERE tr.user_business_id = ub.id 
  AND tr.name = 'VAT/Sales Tax 16%'
);

INSERT INTO tax_rates (user_business_id, name, tax_type, rate, description)
SELECT 
  ub.id,
  'Corporate Income Tax 30%',
  'income_tax',
  30.00,
  'Standard Corporate Income Tax Rate'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM tax_rates tr 
  WHERE tr.user_business_id = ub.id 
  AND tr.name = 'Corporate Income Tax 30%'
);

INSERT INTO tax_rates (user_business_id, name, tax_type, rate, description)
SELECT 
  ub.id,
  'Withholding Tax 15%',
  'withholding_tax',
  15.00,
  'Standard Withholding Tax Rate'
FROM user_businesses ub
WHERE NOT EXISTS (
  SELECT 1 FROM tax_rates tr 
  WHERE tr.user_business_id = ub.id 
  AND tr.name = 'Withholding Tax 15%'
);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
SELECT 'Tax system migration completed successfully!' as status;
SELECT COUNT(*) as tax_rates_created FROM tax_rates;
SELECT COUNT(*) as tax_accounts_added FROM accounts WHERE code IN ('2230', '2240', '6850', '6860');
