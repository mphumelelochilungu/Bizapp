# Tax System Implementation Guide

## Overview
This document provides a complete guide to the tax system implementation in your accounting application. The system supports multiple tax types including Sales Tax (VAT/GST), Income Tax, Withholding Tax, and Payroll Tax.

## Database Schema

### New Tables Created

#### 1. `tax_rates` - Tax Rate Configuration
Stores all tax rates configured for each business.

**Columns:**
- `id` - Primary key
- `user_business_id` - Foreign key to user_businesses
- `name` - Tax rate name (e.g., "VAT 16%")
- `tax_type` - Type: sales_tax, income_tax, withholding_tax, payroll_tax, other
- `rate` - Tax percentage (0-100)
- `is_active` - Whether the rate is currently active
- `effective_date` - Date when rate becomes effective
- `description` - Optional description
- `created_at`, `updated_at` - Timestamps

**Constraints:**
- Unique constraint on (user_business_id, name)
- Rate must be between 0 and 100

#### 2. `tax_transactions` - Tax Transaction Tracking
Links tax calculations to journal entries.

**Columns:**
- `id` - Primary key
- `journal_entry_id` - Foreign key to journal_entries
- `tax_rate_id` - Foreign key to tax_rates
- `tax_type` - Type of tax
- `taxable_amount` - Amount before tax
- `tax_amount` - Calculated tax amount
- `tax_account_id` - Account where tax is recorded
- `description` - Optional description
- `created_at` - Timestamp

#### 3. `tax_periods` - Tax Period Management
Tracks tax filing periods and their status.

**Columns:**
- `id` - Primary key
- `user_business_id` - Foreign key to user_businesses
- `tax_type` - Type of tax
- `period_name` - Name (e.g., "Q1 2025")
- `period_start`, `period_end` - Date range
- `status` - open, closed, filed, paid
- `total_tax_collected` - Total tax collected in period
- `total_tax_paid` - Total tax paid in period
- `net_tax_due` - Net amount due
- `filing_date`, `payment_date` - Important dates
- `notes` - Optional notes
- `created_at`, `updated_at` - Timestamps

**Constraints:**
- Unique constraint on (user_business_id, tax_type, period_start, period_end)

### New Tax Accounts

The following accounts are automatically created for all businesses:

**Liability Accounts (Current Liabilities):**
- `2210` - Sales Tax Payable
- `2220` - Income Tax Payable
- `2230` - Withholding Tax Payable
- `2240` - Payroll Tax Payable

**Expense Accounts:**
- `6850` - Income Tax Expense (Non-Operating)
- `6860` - Payroll Tax Expense (Operating)

## Migration

### Running the Migration

Execute the migration script to add tax system to existing databases:

```bash
psql -U your_username -d your_database -f migration-add-tax-system.sql
```

Or run in Supabase SQL Editor:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste contents of `migration-add-tax-system.sql`
4. Click "Run"

### What the Migration Does

1. Creates three new tables (tax_rates, tax_transactions, tax_periods)
2. Enables Row Level Security (RLS) on all tax tables
3. Creates RLS policies for secure multi-tenant access
4. Adds new tax accounts to all existing businesses
5. Inserts default tax rates (16% VAT, 30% Income Tax, 15% Withholding Tax)

## Features

### 1. Tax Settings Page (`/tax-settings`)

**Features:**
- Configure multiple tax rates per business
- Support for all tax types
- Activate/deactivate tax rates
- Edit and delete tax rates
- Initialize default tax rates
- Visual statistics dashboard

**Usage:**
1. Navigate to Tax Settings
2. Click "Add Tax Rate" or "Add Default Rates"
3. Configure tax name, type, rate percentage, and description
4. Activate/deactivate rates as needed

### 2. Tax Reports Page (`/tax-reports`)

**Four Main Reports:**

#### A. Sales Tax Report
- Shows tax collected from customers
- Shows tax paid to authorities
- Calculates net tax due
- Visual charts and breakdowns

#### B. Income Tax Report
- Calculates taxable income from P&L
- Shows revenue, COGS, gross profit, expenses
- Estimates income tax based on configured rate
- Full tax calculation breakdown

#### C. Withholding Tax Report
- Tracks tax withheld from payments
- Shows tax remitted to authorities
- Calculates net tax due

#### D. Tax Periods Management
- Create and manage tax filing periods
- Track period status (open, closed, filed, paid)
- Generate periods automatically for a year
- Monthly periods for sales/withholding/payroll tax
- Quarterly periods for income tax

### 3. Tax Utilities (`taxUtils.js`)

**Helper Functions:**
- `calculateTax(amount, rate)` - Calculate tax on amount
- `calculateTaxFromTotal(total, rate)` - Extract tax from total
- `calculateIncomeTax(taxableIncome, rate)` - Calculate income tax
- `getTaxAccountByType(accounts, taxType)` - Get tax liability account
- `generateTaxPeriods(year, taxType)` - Generate tax periods
- `formatTaxRate(rate)` - Format rate as percentage
- `validateTaxRate(rate)` - Validate rate is 0-100

## Usage Examples

### Example 1: Recording a Sale with Sales Tax

**Scenario:** Sale of ZK 1,000 with 16% VAT

**Journal Entry:**
```
Debit:  Cash (1010)              ZK 1,160
Credit: Sales Revenue (4000)     ZK 1,000
Credit: Sales Tax Payable (2210) ZK   160
```

**Using Tax Utilities:**
```javascript
import { calculateTax } from '../lib/taxUtils'

const sale = calculateTax(1000, 16)
// Returns: { subtotal: 1000, taxRate: 16, taxAmount: 160, total: 1160 }
```

### Example 2: Recording Income Tax

**Scenario:** Quarterly income tax of ZK 10,000

**Journal Entry:**
```
Debit:  Income Tax Expense (6850)  ZK 10,000
Credit: Income Tax Payable (2220)  ZK 10,000
```

### Example 3: Paying Tax to Authorities

**Scenario:** Remitting ZK 5,000 sales tax

**Journal Entry:**
```
Debit:  Sales Tax Payable (2210)  ZK 5,000
Credit: Cash (1010)               ZK 5,000
```

## Tax Calculation Logic

### Sales Tax Calculation
```
Tax Amount = Subtotal × (Tax Rate / 100)
Total = Subtotal + Tax Amount
```

### Income Tax Calculation
```
Gross Profit = Revenue - COGS
Taxable Income = Gross Profit - Operating Expenses
Income Tax = Taxable Income × (Tax Rate / 100)
```

### Withholding Tax Calculation
```
Withholding Tax = Payment Amount × (Withholding Rate / 100)
Net Payment = Payment Amount - Withholding Tax
```

## Reports Integration

The tax system integrates with existing reports:

### Income Statement (P&L)
- Now includes COGS section
- Shows Gross Profit calculation
- Separates operating and non-operating expenses
- Income tax expense appears in non-operating expenses

### Tax Summary Report
- Enhanced to show COGS and Gross Profit
- Calculates taxable income correctly
- Shows estimated tax based on configured rates

### Balance Sheet
- Tax liability accounts show amounts owed
- Tax expense accounts reduce equity through retained earnings

## Best Practices

### 1. Tax Rate Configuration
- Set up tax rates before recording transactions
- Use descriptive names (e.g., "VAT 16% - Standard Rate")
- Keep inactive rates for historical reference
- Update effective dates when rates change

### 2. Tax Period Management
- Create periods at the start of each year
- Close periods after filing
- Mark as "paid" after remittance
- Keep notes on filing reference numbers

### 3. Recording Transactions
- Always separate tax from base amount
- Use correct tax accounts (2210, 2220, etc.)
- Record tax transactions when they occur
- Reconcile tax accounts monthly

### 4. Tax Reporting
- Run reports before filing deadlines
- Review all tax transactions for accuracy
- Keep backup of reports for audit trail
- File and pay on time to avoid penalties

## Compliance Considerations

### Record Keeping
- Maintain all tax transaction records
- Keep copies of filed tax returns
- Document payment confirmations
- Store for required retention period (typically 7 years)

### Audit Trail
- All tax transactions are timestamped
- RLS policies ensure data security
- Tax periods track filing and payment dates
- Journal entries provide complete audit trail

### Multi-Currency (Future Enhancement)
- Current implementation assumes single currency
- For multi-currency, add currency fields to tax_transactions
- Convert to base currency for reporting

## Troubleshooting

### Issue: Tax accounts not showing
**Solution:** Run migration script to add tax accounts to existing businesses

### Issue: Tax rates not calculating
**Solution:** Ensure tax rate is marked as active and effective date is valid

### Issue: Reports showing incorrect amounts
**Solution:** Verify date range and ensure all transactions are posted

### Issue: Cannot delete tax rate
**Solution:** Check if tax rate is referenced by tax transactions

## Future Enhancements

### Planned Features
1. Automated tax calculation on journal entries
2. Tax invoice generation with QR codes
3. Electronic filing integration
4. Tax payment scheduling and reminders
5. Multi-jurisdiction tax support
6. Tax exemption management
7. Reverse charge mechanism for B2B
8. Tax audit report generation

### API Integration Opportunities
- Government tax authority APIs
- Payment gateway integration for tax payments
- Accounting software export (QuickBooks, Xero)
- E-filing system integration

## Support

For issues or questions:
1. Check this documentation
2. Review migration logs
3. Verify RLS policies are active
4. Check Supabase logs for errors
5. Ensure user has proper business access

## Version History

**Version 1.0** (Current)
- Initial tax system implementation
- Four tax types supported
- Comprehensive reporting
- Tax period management
- Default tax rates and accounts

---

**Last Updated:** December 26, 2025
**Author:** Cascade AI Assistant
**Status:** Production Ready
