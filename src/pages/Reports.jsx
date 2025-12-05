import { useState, useEffect, useRef } from 'react'
import { FileDown, Calendar, Eye, Printer, FileText, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Download, X, Building2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'

export function Reports() {
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const reportRef = useRef(null)

  const [reportConfig, setReportConfig] = useState({
    type: 'income-statement',
    period: 'this-month',
    format: 'pdf',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Fetch user's businesses
  useEffect(() => {
    fetchUserBusinesses()
  }, [])

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
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedBusinesses = data.map(b => ({
        id: b.id,
        userBusinessId: b.id,
        name: b.name,
        category: b.business_types?.category || 'Business',
        businessType: b.business_types?.name,
        budget: b.budget || 0,
        capex_budget: b.capex_budget || 0,
        opex_budget: b.opex_budget || 0,
        start_date: b.start_date,
        expected_monthly_profit: b.expected_monthly_profit || 0
      }))

      setUserBusinesses(formattedBusinesses)
      if (formattedBusinesses.length > 0) {
        setSelectedBusinessId(formattedBusinesses[0].id)
        setSelectedBusiness(formattedBusinesses[0])
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch transactions when business changes
  useEffect(() => {
    if (selectedBusiness?.userBusinessId) {
      fetchTransactions()
    }
  }, [selectedBusiness?.userBusinessId])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('user_business_id', selectedBusiness.userBusinessId)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleBusinessChange = (businessId) => {
    setSelectedBusinessId(businessId)
    const business = userBusinesses.find(b => b.id === businessId)
    setSelectedBusiness(business)
    setShowPreview(false)
  }

  // Update date range based on period selection
  const handlePeriodChange = (period) => {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
        break
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = now
        break
      case 'last-quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1
        startDate = new Date(now.getFullYear(), lastQuarter * 3, 1)
        endDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0)
        break
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
        break
      case 'all-time':
        startDate = new Date(selectedBusiness?.start_date || now.getFullYear() - 1)
        endDate = now
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
    }

    setReportConfig({
      ...reportConfig,
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  }

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date)
    return tDate >= new Date(reportConfig.startDate) && tDate <= new Date(reportConfig.endDate)
  })

  // Calculate report data
  const reportData = {
    revenue: filteredTransactions.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    capex: filteredTransactions.filter(t => t.type === 'CAPEX').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    opex: filteredTransactions.filter(t => t.type === 'OPEX').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalExpenses: filteredTransactions.filter(t => t.type !== 'Revenue').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    netProfit: 0,
    transactionCount: filteredTransactions.length,
    revenueTransactions: filteredTransactions.filter(t => t.type === 'Revenue'),
    capexTransactions: filteredTransactions.filter(t => t.type === 'CAPEX'),
    opexTransactions: filteredTransactions.filter(t => t.type === 'OPEX')
  }
  reportData.netProfit = reportData.revenue - reportData.totalExpenses

  // Group transactions by category
  const categoryBreakdown = filteredTransactions.reduce((acc, t) => {
    const key = `${t.type}-${t.category}`
    if (!acc[key]) {
      acc[key] = { type: t.type, category: t.category, amount: 0, count: 0 }
    }
    acc[key].amount += parseFloat(t.amount)
    acc[key].count += 1
    return acc
  }, {})

  const generateReport = () => {
    setGenerating(true)
    setTimeout(() => {
      setShowPreview(true)
      setGenerating(false)
    }, 500)
  }

  const downloadReport = () => {
    const reportContent = reportRef.current
    if (!reportContent) return

    if (reportConfig.format === 'csv') {
      downloadCSV()
    } else {
      // For PDF/Excel, we'll create a printable version
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>${getReportTitle()} - ${selectedBusiness?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
              h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              h2 { color: #475569; margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              th { background: #f8fafc; font-weight: 600; }
              .summary-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .positive { color: #10b981; }
              .negative { color: #ef4444; }
              .header-info { color: #64748b; margin-bottom: 30px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            ${reportContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      if (reportConfig.format === 'pdf') {
        printWindow.print()
      }
    }
  }

  const downloadCSV = () => {
    let csvContent = `${getReportTitle()}\n`
    csvContent += `Business: ${selectedBusiness?.name}\n`
    csvContent += `Period: ${formatDate(reportConfig.startDate)} - ${formatDate(reportConfig.endDate)}\n\n`
    
    csvContent += `Summary\n`
    csvContent += `Total Revenue,${reportData.revenue}\n`
    csvContent += `Total CAPEX,${reportData.capex}\n`
    csvContent += `Total OPEX,${reportData.opex}\n`
    csvContent += `Net Profit,${reportData.netProfit}\n\n`
    
    csvContent += `Transactions\n`
    csvContent += `Date,Type,Category,Description,Amount\n`
    filteredTransactions.forEach(t => {
      csvContent += `${t.date},${t.type},${t.category},"${t.description || ''}",${t.amount}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${getReportTitle().replace(/\s+/g, '_')}_${selectedBusiness?.name}_${reportConfig.startDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getReportTitle = () => {
    switch (reportConfig.type) {
      case 'income-statement': return 'Income Statement'
      case 'expense-report': return 'Expense Report'
      case 'cash-flow': return 'Cash Flow Statement'
      case 'budget-analysis': return 'Budget Analysis'
      default: return 'Financial Report'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (userBusinesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Businesses Yet</h3>
            <p className="text-slate-600 mb-4">Start a business first to generate financial reports.</p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Financial Reports
        </h1>
        <p className="text-slate-600">
          Generate and export detailed financial reports for your business
        </p>
      </div>

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
                {business.name} - {business.category}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Generate Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                <select
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income-statement">Income Statement</option>
                  <option value="expense-report">Expense Report</option>
                  <option value="cash-flow">Cash Flow Statement</option>
                  <option value="budget-analysis">Budget Analysis</option>
                </select>
              </div>

              {/* Time Period */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
                <select
                  value={reportConfig.period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="this-year">This Year</option>
                  <option value="all-time">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {reportConfig.period === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                    <input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                    <input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Date Range Display */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(reportConfig.startDate)} - {formatDate(reportConfig.endDate)}</span>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                <div className="flex space-x-2">
                  {['pdf', 'csv'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setReportConfig({ ...reportConfig, format })}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        reportConfig.format === format
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateReport}
                disabled={generating}
                className="w-full flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    <span>Preview Report</span>
                  </>
                )}
              </Button>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transactions</span>
                    <span className="font-medium">{reportData.transactionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(reportData.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Expenses</span>
                    <span className="font-medium text-red-600">{formatCurrency(reportData.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-slate-700 font-medium">Net Profit</span>
                    <span className={`font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Report Preview</span>
              </CardTitle>
              {showPreview && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={downloadReport}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {reportConfig.format.toUpperCase()}</span>
                  </Button>
                  <Button
                    onClick={() => {
                      const printWindow = window.open('', '_blank')
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${getReportTitle()}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 40px; }
                              h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
                              h2 { color: #475569; margin-top: 30px; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                              th { background: #f8fafc; }
                              .positive { color: #10b981; }
                              .negative { color: #ef4444; }
                            </style>
                          </head>
                          <body>${reportRef.current?.innerHTML}</body>
                        </html>
                      `)
                      printWindow.document.close()
                      printWindow.print()
                    }}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!showPreview ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-lg font-medium">No Report Generated</p>
                <p className="text-sm">Configure your report settings and click "Preview Report"</p>
              </div>
            ) : (
              <div ref={reportRef} className="bg-white p-6 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                {/* Report Header */}
                <div className="border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">{getReportTitle()}</h1>
                  <div className="mt-2 text-slate-600">
                    <p className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span><strong>{selectedBusiness?.name}</strong> - {selectedBusiness?.category}</span>
                    </p>
                    <p className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Period: {formatDate(reportConfig.startDate)} - {formatDate(reportConfig.endDate)}</span>
                    </p>
                    <p className="text-xs mt-2">Generated on {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}</p>
                  </div>
                </div>

                {/* Income Statement */}
                {reportConfig.type === 'income-statement' && (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(reportData.revenue)}</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-700">{formatCurrency(reportData.totalExpenses)}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${reportData.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <p className={`text-sm font-medium ${reportData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          Net {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}
                        </p>
                        <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                          {formatCurrency(Math.abs(reportData.netProfit))}
                        </p>
                      </div>
                    </div>

                    {/* Revenue Section */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Revenue</span>
                    </h2>
                    <table className="w-full mb-6">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Category</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.revenueTransactions.length === 0 ? (
                          <tr><td colSpan="4" className="py-4 text-center text-slate-500">No revenue transactions</td></tr>
                        ) : (
                          reportData.revenueTransactions.map((t, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-sm">{formatDate(t.date)}</td>
                              <td className="py-2 px-3 text-sm">{t.category}</td>
                              <td className="py-2 px-3 text-sm text-slate-600">{t.description || '-'}</td>
                              <td className="py-2 px-3 text-sm text-right font-medium text-green-600">{formatCurrency(t.amount)}</td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-green-50 font-semibold">
                          <td colSpan="3" className="py-2 px-3 text-sm">Total Revenue</td>
                          <td className="py-2 px-3 text-sm text-right text-green-700">{formatCurrency(reportData.revenue)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Expenses Section */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span>Expenses</span>
                    </h2>
                    <table className="w-full mb-6">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Category</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...reportData.capexTransactions, ...reportData.opexTransactions].length === 0 ? (
                          <tr><td colSpan="5" className="py-4 text-center text-slate-500">No expense transactions</td></tr>
                        ) : (
                          [...reportData.capexTransactions, ...reportData.opexTransactions].map((t, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-sm">{formatDate(t.date)}</td>
                              <td className="py-2 px-3 text-sm">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  t.type === 'CAPEX' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                }`}>{t.type}</span>
                              </td>
                              <td className="py-2 px-3 text-sm">{t.category}</td>
                              <td className="py-2 px-3 text-sm text-slate-600">{t.description || '-'}</td>
                              <td className="py-2 px-3 text-sm text-right font-medium text-red-600">{formatCurrency(t.amount)}</td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-red-50 font-semibold">
                          <td colSpan="4" className="py-2 px-3 text-sm">Total Expenses</td>
                          <td className="py-2 px-3 text-sm text-right text-red-700">{formatCurrency(reportData.totalExpenses)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Net Profit */}
                    <div className={`p-4 rounded-lg ${reportData.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Net {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                        <span className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatCurrency(reportData.netProfit)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Expense Report */}
                {reportConfig.type === 'expense-report' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">CAPEX (Capital)</p>
                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(reportData.capex)}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">OPEX (Operating)</p>
                        <p className="text-2xl font-bold text-orange-700">{formatCurrency(reportData.opex)}</p>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Expense by Category</h2>
                    <table className="w-full mb-6">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Category</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Type</th>
                          <th className="text-center py-2 px-3 text-sm font-semibold text-slate-700">Count</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(categoryBreakdown).filter(c => c.type !== 'Revenue').map((cat, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 px-3 text-sm font-medium">{cat.category}</td>
                            <td className="py-2 px-3 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                cat.type === 'CAPEX' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                              }`}>{cat.type}</span>
                            </td>
                            <td className="py-2 px-3 text-sm text-center">{cat.count}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium">{formatCurrency(cat.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* All Expense Transactions */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">All Expense Transactions</h2>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Category</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...reportData.capexTransactions, ...reportData.opexTransactions].map((t, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 px-3 text-sm">{formatDate(t.date)}</td>
                            <td className="py-2 px-3 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                t.type === 'CAPEX' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                              }`}>{t.type}</span>
                            </td>
                            <td className="py-2 px-3 text-sm">{t.category}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">{t.description || '-'}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium">{formatCurrency(t.amount)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-semibold">
                          <td colSpan="4" className="py-2 px-3 text-sm">Total Expenses</td>
                          <td className="py-2 px-3 text-sm text-right">{formatCurrency(reportData.totalExpenses)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {/* Cash Flow Statement */}
                {reportConfig.type === 'cash-flow' && (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Cash Inflows</h3>
                        <div className="flex justify-between">
                          <span>Revenue from Sales</span>
                          <span className="font-medium text-green-600">+{formatCurrency(reportData.revenue)}</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t font-semibold">
                          <span>Total Inflows</span>
                          <span className="text-green-700">{formatCurrency(reportData.revenue)}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Cash Outflows</h3>
                        <div className="flex justify-between">
                          <span>Capital Expenditure (CAPEX)</span>
                          <span className="font-medium text-red-600">-{formatCurrency(reportData.capex)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Operating Expenses (OPEX)</span>
                          <span className="font-medium text-red-600">-{formatCurrency(reportData.opex)}</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t font-semibold">
                          <span>Total Outflows</span>
                          <span className="text-red-700">{formatCurrency(reportData.totalExpenses)}</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${reportData.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Net Cash Flow</span>
                          <span className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(reportData.netProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Timeline */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Transaction Timeline</h2>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Inflow</th>
                          <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Outflow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date)).map((t, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 px-3 text-sm">{formatDate(t.date)}</td>
                            <td className="py-2 px-3 text-sm">{t.category} - {t.description || t.type}</td>
                            <td className="py-2 px-3 text-sm text-right text-green-600">
                              {t.type === 'Revenue' ? formatCurrency(t.amount) : '-'}
                            </td>
                            <td className="py-2 px-3 text-sm text-right text-red-600">
                              {t.type !== 'Revenue' ? formatCurrency(t.amount) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* Budget Analysis */}
                {reportConfig.type === 'budget-analysis' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-3">CAPEX Budget</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Allocated</span>
                            <span className="font-medium">{formatCurrency(selectedBusiness?.capex_budget || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span className="font-medium text-blue-600">{formatCurrency(reportData.capex)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span>Remaining</span>
                            <span className={`font-bold ${(selectedBusiness?.capex_budget || 0) - reportData.capex >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency((selectedBusiness?.capex_budget || 0) - reportData.capex)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (reportData.capex / (selectedBusiness?.capex_budget || 1)) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {((reportData.capex / (selectedBusiness?.capex_budget || 1)) * 100).toFixed(1)}% used
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-3">OPEX Budget</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Allocated</span>
                            <span className="font-medium">{formatCurrency(selectedBusiness?.opex_budget || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span className="font-medium text-orange-600">{formatCurrency(reportData.opex)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span>Remaining</span>
                            <span className={`font-bold ${(selectedBusiness?.opex_budget || 0) - reportData.opex >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency((selectedBusiness?.opex_budget || 0) - reportData.opex)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (reportData.opex / (selectedBusiness?.opex_budget || 1)) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {((reportData.opex / (selectedBusiness?.opex_budget || 1)) * 100).toFixed(1)}% used
                        </p>
                      </div>
                    </div>

                    {/* Total Budget */}
                    <div className="p-4 bg-slate-100 rounded-lg mb-6">
                      <h3 className="font-semibold text-slate-900 mb-3">Total Budget Overview</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-slate-600">Total Budget</p>
                          <p className="text-xl font-bold">{formatCurrency(selectedBusiness?.budget || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Total Used</p>
                          <p className="text-xl font-bold text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Remaining</p>
                          <p className={`text-xl font-bold ${(selectedBusiness?.budget || 0) - reportData.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency((selectedBusiness?.budget || 0) - reportData.totalExpenses)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profit vs Expected */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-3">Profit Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Expected Monthly Profit</p>
                          <p className="text-xl font-bold text-purple-600">{formatCurrency(selectedBusiness?.expected_monthly_profit || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Actual Net Profit</p>
                          <p className={`text-xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(reportData.netProfit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
                  <p>This report was generated by BizStep Financial Management System</p>
                  <p>Report ID: {Date.now().toString(36).toUpperCase()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
