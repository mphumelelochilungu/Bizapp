-- =============================================
-- AUTO-CREATE SUBCATEGORIES FOR NEW BUSINESSES
-- =============================================

-- Function to insert default subcategories when a new business is created
CREATE OR REPLACE FUNCTION create_default_subcategories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO account_subcategories (user_business_id, account_type, name, display_order, is_system) VALUES
  -- Assets
  (NEW.id, 'Asset', 'Current Assets', 1, true),
  (NEW.id, 'Asset', 'Cash', 2, true),
  (NEW.id, 'Asset', 'Bank', 3, true),
  (NEW.id, 'Asset', 'Accounts Receivable', 4, true),
  (NEW.id, 'Asset', 'Inventory', 5, true),
  (NEW.id, 'Asset', 'Prepaid Expenses', 6, true),
  (NEW.id, 'Asset', 'Non-Current Assets', 7, true),
  (NEW.id, 'Asset', 'Property, Plant & Equipment', 8, true),
  (NEW.id, 'Asset', 'Accumulated Depreciation', 9, true),
  (NEW.id, 'Asset', 'Intangible Assets', 10, true),
  (NEW.id, 'Asset', 'Long-term Investments', 11, true),
  -- Liabilities
  (NEW.id, 'Liability', 'Current Liabilities', 1, true),
  (NEW.id, 'Liability', 'Accounts Payable', 2, true),
  (NEW.id, 'Liability', 'Accrued Expenses', 3, true),
  (NEW.id, 'Liability', 'Taxes Payable', 4, true),
  (NEW.id, 'Liability', 'Short-term Loans', 5, true),
  (NEW.id, 'Liability', 'Non-Current Liabilities', 6, true),
  (NEW.id, 'Liability', 'Long-term Loans', 7, true),
  (NEW.id, 'Liability', 'Mortgages', 8, true),
  (NEW.id, 'Liability', 'Lease Liabilities', 9, true),
  -- Equity
  (NEW.id, 'Equity', 'Owner''s Capital', 1, true),
  (NEW.id, 'Equity', 'Share Capital', 2, true),
  (NEW.id, 'Equity', 'Retained Earnings', 3, true),
  (NEW.id, 'Equity', 'Current Year Profit/Loss', 4, true),
  (NEW.id, 'Equity', 'Drawings/Dividends', 5, true),
  -- Revenue
  (NEW.id, 'Revenue', 'Sales Revenue', 1, true),
  (NEW.id, 'Revenue', 'Service Income', 2, true),
  (NEW.id, 'Revenue', 'Interest Income', 3, true),
  (NEW.id, 'Revenue', 'Other Operating Income', 4, true),
  -- COGS
  (NEW.id, 'COGS', 'Opening Inventory', 1, true),
  (NEW.id, 'COGS', 'Purchases', 2, true),
  (NEW.id, 'COGS', 'Direct Labor', 3, true),
  (NEW.id, 'COGS', 'Freight/Carriage Inwards', 4, true),
  (NEW.id, 'COGS', 'Closing Inventory', 5, true),
  -- Expenses
  (NEW.id, 'Expense', 'Operating Expenses', 1, true),
  (NEW.id, 'Expense', 'Rent', 2, true),
  (NEW.id, 'Expense', 'Salaries & Wages', 3, true),
  (NEW.id, 'Expense', 'Utilities', 4, true),
  (NEW.id, 'Expense', 'Office Supplies', 5, true),
  (NEW.id, 'Expense', 'Marketing & Advertising', 6, true),
  (NEW.id, 'Expense', 'Insurance', 7, true),
  (NEW.id, 'Expense', 'Repairs & Maintenance', 8, true),
  (NEW.id, 'Expense', 'Non-Operating Expenses', 9, true),
  (NEW.id, 'Expense', 'Interest Expense', 10, true),
  (NEW.id, 'Expense', 'Depreciation', 11, true),
  (NEW.id, 'Expense', 'Bank Charges', 12, true),
  -- Other Income
  (NEW.id, 'Other Income', 'Asset Disposal Gains', 1, true),
  (NEW.id, 'Other Income', 'Foreign Exchange Gains', 2, true),
  -- Other Expenses
  (NEW.id, 'Other Expense', 'Asset Disposal Losses', 1, true),
  (NEW.id, 'Other Expense', 'Foreign Exchange Losses', 2, true)
  ON CONFLICT (user_business_id, account_type, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_default_subcategories ON user_businesses;
CREATE TRIGGER trigger_create_default_subcategories
  AFTER INSERT ON user_businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subcategories();

-- =============================================
-- FIX CASCADE DELETE FOR ACCOUNTING TABLES
-- =============================================
-- Fix the foreign key constraint on journal_entry_lines
-- to allow proper cascade deletion when a business is deleted.

-- Drop the old constraint without CASCADE
ALTER TABLE journal_entry_lines 
DROP CONSTRAINT IF EXISTS journal_entry_lines_account_id_fkey;

-- Add the new constraint with CASCADE
ALTER TABLE journal_entry_lines 
ADD CONSTRAINT journal_entry_lines_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

SELECT 'Foreign key constraint fixed - businesses can now be deleted!' as status;