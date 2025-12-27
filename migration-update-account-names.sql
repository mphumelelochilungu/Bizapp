-- =============================================
-- MIGRATION: Update Account Names with Descriptive Parentheses
-- =============================================
-- Purpose: Make Chart of Accounts more user-friendly by adding
--          examples in parentheses for parent accounts
-- Date: December 26, 2025
-- =============================================

-- Update existing accounts with descriptive names
-- This helps non-accounting users understand what goes under each account

-- ASSETS
UPDATE accounts 
SET name = 'Inventory (Raw Materials, WIP, Finished Goods)' 
WHERE code = '1200' AND name = 'Inventory';

UPDATE accounts 
SET name = 'Prepaid Expenses (Rent, Insurance)' 
WHERE code = '1300' AND name = 'Prepaid Expenses';

UPDATE accounts 
SET name = 'Property, Plant & Equipment (Land, Buildings, Machinery)' 
WHERE code = '1500' AND name = 'Property, Plant & Equipment';

UPDATE accounts 
SET name = 'Equipment (Machinery, Vehicles, Furniture, Computers)' 
WHERE code = '1530' AND name = 'Equipment';

UPDATE accounts 
SET name = 'Accumulated Depreciation (Buildings, Equipment, Vehicles)' 
WHERE code = '1600' AND name = 'Accumulated Depreciation';

UPDATE accounts 
SET name = 'Intangible Assets (Software, Patents, Trademarks, Goodwill)' 
WHERE code = '1700' AND name = 'Intangible Assets';

-- LIABILITIES
UPDATE accounts 
SET name = 'Accrued Expenses (Salaries, Interest, Utilities)' 
WHERE code = '2100' AND name = 'Accrued Expenses';

UPDATE accounts 
SET name = 'Taxes Payable (Income, Sales, Payroll)' 
WHERE code = '2200' AND name = 'Taxes Payable';

-- REVENUE
UPDATE accounts 
SET name = 'Sales Revenue (Products, Merchandise)' 
WHERE code = '4000' AND name = 'Sales Revenue';

UPDATE accounts 
SET name = 'Service Revenue (Consulting, Professional Fees)' 
WHERE code = '4100' AND name = 'Service Revenue';

-- COGS
UPDATE accounts 
SET name = 'Purchases (Raw Materials, Merchandise)' 
WHERE code = '5100' AND name = 'Purchases';

-- EXPENSES
UPDATE accounts 
SET name = 'Utilities (Electricity, Water, Gas, Internet)' 
WHERE code = '6200' AND name = 'Utilities';

UPDATE accounts 
SET name = 'Professional Fees (Legal, Accounting, Consulting)' 
WHERE code = '6700' AND name = 'Professional Fees';

-- Verify the updates
SELECT code, name, account_type, subcategory 
FROM accounts 
WHERE code IN ('1200', '1300', '1500', '1530', '1600', '1700', 
               '2100', '2200', 
               '4000', '4100', 
               '5100', 
               '6200', '6700')
ORDER BY code;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Account names updated successfully with descriptive parentheses!';
  RAISE NOTICE 'Users can now see examples of what goes under each parent account.';
END $$;
