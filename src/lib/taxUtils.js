export const TAX_TYPES = {
  SALES_TAX: 'sales_tax',
  INCOME_TAX: 'income_tax',
  WITHHOLDING_TAX: 'withholding_tax',
  PAYROLL_TAX: 'payroll_tax',
  OTHER: 'other'
}

export const TAX_TYPE_LABELS = {
  sales_tax: 'Sales Tax (VAT/GST)',
  income_tax: 'Income Tax',
  withholding_tax: 'Withholding Tax',
  payroll_tax: 'Payroll Tax',
  other: 'Other Tax'
}

export const TAX_PERIOD_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILED: 'filed',
  PAID: 'paid'
}

export const TAX_PERIOD_STATUS_LABELS = {
  open: 'Open',
  closed: 'Closed',
  filed: 'Filed',
  paid: 'Paid'
}

export const calculateTax = (amount, rate) => {
  const taxAmount = (amount * rate) / 100
  return {
    subtotal: amount,
    taxRate: rate,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat((amount + taxAmount).toFixed(2))
  }
}

export const calculateTaxFromTotal = (total, rate) => {
  const divisor = 1 + (rate / 100)
  const subtotal = total / divisor
  const taxAmount = total - subtotal
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxRate: rate,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  }
}

export const calculateIncomeTax = (taxableIncome, rate) => {
  if (taxableIncome <= 0) return 0
  return parseFloat(((taxableIncome * rate) / 100).toFixed(2))
}

export const getTaxAccountByType = (accounts, taxType) => {
  const taxAccountMap = {
    sales_tax: '2210',
    income_tax: '2220',
    withholding_tax: '2230',
    payroll_tax: '2240'
  }
  
  const accountCode = taxAccountMap[taxType]
  if (!accountCode) return null
  
  return accounts.find(acc => acc.code === accountCode)
}

export const getTaxExpenseAccountByType = (accounts, taxType) => {
  const taxExpenseMap = {
    income_tax: '6850',
    payroll_tax: '6860'
  }
  
  const accountCode = taxExpenseMap[taxType]
  if (!accountCode) return null
  
  return accounts.find(acc => acc.code === accountCode)
}

export const generateTaxPeriods = (year, taxType) => {
  const periods = []
  
  switch (taxType) {
    case 'sales_tax':
      for (let month = 0; month < 12; month++) {
        const start = new Date(year, month, 1)
        const end = new Date(year, month + 1, 0)
        periods.push({
          period_name: `${start.toLocaleString('default', { month: 'long' })} ${year}`,
          period_start: start.toISOString().split('T')[0],
          period_end: end.toISOString().split('T')[0],
          tax_type: taxType
        })
      }
      break
      
    case 'income_tax':
      for (let quarter = 0; quarter < 4; quarter++) {
        const startMonth = quarter * 3
        const start = new Date(year, startMonth, 1)
        const end = new Date(year, startMonth + 3, 0)
        periods.push({
          period_name: `Q${quarter + 1} ${year}`,
          period_start: start.toISOString().split('T')[0],
          period_end: end.toISOString().split('T')[0],
          tax_type: taxType
        })
      }
      break
      
    case 'withholding_tax':
    case 'payroll_tax':
      for (let month = 0; month < 12; month++) {
        const start = new Date(year, month, 1)
        const end = new Date(year, month + 1, 0)
        periods.push({
          period_name: `${start.toLocaleString('default', { month: 'long' })} ${year}`,
          period_start: start.toISOString().split('T')[0],
          period_end: end.toISOString().split('T')[0],
          tax_type: taxType
        })
      }
      break
      
    default:
      const start = new Date(year, 0, 1)
      const end = new Date(year, 11, 31)
      periods.push({
        period_name: `${year}`,
        period_start: start.toISOString().split('T')[0],
        period_end: end.toISOString().split('T')[0],
        tax_type: taxType
      })
  }
  
  return periods
}

export const formatTaxRate = (rate) => {
  return `${parseFloat(rate).toFixed(2)}%`
}

export const validateTaxRate = (rate) => {
  const numRate = parseFloat(rate)
  return !isNaN(numRate) && numRate >= 0 && numRate <= 100
}

export const DEFAULT_TAX_RATES = [
  {
    name: 'VAT/Sales Tax 16%',
    tax_type: 'sales_tax',
    rate: 16.00,
    description: 'Standard VAT/Sales Tax Rate'
  },
  {
    name: 'Corporate Income Tax 30%',
    tax_type: 'income_tax',
    rate: 30.00,
    description: 'Standard Corporate Income Tax Rate'
  },
  {
    name: 'Withholding Tax 15%',
    tax_type: 'withholding_tax',
    rate: 15.00,
    description: 'Standard Withholding Tax Rate'
  },
  {
    name: 'Payroll Tax 10%',
    tax_type: 'payroll_tax',
    rate: 10.00,
    description: 'Standard Payroll Tax Rate'
  }
]
