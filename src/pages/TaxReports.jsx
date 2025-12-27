import { useState, useEffect } from 'react'
import { 
  FileText, Download, Calendar, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle, Clock, Plus, Edit2, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import { 
  TAX_TYPES, 
  TAX_TYPE_LABELS, 
  TAX_PERIOD_STATUS,
  TAX_PERIOD_STATUS_LABELS,
  generateTaxPeriods,
  formatTaxRate
} from '../lib/taxUtils'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CHART_COLORS = {
  collected: '#10b981',
  paid: '#ef4444',
  due: '#f59e0b',
  primary: '#3b82f6'
}

export function TaxReports() {
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [taxRates, setTaxRates] = useState([])
  const [taxPeriods, setTaxPeriods] = useState([])
  const [taxTransactions, setTaxTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState('sales-tax')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [showAddPeriod, setShowAddPeriod] = useState(false)
  const [newPeriod, setNewPeriod] = useState({
    tax_type: 'sales_tax',
    period_name: '',
    period_start: '',
    period_end: ''
  })

  useEffect(() => {
    fetchUserBusinesses()
  }, [])

  useEffect(() => {
    if (selectedBusinessId) {
      fetchAllData()
    }
  }, [selectedBusinessId])

  const fetchUserBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserBusinesses(data || [])
      if (data && data.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    await Promise.all([
      fetchTaxRates(),
      fetchTaxPeriods(),
      fetchTaxTransactions(),
      fetchAccounts(),
      fetchJournalEntries()
    ])
  }

  const fetchTaxRates = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('user_business_id', selectedBusinessId)
        .eq('is_active', true)

      if (error) throw error
      setTaxRates(data || [])
    } catch (error) {
      console.error('Error fetching tax rates:', error)
    }
  }

  const fetchTaxPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_periods')
        .select('*')
        .eq('user_business_id', selectedBusinessId)
        .order('period_start', { ascending: false })

      if (error) throw error
      setTaxPeriods(data || [])
    } catch (error) {
      console.error('Error fetching tax periods:', error)
    }
  }

  const fetchTaxTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_transactions')
        .select('*, journal_entry:journal_entries(date, description)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTaxTransactions(data || [])
    } catch (error) {
      console.error('Error fetching tax transactions:', error)
    }
  }

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_business_id', selectedBusinessId)

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, lines:journal_entry_lines(*)')
        .eq('user_business_id', selectedBusinessId)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false })

      if (error) throw error
      setJournalEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    }
  }

  const calculateSalesTaxReport = () => {
    const salesTaxAccount = accounts.find(a => a.code === '2210')
    if (!salesTaxAccount) return null

    let taxCollected = 0
    let taxPaid = 0

    journalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.account_id === salesTaxAccount.id) {
          taxCollected += line.credit_amount
          taxPaid += line.debit_amount
        }
      })
    })

    const netTaxDue = taxCollected - taxPaid

    return {
      taxCollected,
      taxPaid,
      netTaxDue,
      transactions: taxTransactions.filter(t => t.tax_type === 'sales_tax')
    }
  }

  const calculateIncomeTaxReport = () => {
    const revenueAccounts = accounts.filter(a => a.account_type === 'Revenue')
    const cogsAccounts = accounts.filter(a => a.account_type === 'COGS')
    const expenseAccounts = accounts.filter(a => a.account_type === 'Expense')

    let totalRevenue = 0
    let totalCOGS = 0
    let totalExpenses = 0

    journalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const account = accounts.find(a => a.id === line.account_id)
        if (!account) return

        if (account.account_type === 'Revenue') {
          totalRevenue += line.credit_amount - line.debit_amount
        } else if (account.account_type === 'COGS') {
          totalCOGS += line.debit_amount - line.credit_amount
        } else if (account.account_type === 'Expense') {
          totalExpenses += line.debit_amount - line.credit_amount
        }
      })
    })

    const grossProfit = totalRevenue - totalCOGS
    const taxableIncome = grossProfit - totalExpenses

    const incomeTaxRate = taxRates.find(r => r.tax_type === 'income_tax')
    const estimatedTax = incomeTaxRate ? (taxableIncome * incomeTaxRate.rate) / 100 : 0

    return {
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      taxableIncome,
      estimatedTax,
      taxRate: incomeTaxRate?.rate || 0
    }
  }

  const calculateWithholdingTaxReport = () => {
    const withholdingTaxAccount = accounts.find(a => a.code === '2230')
    if (!withholdingTaxAccount) return null

    let taxWithheld = 0
    let taxRemitted = 0

    journalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.account_id === withholdingTaxAccount.id) {
          taxWithheld += line.credit_amount
          taxRemitted += line.debit_amount
        }
      })
    })

    return {
      taxWithheld,
      taxRemitted,
      netTaxDue: taxWithheld - taxRemitted,
      transactions: taxTransactions.filter(t => t.tax_type === 'withholding_tax')
    }
  }

  const handleAddPeriod = async () => {
    if (!newPeriod.period_name || !newPeriod.period_start || !newPeriod.period_end) {
      alert('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('tax_periods')
        .insert({
          ...newPeriod,
          user_business_id: selectedBusinessId
        })

      if (error) throw error

      setNewPeriod({
        tax_type: 'sales_tax',
        period_name: '',
        period_start: '',
        period_end: ''
      })
      setShowAddPeriod(false)
      fetchTaxPeriods()
    } catch (error) {
      console.error('Error adding tax period:', error)
      alert('Error adding tax period: ' + error.message)
    }
  }

  const handleUpdatePeriodStatus = async (periodId, status) => {
    try {
      const { error } = await supabase
        .from('tax_periods')
        .update({ status })
        .eq('id', periodId)

      if (error) throw error
      fetchTaxPeriods()
    } catch (error) {
      console.error('Error updating period:', error)
      alert('Error updating period: ' + error.message)
    }
  }

  const generatePeriodsForYear = async () => {
    const year = new Date().getFullYear()
    const taxType = activeReport === 'sales-tax' ? 'sales_tax' : 'income_tax'
    
    if (!confirm(`Generate tax periods for ${year}?`)) return

    try {
      const periods = generateTaxPeriods(year, taxType)
      const periodsToInsert = periods.map(p => ({
        ...p,
        user_business_id: selectedBusinessId
      }))

      const { error } = await supabase
        .from('tax_periods')
        .insert(periodsToInsert)

      if (error) throw error

      alert(`Generated ${periods.length} tax periods for ${year}`)
      fetchTaxPeriods()
    } catch (error) {
      console.error('Error generating periods:', error)
      alert('Error generating periods: ' + error.message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const salesTaxReport = calculateSalesTaxReport()
  const incomeTaxReport = calculateIncomeTaxReport()
  const withholdingTaxReport = calculateWithholdingTaxReport()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Tax Reports</h1>
        <p className="text-slate-600">Comprehensive tax reporting and compliance tracking</p>
      </div>

      {userBusinesses.length > 1 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Business
            </label>
            <select
              value={selectedBusinessId || ''}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {userBusinesses.map(business => (
                <option key={business.id} value={business.id}>
                  {business.business_name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchJournalEntries} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Update Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <Button
          variant={activeReport === 'sales-tax' ? 'default' : 'outline'}
          onClick={() => setActiveReport('sales-tax')}
        >
          Sales Tax Report
        </Button>
        <Button
          variant={activeReport === 'income-tax' ? 'default' : 'outline'}
          onClick={() => setActiveReport('income-tax')}
        >
          Income Tax Report
        </Button>
        <Button
          variant={activeReport === 'withholding-tax' ? 'default' : 'outline'}
          onClick={() => setActiveReport('withholding-tax')}
        >
          Withholding Tax Report
        </Button>
        <Button
          variant={activeReport === 'tax-periods' ? 'default' : 'outline'}
          onClick={() => setActiveReport('tax-periods')}
        >
          Tax Periods
        </Button>
      </div>

      {activeReport === 'sales-tax' && salesTaxReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tax Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(salesTaxReport.taxCollected)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tax Paid</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(salesTaxReport.taxPaid)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Net Tax Due</p>
                    <p className={`text-2xl font-bold ${salesTaxReport.netTaxDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(salesTaxReport.netTaxDue)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Tax Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Tax Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Collected', value: salesTaxReport.taxCollected, fill: CHART_COLORS.collected },
                      { name: 'Paid', value: salesTaxReport.taxPaid, fill: CHART_COLORS.paid },
                      { name: 'Due', value: salesTaxReport.netTaxDue, fill: CHART_COLORS.due }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="value">
                        {[
                          { fill: CHART_COLORS.collected },
                          { fill: CHART_COLORS.paid },
                          { fill: CHART_COLORS.due }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 rounded">
                      <span>Total Tax Collected</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(salesTaxReport.taxCollected)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded">
                      <span>Total Tax Paid to Authorities</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(salesTaxReport.taxPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-orange-50 rounded">
                      <span className="font-semibold">Net Tax Due</span>
                      <span className="font-bold text-orange-600">
                        {formatCurrency(salesTaxReport.netTaxDue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeReport === 'income-tax' && incomeTaxReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(incomeTaxReport.totalRevenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Gross Profit</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(incomeTaxReport.grossProfit)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Taxable Income</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(incomeTaxReport.taxableIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Estimated Tax ({formatTaxRate(incomeTaxReport.taxRate)})</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(incomeTaxReport.estimatedTax)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income Tax Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between p-3 border-b">
                  <span>Total Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(incomeTaxReport.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b">
                  <span>Less: Cost of Goods Sold</span>
                  <span className="font-medium text-orange-600">
                    ({formatCurrency(incomeTaxReport.totalCOGS)})
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b bg-blue-50">
                  <span className="font-semibold">Gross Profit</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(incomeTaxReport.grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b">
                  <span>Less: Operating Expenses</span>
                  <span className="font-medium text-red-600">
                    ({formatCurrency(incomeTaxReport.totalExpenses)})
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b bg-purple-50">
                  <span className="font-semibold">Taxable Income</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(incomeTaxReport.taxableIncome)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="font-bold text-lg">Estimated Income Tax ({formatTaxRate(incomeTaxReport.taxRate)})</span>
                  <span className="font-bold text-2xl text-orange-600">
                    {formatCurrency(incomeTaxReport.estimatedTax)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeReport === 'withholding-tax' && withholdingTaxReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Tax Withheld</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(withholdingTaxReport.taxWithheld)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Tax Remitted</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(withholdingTaxReport.taxRemitted)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Net Tax Due</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(withholdingTaxReport.netTaxDue)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Withholding Tax Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-blue-50 rounded">
                  <span>Total Tax Withheld</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(withholdingTaxReport.taxWithheld)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span>Total Tax Remitted</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(withholdingTaxReport.taxRemitted)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-orange-50 rounded">
                  <span className="font-semibold">Net Tax Due</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(withholdingTaxReport.netTaxDue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeReport === 'tax-periods' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tax Periods Management</CardTitle>
              <div className="flex gap-2">
                <Button onClick={generatePeriodsForYear} variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Periods
                </Button>
                <Button onClick={() => setShowAddPeriod(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Period
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showAddPeriod && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-4">Add New Tax Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Type</label>
                    <select
                      value={newPeriod.tax_type}
                      onChange={(e) => setNewPeriod({ ...newPeriod, tax_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {Object.entries(TAX_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Period Name</label>
                    <input
                      type="text"
                      value={newPeriod.period_name}
                      onChange={(e) => setNewPeriod({ ...newPeriod, period_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Q1 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newPeriod.period_start}
                      onChange={(e) => setNewPeriod({ ...newPeriod, period_start: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={newPeriod.period_end}
                      onChange={(e) => setNewPeriod({ ...newPeriod, period_end: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddPeriod(false)}>Cancel</Button>
                  <Button onClick={handleAddPeriod}>Add Period</Button>
                </div>
              </div>
            )}

            {taxPeriods.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No tax periods configured</p>
                <Button onClick={() => setShowAddPeriod(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Period
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(TAX_TYPE_LABELS).map(([type, label]) => {
                  const periods = taxPeriods.filter(p => p.tax_type === type)
                  if (periods.length === 0) return null

                  return (
                    <div key={type} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{label}</h3>
                      <div className="space-y-2">
                        {periods.map(period => (
                          <div key={period.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{period.period_name}</span>
                                <span className="text-sm text-slate-600">
                                  {formatDate(period.period_start)} - {formatDate(period.period_end)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  period.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  period.status === 'filed' ? 'bg-blue-100 text-blue-700' :
                                  period.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {TAX_PERIOD_STATUS_LABELS[period.status]}
                                </span>
                              </div>
                              {period.net_tax_due > 0 && (
                                <p className="text-sm text-slate-600 mt-1">
                                  Net Tax Due: {formatCurrency(period.net_tax_due)}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={period.status}
                                onChange={(e) => handleUpdatePeriodStatus(period.id, e.target.value)}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                {Object.entries(TAX_PERIOD_STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
