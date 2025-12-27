# Double-Entry Accounting System - Setup Guide

## Overview

This application includes a comprehensive double-entry accounting system with a standard chart of accounts following international accounting principles.

## Chart of Accounts Structure

The system uses a standard numbering structure:

| Range | Account Type | Description |
|-------|-------------|-------------|
| **1000-1999** | **Assets** | What the business owns or controls |
| 1000-1499 | Current Assets | Cash, Bank, Accounts Receivable, Inventory, Prepaid Expenses |
| 1500-1999 | Non-Current Assets | Property, Plant & Equipment, Accumulated Depreciation, Intangible Assets |
| **2000-2999** | **Liabilities** | What the business owes |
| 2000-2499 | Current Liabilities | Accounts Payable, Accrued Expenses, Taxes Payable, Short-term Loans |
| 2500-2999 | Non-Current Liabilities | Long-term Loans, Mortgages, Lease Liabilities |
| **3000-3999** | **Equity** | Owner's claim on the business |
| 3000-3999 | Owner's Equity | Owner's Capital, Share Capital, Retained Earnings, Dividends |
| **4000-4999** | **Revenue** | Money earned from operations |
| 4000-4999 | Income | Sales Revenue, Service Revenue, Interest Income, Rental Income |
| **5000-5999** | **COGS** | Direct costs to produce goods/services |
| 5000-5999 | Cost of Goods Sold | Opening Inventory, Purchases, Direct Labor, Freight, Closing Inventory |
| **6000-6999** | **Expenses** | Costs incurred to run the business |
| 6000-6799 | Operating Expenses | Rent, Salaries, Utilities, Marketing, Insurance, Repairs |
| 6800-6999 | Non-Operating Expenses | Interest Expense, Depreciation, Bank Charges |
| **7000-7999** | **Other Income/Expenses** | Non-core activities |
| 7000-7499 | Other Income | Asset Disposal Gains, Foreign Exchange Gains |
| 7500-7999 | Other Expenses | Asset Disposal Losses, Foreign Exchange Losses, Penalties |

## Database Setup

### For New Installations

1. Run the main schema file:
```bash
psql -U your_username -d your_database -f supabase-schema.sql
```

### For Existing Installations

If you already have an accounts table, run the migration script:
```bash
psql -U your_username -d your_database -f migration-add-subcategory-cogs.sql
```

This will:
- Add the `subcategory` column
- Update account type constraints to include COGS, Other Income, and Other Expense
- Preserve all existing data

## Features

### 1. Chart of Accounts
- **200+ pre-configured accounts** covering all major business categories
- Organized by account type and subcategory
- Standard numbering system (1000-7999)
- Easy to add custom accounts

### 2. Journal Entries
- Create double-entry journal entries
- Automatic balance validation (Debits = Credits)
- Draft and post functionality
- Reference numbers and memos
- Multi-line entries support

### 3. Trial Balance
- Real-time trial balance calculation
- Shows debit and credit balances
- Balance verification
- Grouped by account type

### 4. General Ledger
- View transactions by account
- Running balance calculation
- Detailed transaction history
- Date-based filtering

## Using the System

### Initial Setup

1. **Navigate to Accounting page**
2. **Select your business** from the dropdown
3. **Click "Create Default Accounts"** to initialize the chart of accounts
   - This creates 200+ standard accounts
   - You can customize or add more accounts later

### Creating Journal Entries

#### Example 1: Cash Sale
```
Date: 2024-01-15
Description: Cash sale to customer

Debit:  1000 - Cash                    $1,000.00
Credit: 4000 - Sales Revenue                      $1,000.00
```

#### Example 2: Purchase Inventory with Cash
```
Date: 2024-01-16
Description: Purchase inventory for resale

Debit:  1200 - Inventory               $500.00
Credit: 1000 - Cash                               $500.00
```

#### Example 3: Pay Rent
```
Date: 2024-01-17
Description: Monthly office rent payment

Debit:  6000 - Rent Expense            $1,200.00
Credit: 1000 - Cash                               $1,200.00
```

#### Example 4: Record Cost of Goods Sold
```
Date: 2024-01-18
Description: Cost of goods sold for January sales

Debit:  5000 - Cost of Goods Sold      $300.00
Credit: 1200 - Inventory                          $300.00
```

### Account Categories Explained

#### Assets (1000-1999)
What your business owns:
- **Cash & Bank**: Money in hand and bank accounts
- **Accounts Receivable**: Money customers owe you
- **Inventory**: Goods for sale
- **Equipment**: Long-term assets like machinery, vehicles

#### Liabilities (2000-2999)
What your business owes:
- **Accounts Payable**: Money you owe suppliers
- **Loans**: Bank loans and credit
- **Taxes Payable**: Taxes you need to pay

#### Equity (3000-3999)
Owner's investment and retained profits:
- **Owner's Capital**: Initial investment
- **Retained Earnings**: Accumulated profits
- **Drawings**: Owner withdrawals

#### Revenue (4000-4999)
Income from business operations:
- **Sales Revenue**: Product sales
- **Service Revenue**: Service fees
- **Interest Income**: Investment income

#### COGS (5000-5999)
Direct costs of producing goods/services:
- **Purchases**: Raw materials or merchandise
- **Direct Labor**: Production wages
- **Freight**: Shipping costs for inventory

#### Expenses (6000-6999)
Operating costs:
- **Rent**: Office/store rent
- **Salaries**: Employee wages
- **Utilities**: Electricity, water, internet
- **Marketing**: Advertising costs

#### Other Income/Expenses (7000-7999)
Non-operating items:
- **Gains/Losses on Asset Sales**
- **Foreign Exchange Gains/Losses**
- **Penalties and Fines**

## Best Practices

### 1. Regular Recording
- Record transactions daily or weekly
- Don't wait until month-end

### 2. Use Reference Numbers
- Invoice numbers for sales
- Receipt numbers for purchases
- Check numbers for payments

### 3. Add Memos
- Explain unusual transactions
- Note customer/supplier names
- Reference supporting documents

### 4. Review Trial Balance
- Check monthly for balance
- Investigate any discrepancies
- Ensure debits equal credits

### 5. Backup Data
- Export reports regularly
- Keep supporting documents
- Maintain audit trail

## Common Transactions

### Sales Transaction (Cash)
1. Debit: Cash (1000)
2. Credit: Sales Revenue (4000)

### Sales Transaction (Credit)
1. Debit: Accounts Receivable (1100)
2. Credit: Sales Revenue (4000)

### Receive Payment from Customer
1. Debit: Cash (1000)
2. Credit: Accounts Receivable (1100)

### Purchase Inventory (Cash)
1. Debit: Inventory (1200)
2. Credit: Cash (1000)

### Purchase Inventory (Credit)
1. Debit: Inventory (1200)
2. Credit: Accounts Payable (2000)

### Pay Supplier
1. Debit: Accounts Payable (2000)
2. Credit: Cash (1000)

### Record Expense
1. Debit: [Expense Account] (6xxx)
2. Credit: Cash (1000)

### Owner Investment
1. Debit: Cash (1000)
2. Credit: Owner's Capital (3000)

### Owner Withdrawal
1. Debit: Owner's Drawings (3300)
2. Credit: Cash (1000)

## Troubleshooting

### Trial Balance Doesn't Balance
- Check all posted entries
- Verify debits equal credits in each entry
- Look for entries with only debit or only credit

### Can't Delete Account
- Account may have transactions
- Check if used in journal entries
- Consider marking inactive instead

### Missing Accounts
- Click "Create Default Accounts"
- Or manually add needed accounts
- Follow numbering convention

## Support

For issues or questions:
1. Check this documentation
2. Review the trial balance for errors
3. Verify all entries are posted
4. Contact support if needed

## Account Type Reference

| Type | Normal Balance | Increases With | Decreases With |
|------|---------------|----------------|----------------|
| Asset | Debit | Debit | Credit |
| Liability | Credit | Credit | Debit |
| Equity | Credit | Credit | Debit |
| Revenue | Credit | Credit | Debit |
| COGS | Debit | Debit | Credit |
| Expense | Debit | Debit | Credit |
| Other Income | Credit | Credit | Debit |
| Other Expense | Debit | Debit | Credit |

## Financial Statement Preparation

### Income Statement
- Revenue (4000-4999)
- Less: COGS (5000-5999)
- **= Gross Profit**
- Less: Expenses (6000-6999)
- Add: Other Income (7000-7499)
- Less: Other Expenses (7500-7999)
- **= Net Profit**

### Balance Sheet
- **Assets** (1000-1999)
- **Liabilities** (2000-2999)
- **Equity** (3000-3999)
- **Assets = Liabilities + Equity**
