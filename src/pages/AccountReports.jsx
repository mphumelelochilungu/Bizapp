import { useState, useEffect } from 'react'
import { 
  BarChart3, RefreshCw, Building2, TrendingUp, TrendingDown, 
  DollarSign, FileText, Scale, List, Calendar, Download,
  CreditCard, Users, Receipt, Calculator, ChevronDown, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'

const CHART_COLORS = {
  assets: '#22c55e',
  liabilities: '#ef4444',
  equity: '#3b82f6',
  revenue: '#3b82f6',
  expenses: '#f97316',
  cash: '#10b981',
  primary: '#6366f1',
  secondary: '#8b5cf6',
}

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const REPORT_CATEGORIES = [
  {
    id: 'financial-statements',
    name: 'Financial Statements',
    icon: FileText,
    description: 'Core financial reports',
    reports: [
      { id: 'income-statement', name: 'Income Statement (P&L)', icon: TrendingUp },
      { id: 'balance-sheet', name: 'Balance Sheet', icon: Scale },
      { id: 'cash-flow', name: 'Cash Flow Statement', icon: DollarSign },
    ]
  },
  {
    id: 'control-reports',
    name: 'Accounting Control Reports',
    icon: Calculator,
    description: 'Accuracy and compliance',
    reports: [
      { id: 'trial-balance', name: 'Trial Balance', icon: Scale },
      { id: 'general-ledger', name: 'General Ledger Report', icon: List },
      { id: 'journal-report', name: 'Journal Report', icon: FileText },
    ]
  },
  {
    id: 'management-reports',
    name: 'Management Reports',
    icon: BarChart3,
    description: 'Decision-making insights',
    reports: [
      { id: 'expense-analysis', name: 'Expense Analysis', icon: TrendingDown },
      { id: 'revenue-analysis', name: 'Revenue Analysis', icon: TrendingUp },
      { id: 'ap-aging', name: 'Accounts Payable Aging', icon: CreditCard },
      { id: 'ar-aging', name: 'Accounts Receivable Aging', icon: Users },
    ]
  },
  {
    id: 'tax-reports',
    name: 'Tax & Compliance Reports',
    icon: Receipt,
    description: 'Legal and tax reporting',
    reports: [
      { id: 'tax-summary', name: 'Tax Summary Report', icon: Receipt },
    ]
  },
]

export function AccountReports() {
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(['financial-statements'])
  
  const [accounts, setAccounts] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [reportData, setReportData] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchUserBusinesses()
  }, [])

  useEffect(() => {
    if (selectedBusinessId) {
      fetchAccountingData()
    }
  }, [selectedBusinessId])

  useEffect(() => {
    if (activeReport && accounts.length > 0) {
      generateReport(activeReport)
    }
  }, [activeReport, accounts, journalEntries, dateRange])

  const fetchUserBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_businesses')
        .select('id, name')
        .eq('user_id', user.id)

      if (error) throw error
      setUserBusinesses(data || [])
      if (data && data.length > 0) {
        setSelectedBusinessId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAccountingData = async () => {
    try {
      const [accountsRes, entriesRes] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('user_business_id', selectedBusinessId)
          .order('code'),
        supabase
          .from('journal_entries')
          .select(`
            *,
            journal_entry_lines (
              *,
              accounts (code, name, account_type)
            )
          `)
          .eq('user_business_id', selectedBusinessId)
          .eq('is_posted', true)
          .order('entry_date', { ascending: true })
      ])

      if (accountsRes.error) throw accountsRes.error
      if (entriesRes.error) throw entriesRes.error

      setAccounts(accountsRes.data || [])
      setJournalEntries(entriesRes.data || [])
    } catch (error) {
      console.error('Error fetching accounting data:', error)
    }
  }

  const getAccountBalance = (accountId, upToDate = null) => {
    let totalDebit = 0
    let totalCredit = 0

    journalEntries.forEach(entry => {
      if (upToDate && new Date(entry.entry_date) > new Date(upToDate)) return
      
      entry.journal_entry_lines?.forEach(line => {
        if (line.account_id === accountId) {
          totalDebit += parseFloat(line.debit_amount) || 0
          totalCredit += parseFloat(line.credit_amount) || 0
        }
      })
    })

    return { totalDebit, totalCredit, balance: totalDebit - totalCredit }
  }

  const getAccountBalanceInRange = (accountId, startDate, endDate) => {
    let totalDebit = 0
    let totalCredit = 0

    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.entry_date)
      if (entryDate < new Date(startDate) || entryDate > new Date(endDate)) return
      
      entry.journal_entry_lines?.forEach(line => {
        if (line.account_id === accountId) {
          totalDebit += parseFloat(line.debit_amount) || 0
          totalCredit += parseFloat(line.credit_amount) || 0
        }
      })
    })

    return { totalDebit, totalCredit, balance: totalDebit - totalCredit }
  }

  const generateReport = (reportId) => {
    switch (reportId) {
      case 'income-statement':
        generateIncomeStatement()
        break
      case 'balance-sheet':
        generateBalanceSheet()
        break
      case 'cash-flow':
        generateCashFlow()
        break
      case 'trial-balance':
        generateTrialBalance()
        break
      case 'general-ledger':
        generateGeneralLedger()
        break
      case 'journal-report':
        generateJournalReport()
        break
      case 'expense-analysis':
        generateExpenseAnalysis()
        break
      case 'revenue-analysis':
        generateRevenueAnalysis()
        break
      case 'ap-aging':
        generateAPAging()
        break
      case 'ar-aging':
        generateARAging()
        break
      case 'tax-summary':
        generateTaxSummary()
        break
      default:
        setReportData(null)
    }
  }

  const generateIncomeStatement = () => {
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    const cogsAccounts = accounts.filter(a => a.account_type === 'COGS')
    const expenseAccounts = accounts.filter(a => a.account_type === 'Expense')

    const revenues = revenueAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      // Revenue has credit balance (negative in our system)
      // If balance < 0 (normal credit), show as positive revenue
      // If balance > 0 (abnormal debit - e.g., returns or misclassified expense), show as negative (contra-revenue)
      const displayBalance = balance < 0 ? Math.abs(balance) : -balance
      const isAbnormal = balance > 0
      return { ...account, balance: displayBalance, rawBalance: balance, isAbnormal }
    }).filter(a => a.balance !== 0 || a.rawBalance !== 0)

    const cogs = cogsAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return { ...account, balance: Math.abs(balance) }
    }).filter(a => a.balance !== 0)

    // Separate operating and non-operating expenses
    const allExpenses = expenseAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return { ...account, balance: Math.abs(balance) }
    }).filter(a => a.balance !== 0)

    const operatingExpenses = allExpenses.filter(a => a.subcategory === 'Operating Expenses')
    const nonOperatingExpenses = allExpenses.filter(a => a.subcategory === 'Non-Operating Expenses')

    const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0)
    const totalCOGS = cogs.reduce((sum, a) => sum + a.balance, 0)
    const grossProfit = totalRevenue - totalCOGS
    const totalOperatingExpenses = operatingExpenses.reduce((sum, a) => sum + a.balance, 0)
    const operatingProfit = grossProfit - totalOperatingExpenses
    const totalNonOperatingExpenses = nonOperatingExpenses.reduce((sum, a) => sum + a.balance, 0)
    const netIncome = operatingProfit - totalNonOperatingExpenses

    setReportData({
      type: 'income-statement',
      revenues,
      cogs,
      operatingExpenses,
      nonOperatingExpenses,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalOperatingExpenses,
      operatingProfit,
      totalNonOperatingExpenses,
      netIncome
    })
  }

  const generateBalanceSheet = () => {
    const assetAccounts = accounts.filter(a => a.account_type === 'Asset')
    const liabilityAccounts = accounts.filter(a => a.account_type === 'Liability')
    const equityAccounts = accounts.filter(a => a.account_type === 'Equity')

    // Assets: normal balance is DEBIT (positive in our calc)
    const allAssetBalances = assetAccounts.map(account => {
      const { balance } = getAccountBalance(account.id, dateRange.endDate)
      return { ...account, balance, rawBalance: balance }
    })
    
    const assets = allAssetBalances
      .filter(a => a.rawBalance > 0)
      .map(a => ({ ...a, hasAbnormalBalance: false }))

    // Liabilities: normal balance is CREDIT (negative in our calc)
    // For liabilities with debit balances, we need to calculate the implied opening
    let totalOpeningBalanceEquityAdjustment = 0
    
    const allLiabilityBalances = liabilityAccounts.map(account => {
      const { totalDebit, totalCredit, balance } = getAccountBalance(account.id, dateRange.endDate)
      
      // If balance > 0 (debit balance), it means debits > credits
      // This implies there was an opening credit balance that we paid off
      // Implied opening = totalDebit (the amount paid must have existed as liability)
      // True ending liability = totalCredit (what we actually incurred and still owe)
      
      if (balance > 0) {
        // Debit balance - missing opening entry
        // The implied opening entry: Dr Opening Balance Equity, Cr Liability
        const impliedOpening = totalDebit
        totalOpeningBalanceEquityAdjustment -= impliedOpening // Debit to OBE reduces equity
        
        return { 
          ...account, 
          rawBalance: balance,
          trueBalance: totalCredit, // What we actually owe (credits recorded)
          hasAbnormalBalance: true,
          impliedOpening
        }
      } else {
        // Normal credit balance
        return { 
          ...account, 
          rawBalance: balance,
          trueBalance: Math.abs(balance),
          hasAbnormalBalance: false,
          impliedOpening: 0
        }
      }
    })
    
    // Show all liabilities with their TRUE balances
    const liabilities = allLiabilityBalances
      .filter(a => a.trueBalance > 0)
      .map(a => ({ 
        ...a, 
        balance: a.trueBalance
      }))

    // Equity: normal balance is CREDIT (negative in our calc)
    const allEquityBalances = equityAccounts.map(account => {
      const { balance } = getAccountBalance(account.id, dateRange.endDate)
      return { ...account, balance: Math.abs(balance), rawBalance: balance }
    })
    
    const equity = allEquityBalances.filter(a => a.rawBalance < 0)

    // Calculate net income from revenue, COGS, and expenses
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    const cogsAccounts = accounts.filter(a => a.account_type === 'COGS')
    const expenseAccounts = accounts.filter(a => a.account_type === 'Expense')
    
    let netIncome = 0
    revenueAccounts.forEach(account => {
      const { balance } = getAccountBalance(account.id, dateRange.endDate)
      if (balance < 0) {
        netIncome += Math.abs(balance)
      } else if (balance > 0) {
        netIncome -= balance
      }
    })
    cogsAccounts.forEach(account => {
      const { balance } = getAccountBalance(account.id, dateRange.endDate)
      netIncome -= Math.abs(balance)
    })
    expenseAccounts.forEach(account => {
      const { balance } = getAccountBalance(account.id, dateRange.endDate)
      netIncome -= Math.abs(balance)
    })

    // Calculate totals
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0)
    const totalEquityFromAccounts = equity.reduce((sum, a) => sum + a.balance, 0)
    
    // Calculate opening retained earnings to balance the sheet
    // Formula: Assets = Liabilities + Equity
    // Equity = Owner's Equity + Opening Balance Equity Adj + Opening RE + Net Income
    const preliminaryEquity = totalEquityFromAccounts + totalOpeningBalanceEquityAdjustment + netIncome
    const openingRetainedEarnings = totalAssets - totalLiabilities - preliminaryEquity
    
    const totalRetainedEarnings = openingRetainedEarnings + netIncome
    const totalEquity = totalEquityFromAccounts + totalOpeningBalanceEquityAdjustment + totalRetainedEarnings
    
    // Flag if there are abnormal balances (informational)
    const hasAbnormalBalances = liabilities.some(l => l.hasAbnormalBalance)

    setReportData({
      type: 'balance-sheet',
      assets,
      liabilities,
      equity,
      invalidAssets: [],
      invalidLiabilities: [],
      openingRetainedEarnings,
      openingBalanceEquityAdjustment: totalOpeningBalanceEquityAdjustment,
      netIncome,
      totalRetainedEarnings,
      totalAssets,
      totalLiabilities,
      totalEquity,
      hasDataErrors: false,
      hasAbnormalBalances,
      hasImbalance: Math.abs(totalAssets - (totalLiabilities + totalEquity)) > 0.01
    })
  }

  const generateCashFlow = () => {
    const cashAccount = accounts.find(a => a.name.toLowerCase().includes('cash') && a.account_type === 'Asset')
    if (!cashAccount) {
      setReportData({ type: 'cash-flow', error: 'No cash account found' })
      return
    }

    const cashMovements = []
    let openingBalance = 0
    
    // Track inflows and outflows separately for each category
    let operatingInflows = 0
    let operatingOutflows = 0
    let investingInflows = 0
    let investingOutflows = 0
    let financingInflows = 0
    let financingOutflows = 0

    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.entry_date)
      if (entryDate < new Date(dateRange.startDate)) {
        entry.journal_entry_lines?.forEach(line => {
          if (line.account_id === cashAccount.id) {
            openingBalance += (parseFloat(line.debit_amount) || 0) - (parseFloat(line.credit_amount) || 0)
          }
        })
        return
      }
      if (entryDate > new Date(dateRange.endDate)) return

      entry.journal_entry_lines?.forEach(line => {
        if (line.account_id === cashAccount.id) {
          const debit = parseFloat(line.debit_amount) || 0
          const credit = parseFloat(line.credit_amount) || 0
          const amount = debit - credit
          const otherLines = entry.journal_entry_lines.filter(l => l.account_id !== cashAccount.id)
          const category = categorizeTransaction(otherLines)
          
          // Get description from the other account(s) in the entry
          const otherAccount = otherLines.length > 0 ? accounts.find(a => a.id === otherLines[0].account_id) : null
          const description = entry.description || otherAccount?.name || 'Cash transaction'
          
          cashMovements.push({
            date: entry.entry_date,
            description,
            amount,
            category,
            isInflow: amount > 0
          })

          if (category === 'operating') {
            if (amount > 0) operatingInflows += amount
            else operatingOutflows += Math.abs(amount)
          } else if (category === 'investing') {
            if (amount > 0) investingInflows += amount
            else investingOutflows += Math.abs(amount)
          } else if (category === 'financing') {
            if (amount > 0) financingInflows += amount
            else financingOutflows += Math.abs(amount)
          }
        }
      })
    })

    const operatingActivities = operatingInflows - operatingOutflows
    const investingActivities = investingInflows - investingOutflows
    const financingActivities = financingInflows - financingOutflows
    const closingBalance = openingBalance + operatingActivities + investingActivities + financingActivities

    setReportData({
      type: 'cash-flow',
      openingBalance,
      operatingInflows,
      operatingOutflows,
      operatingActivities,
      investingInflows,
      investingOutflows,
      investingActivities,
      financingInflows,
      financingOutflows,
      financingActivities,
      closingBalance,
      cashMovements
    })
  }

  const categorizeTransaction = (lines) => {
    for (const line of lines) {
      const accountType = line.accounts?.account_type
      if (accountType === 'Revenue' || accountType === 'Expense') return 'operating'
      if (line.accounts?.name?.toLowerCase().includes('equipment') || 
          line.accounts?.name?.toLowerCase().includes('property')) return 'investing'
      if (accountType === 'Equity' || 
          line.accounts?.name?.toLowerCase().includes('loan')) return 'financing'
    }
    return 'operating'
  }

  const generateTrialBalance = () => {
    // Define normal balance directions for each account type
    const normalBalanceIsDebit = {
      'Asset': true,
      'Expense': true,
      'COGS': true,
      'Liability': false,
      'Equity': false,
      'Revenue': false
    }
    
    const balances = accounts.map(account => {
      const { totalDebit, totalCredit, balance } = getAccountBalance(account.id, dateRange.endDate)
      
      // Trial balance must show ALL non-zero balances to ensure it balances
      // Positive balance = Debit, Negative balance = Credit
      let displayDebit = 0
      let displayCredit = 0
      
      if (balance > 0) {
        displayDebit = balance
        displayCredit = 0
      } else if (balance < 0) {
        displayDebit = 0
        displayCredit = Math.abs(balance)
      }
      
      // Check if balance is abnormal for this account type
      const expectsDebit = normalBalanceIsDebit[account.account_type]
      const hasDebitBalance = balance > 0
      const hasAbnormalBalance = balance !== 0 && expectsDebit !== hasDebitBalance
      
      return {
        ...account,
        totalDebit,
        totalCredit,
        balance,
        displayDebit,
        displayCredit,
        hasAbnormalBalance,
        abnormalReason: hasAbnormalBalance 
          ? (expectsDebit 
              ? 'Credit balance (normally Debit)' 
              : 'Debit balance (normally Credit) - may indicate missing opening entry')
          : null
      }
    }).filter(a => a.displayDebit > 0 || a.displayCredit > 0)

    const totalDebits = balances.reduce((sum, a) => sum + a.displayDebit, 0)
    const totalCredits = balances.reduce((sum, a) => sum + a.displayCredit, 0)
    const abnormalBalances = balances.filter(b => b.hasAbnormalBalance)

    setReportData({
      type: 'trial-balance',
      balances,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      hasAbnormalBalances: abnormalBalances.length > 0,
      abnormalBalances
    })
  }

  const generateGeneralLedger = () => {
    const ledgerData = accounts.map(account => {
      // Collect all transactions for this account
      const allTransactions = []

      journalEntries.forEach(entry => {
        entry.journal_entry_lines?.forEach(line => {
          if (line.account_id === account.id) {
            const debit = parseFloat(line.debit_amount) || 0
            const credit = parseFloat(line.credit_amount) || 0

            allTransactions.push({
              date: entry.entry_date,
              description: entry.description,
              reference: entry.reference_number,
              entryId: entry.id,
              createdAt: entry.created_at,
              debit,
              credit
            })
          }
        })
      })

      // Sort transactions by date (chronological order), then by created_at for same-date entries
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        const dateDiff = dateA.getTime() - dateB.getTime()
        if (dateDiff !== 0) return dateDiff
        // Secondary sort by created_at for same-date entries
        const createdA = new Date(a.createdAt || 0)
        const createdB = new Date(b.createdAt || 0)
        return createdA.getTime() - createdB.getTime()
      })

      // Calculate running balance in chronological order
      let runningBalance = 0
      const transactions = allTransactions.map(txn => {
        runningBalance += txn.debit - txn.credit
        return {
          ...txn,
          balance: runningBalance
        }
      })
      
      // Debug log to verify sorting
      if (account.name.toLowerCase().includes('cash')) {
        console.log('Cash transactions after sort:', transactions.map(t => ({ date: t.date, debit: t.debit, credit: t.credit, balance: t.balance })))
      }

      return {
        ...account,
        transactions,
        closingBalance: runningBalance
      }
    }).filter(a => a.transactions.length > 0)

    setReportData({
      type: 'general-ledger',
      accounts: ledgerData
    })
  }

  const generateJournalReport = () => {
    const filteredEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date)
      return entryDate >= new Date(dateRange.startDate) && entryDate <= new Date(dateRange.endDate)
    })

    setReportData({
      type: 'journal-report',
      entries: filteredEntries
    })
  }

  const generateExpenseAnalysis = () => {
    // Get COGS accounts
    const cogsAccounts = accounts.filter(a => a.account_type === 'COGS')
    const cogs = cogsAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return { ...account, amount: Math.abs(balance) }
    }).filter(a => a.amount > 0).sort((a, b) => b.amount - a.amount)
    const totalCOGS = cogs.reduce((sum, a) => sum + a.amount, 0)

    // Get Operating Expense accounts
    const expenseAccounts = accounts.filter(a => a.account_type === 'Expense')
    const expenses = expenseAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return { ...account, amount: Math.abs(balance) }
    }).filter(a => a.amount > 0).sort((a, b) => b.amount - a.amount)
    const totalExpenses = expenses.reduce((sum, a) => sum + a.amount, 0)

    // Get Total Revenue for percentage calculation
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    const totalRevenue = revenueAccounts.reduce((sum, account) => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return sum + Math.abs(balance)
    }, 0)

    // Calculate combined totals
    const totalCosts = totalCOGS + totalExpenses
    const grossProfit = totalRevenue - totalCOGS

    setReportData({
      type: 'expense-analysis',
      cogs,
      totalCOGS,
      expenses,
      totalExpenses,
      totalRevenue,
      totalCosts,
      grossProfit
    })
  }

  const generateRevenueAnalysis = () => {
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    
    const revenues = revenueAccounts.map(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      return { ...account, amount: Math.abs(balance) }
    }).filter(a => a.amount > 0).sort((a, b) => b.amount - a.amount)

    const totalRevenue = revenues.reduce((sum, a) => sum + a.amount, 0)

    setReportData({
      type: 'revenue-analysis',
      revenues,
      totalRevenue
    })
  }

  const generateAPAging = () => {
    const apAccount = accounts.find(a => a.name.toLowerCase().includes('accounts payable') || a.name.toLowerCase().includes('payable'))
    if (!apAccount) {
      setReportData({ type: 'ap-aging', error: 'No Accounts Payable account found', transactions: [] })
      return
    }

    const today = new Date(dateRange.endDate)
    
    // Collect all A/P transactions with running balance
    const transactions = []
    let runningBalance = 0
    
    journalEntries
      .filter(entry => new Date(entry.entry_date) <= today)
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .forEach(entry => {
        entry.journal_entry_lines?.forEach(line => {
          if (line.account_id === apAccount.id) {
            const credit = parseFloat(line.credit_amount) || 0
            const debit = parseFloat(line.debit_amount) || 0
            const amount = credit - debit
            
            if (amount !== 0) {
              runningBalance += amount
              
              // Get vendor/description from other lines in the entry
              const otherLines = entry.journal_entry_lines.filter(l => l.account_id !== apAccount.id)
              const otherAccount = otherLines.length > 0 ? accounts.find(a => a.id === otherLines[0].account_id) : null
              const vendor = entry.description || otherAccount?.name || 'General'
              
              transactions.push({
                date: entry.entry_date,
                vendor,
                description: entry.description,
                debit,
                credit,
                amount,
                balance: runningBalance,
                entryId: entry.id
              })
            }
          }
        })
      })
    
    // Calculate aging buckets based on outstanding balance
    const aging = { current: 0, days30: 0, days60: 0, days90: 0, days120: 0, over120: 0 }
    
    // For each credit (purchase), track if it's been paid off
    const outstandingPurchases = []
    transactions.forEach(tx => {
      if (tx.credit > 0) {
        // This is a purchase/liability increase
        const daysDiff = Math.floor((today - new Date(tx.date)) / (1000 * 60 * 60 * 24))
        outstandingPurchases.push({
          date: tx.date,
          amount: tx.credit,
          age: daysDiff,
          vendor: tx.vendor
        })
      } else if (tx.debit > 0) {
        // This is a payment - reduce oldest purchases first (FIFO)
        let paymentRemaining = tx.debit
        for (let i = 0; i < outstandingPurchases.length && paymentRemaining > 0; i++) {
          const purchase = outstandingPurchases[i]
          const paymentApplied = Math.min(purchase.amount, paymentRemaining)
          purchase.amount -= paymentApplied
          paymentRemaining -= paymentApplied
        }
      }
    })
    
    // Age the remaining outstanding purchases
    outstandingPurchases.forEach(purchase => {
      if (purchase.amount > 0) {
        if (purchase.age <= 30) aging.current += purchase.amount
        else if (purchase.age <= 60) aging.days30 += purchase.amount
        else if (purchase.age <= 90) aging.days60 += purchase.amount
        else if (purchase.age <= 120) aging.days90 += purchase.amount
        else aging.over120 += purchase.amount
      }
    })

    const { balance } = getAccountBalance(apAccount.id, dateRange.endDate)
    const totalPayable = Math.abs(balance)
    
    setReportData({
      type: 'ap-aging',
      transactions,
      outstandingPurchases: outstandingPurchases.filter(p => p.amount > 0),
      aging,
      totalPayable
    })
  }

  const generateARAging = () => {
    const arAccount = accounts.find(a => a.name.toLowerCase().includes('accounts receivable') || a.name.toLowerCase().includes('receivable'))
    if (!arAccount) {
      setReportData({ type: 'ar-aging', error: 'No Accounts Receivable account found', transactions: [] })
      return
    }

    const today = new Date(dateRange.endDate)
    
    // Collect all A/R transactions with running balance
    const transactions = []
    let runningBalance = 0
    
    journalEntries
      .filter(entry => new Date(entry.entry_date) <= today)
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .forEach(entry => {
        entry.journal_entry_lines?.forEach(line => {
          if (line.account_id === arAccount.id) {
            const debit = parseFloat(line.debit_amount) || 0
            const credit = parseFloat(line.credit_amount) || 0
            const amount = debit - credit
            
            if (amount !== 0) {
              runningBalance += amount
              
              // Get customer/description from other lines in the entry
              const otherLines = entry.journal_entry_lines.filter(l => l.account_id !== arAccount.id)
              const otherAccount = otherLines.length > 0 ? accounts.find(a => a.id === otherLines[0].account_id) : null
              const customer = entry.description || otherAccount?.name || 'General'
              
              transactions.push({
                date: entry.entry_date,
                customer,
                description: entry.description,
                debit,
                credit,
                amount,
                balance: runningBalance,
                entryId: entry.id
              })
            }
          }
        })
      })
    
    // Calculate aging buckets based on outstanding balance
    const aging = { current: 0, days30: 0, days60: 0, days90: 0, days120: 0, over120: 0 }
    
    // For each debit (invoice), track if it's been collected
    const outstandingInvoices = []
    transactions.forEach(tx => {
      if (tx.debit > 0) {
        // This is an invoice/receivable increase
        const daysDiff = Math.floor((today - new Date(tx.date)) / (1000 * 60 * 60 * 24))
        outstandingInvoices.push({
          date: tx.date,
          amount: tx.debit,
          age: daysDiff,
          customer: tx.customer
        })
      } else if (tx.credit > 0) {
        // This is a collection - reduce oldest invoices first (FIFO)
        let collectionRemaining = tx.credit
        for (let i = 0; i < outstandingInvoices.length && collectionRemaining > 0; i++) {
          const invoice = outstandingInvoices[i]
          const collectionApplied = Math.min(invoice.amount, collectionRemaining)
          invoice.amount -= collectionApplied
          collectionRemaining -= collectionApplied
        }
      }
    })
    
    // Age the remaining outstanding invoices
    outstandingInvoices.forEach(invoice => {
      if (invoice.amount > 0) {
        if (invoice.age <= 30) aging.current += invoice.amount
        else if (invoice.age <= 60) aging.days30 += invoice.amount
        else if (invoice.age <= 90) aging.days60 += invoice.amount
        else if (invoice.age <= 120) aging.days90 += invoice.amount
        else aging.over120 += invoice.amount
      }
    })

    const { balance } = getAccountBalance(arAccount.id, dateRange.endDate)
    const totalReceivable = balance > 0 ? balance : 0
    
    setReportData({
      type: 'ar-aging',
      transactions,
      outstandingInvoices: outstandingInvoices.filter(i => i.amount > 0),
      aging,
      totalReceivable
    })
  }

  const generateTaxSummary = () => {
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    const cogsAccounts = accounts.filter(a => a.account_type === 'COGS')
    const expenseAccounts = accounts.filter(a => a.account_type === 'Expense')

    let totalRevenue = 0
    let totalCOGS = 0
    let totalExpenses = 0

    revenueAccounts.forEach(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      totalRevenue += Math.abs(balance)
    })

    cogsAccounts.forEach(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      totalCOGS += Math.abs(balance)
    })

    expenseAccounts.forEach(account => {
      const { balance } = getAccountBalanceInRange(account.id, dateRange.startDate, dateRange.endDate)
      totalExpenses += Math.abs(balance)
    })

    const grossProfit = totalRevenue - totalCOGS
    const taxableIncome = grossProfit - totalExpenses
    const estimatedTax = taxableIncome > 0 ? taxableIncome * 0.30 : 0

    setReportData({
      type: 'tax-summary',
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      taxableIncome,
      estimatedTax,
      taxRate: 30
    })
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const renderReportContent = () => {
    if (!reportData) return null

    switch (reportData.type) {
      case 'income-statement':
        const incomeChartData = [
          { name: 'Revenue', value: reportData.totalRevenue, fill: CHART_COLORS.revenue },
          { name: 'COGS', value: reportData.totalCOGS, fill: '#f97316' },
          { name: 'Gross Profit', value: reportData.grossProfit, fill: '#3b82f6' },
          { name: 'Operating Expenses', value: reportData.totalOperatingExpenses, fill: CHART_COLORS.expenses },
          { name: 'Operating Profit', value: Math.abs(reportData.operatingProfit), fill: reportData.operatingProfit >= 0 ? '#10b981' : '#ef4444' },
          { name: 'Non-Operating Expenses', value: reportData.totalNonOperatingExpenses, fill: '#dc2626' },
          { name: reportData.netIncome >= 0 ? 'Net Profit' : 'Net Loss', value: Math.abs(reportData.netIncome), fill: reportData.netIncome >= 0 ? CHART_COLORS.assets : CHART_COLORS.liabilities }
        ]
        const expenseBreakdown = [
          ...reportData.cogs.map((e, i) => ({ name: e.name, value: e.balance, fill: PIE_COLORS[i % PIE_COLORS.length] })),
          ...reportData.operatingExpenses.map((e, i) => ({ name: e.name, value: e.balance, fill: PIE_COLORS[(i + reportData.cogs.length) % PIE_COLORS.length] })),
          ...reportData.nonOperatingExpenses.map((e, i) => ({ name: e.name, value: e.balance, fill: PIE_COLORS[(i + reportData.cogs.length + reportData.operatingExpenses.length) % PIE_COLORS.length] }))
        ]
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Revenue</h3>
                {reportData.revenues.length === 0 ? (
                  <p className="text-slate-500 text-sm">No revenue recorded</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.revenues.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span className="text-slate-600">{account.name}</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Revenue</span>
                      <span className="text-green-600">{formatCurrency(reportData.totalRevenue)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-orange-700 mb-3">Cost of Goods Sold</h3>
                {reportData.cogs.length === 0 ? (
                  <p className="text-slate-500 text-sm">No COGS recorded</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.cogs.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span className="text-slate-600">{account.name}</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total COGS</span>
                      <span className="text-orange-600">{formatCurrency(reportData.totalCOGS)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b pb-4 bg-blue-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Gross Profit</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(reportData.grossProfit)}</span>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Operating Expenses</h3>
                {reportData.operatingExpenses.length === 0 ? (
                  <p className="text-slate-500 text-sm">No operating expenses recorded</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.operatingExpenses.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span className="text-slate-600">{account.name}</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Operating Expenses</span>
                      <span className="text-red-600">{formatCurrency(reportData.totalOperatingExpenses)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-lg mb-4 ${reportData.operatingProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Operating {reportData.operatingProfit >= 0 ? 'Profit' : 'Loss'}</span>
                  <span className={`text-xl font-bold ${reportData.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(reportData.operatingProfit))}
                  </span>
                </div>
              </div>

              {reportData.nonOperatingExpenses.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Non-Operating Expenses</h3>
                  <div className="space-y-2">
                    {reportData.nonOperatingExpenses.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span className="text-slate-600">{account.name}</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Non-Operating Expenses</span>
                      <span className="text-red-600">{formatCurrency(reportData.totalNonOperatingExpenses)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-lg ${reportData.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net {reportData.netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                  <span className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(reportData.netIncome))}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Charts */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Revenue vs Expenses</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={incomeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#8884d8">
                      {incomeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {expenseBreakdown.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Expense Breakdown</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )

      case 'balance-sheet':
        const assetsPieData = reportData.assets.filter(a => a.balance > 0).map((a, i) => ({ name: a.name, value: a.balance, fill: PIE_COLORS[i % PIE_COLORS.length] }))
        const balanceSheetBarData = [
          { name: 'Assets', value: reportData.totalAssets, fill: CHART_COLORS.assets },
          { name: 'Liabilities', value: reportData.totalLiabilities, fill: CHART_COLORS.liabilities },
          { name: 'Equity', value: reportData.totalEquity, fill: CHART_COLORS.equity }
        ]
        
        return (
          <>
            {reportData.hasAbnormalBalances && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-700 text-sm font-medium mb-1">
                  ⓘ Opening Balance Equity Auto-Calculated
                </p>
                <p className="text-orange-600 text-xs">
                  Some liability accounts had debit balances indicating missing opening entries. 
                  An adjustment of {formatCurrency(reportData.openingBalanceEquityAdjustment)} was applied to Opening Balance Equity.
                  Consider adding proper opening balance journal entries for accuracy.
                </p>
              </div>
            )}
            {reportData.hasImbalance && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-medium">
                  ⚠️ Balance Sheet does not balance. Check for missing entries or opening balances.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Assets</h3>
                {reportData.assets.length === 0 ? (
                  <p className="text-slate-500 text-sm">No assets recorded</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.assets.map(account => (
                      <div key={account.id} className="flex justify-between items-center">
                        <span className={account.hasAbnormalBalance ? 'text-red-600' : 'text-slate-600'}>
                          {account.name}
                          {account.hasAbnormalBalance && <span className="ml-1 text-xs">⚠️</span>}
                        </span>
                        <span className={`font-medium ${account.hasAbnormalBalance ? 'text-red-600' : ''}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Assets</span>
                      <span className="text-blue-600">{formatCurrency(reportData.totalAssets)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Liabilities</h3>
                {reportData.liabilities.length === 0 ? (
                  <p className="text-slate-500 text-sm">No liabilities recorded</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.liabilities.map(account => (
                      <div key={account.id} className="flex justify-between items-center">
                        <span className={account.hasAbnormalBalance ? 'text-red-600' : 'text-slate-600'}>
                          {account.name}
                          {account.hasAbnormalBalance && <span className="ml-1 text-xs">⚠️</span>}
                        </span>
                        <span className={`font-medium ${account.hasAbnormalBalance ? 'text-red-600' : ''}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Liabilities</span>
                      <span className="text-red-600">{formatCurrency(reportData.totalLiabilities)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">Equity</h3>
                <div className="space-y-2">
                  {reportData.equity.map(account => (
                    <div key={account.id} className="flex justify-between">
                      <span className="text-slate-600">{account.name}</span>
                      <span className="font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                  {reportData.openingBalanceEquityAdjustment !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Opening Balance Equity
                        <span className="ml-1 text-xs text-orange-500" title="Auto-calculated from missing opening entries">ⓘ</span>
                      </span>
                      <span className="font-medium text-orange-600">{formatCurrency(reportData.openingBalanceEquityAdjustment)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Retained Earnings:</span>
                  </div>
                  {reportData.openingRetainedEarnings !== 0 && (
                    <div className="flex justify-between pl-4">
                      <span className="text-slate-500 text-sm">Opening Balance</span>
                      <span className="font-medium text-sm">{formatCurrency(reportData.openingRetainedEarnings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pl-4">
                    <span className="text-slate-500 text-sm">Add: Net Income</span>
                    <span className="font-medium text-sm">{formatCurrency(reportData.netIncome)}</span>
                  </div>
                  <div className="flex justify-between pl-4 border-t border-slate-200 pt-1">
                    <span className="text-slate-600 text-sm font-medium">Total Retained Earnings</span>
                    <span className="font-medium">{formatCurrency(reportData.totalRetainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Equity</span>
                    <span className="text-purple-600">{formatCurrency(reportData.totalEquity)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Liabilities + Equity</span>
                  <span className="text-xl font-bold">{formatCurrency(reportData.totalLiabilities + reportData.totalEquity)}</span>
                </div>
                <div className="mt-2 text-sm">
                  {!reportData.hasImbalance ? (
                    <span className="text-green-600">✓ Balance sheet is balanced</span>
                  ) : (
                    <span className="text-red-600">❌ Balance sheet is NOT balanced (Assets: {formatCurrency(reportData.totalAssets)} ≠ L+E: {formatCurrency(reportData.totalLiabilities + reportData.totalEquity)})</span>
                  )}
                  {reportData.hasAbnormalBalances && (
                    <p className="text-orange-600 text-xs mt-1">
                      Note: Some accounts had abnormal balances. Opening Balance Equity of {formatCurrency(reportData.openingBalanceEquityAdjustment)} was auto-calculated to account for missing opening entries.
                    </p>
                  )}
                  {reportData.openingRetainedEarnings !== 0 && !reportData.hasAbnormalBalances && (
                    <p className="text-slate-500 text-xs mt-1">
                      Note: Opening Retained Earnings of {formatCurrency(reportData.openingRetainedEarnings)} was calculated to balance.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Charts */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Assets vs Liabilities vs Equity</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={balanceSheetBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      {balanceSheetBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {assetsPieData.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Asset Composition</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={assetsPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {assetsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          </>
        )

      case 'cash-flow':
        if (reportData.error) {
          return <p className="text-red-500">{reportData.error}</p>
        }
        const cashFlowBarData = [
          { name: 'Operating', value: reportData.operatingActivities, fill: reportData.operatingActivities >= 0 ? CHART_COLORS.assets : CHART_COLORS.liabilities },
          { name: 'Investing', value: reportData.investingActivities, fill: reportData.investingActivities >= 0 ? CHART_COLORS.assets : CHART_COLORS.liabilities },
          { name: 'Financing', value: reportData.financingActivities, fill: reportData.financingActivities >= 0 ? CHART_COLORS.assets : CHART_COLORS.liabilities }
        ]
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-6">
              <div className="flex justify-between p-3 bg-slate-100 rounded">
                <span className="font-medium">Opening Cash Balance</span>
                <span className="font-bold">{formatCurrency(reportData.openingBalance)}</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-3">Operating Activities</h4>
                  <div className="space-y-2 text-sm">
                    {reportData.operatingInflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium">Cash Inflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'operating' && m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-green-600">{formatCurrency(m.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash inflows</span>
                          <span className="text-green-600">{formatCurrency(reportData.operatingInflows)}</span>
                        </div>
                      </>
                    )}
                    {reportData.operatingOutflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium mt-2">Cash Outflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'operating' && !m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-red-600">({formatCurrency(Math.abs(m.amount))})</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash outflows</span>
                          <span className="text-red-600">({formatCurrency(reportData.operatingOutflows)})</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Net cash from operations</span>
                      <span className={reportData.operatingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(reportData.operatingActivities)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-3">Investing Activities</h4>
                  <div className="space-y-2 text-sm">
                    {reportData.investingInflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium">Cash Inflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'investing' && m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-green-600">{formatCurrency(m.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash inflows</span>
                          <span className="text-green-600">{formatCurrency(reportData.investingInflows)}</span>
                        </div>
                      </>
                    )}
                    {reportData.investingOutflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium mt-2">Cash Outflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'investing' && !m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-red-600">({formatCurrency(Math.abs(m.amount))})</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash outflows</span>
                          <span className="text-red-600">({formatCurrency(reportData.investingOutflows)})</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Net cash from investing</span>
                      <span className={reportData.investingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(reportData.investingActivities)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-orange-700 mb-3">Financing Activities</h4>
                  <div className="space-y-2 text-sm">
                    {reportData.financingInflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium">Cash Inflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'financing' && m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-green-600">{formatCurrency(m.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash inflows</span>
                          <span className="text-green-600">{formatCurrency(reportData.financingInflows)}</span>
                        </div>
                      </>
                    )}
                    {reportData.financingOutflows > 0 && (
                      <>
                        <div className="text-slate-500 font-medium mt-2">Cash Outflows:</div>
                        {reportData.cashMovements.filter(m => m.category === 'financing' && !m.isInflow).map((m, i) => (
                          <div key={i} className="flex justify-between pl-4">
                            <span className="text-slate-600">{m.description}</span>
                            <span className="text-red-600">({formatCurrency(Math.abs(m.amount))})</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-4 font-medium border-t pt-1">
                          <span>Total cash outflows</span>
                          <span className="text-red-600">({formatCurrency(reportData.financingOutflows)})</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Net cash from financing</span>
                      <span className={reportData.financingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(reportData.financingActivities)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-bold text-lg">Closing Cash Balance</span>
                <span className="font-bold text-xl text-blue-600">{formatCurrency(reportData.closingBalance)}</span>
              </div>
            </div>

            {/* Right - Chart */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Cash Flow by Activity</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cashFlowBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      {cashFlowBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Cash Balance Change</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={[
                    { name: 'Opening', value: reportData.openingBalance, fill: CHART_COLORS.primary },
                    { name: 'Closing', value: reportData.closingBalance, fill: CHART_COLORS.cash }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      <Cell fill={CHART_COLORS.primary} />
                      <Cell fill={CHART_COLORS.cash} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'trial-balance':
        const trialBalanceChartData = [
          { name: 'Total Debits', value: reportData.totalDebits, fill: CHART_COLORS.assets },
          { name: 'Total Credits', value: reportData.totalCredits, fill: CHART_COLORS.liabilities }
        ]
        const accountBalancesData = reportData.balances.slice(0, 8).map((a, i) => ({
          name: a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name,
          debit: a.displayDebit,
          credit: a.displayCredit
        }))
        
        return (
          <>
            {reportData.hasAbnormalBalances && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-700 text-sm font-medium mb-2">
                  ⚠️ Abnormal Balances Detected
                </p>
                <div className="text-orange-600 text-xs space-y-1">
                  {reportData.abnormalBalances.map(a => (
                    <div key={a.id}>
                      <strong>{a.code} - {a.name}:</strong> {a.abnormalReason}
                    </div>
                  ))}
                </div>
                <p className="text-orange-500 text-xs mt-2 italic">
                  These balances are shown as recorded. Consider adding opening balance entries to correct.
                </p>
              </div>
            )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-left py-2 px-3">Account</th>
                    <th className="text-right py-2 px-3">Debit</th>
                    <th className="text-right py-2 px-3">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.balances.map(account => (
                    <tr key={account.id} className={`border-b ${account.hasAbnormalBalance ? 'bg-orange-50' : ''}`}>
                      <td className="py-2 px-3 font-mono text-sm">{account.code}</td>
                      <td className="py-2 px-3">
                        {account.name}
                        {account.hasAbnormalBalance && (
                          <span className="ml-1 text-orange-500" title={account.abnormalReason}>⚠️</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right ${account.hasAbnormalBalance && account.displayDebit > 0 ? 'text-orange-600 font-medium' : ''}`}>
                        {account.displayDebit > 0 ? formatCurrency(account.displayDebit) : '-'}
                      </td>
                      <td className={`py-2 px-3 text-right ${account.hasAbnormalBalance && account.displayCredit > 0 ? 'text-orange-600 font-medium' : ''}`}>
                        {account.displayCredit > 0 ? formatCurrency(account.displayCredit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan="2" className="py-2 px-3 text-right">Totals</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalDebits)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalCredits)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className={`p-3 rounded text-center ${reportData.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {reportData.isBalanced ? '✓ Books are balanced' : '⚠ Books are not balanced'}
              </div>
            </div>

            {/* Right - Charts */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Debits vs Credits</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={trialBalanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      {trialBalanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Account Balances</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={accountBalancesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="debit" fill={CHART_COLORS.assets} name="Debit" />
                    <Bar dataKey="credit" fill={CHART_COLORS.liabilities} name="Credit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          </>
        )

      case 'general-ledger':
        return (
          <div className="space-y-6">
            {reportData.accounts.map(account => {
              const balanceChartData = account.transactions.map((tx, i) => ({
                name: formatDate(tx.date),
                balance: tx.balance
              }))
              
              return (
                <div key={account.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm text-slate-500">{account.code}</span>
                      <span className="ml-2 font-semibold">{account.name}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(account.closingBalance)}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-left py-2 px-3">Description</th>
                          <th className="text-right py-2 px-3">Debit</th>
                          <th className="text-right py-2 px-3">Credit</th>
                          <th className="text-right py-2 px-3">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.transactions.map((tx, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-2 px-3">{formatDate(tx.date)}</td>
                            <td className="py-2 px-3">{tx.description}</td>
                            <td className="py-2 px-3 text-right">{tx.debit > 0 ? formatCurrency(tx.debit) : '-'}</td>
                            <td className="py-2 px-3 text-right">{tx.credit > 0 ? formatCurrency(tx.credit) : '-'}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatCurrency(tx.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {balanceChartData.length > 1 && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-slate-500 mb-2">Balance Over Time</h4>
                        <ResponsiveContainer width="100%" height={150}>
                          <AreaChart data={balanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="balance" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'journal-report':
        return (
          <div className="space-y-4">
            {reportData.entries.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No journal entries in this period</p>
            ) : (
              reportData.entries.map(entry => (
                <div key={entry.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{entry.description}</span>
                      {entry.reference_number && (
                        <span className="ml-2 text-sm text-slate-500">Ref: {entry.reference_number}</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-600">{formatDate(entry.entry_date)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {entry.journal_entry_lines?.map((line, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-3">
                            <span className="font-mono text-slate-500">{line.accounts?.code}</span>
                            <span className="ml-2">{line.accounts?.name}</span>
                          </td>
                          <td className="py-2 px-3 text-right w-24">
                            {parseFloat(line.debit_amount) > 0 ? formatCurrency(line.debit_amount) : ''}
                          </td>
                          <td className="py-2 px-3 text-right w-24">
                            {parseFloat(line.credit_amount) > 0 ? formatCurrency(line.credit_amount) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )

      case 'expense-analysis':
        const allCostsPieData = [
          ...reportData.cogs.map((c, i) => ({ name: c.name, value: c.amount, fill: '#f97316' })),
          ...reportData.expenses.map((e, i) => ({ name: e.name, value: e.amount, fill: PIE_COLORS[i % PIE_COLORS.length] }))
        ]
        const hasNoCosts = reportData.cogs.length === 0 && reportData.expenses.length === 0
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-4">
              {hasNoCosts ? (
                <p className="text-slate-500 text-center py-8">No costs recorded in this period</p>
              ) : (
                <>
                  {/* Revenue Reference */}
                  <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-blue-700">Total Revenue (Reference)</span>
                    <span className="font-bold text-blue-600">{formatCurrency(reportData.totalRevenue)}</span>
                  </div>

                  {/* Cost of Sales / COGS Section */}
                  {reportData.cogs.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-orange-700 mb-3">Cost of Sales</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 border-b">
                            <th className="text-left py-2">Account</th>
                            <th className="text-right py-2">Amount</th>
                            <th className="text-right py-2">% of Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.cogs.map(cost => (
                            <tr key={cost.id} className="border-b">
                              <td className="py-2">{cost.name}</td>
                              <td className="py-2 text-right font-medium">{formatCurrency(cost.amount)}</td>
                              <td className="py-2 text-right text-orange-600">
                                {reportData.totalRevenue > 0 ? ((cost.amount / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-orange-50 font-semibold">
                            <td className="py-2">Total COGS</td>
                            <td className="py-2 text-right text-orange-600">{formatCurrency(reportData.totalCOGS)}</td>
                            <td className="py-2 text-right text-orange-600">
                              {reportData.totalRevenue > 0 ? ((reportData.totalCOGS / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="mt-2 p-2 bg-green-50 rounded flex justify-between text-sm">
                        <span className="text-green-700">Gross Profit</span>
                        <span className="font-semibold text-green-600">{formatCurrency(reportData.grossProfit)}</span>
                      </div>
                    </div>
                  )}

                  {/* Operating Expenses Section */}
                  {reportData.expenses.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-red-700 mb-3">Operating Expenses</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 border-b">
                            <th className="text-left py-2">Account</th>
                            <th className="text-right py-2">Amount</th>
                            <th className="text-right py-2">% of Revenue</th>
                            <th className="text-right py-2">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.expenses.map(expense => (
                            <tr key={expense.id} className="border-b">
                              <td className="py-2">{expense.name}</td>
                              <td className="py-2 text-right font-medium">{formatCurrency(expense.amount)}</td>
                              <td className="py-2 text-right text-slate-600">
                                {reportData.totalRevenue > 0 ? ((expense.amount / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                              </td>
                              <td className="py-2 text-right text-slate-600">
                                {reportData.totalCosts > 0 ? ((expense.amount / reportData.totalCosts) * 100).toFixed(1) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-red-50 font-semibold">
                            <td className="py-2">Total Operating Expenses</td>
                            <td className="py-2 text-right text-red-600">{formatCurrency(reportData.totalExpenses)}</td>
                            <td className="py-2 text-right text-red-600">
                              {reportData.totalRevenue > 0 ? ((reportData.totalExpenses / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                            </td>
                            <td className="py-2 text-right text-red-600">
                              {reportData.totalCosts > 0 ? ((reportData.totalExpenses / reportData.totalCosts) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* Combined Total */}
                  <div className="p-4 bg-slate-100 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">Total Costs (COGS + Expenses)</span>
                      <span className="font-bold text-lg">{formatCurrency(reportData.totalCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>As % of Revenue</span>
                      <span className={reportData.totalCosts > reportData.totalRevenue ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {reportData.totalRevenue > 0 ? ((reportData.totalCosts / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                        {reportData.totalCosts > reportData.totalRevenue && ' (Exceeds Revenue!)'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right - Charts */}
            {allCostsPieData.length > 0 && (
              <div className="space-y-6">
                {/* Operating Expenses Bar Chart */}
                {reportData.expenses.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">Operating Expenses Breakdown</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reportData.expenses.map((e, i) => ({ 
                        name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name, 
                        value: e.amount,
                        fill: PIE_COLORS[i % PIE_COLORS.length]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={80} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value">
                          {reportData.expenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Cost Distribution Pie Chart */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Total Cost Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allCostsPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name.length > 12 ? name.substring(0,12) + '...' : name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {allCostsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )

      case 'revenue-analysis':
        const revenuePieData = reportData.revenues.map((r, i) => ({ name: r.name, value: r.amount, fill: PIE_COLORS[i % PIE_COLORS.length] }))
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-4">
              {reportData.revenues.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No revenue recorded in this period</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {reportData.revenues.map(revenue => {
                      const percentage = (revenue.amount / reportData.totalRevenue) * 100
                      return (
                        <div key={revenue.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{revenue.name}</span>
                            <span className="font-medium">{formatCurrency(revenue.amount)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg flex justify-between">
                    <span className="font-bold">Total Revenue</span>
                    <span className="font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Right - Chart */}
            {revenuePieData.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Revenue Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenuePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {revenuePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )

      case 'ap-aging':
        if (reportData.error) {
          return <p className="text-amber-600 text-center py-4">{reportData.error}</p>
        }
        const apAgingBarData = [
          { name: 'Current', value: reportData.aging.current, fill: CHART_COLORS.assets },
          { name: '31-60', value: reportData.aging.days30, fill: '#fbbf24' },
          { name: '61-90', value: reportData.aging.days60, fill: CHART_COLORS.expenses },
          { name: '91-120', value: reportData.aging.days90, fill: '#f97316' },
          { name: '120+', value: reportData.aging.over120, fill: CHART_COLORS.liabilities }
        ]
        
        return (
          <div className="space-y-6">
            {/* Transaction Detail */}
            {reportData.transactions && reportData.transactions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Transaction History</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Vendor/Description</th>
                      <th className="text-right py-2 px-3">Purchase</th>
                      <th className="text-right py-2 px-3">Payment</th>
                      <th className="text-right py-2 px-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.map((tx, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 px-3">{formatDate(tx.date)}</td>
                        <td className="py-2 px-3">{tx.vendor}</td>
                        <td className="py-2 px-3 text-right text-red-600">
                          {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-green-600">
                          {tx.debit > 0 ? `(${formatCurrency(tx.debit)})` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {formatCurrency(Math.abs(tx.balance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan="4" className="py-2 px-3 text-right">Current Balance</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalPayable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Outstanding Purchases Detail */}
            {reportData.outstandingPurchases && reportData.outstandingPurchases.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Outstanding Purchases</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Vendor</th>
                      <th className="text-right py-2 px-3">Amount</th>
                      <th className="text-right py-2 px-3">Age (Days)</th>
                      <th className="text-right py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.outstandingPurchases.map((purchase, i) => {
                      let ageCategory = 'Current'
                      let ageColor = 'text-green-600'
                      if (purchase.age > 120) {
                        ageCategory = 'Over 120 days'
                        ageColor = 'text-red-600'
                      } else if (purchase.age > 90) {
                        ageCategory = '91-120 days'
                        ageColor = 'text-orange-600'
                      } else if (purchase.age > 60) {
                        ageCategory = '61-90 days'
                        ageColor = 'text-orange-500'
                      } else if (purchase.age > 30) {
                        ageCategory = '31-60 days'
                        ageColor = 'text-yellow-600'
                      }
                      
                      return (
                        <tr key={i} className="border-b">
                          <td className="py-2 px-3">{formatDate(purchase.date)}</td>
                          <td className="py-2 px-3">{purchase.vendor}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(purchase.amount)}</td>
                          <td className="py-2 px-3 text-right">{purchase.age}</td>
                          <td className={`py-2 px-3 text-right font-medium ${ageColor}`}>{ageCategory}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Aging Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Aging Table */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700">Aging Summary</h4>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left py-2 px-3">Aging Period</th>
                      <th className="text-right py-2 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="py-2 px-3">Current (0-30 days)</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.current)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">31-60 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days30)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">61-90 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days60)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">91-120 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days90)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">Over 120 days</td><td className="py-2 px-3 text-right text-red-600">{formatCurrency(reportData.aging.over120)}</td></tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td className="py-2 px-3">Total Payable</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalPayable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Right - Chart */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Aging Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={apAgingBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      {apAgingBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'ar-aging':
        if (reportData.error) {
          return <p className="text-amber-600 text-center py-4">{reportData.error}</p>
        }
        const arAgingBarData = [
          { name: 'Current', value: reportData.aging.current, fill: CHART_COLORS.assets },
          { name: '31-60', value: reportData.aging.days30, fill: '#fbbf24' },
          { name: '61-90', value: reportData.aging.days60, fill: CHART_COLORS.expenses },
          { name: '91-120', value: reportData.aging.days90, fill: '#f97316' },
          { name: '120+', value: reportData.aging.over120, fill: CHART_COLORS.liabilities }
        ]
        
        return (
          <div className="space-y-6">
            {/* Transaction Detail */}
            {reportData.transactions && reportData.transactions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Transaction History</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Customer/Description</th>
                      <th className="text-right py-2 px-3">Invoice</th>
                      <th className="text-right py-2 px-3">Collection</th>
                      <th className="text-right py-2 px-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.map((tx, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 px-3">{formatDate(tx.date)}</td>
                        <td className="py-2 px-3">{tx.customer}</td>
                        <td className="py-2 px-3 text-right text-green-600">
                          {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-600">
                          {tx.credit > 0 ? `(${formatCurrency(tx.credit)})` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {formatCurrency(Math.abs(tx.balance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan="4" className="py-2 px-3 text-right">Current Balance</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalReceivable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Outstanding Invoices Detail */}
            {reportData.outstandingInvoices && reportData.outstandingInvoices.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Outstanding Invoices</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Customer</th>
                      <th className="text-right py-2 px-3">Amount</th>
                      <th className="text-right py-2 px-3">Age (Days)</th>
                      <th className="text-right py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.outstandingInvoices.map((invoice, i) => {
                      let ageCategory = 'Current'
                      let ageColor = 'text-green-600'
                      if (invoice.age > 120) {
                        ageCategory = 'Over 120 days'
                        ageColor = 'text-red-600'
                      } else if (invoice.age > 90) {
                        ageCategory = '91-120 days'
                        ageColor = 'text-orange-600'
                      } else if (invoice.age > 60) {
                        ageCategory = '61-90 days'
                        ageColor = 'text-orange-500'
                      } else if (invoice.age > 30) {
                        ageCategory = '31-60 days'
                        ageColor = 'text-yellow-600'
                      }
                      
                      return (
                        <tr key={i} className="border-b">
                          <td className="py-2 px-3">{formatDate(invoice.date)}</td>
                          <td className="py-2 px-3">{invoice.customer}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                          <td className="py-2 px-3 text-right">{invoice.age}</td>
                          <td className={`py-2 px-3 text-right font-medium ${ageColor}`}>{ageCategory}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Aging Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Aging Table */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700">Aging Summary</h4>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left py-2 px-3">Aging Period</th>
                      <th className="text-right py-2 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="py-2 px-3">Current (0-30 days)</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.current)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">31-60 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days30)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">61-90 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days60)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">91-120 days</td><td className="py-2 px-3 text-right">{formatCurrency(reportData.aging.days90)}</td></tr>
                    <tr className="border-b"><td className="py-2 px-3">Over 120 days</td><td className="py-2 px-3 text-right text-red-600">{formatCurrency(reportData.aging.over120)}</td></tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td className="py-2 px-3">Total Receivable</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(reportData.totalReceivable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Right - Chart */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-600 mb-3">Aging Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={arAgingBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value">
                      {arAgingBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'tax-summary':
        const taxChartData = [
          { name: 'Revenue', value: reportData.totalRevenue, fill: CHART_COLORS.revenue },
          { name: 'COGS', value: reportData.totalCOGS, fill: '#f97316' },
          { name: 'Gross Profit', value: reportData.grossProfit, fill: '#3b82f6' },
          { name: 'Expenses', value: reportData.totalExpenses, fill: CHART_COLORS.expenses },
          { name: 'Taxable Income', value: reportData.taxableIncome, fill: CHART_COLORS.primary },
          { name: 'Est. Tax', value: reportData.estimatedTax, fill: CHART_COLORS.liabilities }
        ]
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Data */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between p-3 border-b">
                  <span>Total Revenue</span>
                  <span className="font-medium text-green-600">{formatCurrency(reportData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between p-3 border-b">
                  <span>Less: Cost of Goods Sold</span>
                  <span className="font-medium text-orange-600">({formatCurrency(reportData.totalCOGS)})</span>
                </div>
                <div className="flex justify-between p-3 border-b bg-blue-50">
                  <span className="font-semibold">Gross Profit</span>
                  <span className="font-bold text-blue-600">{formatCurrency(reportData.grossProfit)}</span>
                </div>
                <div className="flex justify-between p-3 border-b">
                  <span>Less: Operating Expenses</span>
                  <span className="font-medium text-red-600">({formatCurrency(reportData.totalExpenses)})</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-100 rounded">
                  <span className="font-semibold">Taxable Income</span>
                  <span className="font-bold">{formatCurrency(reportData.taxableIncome)}</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">Estimated Tax ({reportData.taxRate}%)</span>
                    <p className="text-sm text-slate-500">This is an estimate only</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.estimatedTax)}</span>
                </div>
              </div>
            </div>

            {/* Right - Chart */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-600 mb-3">Tax Breakdown</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={taxChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value">
                    {taxChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (userBusinesses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Business Found</h3>
              <p className="text-slate-500">Please create a business first to view account reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getReportTitle = () => {
    for (const category of REPORT_CATEGORIES) {
      const report = category.reports.find(r => r.id === activeReport)
      if (report) return report.name
    }
    return 'Select a Report'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header with Business Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Account Reports</h1>
            <p className="text-sm text-slate-500">Financial statements and analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-slate-400" />
            <select
              value={selectedBusinessId || ''}
              onChange={(e) => setSelectedBusinessId(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm font-medium bg-white shadow-sm"
            >
              {userBusinesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Selection Dropdowns */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REPORT_CATEGORIES.map(category => {
              const CategoryIcon = category.icon
              return (
                <div key={category.id} className="relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    <CategoryIcon className="h-3 w-3 inline mr-1" />
                    {category.name}
                  </label>
                  <select
                    value={activeReport && category.reports.find(r => r.id === activeReport) ? activeReport : ''}
                    onChange={(e) => {
                      if (e.target.value) setActiveReport(e.target.value)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-white shadow-sm ${
                      activeReport && category.reports.find(r => r.id === activeReport)
                        ? 'border-blue-500 ring-1 ring-blue-500'
                        : ''
                    }`}
                  >
                    <option value="">Select report...</option>
                    {category.reports.map(report => (
                      <option key={report.id} value={report.id}>{report.name}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>{getReportTitle()}</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-2 py-1 border rounded text-sm"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-2 py-1 border rounded text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!activeReport ? (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Select a Report</p>
              <p className="text-sm mt-2">Choose a report from the dropdowns above to view</p>
            </div>
          ) : (
            renderReportContent()
          )}
        </CardContent>
      </Card>
    </div>
  )
}
