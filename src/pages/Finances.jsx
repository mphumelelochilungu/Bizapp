import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle2, Edit, Wallet, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { formatCurrency, formatDate } from '../lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, ReferenceLine } from 'recharts'

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
    type: 'OPEX',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Fetch user's businesses
  useEffect(() => {
    fetchUserBusinesses()
  }, [])

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
  const netProfit = totalRevenue - totalCapex - totalOpex
  
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
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loadingTransactions ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No transactions yet. Click "Add Transaction" to get started!
                    </td>
                  </tr>
                ) : transactions.map(transaction => (
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
                    <td className="py-3 px-4 text-sm text-slate-600">{transaction.description}</td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${
                      transaction.type === 'Revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
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
                  <option value="OPEX">OPEX (Operating Expense)</option>
                  <option value="CAPEX">CAPEX (Capital Expense)</option>
                  <option value="Revenue">Revenue</option>
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
    </div>
  )
}
