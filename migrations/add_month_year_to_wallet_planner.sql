-- Migration: Add month and year fields to personal_income and savings_goals
-- This makes Income Sources and Savings Goals month-specific

-- =============================================
-- 1. Add month and year to personal_income
-- =============================================
ALTER TABLE personal_income 
ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month BETWEEN 1 AND 12),
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Set default values for existing records (current month/year)
UPDATE personal_income 
SET month = EXTRACT(MONTH FROM created_at),
    year = EXTRACT(YEAR FROM created_at)
WHERE month IS NULL OR year IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE personal_income 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;

-- Add unique constraint to prevent duplicate income sources per month
ALTER TABLE personal_income 
ADD CONSTRAINT unique_income_per_month 
UNIQUE(user_id, source, month, year);

-- =============================================
-- 2. Add month and year to savings_goals
-- =============================================
ALTER TABLE savings_goals 
ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month BETWEEN 1 AND 12),
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Set default values for existing records (current month/year)
UPDATE savings_goals 
SET month = EXTRACT(MONTH FROM created_at),
    year = EXTRACT(YEAR FROM created_at)
WHERE month IS NULL OR year IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE savings_goals 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;

-- Add unique constraint to prevent duplicate savings goals per month
ALTER TABLE savings_goals 
ADD CONSTRAINT unique_savings_goal_per_month 
UNIQUE(user_id, name, month, year);

-- =============================================
-- 3. Create indexes for better query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_personal_income_month_year 
ON personal_income(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_savings_goals_month_year 
ON savings_goals(user_id, month, year);

-- =============================================
-- NOTES:
-- - Budgets already have month/year fields
-- - Expenses already have date field (month-specific)
-- - This migration makes Income and Savings Goals month-specific
-- - Existing data will be assigned to the month/year of creation
-- =============================================
