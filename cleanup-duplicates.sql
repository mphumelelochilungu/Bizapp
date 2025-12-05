-- =============================================
-- CLEANUP DUPLICATE BUSINESS TYPES
-- =============================================
-- This script removes duplicate business types, keeping only the first occurrence

-- Step 1: Show duplicates before cleanup
SELECT name, category, COUNT(*) as count
FROM business_types
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- Step 2: Delete duplicates, keeping the one with the lowest ID
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

-- Step 3: Verify cleanup - should return no rows
SELECT name, category, COUNT(*) as count
FROM business_types
GROUP BY name, category
HAVING COUNT(*) > 1;

-- Step 4: Show final count
SELECT COUNT(*) as total_business_types FROM business_types;

-- Step 5: Show count by category
SELECT category, COUNT(*) as count
FROM business_types
GROUP BY category
ORDER BY category;
