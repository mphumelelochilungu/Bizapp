-- =============================================
-- Personal Expense Categories Table
-- =============================================

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own expense categories" ON expense_categories;
CREATE POLICY "Users can view their own expense categories"
  ON expense_categories FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own expense categories" ON expense_categories;
CREATE POLICY "Users can insert their own expense categories"
  ON expense_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own expense categories" ON expense_categories;
CREATE POLICY "Users can update their own expense categories"
  ON expense_categories FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own expense categories" ON expense_categories;
CREATE POLICY "Users can delete their own expense categories"
  ON expense_categories FOR DELETE
  USING (user_id = auth.uid() AND is_default = false);

-- Function to create default expense categories for new users
CREATE OR REPLACE FUNCTION create_default_expense_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO expense_categories (user_id, name, is_default) VALUES
    (NEW.id, 'Housing', true),
    (NEW.id, 'Transportation', true),
    (NEW.id, 'Food', true),
    (NEW.id, 'Utilities', true),
    (NEW.id, 'Healthcare', true),
    (NEW.id, 'Insurance', true),
    (NEW.id, 'Debt Payments', true),
    (NEW.id, 'Entertainment', true),
    (NEW.id, 'Clothing', true),
    (NEW.id, 'Personal Care', true),
    (NEW.id, 'Education', true),
    (NEW.id, 'Gifts', true),
    (NEW.id, 'Savings', true),
    (NEW.id, 'Investments', true),
    (NEW.id, 'Childcare', true),
    (NEW.id, 'Pet Care', true),
    (NEW.id, 'Travel', true),
    (NEW.id, 'Other', true)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create default categories for new users
DROP TRIGGER IF EXISTS trigger_create_default_expense_categories ON auth.users;
CREATE TRIGGER trigger_create_default_expense_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_expense_categories();

-- Seed default categories for existing users (run once)
INSERT INTO expense_categories (user_id, name, is_default)
SELECT 
  u.id,
  category.name,
  true
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Housing'),
    ('Transportation'),
    ('Food'),
    ('Utilities'),
    ('Healthcare'),
    ('Insurance'),
    ('Debt Payments'),
    ('Entertainment'),
    ('Clothing'),
    ('Personal Care'),
    ('Education'),
    ('Gifts'),
    ('Savings'),
    ('Investments'),
    ('Childcare'),
    ('Pet Care'),
    ('Travel'),
    ('Other')
) AS category(name)
ON CONFLICT (user_id, name) DO NOTHING;
