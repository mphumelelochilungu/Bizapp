-- Migration: Fix bank_accounts.chart_account_id type mismatch
-- Problem: accounts.id is BIGINT but bank_accounts.chart_account_id was created as UUID
-- Solution: Change bank_accounts.chart_account_id to BIGINT

-- =============================================
-- 1. Drop existing foreign key constraint on bank_accounts
-- =============================================
ALTER TABLE bank_accounts 
DROP CONSTRAINT IF EXISTS bank_accounts_chart_account_id_fkey;

-- =============================================
-- 2. Change chart_account_id column type from UUID to BIGINT
-- =============================================
ALTER TABLE bank_accounts 
ALTER COLUMN chart_account_id TYPE BIGINT USING NULL;

-- =============================================
-- 3. Re-add foreign key constraint
-- =============================================
ALTER TABLE bank_accounts 
ADD CONSTRAINT bank_accounts_chart_account_id_fkey 
FOREIGN KEY (chart_account_id) REFERENCES accounts(id) ON DELETE SET NULL;

-- =============================================
-- 4. Update the trigger function to use BIGINT
-- =============================================
CREATE OR REPLACE FUNCTION create_chart_account_for_bank()
RETURNS TRIGGER AS $$
DECLARE
  new_chart_id BIGINT;
  full_name TEXT;
BEGIN
  -- Generate code if not provided
  IF NEW.account_code IS NULL OR NEW.account_code = '' THEN
    NEW.account_code := generate_bank_account_code(NEW.user_business_id, NEW.account_type);
  END IF;
  
  -- Build full name with institution
  full_name := NEW.account_name;
  IF NEW.institution_name IS NOT NULL AND NEW.institution_name != '' THEN
    full_name := full_name || ' (' || NEW.institution_name || ')';
  END IF;
  
  -- Create corresponding entry in accounts table (Chart of Accounts)
  INSERT INTO accounts (user_business_id, code, name, account_type, subcategory, is_active)
  VALUES (
    NEW.user_business_id,
    NEW.account_code,
    full_name,
    'Asset',
    NEW.account_type,
    NEW.is_active
  )
  RETURNING id INTO new_chart_id;
  
  -- Link bank account to the chart of accounts entry
  NEW.chart_account_id := new_chart_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- NOTES:
-- Your accounts table uses BIGINT for id
-- This migration fixes bank_accounts.chart_account_id to use BIGINT
-- Run this in Supabase SQL Editor
-- =============================================
