import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle2, Edit, Wallet, Briefcase, BookOpen, Video, X, ChevronDown, ChevronUp, Trash2, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { formatCurrency, formatDate } from '../lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, ReferenceLine } from 'recharts'

// Financial concepts content
const FINANCIAL_CONCEPTS = [
  {
    id: 1,
    title: 'Revenue / Income',
    icon: '💰',
    description: 'Money coming into the business.',
    examples: ['Sales of products or services', 'Income from consulting', 'Extra income (e.g., renting out equipment)'],
    importance: 'Track how much money is coming in to measure success and plan spending.'
  },
  {
    id: 2,
    title: 'Expenses / Costs',
    icon: '💸',
    description: 'Money going out to run the business. Divided into CAPEX and OPEX.',
    subcategories: [
      {
        name: 'CAPEX (Capital Expenditure)',
        definition: 'One-time investments for long-term use.',
        examples: ['Equipment', 'Furniture', 'Machinery', 'Renovations']
      },
      {
        name: 'OPEX (Operating Expenditure)',
        definition: 'Recurring costs to keep the business running.',
        examples: ['Rent', 'Utilities', 'Salaries/wages', 'Raw materials', 'Marketing']
      }
    ]
  },
  {
    id: 3,
    title: 'Budget',
    icon: '📊',
    description: 'Planned allocation of money to manage expenses and growth.',
    importance: 'Helps plan how much you can spend on CAPEX and OPEX without running out of cash.',
    tips: ['Set Total Budget → CAPEX / OPEX split', 'Monitor progress bars (green/yellow/red)', 'Get alerts when spending exceeds limits']
  },
  {
    id: 4,
    title: 'Profit / Net Profit',
    icon: '📈',
    description: 'Revenue minus expenses.',
    importance: 'Shows if the business is making money or losing money. Helps plan for growth and reinvestment.',
    tips: ['Green indicator = profit', 'Red indicator = loss', 'Track over time with charts']
  },
  {
    id: 5,
    title: 'Cash Flow',
    icon: '🔄',
    description: 'Money coming in vs money going out over time.',
    formula: 'Net Cash Flow = ( Revenue − OPEX ) − CAPEX + Financing In − Financing Out',
    importance: 'A profitable business can fail if cash is poorly managed. Net Cash Flow shows the actual cash position after all operating, investing, and financing activities.',
    tips: ['Monitor monthly cash inflow vs outflow', 'Highlight cash shortages early', 'Operating Cash Flow = Revenue − OPEX', 'Investing Cash Flow = CAPEX (outflow)', 'Financing Cash Flow = Loans received − Loan repayments']
  },
  {
    id: 6,
    title: 'Break-even Point',
    icon: '⚖️',
    description: 'The point where revenue = expenses → no profit, no loss.',
    importance: 'Helps know how much you need to sell to cover costs.'
  },
  {
    id: 7,
    title: 'Financial Reports',
    icon: '📋',
    description: 'Visual summaries of your business finances.',
    examples: ['Revenue vs Expenses chart', 'CAPEX & OPEX summary', 'Monthly profit/loss', 'Transaction history']
  },
  {
    id: 8,
    title: 'Key Metrics',
    icon: '🎯',
    description: 'Numbers that show how healthy your business is.',
    examples: ['Revenue growth (%)', 'Expense ratio (OPEX / Revenue)', 'Profit margin (%)', 'Budget utilization (%)']
  }
]

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
const CHART_COLORS = {
  revenue: '#10b981',
  capex: '#3b82f6',
  opex: '#f59e0b',
  profit: '#8b5cf6',
  loss: '#ef4444'
}

export function Finances() {
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showConceptsModal, setShowConceptsModal] = useState(false)
  const [expandedConcept, setExpandedConcept] = useState(null)
  const [financeVideoUrl, setFinanceVideoUrl] = useState('')
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [budget, setBudget] = useState({
    total: 10000,
    capex: 5000,
    opex: 5000
  })
  const [newTransaction, setNewTransaction] = useState({
    type: 'CAPEX',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  // Delete transaction state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  // Edit transaction state
  const [showEditModal, setShowEditModal] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [editTransaction, setEditTransaction] = useState({
    type: '',
    category: '',
    amount: '',
    description: '',
    date: ''
  })
  const [saving, setSaving] = useState(false)

  // Fetch user's businesses and settings
  useEffect(() => {
    fetchUserBusinesses()
    fetchFinanceVideoUrl()
  }, [])

  const fetchFinanceVideoUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'finance_video_url')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data?.setting_value) {
        setFinanceVideoUrl(data.setting_value)
      }
    } catch (error) {
      console.error('Error fetching finance video URL:', error)
    }
  }

  // Update budget when business changes
  useEffect(() => {
    if (selectedBusiness) {
      const newBudget = {
        total: selectedBusiness.budget || 10000,
        capex: selectedBusiness.capex_budget || 5000,
        opex: selectedBusiness.opex_budget || 5000
      }
      console.log('Updating budget to:', newBudget)
      setBudget(newBudget)
    }
  }, [selectedBusiness])

  // Fetch transactions when business changes
  useEffect(() => {
    if (selectedBusiness?.userBusinessId) {
      fetchTransactions(selectedBusiness.userBusinessId)
    }
  }, [selectedBusiness?.userBusinessId])

  const fetchTransactions = async (businessId) => {
    setLoadingTransactions(true)
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('user_business_id', businessId)
        .order('date', { ascending: false })

      if (error) throw error

      console.log('Loaded transactions:', data?.length || 0)
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  const fetchUserBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            category,
            description,
            startup_cost,
            monthly_profit,
            difficulty
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserBusinesses(data || [])
      
      // Set first business as selected if none selected
      if (data && data.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(data[0].id)
        setSelectedBusiness({
          ...data[0].business_types,
          userBusinessId: data[0].id,
          businessName: data[0].name,
          budget: data[0].budget,
          capex_budget: data[0].capex_budget,
          opex_budget: data[0].opex_budget,
          start_date: data[0].start_date,
          expected_monthly_profit: data[0].expected_monthly_profit
        })
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessChange = (businessId) => {
    const business = userBusinesses.find(b => b.id === businessId)
    if (business) {
      console.log('Switching to business:', business.name, {
        budget: business.budget,
        capex: business.capex_budget,
        opex: business.opex_budget
      })
      setSelectedBusinessId(businessId)
      setSelectedBusiness({
        ...business.business_types,
        userBusinessId: business.id,
        businessName: business.name,
        budget: business.budget,
        capex_budget: business.capex_budget,
        opex_budget: business.opex_budget,
        start_date: business.start_date,
        expected_monthly_profit: business.expected_monthly_profit
      })
    }
  }

  const totalRevenue = transactions.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0)
  const totalCapex = transactions.filter(t => t.type === 'CAPEX').reduce((sum, t) => sum + t.amount, 0)
  const totalOpex = transactions.filter(t => t.type === 'OPEX').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = totalCapex + totalOpex
  const netProfit = totalRevenue - totalExpenses

  // Key Metrics Calculations
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
  const expenseRatio = totalRevenue > 0 ? ((totalOpex / totalRevenue) * 100) : 0
  const budgetUtilization = budget.total > 0 ? ((totalExpenses / budget.total) * 100) : 0
  
  // Revenue growth (compare last 2 months)
  const getRevenueGrowth = () => {
    const sortedByDate = [...transactions].filter(t => t.type === 'Revenue').sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sortedByDate.length < 2) return 0
    
    const now = new Date()
    const thisMonth = now.getMonth()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const thisYear = now.getFullYear()
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
    
    const thisMonthRevenue = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'Revenue' && d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).reduce((sum, t) => sum + t.amount, 0)
    
    const lastMonthRevenue = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'Revenue' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    }).reduce((sum, t) => sum + t.amount, 0)
    
    if (lastMonthRevenue === 0) return thisMonthRevenue > 0 ? 100 : 0
    return ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  }
  const revenueGrowth = getRevenueGrowth()

  // Budget calculations
  const capexUsed = totalCapex
  const opexUsed = totalOpex
  const capexRemaining = budget.capex - capexUsed
  const opexRemaining = budget.opex - opexUsed
  const totalUsed = capexUsed + opexUsed
  const totalRemaining = budget.total - totalUsed
  
  // Budget status
  const capexPercentage = (capexUsed / budget.capex) * 100
  const opexPercentage = (opexUsed / budget.opex) * 100
  const totalPercentage = (totalUsed / budget.total) * 100
  
  const isCapexOverBudget = capexUsed > budget.capex
  const isOpexOverBudget = opexUsed > budget.opex
  const isTotalOverBudget = totalUsed > budget.total
  
  // Donut chart data for budget allocation
  const budgetAllocationData = [
    { name: 'CAPEX Budget', value: budget.capex, color: CHART_COLORS.capex },
    { name: 'OPEX Budget', value: budget.opex, color: CHART_COLORS.opex },
  ]

  // Donut chart data for budget usage
  const budgetUsageData = [
    { name: 'CAPEX Used', value: capexUsed, color: CHART_COLORS.capex },
    { name: 'OPEX Used', value: opexUsed, color: CHART_COLORS.opex },
    { name: 'Remaining', value: Math.max(0, totalRemaining), color: '#e2e8f0' }
  ]

  // Generate monthly chart data from transactions based on date range
  const generateMonthlyData = () => {
    const months = []
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    // Generate months between start and end date
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    
    while (current <= end) {
      const monthShort = current.toLocaleDateString('en-US', { month: 'short' })
      const yearShort = current.toLocaleDateString('en-US', { year: '2-digit' })
      months.push({
        month: `${monthShort}`,
        monthYear: `${monthShort} '${yearShort}`,
        year: current.getFullYear(),
        monthNum: current.getMonth(),
        revenue: 0,
        capex: 0,
        opex: 0,
        expenses: 0,
        profit: 0
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    // Fill in transaction data (only within date range)
    transactions.forEach(t => {
      const tDate = new Date(t.date)
      
      // Check if transaction is within date range
      if (tDate < startDate || tDate > endDate) return
      
      const tMonth = tDate.getMonth()
      const tYear = tDate.getFullYear()
      
      const monthData = months.find(m => m.monthNum === tMonth && m.year === tYear)
      if (monthData) {
        const amount = parseFloat(t.amount) || 0
        if (t.type === 'Revenue') {
          monthData.revenue += amount
        } else if (t.type === 'CAPEX') {
          monthData.capex += amount
          monthData.expenses += amount
        } else if (t.type === 'OPEX') {
          monthData.opex += amount
          monthData.expenses += amount
        }
      }
    })

    // Calculate profit for each month
    months.forEach(m => {
      m.profit = m.revenue - m.expenses
    })
    
    return months
  }

  const monthlyChartData = generateMonthlyData()

  // Break-even calculations
  const breakEvenPoint = totalCapex + totalOpex // Total expenses to cover
  const revenueToBreakEven = Math.max(0, breakEvenPoint - totalRevenue)
  const isBreakEvenReached = totalRevenue >= breakEvenPoint
  const breakEvenProgress = breakEvenPoint > 0 ? Math.min(100, (totalRevenue / breakEvenPoint) * 100) : 100

  // Cash Flow data for chart
  const cashFlowData = monthlyChartData.map(m => ({
    ...m,
    inflow: m.revenue,
    outflow: m.expenses,
    netCashFlow: m.revenue - m.expenses,
    cumulativeCashFlow: 0 // Will be calculated below
  }))
  
  // Calculate cumulative cash flow
  let cumulative = 0
  cashFlowData.forEach(m => {
    cumulative += m.netCashFlow
    m.cumulativeCashFlow = cumulative
  })

  // Waterfall chart data (Revenue → Expenses → Profit)
  const waterfallData = [
    { 
      name: 'Revenue', 
      value: totalRevenue, 
      fill: CHART_COLORS.revenue,
      start: 0,
      end: totalRevenue
    },
    { 
      name: 'CAPEX', 
      value: -capexUsed, 
      fill: CHART_COLORS.capex,
      start: totalRevenue,
      end: totalRevenue - capexUsed
    },
    { 
      name: 'OPEX', 
      value: -opexUsed, 
      fill: CHART_COLORS.opex,
      start: totalRevenue - capexUsed,
      end: totalRevenue - capexUsed - opexUsed
    },
    { 
      name: 'Net Profit', 
      value: netProfit, 
      fill: netProfit >= 0 ? CHART_COLORS.profit : CHART_COLORS.loss,
      start: 0,
      end: netProfit
    }
  ]

  const addTransaction = async () => {
    if (!newTransaction.category || !newTransaction.amount || !selectedBusiness?.userBusinessId) return
    
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .insert([{
          user_business_id: selectedBusiness.userBusinessId,
          type: newTransaction.type,
          category: newTransaction.category,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description,
          date: newTransaction.date
        }])
        .select()

      if (error) throw error

      // Refresh transactions
      await fetchTransactions(selectedBusiness.userBusinessId)
      
      setNewTransaction({
        type: 'OPEX',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Failed to add transaction. Please try again.')
    }
  }

  // Open delete confirmation modal
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  // Confirm and delete transaction
  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', transactionToDelete.id)

      if (error) throw error

      // Refresh transactions
      await fetchTransactions(selectedBusiness.userBusinessId)
      
      setShowDeleteModal(false)
      setTransactionToDelete(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Get transaction origin/source description
  const getTransactionOrigin = (transaction) => {
    const category = transaction.category?.toLowerCase() || ''
    const description = transaction.description?.toLowerCase() || ''
    
    // Check if it's from a business step
    const stepKeywords = ['market research', 'licenses', 'registration', 'setup location', 'marketing', 'branding', 'launch', 'operations']
    const isFromStep = stepKeywords.some(keyword => category.includes(keyword) || description.includes(keyword))
    
    if (isFromStep) {
      return {
        source: 'Business Roadmap Step',
        icon: '📋',
        warning: 'This transaction was automatically created when you completed a business roadmap step. Deleting it will not undo the step completion.'
      }
    }
    
    // Check if it's a manual entry
    return {
      source: 'Manual Entry',
      icon: '✏️',
      warning: 'This transaction was manually added. Deleting it will permanently remove this record.'
    }
  }

  // Open edit transaction modal
  const handleEditClick = (transaction) => {
    setTransactionToEdit(transaction)
    setEditTransaction({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      date: transaction.date
    })
    setShowEditModal(true)
  }

  // Save edited transaction
  const saveEditedTransaction = async () => {
    if (!transactionToEdit || !editTransaction.category || !editTransaction.amount) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('financial_records')
        .update({
          type: editTransaction.type,
          category: editTransaction.category,
          amount: parseFloat(editTransaction.amount),
          description: editTransaction.description,
          date: editTransaction.date
        })
        .eq('id', transactionToEdit.id)

      if (error) throw error

      // Refresh transactions
      await fetchTransactions(selectedBusiness.userBusinessId)
      
      setShowEditModal(false)
      setTransactionToEdit(null)
      setEditTransaction({
        type: '',
        category: '',
        amount: '',
        description: '',
        date: ''
      })
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Failed to update transaction. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  const updateBudget = () => {
    // Ensure CAPEX + OPEX doesn't exceed total budget
    if (budget.capex + budget.opex > budget.total) {
      alert('CAPEX + OPEX cannot exceed total budget!')
      return
    }
    setShowBudgetModal(false)
  }
  
  const getBudgetStatus = (used, allocated) => {
    const percentage = (used / allocated) * 100
    if (percentage > 100) return { color: 'red', status: 'Over Budget', icon: AlertCircle }
    if (percentage > 90) return { color: 'yellow', status: 'Near Limit', icon: AlertCircle }
    return { color: 'green', status: 'Within Budget', icon: CheckCircle2 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your businesses...</p>
        </div>
      </div>
    )
  }

  if (!selectedBusiness) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Business Yet</h2>
            <p className="text-slate-600 mb-6">
              You haven't started any business yet. Go to Home to select a business and get started!
            </p>
            <Button onClick={() => window.location.href = '/home'}>
              Browse Businesses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Business Selector */}
      {userBusinesses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Business ({userBusinesses.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {userBusinesses.map((business) => (
              <button
                key={business.id}
                type="button"
                onClick={() => handleBusinessChange(business.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedBusinessId === business.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {business.name} - {business.business_types?.category || 'Business'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedBusiness.businessName || selectedBusiness.name} - Finances
          </h1>
          <div className="flex items-center space-x-2 text-slate-600">
            <Briefcase className="h-4 w-4" />
            <span>{selectedBusiness.category}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowConceptsModal(true)} variant="outline" className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Financial Concepts</span>
          </Button>
          <Button onClick={() => setShowBudgetModal(true)} variant="outline" className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Manage Budget</span>
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <Card className="mb-8 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <CardTitle>Budget Allocation & Usage</CardTitle>
            </div>
            <Button onClick={() => setShowBudgetModal(true)} size="sm" variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Budget</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Budget */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Total Budget</span>
                  <span className="text-2xl font-bold text-slate-900">{formatCurrency(budget.total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Used:</span>
                  <span className={`font-semibold ${isTotalOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(totalUsed)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-600">Remaining:</span>
                  <span className={`font-semibold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalRemaining)}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isTotalOverBudget ? 'bg-red-600' : totalPercentage > 90 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{totalPercentage.toFixed(1)}% used</span>
                  {isTotalOverBudget ? (
                    <span className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Over Budget</span>
                    </span>
                  ) : totalPercentage > 90 ? (
                    <span className="flex items-center space-x-1 text-xs text-yellow-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Near Limit</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Within Budget</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CAPEX Budget */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">CAPEX Budget</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(budget.capex)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Used:</span>
                  <span className={`font-semibold ${isCapexOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(capexUsed)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-600">Remaining:</span>
                  <span className={`font-semibold ${capexRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(capexRemaining)}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isCapexOverBudget ? 'bg-red-600' : capexPercentage > 90 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(capexPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{capexPercentage.toFixed(1)}% used</span>
                  {isCapexOverBudget ? (
                    <span className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Over Budget</span>
                    </span>
                  ) : capexPercentage > 90 ? (
                    <span className="flex items-center space-x-1 text-xs text-yellow-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Near Limit</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Within Budget</span>
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Capital Expenditure (one-time investments)
                </div>
              </div>
            </div>

            {/* OPEX Budget */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">OPEX Budget</span>
                  <span className="text-2xl font-bold text-orange-600">{formatCurrency(budget.opex)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Used:</span>
                  <span className={`font-semibold ${isOpexOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(opexUsed)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-600">Remaining:</span>
                  <span className={`font-semibold ${opexRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(opexRemaining)}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isOpexOverBudget ? 'bg-red-600' : opexPercentage > 90 ? 'bg-yellow-500' : 'bg-orange-600'}`}
                    style={{ width: `${Math.min(opexPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{opexPercentage.toFixed(1)}% used</span>
                  {isOpexOverBudget ? (
                    <span className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Over Budget</span>
                    </span>
                  ) : opexPercentage > 90 ? (
                    <span className="flex items-center space-x-1 text-xs text-yellow-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Near Limit</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Within Budget</span>
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Operating Expenditure (recurring costs)
                </div>
              </div>
            </div>
          </div>

          {/* Budget Alerts */}
          {(isTotalOverBudget || isCapexOverBudget || isOpexOverBudget) && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Budget Alert!</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {isTotalOverBudget && (
                      <li>• Total spending ({formatCurrency(totalUsed)}) exceeds budget ({formatCurrency(budget.total)})</li>
                    )}
                    {isCapexOverBudget && (
                      <li>• CAPEX spending ({formatCurrency(capexUsed)}) exceeds budget ({formatCurrency(budget.capex)})</li>
                    )}
                    {isOpexOverBudget && (
                      <li>• OPEX spending ({formatCurrency(opexUsed)}) exceeds budget ({formatCurrency(budget.opex)})</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Total Revenue</div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">CAPEX</div>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalCapex)}
            </div>
            <div className="text-xs text-slate-500 mt-1">One-time investments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">OPEX</div>
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalOpex)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Recurring expenses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Net Profit</div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Key Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Revenue Growth */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-sm text-blue-700 font-medium mb-1">Revenue Growth</div>
              <div className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 mt-1">vs last month</div>
            </div>

            {/* Profit Margin */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-sm text-green-700 font-medium mb-1">Profit Margin</div>
              <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 mt-1">Net Profit / Revenue</div>
            </div>

            {/* Expense Ratio */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="text-sm text-orange-700 font-medium mb-1">Expense Ratio</div>
              <div className={`text-2xl font-bold ${expenseRatio <= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                {expenseRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-orange-600 mt-1">OPEX / Revenue</div>
            </div>

            {/* Budget Utilization */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-sm text-purple-700 font-medium mb-1">Budget Used</div>
              <div className={`text-2xl font-bold ${budgetUtilization <= 100 ? 'text-purple-600' : 'text-red-600'}`}>
                {budgetUtilization.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600 mt-1">of total budget</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break-even Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span>Break-even Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Progress to Break-even</span>
                <span className={`text-sm font-bold ${isBreakEvenReached ? 'text-green-600' : 'text-slate-600'}`}>
                  {breakEvenProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBreakEvenReached ? 'bg-green-500' : breakEvenProgress >= 75 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, breakEvenProgress)}%` }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Expenses (Break-even Point)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(breakEvenPoint)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Revenue Earned</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-slate-600">Revenue Needed to Break-even</span>
                  <span className={`font-semibold ${isBreakEvenReached ? 'text-green-600' : 'text-orange-600'}`}>
                    {isBreakEvenReached ? 'Reached!' : formatCurrency(revenueToBreakEven)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className={`rounded-xl p-6 ${isBreakEvenReached ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <div className="flex items-center space-x-3 mb-3">
                {isBreakEvenReached ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                )}
                <div>
                  <h4 className={`font-bold ${isBreakEvenReached ? 'text-green-800' : 'text-orange-800'}`}>
                    {isBreakEvenReached ? 'Break-even Reached!' : 'Working Towards Break-even'}
                  </h4>
                  <p className={`text-sm ${isBreakEvenReached ? 'text-green-700' : 'text-orange-700'}`}>
                    {isBreakEvenReached 
                      ? `You've covered all expenses and are now profitable by ${formatCurrency(netProfit)}`
                      : `You need ${formatCurrency(revenueToBreakEven)} more in revenue to cover all expenses`
                    }
                  </p>
                </div>
              </div>
              
              {!isBreakEvenReached && totalRevenue > 0 && (
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-sm text-orange-700">
                    <strong>Tip:</strong> At your current revenue rate, focus on increasing sales or reducing expenses to reach break-even faster.
                  </p>
                </div>
              )}
              
              {isBreakEvenReached && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Great job!</strong> Your business is profitable. Consider reinvesting profits for growth or building an emergency fund.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-slate-900">Financial Charts</h3>
              <span className="text-sm text-slate-500">
                ({new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600">From:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600">To:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Quick Range Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 1)
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  1M
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 3)
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  3M
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 6)
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  6M
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setFullYear(start.getFullYear() - 1)
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  1Y
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date(selectedBusiness?.start_date || new Date().setFullYear(new Date().getFullYear() - 1))
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1. Revenue Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  fill="url(#revenueGradient)" 
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.revenue, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: CHART_COLORS.revenue, strokeWidth: 2 }}
                  name="Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
            {transactions.length === 0 && (
              <p className="text-center text-sm text-slate-500 mt-2">
                Add revenue transactions to see the trend
              </p>
            )}
          </CardContent>
        </Card>

        {/* 2. Stacked Bar Chart for Monthly CAPEX + OPEX */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span>Monthly CAPEX & OPEX</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar 
                  dataKey="capex" 
                  stackId="expenses" 
                  fill={CHART_COLORS.capex} 
                  name="CAPEX"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="opex" 
                  stackId="expenses" 
                  fill={CHART_COLORS.opex} 
                  name="OPEX"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            {transactions.length === 0 && (
              <p className="text-center text-sm text-slate-500 mt-2">
                Add CAPEX/OPEX transactions to see breakdown
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 3. Donut Chart for Budget Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              <span>Budget Allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={budgetUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {budgetUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center text */}
            <div className="text-center -mt-4">
              <p className="text-sm text-slate-500">Total Used</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalUsed)}</p>
              <p className="text-sm text-slate-500">of {formatCurrency(budget.total)}</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Waterfall Chart for Revenue → Expenses → Profit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <span>Profit Waterfall</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={waterfallData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => `$${Math.abs(value)}`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const item = props.payload
                    if (item.name === 'Revenue' || item.name === 'Net Profit') {
                      return formatCurrency(Math.abs(value))
                    }
                    return `-${formatCurrency(Math.abs(value))}`
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <ReferenceLine x={0} stroke="#94a3b8" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Summary */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="text-slate-400">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Expenses</p>
                <p className="text-sm font-semibold text-red-600">-{formatCurrency(totalUsed)}</p>
              </div>
              <div className="text-slate-400">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Net Profit</p>
                <p className={`text-sm font-semibold ${netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 - Original Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 5. Revenue vs Expenses Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2} 
                  name="Revenue"
                  dot={{ fill: CHART_COLORS.revenue, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke={CHART_COLORS.loss}
                  strokeWidth={2} 
                  name="Expenses"
                  dot={{ fill: CHART_COLORS.loss, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {transactions.length === 0 && (
              <p className="text-center text-sm text-slate-500 mt-2">
                Add transactions to see data on the chart
              </p>
            )}
          </CardContent>
        </Card>

        {/* 6. Monthly Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill={CHART_COLORS.revenue} name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill={CHART_COLORS.loss} name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {transactions.length === 0 && (
              <p className="text-center text-sm text-slate-500 mt-2">
                Add transactions to see data on the chart
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 font-medium">Total Inflow</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-green-600 mt-1">Money coming in</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm text-red-700 font-medium">Total Outflow</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-red-600 mt-1">Money going out</div>
            </div>
            <div className={`rounded-lg p-4 border ${netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Cash Flow</div>
              <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
              </div>
              <div className={`text-xs mt-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {netProfit >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
              </div>
            </div>
            <div className={`rounded-lg p-4 border ${
              cashFlowData.some(m => m.cumulativeCashFlow < 0) 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className={`text-sm font-medium ${
                cashFlowData.some(m => m.cumulativeCashFlow < 0) ? 'text-red-700' : 'text-green-700'
              }`}>Cash Status</div>
              <div className={`text-xl font-bold ${
                cashFlowData.some(m => m.cumulativeCashFlow < 0) ? 'text-red-600' : 'text-green-600'
              }`}>
                {cashFlowData.some(m => m.cumulativeCashFlow < 0) ? 'Warning' : 'Healthy'}
              </div>
              <div className={`text-xs mt-1 ${
                cashFlowData.some(m => m.cumulativeCashFlow < 0) ? 'text-red-600' : 'text-green-600'
              }`}>
                {cashFlowData.some(m => m.cumulativeCashFlow < 0) 
                  ? 'Cash shortage detected' 
                  : 'No cash shortages'
                }
              </div>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inflow vs Outflow Bar Chart */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Monthly Inflow vs Outflow</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="inflow" fill="#10b981" name="Inflow (Revenue)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" fill="#ef4444" name="Outflow (Expenses)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative Cash Flow Line Chart */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Cumulative Cash Flow</h4>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeCashFlow" 
                    fill="url(#cashFlowGradient)" 
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Cumulative Cash"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeCashFlow" 
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                    name="Cumulative Cash"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow Warning */}
          {cashFlowData.some(m => m.cumulativeCashFlow < 0) && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">Cash Flow Warning</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your cumulative cash flow went negative in some months. This means expenses exceeded revenue, 
                    which could lead to cash shortages. Consider reducing expenses or increasing revenue to maintain healthy cash flow.
                  </p>
                </div>
              </div>
            </div>
          )}

          {transactions.length === 0 && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Add transactions to see cash flow analysis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Origin</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTransactions ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No transactions yet. Click "Add Transaction" to get started!
                    </td>
                  </tr>
                ) : transactions.map(transaction => {
                  const origin = getTransactionOrigin(transaction)
                  return (
                  <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-600">{formatDate(transaction.date)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'Revenue' ? 'bg-green-100 text-green-700' :
                        transaction.type === 'CAPEX' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{transaction.category}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 text-xs text-slate-500">
                        <span>{origin.icon}</span>
                        <span>{origin.source}</span>
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${
                      transaction.type === 'Revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Management Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Manage Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> CAPEX + OPEX must not exceed Total Budget
                  </p>
                </div>

                <Input
                  label="Total Budget"
                  type="number"
                  value={budget.total}
                  onChange={(e) => setBudget({...budget, total: parseFloat(e.target.value) || 0})}
                  placeholder="10000"
                />

                <Input
                  label="CAPEX Budget (Capital Expenditure)"
                  type="number"
                  value={budget.capex}
                  onChange={(e) => setBudget({...budget, capex: parseFloat(e.target.value) || 0})}
                  placeholder="5000"
                />

                <Input
                  label="OPEX Budget (Operating Expenditure)"
                  type="number"
                  value={budget.opex}
                  onChange={(e) => setBudget({...budget, opex: parseFloat(e.target.value) || 0})}
                  placeholder="5000"
                />

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Total Allocated:</span>
                    <span className={`font-semibold ${
                      (budget.capex + budget.opex) > budget.total ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(budget.capex + budget.opex)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Unallocated:</span>
                    <span className={`font-semibold ${
                      (budget.total - budget.capex - budget.opex) < 0 ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {formatCurrency(budget.total - budget.capex - budget.opex)}
                    </span>
                  </div>
                </div>

                {(budget.capex + budget.opex) > budget.total && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> CAPEX ({formatCurrency(budget.capex)}) + OPEX ({formatCurrency(budget.opex)}) exceeds Total Budget ({formatCurrency(budget.total)})
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button onClick={updateBudget} className="flex-1">
                    Save Budget
                  </Button>
                  <Button onClick={() => setShowBudgetModal(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Type"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                >
                  <option value="CAPEX">CAPEX (Capital Expense)</option>
                  <option value="OPEX">OPEX (Operating Expense)</option>
                  <option value="Revenue">Revenue/Income</option>
                </Select>

                <Input
                  label="Category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  placeholder="e.g., Rent, Equipment, Sales"
                />

                <Input
                  label="Amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0.00"
                />

                <Input
                  label="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Brief description"
                />

                <Input
                  label="Date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />

                <div className="flex space-x-3 pt-4">
                  <Button onClick={addTransaction} className="flex-1">
                    Add Transaction
                  </Button>
                  <Button onClick={() => setShowAddModal(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Concepts Modal */}
      {showConceptsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-7 w-7 text-white" />
                <h2 className="text-xl font-bold text-white">Basic Financial Concepts</h2>
              </div>
              <button
                onClick={() => setShowConceptsModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Video Link Section */}
            {financeVideoUrl && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                <a
                  href={financeVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium"
                >
                  <Video className="h-5 w-5" />
                  <span>Watch Video Tutorial on Financial Basics</span>
                </a>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-slate-600 mb-6">
                Understanding these basic concepts will help you manage your business finances effectively.
              </p>

              <div className="space-y-3">
                {FINANCIAL_CONCEPTS.map((concept) => (
                  <div
                    key={concept.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    {/* Concept Header */}
                    <button
                      onClick={() => setExpandedConcept(expandedConcept === concept.id ? null : concept.id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{concept.icon}</span>
                        <span className="font-semibold text-slate-900">{concept.title}</span>
                      </div>
                      {expandedConcept === concept.id ? (
                        <ChevronUp className="h-5 w-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      )}
                    </button>

                    {/* Concept Details */}
                    {expandedConcept === concept.id && (
                      <div className="px-4 py-4 bg-white border-t border-slate-200">
                        <p className="text-slate-700 mb-3">{concept.description}</p>

                        {concept.importance && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-blue-700">Why it matters: </span>
                            <span className="text-sm text-slate-600">{concept.importance}</span>
                          </div>
                        )}

                        {concept.formula && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <span className="text-sm font-medium text-blue-800">Formula: </span>
                            <code className="text-sm text-blue-700 font-mono">{concept.formula}</code>
                          </div>
                        )}

                        {concept.examples && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-slate-700 mb-1">Examples:</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                              {concept.examples.map((ex, i) => (
                                <li key={i}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {concept.subcategories && (
                          <div className="space-y-3">
                            {concept.subcategories.map((sub, i) => (
                              <div key={i} className="bg-slate-50 rounded-lg p-3">
                                <p className="font-medium text-slate-800">{sub.name}</p>
                                <p className="text-sm text-slate-600 mb-2">{sub.definition}</p>
                                <ul className="list-disc list-inside text-sm text-slate-500">
                                  {sub.examples.map((ex, j) => (
                                    <li key={j}>{ex}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {concept.tips && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-1">Tips:</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                              {concept.tips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Summary</h4>
                <p className="text-sm text-green-700">
                  For a beginner-friendly approach, focus on: <strong>Revenue</strong> (what's coming in), 
                  <strong> Expenses</strong> (CAPEX & OPEX - what's going out), <strong>Budget</strong> (plan for spending), 
                  <strong> Profit</strong> (is the business making money?), and <strong>Cash Flow</strong> (manage timing of money).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <Button onClick={() => setShowConceptsModal(false)} className="w-full">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Delete Transaction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Transaction Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium">{formatDate(transactionToDelete.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      transactionToDelete.type === 'Revenue' ? 'bg-green-100 text-green-700' :
                      transactionToDelete.type === 'CAPEX' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {transactionToDelete.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-medium">{transactionToDelete.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className={`font-semibold ${
                      transactionToDelete.type === 'Revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transactionToDelete.type === 'Revenue' ? '+' : '-'}{formatCurrency(transactionToDelete.amount)}
                    </span>
                  </div>
                  {transactionToDelete.description && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Description:</span>
                      <p className="text-slate-700 mt-1">{transactionToDelete.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Origin Info */}
              {(() => {
                const origin = getTransactionOrigin(transactionToDelete)
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Origin: {origin.icon} {origin.source}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">{origin.warning}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Warning</p>
                    <p className="text-xs text-red-700 mt-1">
                      This action cannot be undone. The transaction will be permanently removed from your financial records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setTransactionToDelete(null)
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDeleteTransaction}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Transaction'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && transactionToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Edit Transaction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={editTransaction.type}
                    onChange={(e) => setEditTransaction({ ...editTransaction, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CAPEX">CAPEX (Capital Expenditure)</option>
                    <option value="OPEX">OPEX (Operating Expenditure)</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editTransaction.category}
                    onChange={(e) => setEditTransaction({ ...editTransaction, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Equipment, Rent, Sales"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={editTransaction.amount}
                    onChange={(e) => setEditTransaction({ ...editTransaction, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editTransaction.description}
                    onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editTransaction.date}
                    onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Origin Info */}
                {(() => {
                  const origin = getTransactionOrigin(transactionToEdit)
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          Origin: {origin.icon} {origin.source}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Actions */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditModal(false)
                      setTransactionToEdit(null)
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveEditedTransaction}
                    disabled={saving || !editTransaction.category || !editTransaction.amount}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
