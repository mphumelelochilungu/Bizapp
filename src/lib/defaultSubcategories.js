// Default Account Subcategories
// These are pre-configured subcategories that users can customize

export const DEFAULT_SUBCATEGORIES = [
  // ==========================================
  // ASSETS (1000-1999)
  // ==========================================
  { account_type: 'Asset', name: 'Current Assets', display_order: 1, is_system: true },
  { account_type: 'Asset', name: 'Bank Account', display_order: 2, is_system: true },
  { account_type: 'Asset', name: 'Digital Wallet', display_order: 3, is_system: true },
  { account_type: 'Asset', name: 'Cash', display_order: 4, is_system: true },
  { account_type: 'Asset', name: 'Accounts Receivable', display_order: 5, is_system: true },
  { account_type: 'Asset', name: 'Inventory', display_order: 5, is_system: true },
  { account_type: 'Asset', name: 'Prepaid Expenses', display_order: 6, is_system: true },
  { account_type: 'Asset', name: 'Non-Current Assets', display_order: 7, is_system: true },
  { account_type: 'Asset', name: 'Property, Plant & Equipment', display_order: 8, is_system: true },
  { account_type: 'Asset', name: 'Accumulated Depreciation', display_order: 9, is_system: true },
  { account_type: 'Asset', name: 'Intangible Assets', display_order: 10, is_system: true },
  { account_type: 'Asset', name: 'Long-term Investments', display_order: 11, is_system: true },

  // ==========================================
  // LIABILITIES (2000-2999)
  // ==========================================
  { account_type: 'Liability', name: 'Current Liabilities', display_order: 1, is_system: true },
  { account_type: 'Liability', name: 'Accounts Payable', display_order: 2, is_system: true },
  { account_type: 'Liability', name: 'Accrued Expenses', display_order: 3, is_system: true },
  { account_type: 'Liability', name: 'Taxes Payable', display_order: 4, is_system: true },
  { account_type: 'Liability', name: 'Short-term Loans', display_order: 5, is_system: true },
  { account_type: 'Liability', name: 'Non-Current Liabilities', display_order: 6, is_system: true },
  { account_type: 'Liability', name: 'Long-term Loans', display_order: 7, is_system: true },
  { account_type: 'Liability', name: 'Mortgages', display_order: 8, is_system: true },
  { account_type: 'Liability', name: 'Lease Liabilities', display_order: 9, is_system: true },

  // ==========================================
  // EQUITY (3000-3999)
  // ==========================================
  { account_type: 'Equity', name: 'Owner\'s Capital', display_order: 1, is_system: true },
  { account_type: 'Equity', name: 'Share Capital', display_order: 2, is_system: true },
  { account_type: 'Equity', name: 'Retained Earnings', display_order: 3, is_system: true },
  { account_type: 'Equity', name: 'Current Year Profit/Loss', display_order: 4, is_system: true },
  { account_type: 'Equity', name: 'Drawings/Dividends', display_order: 5, is_system: true },

  // ==========================================
  // REVENUE (4000-4999)
  // ==========================================
  { account_type: 'Revenue', name: 'Sales Revenue', display_order: 1, is_system: true },
  { account_type: 'Revenue', name: 'Service Income', display_order: 2, is_system: true },
  { account_type: 'Revenue', name: 'Interest Income', display_order: 3, is_system: true },
  { account_type: 'Revenue', name: 'Other Operating Income', display_order: 4, is_system: true },

  // ==========================================
  // COGS (5000-5999)
  // ==========================================
  { account_type: 'COGS', name: 'Opening Inventory', display_order: 1, is_system: true },
  { account_type: 'COGS', name: 'Purchases', display_order: 2, is_system: true },
  { account_type: 'COGS', name: 'Direct Labor', display_order: 3, is_system: true },
  { account_type: 'COGS', name: 'Freight/Carriage Inwards', display_order: 4, is_system: true },
  { account_type: 'COGS', name: 'Closing Inventory', display_order: 5, is_system: true },

  // ==========================================
  // EXPENSES (6000-6999)
  // ==========================================
  { account_type: 'Expense', name: 'Operating Expenses', display_order: 1, is_system: true },
  { account_type: 'Expense', name: 'Rent', display_order: 2, is_system: true },
  { account_type: 'Expense', name: 'Salaries & Wages', display_order: 3, is_system: true },
  { account_type: 'Expense', name: 'Utilities', display_order: 4, is_system: true },
  { account_type: 'Expense', name: 'Office Supplies', display_order: 5, is_system: true },
  { account_type: 'Expense', name: 'Marketing & Advertising', display_order: 6, is_system: true },
  { account_type: 'Expense', name: 'Insurance', display_order: 7, is_system: true },
  { account_type: 'Expense', name: 'Repairs & Maintenance', display_order: 8, is_system: true },
  { account_type: 'Expense', name: 'Non-Operating Expenses', display_order: 9, is_system: true },
  { account_type: 'Expense', name: 'Interest Expense', display_order: 10, is_system: true },
  { account_type: 'Expense', name: 'Depreciation', display_order: 11, is_system: true },
  { account_type: 'Expense', name: 'Bank Charges', display_order: 12, is_system: true },

  // ==========================================
  // OTHER INCOME (7000-7499)
  // ==========================================
  { account_type: 'Other Income', name: 'Asset Disposal Gains', display_order: 1, is_system: true },
  { account_type: 'Other Income', name: 'Foreign Exchange Gains', display_order: 2, is_system: true },

  // ==========================================
  // OTHER EXPENSES (7500-7999)
  // ==========================================
  { account_type: 'Other Expense', name: 'Asset Disposal Losses', display_order: 1, is_system: true },
  { account_type: 'Other Expense', name: 'Foreign Exchange Losses', display_order: 2, is_system: true },
]

// Get subcategories by account type
export const getSubcategoriesByType = (subcategories, accountType) => {
  return subcategories
    .filter(sub => sub.account_type === accountType)
    .sort((a, b) => a.display_order - b.display_order)
}
