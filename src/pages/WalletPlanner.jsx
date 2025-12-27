import { useState, useEffect } from 'react'
import { Plus, AlertCircle, TrendingUp, Wallet, Trash2, Edit2, Target, PiggyBank, Calendar, X, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function WalletPlanner() {
  const [loading, setLoading] = useState(true)
  const [income, setIncome] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  
  // Modal states
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [showAddSavingsGoal, setShowAddSavingsGoal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  
  // Form states
  const [newIncome, setNewIncome] = useState({ source: '', amount: '', frequency: 'Monthly' })
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' })
  const [newBudget, setNewBudget] = useState({ category: '', limit_amount: '' })
  const [newSavingsGoal, setNewSavingsGoal] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '' })
  
  // Date filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [selectedMonth, selectedYear])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch income
      const { data: incomeData } = await supabase
        .from('personal_income')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Fetch expenses for selected month
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
      
      const { data: expenseData } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      
      // Fetch budgets for selected month
      const { data: budgetData } = await supabase
        .from('personal_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
      
      // Fetch savings goals
      const { data: savingsData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setIncome(incomeData || [])
      setExpenses(expenseData || [])
      setBudgets(budgetData || [])
      setSavingsGoals(savingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totalMonthlyIncome = income.reduce((sum, i) => {
    const amount = parseFloat(i.amount) || 0
    if (i.frequency === 'Weekly') return sum + (amount * 4)
    if (i.frequency === 'Yearly') return sum + (amount / 12)
    if (i.frequency === 'One-time') return sum + amount
    return sum + amount // Monthly
  }, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const netSavings = totalMonthlyIncome - totalExpenses
  const savingsRate = totalMonthlyIncome > 0 ? (netSavings / totalMonthlyIncome) * 100 : 0

  // Expense breakdown by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount)
    return acc
  }, {})

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }))

  // Budget tracking with spent amounts
  const budgetTracking = budgets.map(budget => {
    const spent = expensesByCategory[budget.category] || 0
    return {
      ...budget,
      spent,
      percentage: (spent / parseFloat(budget.limit_amount)) * 100
    }
  })

  // CRUD Operations
  const addIncome = async () => {
    if (!newIncome.source || !newIncome.amount) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('personal_income')
        .insert([{ ...newIncome, user_id: user.id }])
      
      if (error) throw error
      setNewIncome({ source: '', amount: '', frequency: 'Monthly' })
      setShowAddIncome(false)
      fetchAllData()
    } catch (error) {
      console.error('Error adding income:', error)
    }
  }

  const deleteIncome = async (id) => {
    try {
      await supabase.from('personal_income').delete().eq('id', id)
      fetchAllData()
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  const addExpense = async () => {
    if (!newExpense.category || !newExpense.amount) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('personal_expenses')
        .insert([{ ...newExpense, user_id: user.id }])
      
      if (error) throw error
      setNewExpense({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' })
      setShowAddExpense(false)
      fetchAllData()
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const deleteExpense = async (id) => {
    try {
      await supabase.from('personal_expenses').delete().eq('id', id)
      fetchAllData()
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const addBudget = async () => {
    if (!newBudget.category || !newBudget.limit_amount) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('personal_budgets')
        .insert([{ 
          ...newBudget, 
          user_id: user.id,
          month: selectedMonth,
          year: selectedYear
        }])
      
      if (error) throw error
      setNewBudget({ category: '', limit_amount: '' })
      setShowAddBudget(false)
      fetchAllData()
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  const deleteBudget = async (id) => {
    try {
      await supabase.from('personal_budgets').delete().eq('id', id)
      fetchAllData()
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const addSavingsGoal = async () => {
    if (!newSavingsGoal.name || !newSavingsGoal.target_amount) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('savings_goals')
        .insert([{ ...newSavingsGoal, user_id: user.id }])
      
      if (error) throw error
      setNewSavingsGoal({ name: '', target_amount: '', current_amount: '0', deadline: '' })
      setShowAddSavingsGoal(false)
      fetchAllData()
    } catch (error) {
      console.error('Error adding savings goal:', error)
    }
  }

  const updateSavingsGoal = async (id, current_amount) => {
    try {
      await supabase
        .from('savings_goals')
        .update({ current_amount })
        .eq('id', id)
      fetchAllData()
    } catch (error) {
      console.error('Error updating savings goal:', error)
    }
  }

  const deleteSavingsGoal = async (id) => {
    try {
      await supabase.from('savings_goals').delete().eq('id', id)
      fetchAllData()
    } catch (error) {
      console.error('Error deleting savings goal:', error)
    }
  }

  // Month navigation
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Personal Wallet Planner 💰
        </h1>
        <p className="text-slate-600">
          Manage your personal income, expenses, and budgets
        </p>
      </div>

      {/* Month Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-900">
                {months[selectedMonth - 1]} {selectedYear}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, i) => (
                  <option key={i} value={i + 1}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Monthly Income</div>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <div className="text-xs text-slate-500 mt-1">{income.length} source(s)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Total Expenses</div>
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-slate-500 mt-1">{expenses.length} transaction(s)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Net Savings</div>
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
            <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netSavings)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {savingsRate.toFixed(1)}% savings rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Savings Goals</div>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {savingsGoals.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatCurrency(savingsGoals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0))} saved
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Income Sources</span>
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddIncome(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {income.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <DollarSign className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No income sources yet</p>
                <p className="text-sm">Add your income to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {income.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg group">
                    <div>
                      <div className="font-medium text-slate-900">{item.source}</div>
                      <div className="text-sm text-slate-600">{item.frequency}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(item.amount)}
                      </div>
                      <button
                        onClick={() => deleteIncome(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between font-semibold">
                    <span>Total Monthly</span>
                    <span className="text-green-600">{formatCurrency(totalMonthlyIncome)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-red-600" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Wallet className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No expenses this month</p>
                <p className="text-sm">Add expenses to see breakdown</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Budget Tracking</span>
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddBudget(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetTracking.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No budgets set for {months[selectedMonth - 1]}</p>
              <p className="text-sm">Set category budgets to track spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetTracking.map((budget) => {
                const isNearLimit = budget.percentage >= 80
                const isOverLimit = budget.percentage >= 100

                return (
                  <div key={budget.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{budget.category}</span>
                        {isNearLimit && (
                          <AlertCircle className={`h-4 w-4 ${isOverLimit ? 'text-red-600' : 'text-yellow-600'}`} />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-slate-600">
                          <span className={isOverLimit ? 'text-red-600 font-semibold' : ''}>
                            {formatCurrency(budget.spent)}
                          </span>
                          {' / '}
                          {formatCurrency(budget.limit_amount)}
                        </div>
                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverLimit ? 'bg-red-600' : isNearLimit ? 'bg-yellow-500' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {budget.percentage.toFixed(0)}% used
                      {budget.percentage < 100 && ` • ${formatCurrency(parseFloat(budget.limit_amount) - budget.spent)} remaining`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Savings Goals */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-purple-600" />
              <span>Savings Goals</span>
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddSavingsGoal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No savings goals yet</p>
              <p className="text-sm">Set goals to track your savings progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsGoals.map((goal) => {
                const percentage = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100
                const isComplete = percentage >= 100

                return (
                  <div key={goal.id} className="p-4 bg-purple-50 rounded-lg group">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{goal.name}</h4>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-purple-600 font-medium">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-slate-600">of {formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="bg-purple-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isComplete ? 'bg-green-600' : 'bg-purple-600'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {percentage.toFixed(0)}% complete
                        {goal.deadline && ` • Due ${formatDate(goal.deadline)}`}
                      </span>
                      <button
                        onClick={() => {
                          const amount = prompt('Enter new saved amount:', goal.current_amount)
                          if (amount) updateSavingsGoal(goal.id, amount)
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button size="sm" onClick={() => setShowAddExpense(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Wallet className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No expenses this month</p>
              <p className="text-sm">Add your first expense to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-900">{expense.category}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                    {expense.description && (
                      <div className="text-sm text-slate-500">{expense.description}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length > 10 && (
                <p className="text-center text-sm text-slate-500 pt-2">
                  And {expenses.length - 10} more transactions...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      {showAddIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Income Source</CardTitle>
                <button onClick={() => setShowAddIncome(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    placeholder="e.g., Salary, Freelance, Rental"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newIncome.frequency}
                    onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-time">One-time</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={addIncome} className="flex-1">Add Income</Button>
                  <Button onClick={() => setShowAddIncome(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Expense</CardTitle>
                <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Grocery shopping"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={addExpense} className="flex-1">Add Expense</Button>
                  <Button onClick={() => setShowAddExpense(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Budget for {months[selectedMonth - 1]}</CardTitle>
                <button onClick={() => setShowAddBudget(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {EXPENSE_CATEGORIES.filter(cat => !budgets.find(b => b.category === cat)).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget Limit</label>
                  <input
                    type="number"
                    value={newBudget.limit_amount}
                    onChange={(e) => setNewBudget({ ...newBudget, limit_amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={addBudget} className="flex-1">Add Budget</Button>
                  <Button onClick={() => setShowAddBudget(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Savings Goal Modal */}
      {showAddSavingsGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Savings Goal</CardTitle>
                <button onClick={() => setShowAddSavingsGoal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                  <input
                    type="text"
                    value={newSavingsGoal.name}
                    onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, name: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
                  <input
                    type="number"
                    value={newSavingsGoal.target_amount}
                    onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, target_amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Amount (optional)</label>
                  <input
                    type="number"
                    value={newSavingsGoal.current_amount}
                    onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, current_amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (optional)</label>
                  <input
                    type="date"
                    value={newSavingsGoal.deadline}
                    onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={addSavingsGoal} className="flex-1">Add Goal</Button>
                  <Button onClick={() => setShowAddSavingsGoal(false)} variant="secondary" className="flex-1">
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
