-- Migration: Add Bank Accounts functionality
-- Account types: Bank Account, Digital Wallet, Cash
-- Integrates with Chart of Accounts under Assets (codes starting with 1XXX)
-- Auto-creates corresponding entry in accounts table for double-entry accounting

-- =============================================
-- 0. Drop existing table if needed (for re-running migration)
-- =============================================
DROP TABLE IF EXISTS bank_accounts CASCADE;

-- =============================================
-- 1. Create bank_accounts table
-- =============================================
CREATE TABLE bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_business_id BIGINT REFERENCES user_businesses(id) ON DELETE CASCADE NOT NULL, -- Required for accounting
  chart_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL, -- Link to Chart of Accounts
  account_code CHAR(4) NOT NULL, -- 4-digit code starting with 1 (Assets)
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Bank Account', 'Digital Wallet', 'Cash')),
  institution_name TEXT, -- Only applicable for Bank Account and Digital Wallet
  account_number TEXT, -- Optional, for reference
  current_balance DECIMAL(15,2) DEFAULT 0,
  currency_code CHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_business_id, account_code) -- Each business has unique account codes
);

-- =============================================
-- 2. Create indexes for better performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_business_id ON bank_accounts(user_business_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(user_business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_chart_account ON bank_accounts(chart_account_id);

-- =============================================
-- 3. Enable Row Level Security (RLS)
-- =============================================
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own bank accounts
CREATE POLICY "Users can view own bank accounts" ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own bank accounts
CREATE POLICY "Users can insert own bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bank accounts
CREATE POLICY "Users can update own bank accounts" ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own bank accounts
CREATE POLICY "Users can delete own bank accounts" ON bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. Create function to generate next account code
-- =============================================
CREATE OR REPLACE FUNCTION generate_bank_account_code(p_business_id BIGINT, p_account_type TEXT)
RETURNS CHAR(4) AS $$
DECLARE
  prefix CHAR(2);
  next_num INTEGER;
  new_code CHAR(4);
BEGIN
  -- Assign prefix based on account type (all under Assets starting with 1)
  -- 10XX = Bank Account
  -- 11XX = Digital Wallet
  -- 12XX = Cash
  CASE p_account_type
    WHEN 'Bank Account' THEN prefix := '10';
    WHEN 'Digital Wallet' THEN prefix := '11';
    WHEN 'Cash' THEN prefix := '12';
    ELSE prefix := '10';
  END CASE;
  
  -- Find the next available number for this prefix (check both bank_accounts and accounts tables)
  SELECT COALESCE(MAX(num), 0) + 1
  INTO next_num
  FROM (
    -- Check bank_accounts table
    SELECT CAST(SUBSTRING(account_code FROM 3 FOR 2) AS INTEGER) as num
    FROM bank_accounts
    WHERE user_business_id = p_business_id
      AND account_code LIKE prefix || '%'
    UNION ALL
    -- Check accounts table to avoid code conflicts
    SELECT CAST(SUBSTRING(code FROM 3 FOR 2) AS INTEGER) as num
    FROM accounts
    WHERE user_business_id = p_business_id
      AND code LIKE prefix || '%'
  ) combined;
  
  -- Ensure we don't exceed 99 accounts per type
  IF next_num > 99 THEN
    RAISE EXCEPTION 'Maximum accounts reached for this type';
  END IF;
  
  -- Generate the code
  new_code := prefix || LPAD(next_num::TEXT, 2, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. Create function to auto-create Chart of Accounts entry
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
    NEW.account_type, -- Subcategory: Bank Account, Digital Wallet, or Cash
    NEW.is_active
  )
  RETURNING id INTO new_chart_id;
  
  -- Link bank account to the chart of accounts entry
  NEW.chart_account_id := new_chart_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_chart_account ON bank_accounts;
CREATE TRIGGER trigger_create_chart_account
  BEFORE INSERT ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_chart_account_for_bank();

-- =============================================
-- 6. Create function to sync updates to Chart of Accounts
-- =============================================
CREATE OR REPLACE FUNCTION sync_chart_account_for_bank()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
BEGIN
  -- Build full name with institution
  full_name := NEW.account_name;
  IF NEW.institution_name IS NOT NULL AND NEW.institution_name != '' THEN
    full_name := full_name || ' (' || NEW.institution_name || ')';
  END IF;
  
  -- Update the linked chart of accounts entry
  IF NEW.chart_account_id IS NOT NULL THEN
    UPDATE accounts
    SET 
      name = full_name,
      subcategory = NEW.account_type,
      is_active = NEW.is_active
    WHERE id = NEW.chart_account_id;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_chart_account ON bank_accounts;
CREATE TRIGGER trigger_sync_chart_account
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_chart_account_for_bank();

-- =============================================
-- 7. Create function to handle bank account deletion
-- =============================================
CREATE OR REPLACE FUNCTION delete_chart_account_for_bank()
RETURNS TRIGGER AS $$
BEGIN
  -- Deactivate the chart account (don't delete to preserve journal entry history)
  IF OLD.chart_account_id IS NOT NULL THEN
    UPDATE accounts
    SET is_active = FALSE
    WHERE id = OLD.chart_account_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_delete_chart_account ON bank_accounts;
CREATE TRIGGER trigger_delete_chart_account
  BEFORE DELETE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION delete_chart_account_for_bank();

-- =============================================
-- NOTES:
-- Account codes are 4-digit codes under Assets (1XXX):
-- - 10XX = Bank Account (e.g., 1001, 1002, 1003...)
-- - 11XX = Digital Wallet (e.g., 1101, 1102, 1103...)
-- - 12XX = Cash (e.g., 1201, 1202, 1203...)
-- 
-- When a bank account is created:
-- 1. A corresponding entry is auto-created in the 'accounts' table (Chart of Accounts)
-- 2. The bank account is linked via chart_account_id
-- 3. This allows the account to be used in journal entries for double-entry accounting
-- 
-- When a bank account is updated, the Chart of Accounts entry is synced
-- When a bank account is deleted, the Chart of Accounts entry is deactivated (not deleted)
-- =============================================

-- =============================================
-- 8. Create trigger to update bank account balance from journal entries
-- =============================================
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  bank_acc_id BIGINT;
  account_code TEXT;
  account_subcategory TEXT;
BEGIN
  -- Get the account details for the journal entry line
  SELECT a.code, a.subcategory, ba.id
  INTO account_code, account_subcategory, bank_acc_id
  FROM accounts a
  LEFT JOIN bank_accounts ba ON ba.chart_account_id = a.id
  WHERE a.id = COALESCE(NEW.account_id, OLD.account_id);
  
  -- Only process if this is a bank account (Bank Account, Digital Wallet, or Cash)
  IF account_subcategory IN ('Bank Account', 'Digital Wallet', 'Cash') AND bank_acc_id IS NOT NULL THEN
    -- Recalculate the bank account balance from all journal entries
    UPDATE bank_accounts
    SET current_balance = COALESCE((
      SELECT SUM(
        COALESCE(jel.debit_amount, 0) - COALESCE(jel.credit_amount, 0)
      )
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE jel.account_id = (SELECT chart_account_id FROM bank_accounts WHERE id = bank_acc_id)
        AND je.status = 'posted'
    ), 0),
    updated_at = NOW()
    WHERE id = bank_acc_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT of journal entry lines
DROP TRIGGER IF EXISTS trigger_update_bank_balance_insert ON journal_entry_lines;
CREATE TRIGGER trigger_update_bank_balance_insert
  AFTER INSERT ON journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_balance();

-- Trigger on UPDATE of journal entry lines
DROP TRIGGER IF EXISTS trigger_update_bank_balance_update ON journal_entry_lines;
CREATE TRIGGER trigger_update_bank_balance_update
  AFTER UPDATE ON journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_balance();

-- Trigger on DELETE of journal entry lines
DROP TRIGGER IF EXISTS trigger_update_bank_balance_delete ON journal_entry_lines;
CREATE TRIGGER trigger_update_bank_balance_delete
  AFTER DELETE ON journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_balance();

-- =============================================
-- 9. Create trigger to update bank balance when journal entry status changes
-- =============================================
CREATE OR REPLACE FUNCTION update_bank_balance_on_je_status()
RETURNS TRIGGER AS $$
DECLARE
  line_record RECORD;
BEGIN
  -- Only process if status changed to/from 'posted'
  IF (NEW.status = 'posted' AND OLD.status != 'posted') OR 
     (NEW.status != 'posted' AND OLD.status = 'posted') THEN
    
    -- Update all bank accounts affected by this journal entry
    FOR line_record IN 
      SELECT DISTINCT jel.account_id
      FROM journal_entry_lines jel
      WHERE jel.journal_entry_id = NEW.id
    LOOP
      -- Trigger the balance update for each affected account
      PERFORM update_bank_account_balance()
      FROM journal_entry_lines
      WHERE account_id = line_record.account_id
      LIMIT 1;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_bank_on_je_status ON journal_entries;
CREATE TRIGGER trigger_update_bank_on_je_status
  AFTER UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_balance_on_je_status();
