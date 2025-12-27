// Comprehensive Chart of Accounts for Double-Entry Accounting
// Following standard numbering: 1000-1999 Assets, 2000-2999 Liabilities, 3000-3999 Equity, 
// 4000-4999 Revenue, 5000-5999 COGS, 6000-6999 Expenses, 7000-7999 Other Income/Expenses

export const DEFAULT_CHART_OF_ACCOUNTS = [
  // ==========================================
  // 1000-1999: ASSETS
  // ==========================================
  
  // Current Assets (1000-1499)
  { code: '1000', name: 'Cash', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1010', name: 'Petty Cash', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1020', name: 'Bank - Checking Account', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1030', name: 'Bank - Savings Account', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1040', name: 'Bank - Money Market', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1100', name: 'Accounts Receivable', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1110', name: 'Allowance for Doubtful Accounts', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1220', name: 'A/REC Trade Notes Receivable', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1230', name: 'A/REC Installment Receivables', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1240', name: 'A/REC Retainage Withheld', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1290', name: 'A/REC Allowance for Uncollectible Accounts', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1200', name: 'Inventory (Raw Materials, WIP, Finished Goods)', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1210', name: 'Raw Materials', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1310', name: 'INV - Reserved', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1320', name: 'INV - Work-in-Progress', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1330', name: 'INV - Finished Goods', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1340', name: 'INV - Reserved', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1350', name: 'INV - Unbilled Cost & Fees', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1390', name: 'INV - Reserve for Obsolescence', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1400', name: 'Prepaid Expenses (Rent, Insurance)', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1410', name: 'PREPAID - Insurance', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1420', name: 'PREPAID - Real Estate Taxes', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1430', name: 'PREPAID - Repairs & Maintenance', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1440', name: 'PREPAID - Rent', account_type: 'Asset', subcategory: 'Current Assets' },
  { code: '1450', name: 'PREPAID - Deposits', account_type: 'Asset', subcategory: 'Current Assets' },
  
  // Non-Current Assets (1500-1999)
  { code: '1500', name: 'Property, Plant & Equipment (Land, Buildings, Machinery)', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1510', name: 'PPE - Buildings', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1520', name: 'PPE - Machinery & Equipment', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1530', name: 'PPE - Vehicles', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1540', name: 'PPE - Computer Equipment', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1550', name: 'PPE - Furniture & Fixtures', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1560', name: 'PPE - Leasehold Improvements', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1600', name: 'Accumulated Depreciation & Amortization', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1610', name: 'ACCUM DEPR Buildings', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1620', name: 'ACCUM DEPR Machinery & Equipment', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1630', name: 'ACCUM DEPR Vehicles', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1640', name: 'ACCUM DEPR Computer Equipment', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1650', name: 'ACCUM DEPR Furniture & Fixtures', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1660', name: 'ACCUM DEPR Leasehold Improvements', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1700', name: 'Non-Current Receivables', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1710', name: 'NCA - Notes Receivable', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1720', name: 'NCA - Installment Receivables', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1730', name: 'NCA - Retainage Withheld', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1800', name: 'Intercompany Receivables', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1900', name: 'Other Non-Current Assets', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1910', name: 'Organization Costs', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1920', name: 'Patents & Licenses', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  { code: '1930', name: 'Intangible Assets - Capitalized Software Costs', account_type: 'Asset', subcategory: 'Non-Current Assets' },
  
  // ==========================================
  // 2000-2999: LIABILITIES
  // ==========================================
  
  // Current Liabilities (2000-2499)
  { code: '2000', name: 'Accounts Payable', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2010', name: 'Trade Payables', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2110', name: 'A/P Trade', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2120', name: 'A/P Accrued Accounts Payable', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2130', name: 'A/P Retainage Withheld', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2150', name: 'Current Maturities of Long-Term Debt', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2160', name: 'Bank Notes Payable', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2170', name: 'Construction Loans Payable', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2200', name: 'Accrued Compensation & Related Items', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2210', name: 'Accrued - Payroll', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2220', name: 'Accrued - Commissions', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2230', name: 'Accrued - FICA', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2240', name: 'Accrued - Unemployment Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2250', name: 'Accrued - Workmen\'s Comp', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2260', name: 'Accrued - Medical Benefits', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2270', name: 'Accrued - 401K Company Match', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2275', name: 'W/H - FICA', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2280', name: 'W/H - Medical Benefits', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2285', name: 'W/H - 401K Employee Contribution', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2300', name: 'Other Accrued Expenses', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2310', name: 'Accrued - Rent', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2320', name: 'Accrued - Interest', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2330', name: 'Accrued - Property Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2340', name: 'Accrued - Warranty Expense', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2500', name: 'Accrued Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2510', name: 'Accrued - Federal Income Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2520', name: 'Accrued - State Income Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2530', name: 'Accrued - Franchise Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2540', name: 'Deferred - FIT Current', account_type: 'Liability', subcategory: 'Current Liabilities' },
  { code: '2550', name: 'Deferred - State Income Taxes', account_type: 'Liability', subcategory: 'Current Liabilities' },
  
  // Non-Current Liabilities (2500-2999)
  { code: '2600', name: 'Deferred Taxes', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2610', name: 'D/T - FIT - Non Current', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2620', name: 'D/T - SIT - Non Current', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2700', name: 'Long-Term Debt', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2710', name: 'LTD - Notes Payable', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2720', name: 'LTD - Mortgages Payable', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2730', name: 'LTD - Installment Notes Payable', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2800', name: 'Intercompany Payables', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  { code: '2900', name: 'Other Non Current Liabilities', account_type: 'Liability', subcategory: 'Non-Current Liabilities' },
  
  // ==========================================
  // 3000-3999: EQUITY
  // ==========================================
  
  { code: '3000', name: 'Owner\'s Equities', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3100', name: 'Common Stock', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3200', name: 'Preferred Stock', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3300', name: 'Paid in Capital', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3400', name: 'Partners Capital', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3500', name: 'Member Contributions', account_type: 'Equity', subcategory: 'Owner\'s Equity' },
  { code: '3900', name: 'Retained Earnings', account_type: 'Equity', subcategory: 'Retained Earnings' },
  
  // ==========================================
  // 4000-4999: REVENUE (INCOME)
  // ==========================================
  
  { code: '4000', name: 'Revenue', account_type: 'Revenue', subcategory: 'Operating Revenue' },
  { code: '4010', name: 'REVENUE - PRODUCT 1', account_type: 'Revenue', subcategory: 'Operating Revenue' },
  { code: '4020', name: 'REVENUE - PRODUCT 2', account_type: 'Revenue', subcategory: 'Operating Revenue' },
  { code: '4030', name: 'REVENUE - PRODUCT 3', account_type: 'Revenue', subcategory: 'Operating Revenue' },
  { code: '4040', name: 'REVENUE - PRODUCT 4', account_type: 'Revenue', subcategory: 'Operating Revenue' },
  { code: '4600', name: 'Interest Income', account_type: 'Revenue', subcategory: 'Financial Income' },
  { code: '4700', name: 'Other Income', account_type: 'Revenue', subcategory: 'Other Operating Income' },
  { code: '4800', name: 'Finance Charge Income', account_type: 'Revenue', subcategory: 'Financial Income' },
  { code: '4900', name: 'Sales Returns and Allowances', account_type: 'Revenue', subcategory: 'Contra Revenue' },
  { code: '4950', name: 'Sales Discounts', account_type: 'Revenue', subcategory: 'Contra Revenue' },
  
  // ==========================================
  // 5000-5999: COST OF GOODS SOLD (COGS)
  // ==========================================
  
  { code: '5000', name: 'Cost of Goods Sold', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5010', name: 'COGS - PRODUCT 1', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5020', name: 'COGS - PRODUCT 2', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5030', name: 'COGS - PRODUCT 3', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5040', name: 'COGS - PRODUCT 4', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5700', name: 'Freight', account_type: 'COGS', subcategory: 'Direct Costs' },
  { code: '5800', name: 'Inventory Adjustments', account_type: 'COGS', subcategory: 'Inventory' },
  { code: '5900', name: 'Purchase Returns and Allowances', account_type: 'COGS', subcategory: 'Contra COGS' },
  { code: '5950', name: 'Reserved', account_type: 'COGS', subcategory: 'Direct Costs' },
  
  // ==========================================
  // 6000-6999: EXPENSES
  // ==========================================
  
  // Operating Expenses (6000-7000)
  { code: '6010', name: 'Advertising Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6050', name: 'Amortization Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6100', name: 'Auto Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6150', name: 'Bad Debt Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6200', name: 'Bank Charges', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6250', name: 'Cash Over and Short', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6300', name: 'Commission Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6350', name: 'Depreciation Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6400', name: 'Employee Benefit Program', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6550', name: 'Freight Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6600', name: 'Gifts Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6650', name: 'Insurance - General', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6700', name: 'Interest Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6750', name: 'Professional Fees', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6800', name: 'License Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6850', name: 'Maintenance Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6900', name: 'Meals and Entertainment', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '6950', name: 'Office Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7000', name: 'Payroll Taxes', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7050', name: 'Printing', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7150', name: 'Postage', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7200', name: 'Rent', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7250', name: 'Repairs Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7300', name: 'Salaries Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7350', name: 'Supplies Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7400', name: 'Taxes - FIT Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  { code: '7500', name: 'Utilities Expense', account_type: 'Expense', subcategory: 'Operating Expenses' },
  
  // ==========================================
  // 7000-7999: OTHER INCOME / OTHER EXPENSES
  // ==========================================
  
  // Other Income/Expenses (7900)
  { code: '7900', name: 'Gain/Loss on Sale of Assets', account_type: 'Other Income', subcategory: 'Non-Operating Income' },
]

// Account type groupings for display
export const ACCOUNT_TYPE_GROUPS = [
  { type: 'Asset', range: '1000-1999', color: 'green' },
  { type: 'Liability', range: '2000-2999', color: 'red' },
  { type: 'Equity', range: '3000-3999', color: 'purple' },
  { type: 'Revenue', range: '4000-4999', color: 'blue' },
  { type: 'COGS', range: '5000-5999', color: 'orange' },
  { type: 'Expense', range: '6000-6999', color: 'amber' },
  { type: 'Other Income', range: '7000-7499', color: 'teal' },
  { type: 'Other Expense', range: '7500-7999', color: 'pink' },
]

// Get accounts by type
export const getAccountsByType = (accounts, type) => {
  return accounts.filter(acc => acc.account_type === type)
}

// Get accounts by subcategory
export const getAccountsBySubcategory = (accounts, subcategory) => {
  return accounts.filter(acc => acc.subcategory === subcategory)
}

// Get unique subcategories for a type
export const getSubcategoriesForType = (accounts, type) => {
  const typeAccounts = getAccountsByType(accounts, type)
  return [...new Set(typeAccounts.map(acc => acc.subcategory).filter(Boolean))]
}
