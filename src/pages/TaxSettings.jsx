import { useState, useEffect } from 'react'
import { 
  Settings, Plus, Edit2, Trash2, Check, X, AlertCircle, 
  DollarSign, FileText, Calendar, TrendingUp, Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import { 
  TAX_TYPES, 
  TAX_TYPE_LABELS, 
  formatTaxRate, 
  validateTaxRate,
  DEFAULT_TAX_RATES
} from '../lib/taxUtils'

export function TaxSettings() {
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [taxRates, setTaxRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddRate, setShowAddRate] = useState(false)
  const [editingRate, setEditingRate] = useState(null)
  const [newRate, setNewRate] = useState({
    name: '',
    tax_type: 'sales_tax',
    rate: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchUserBusinesses()
  }, [])

  useEffect(() => {
    if (selectedBusinessId) {
      fetchTaxRates()
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

  const fetchTaxRates = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('user_business_id', selectedBusinessId)
        .order('tax_type, name')

      if (error) throw error
      setTaxRates(data || [])
    } catch (error) {
      console.error('Error fetching tax rates:', error)
    }
  }

  const handleAddRate = async () => {
    if (!newRate.name || !newRate.rate) {
      alert('Please fill in all required fields')
      return
    }

    if (!validateTaxRate(newRate.rate)) {
      alert('Tax rate must be between 0 and 100')
      return
    }

    try {
      const { error } = await supabase
        .from('tax_rates')
        .insert({
          ...newRate,
          user_business_id: selectedBusinessId,
          rate: parseFloat(newRate.rate)
        })

      if (error) throw error

      setNewRate({
        name: '',
        tax_type: 'sales_tax',
        rate: '',
        description: '',
        is_active: true
      })
      setShowAddRate(false)
      fetchTaxRates()
    } catch (error) {
      console.error('Error adding tax rate:', error)
      alert('Error adding tax rate: ' + error.message)
    }
  }

  const handleUpdateRate = async () => {
    if (!editingRate.name || !editingRate.rate) {
      alert('Please fill in all required fields')
      return
    }

    if (!validateTaxRate(editingRate.rate)) {
      alert('Tax rate must be between 0 and 100')
      return
    }

    try {
      const { error } = await supabase
        .from('tax_rates')
        .update({
          name: editingRate.name,
          tax_type: editingRate.tax_type,
          rate: parseFloat(editingRate.rate),
          description: editingRate.description,
          is_active: editingRate.is_active
        })
        .eq('id', editingRate.id)

      if (error) throw error

      setEditingRate(null)
      fetchTaxRates()
    } catch (error) {
      console.error('Error updating tax rate:', error)
      alert('Error updating tax rate: ' + error.message)
    }
  }

  const handleDeleteRate = async (rateId) => {
    if (!confirm('Are you sure you want to delete this tax rate?')) return

    try {
      const { error } = await supabase
        .from('tax_rates')
        .delete()
        .eq('id', rateId)

      if (error) throw error
      fetchTaxRates()
    } catch (error) {
      console.error('Error deleting tax rate:', error)
      alert('Error deleting tax rate: ' + error.message)
    }
  }

  const handleToggleActive = async (rate) => {
    try {
      const { error } = await supabase
        .from('tax_rates')
        .update({ is_active: !rate.is_active })
        .eq('id', rate.id)

      if (error) throw error
      fetchTaxRates()
    } catch (error) {
      console.error('Error toggling tax rate:', error)
      alert('Error updating tax rate: ' + error.message)
    }
  }

  const initializeDefaultRates = async () => {
    if (!confirm('This will add default tax rates for your business. Continue?')) return

    try {
      const ratesToInsert = DEFAULT_TAX_RATES.map(rate => ({
        ...rate,
        user_business_id: selectedBusinessId
      }))

      const { error } = await supabase
        .from('tax_rates')
        .insert(ratesToInsert)

      if (error) throw error

      alert('Default tax rates added successfully!')
      fetchTaxRates()
    } catch (error) {
      console.error('Error adding default rates:', error)
      alert('Error adding default rates: ' + error.message)
    }
  }

  const copyRatesToAllBusinesses = async () => {
    if (taxRates.length === 0) {
      alert('No tax rates to copy. Please add rates first.')
      return
    }

    const otherBusinesses = userBusinesses.filter(b => b.id !== selectedBusinessId)
    if (otherBusinesses.length === 0) {
      alert('No other businesses to copy to.')
      return
    }

    const businessNames = otherBusinesses.map(b => b.business_name).join(', ')
    if (!confirm(`Copy ${taxRates.length} tax rates to: ${businessNames}?`)) return

    try {
      const ratesToInsert = []
      
      for (const business of otherBusinesses) {
        for (const rate of taxRates) {
          ratesToInsert.push({
            user_business_id: business.id,
            name: rate.name,
            tax_type: rate.tax_type,
            rate: rate.rate,
            description: rate.description,
            is_active: rate.is_active,
            effective_date: rate.effective_date
          })
        }
      }

      const { error } = await supabase
        .from('tax_rates')
        .insert(ratesToInsert)

      if (error) throw error

      alert(`Successfully copied ${taxRates.length} tax rates to ${otherBusinesses.length} businesses!`)
    } catch (error) {
      console.error('Error copying tax rates:', error)
      alert('Error copying tax rates: ' + error.message)
    }
  }

  const getTaxRatesByType = (type) => {
    return taxRates.filter(rate => rate.tax_type === type)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Tax Settings</h1>
        <p className="text-slate-600">Configure tax rates and settings for your business</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Tax Rates</p>
                <p className="text-2xl font-bold text-slate-800">{taxRates.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Rates</p>
                <p className="text-2xl font-bold text-green-600">
                  {taxRates.filter(r => r.is_active).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sales Tax Rates</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getTaxRatesByType('sales_tax').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Income Tax Rates</p>
                <p className="text-2xl font-bold text-orange-600">
                  {getTaxRatesByType('income_tax').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tax Rates Configuration</CardTitle>
            <div className="flex gap-2">
              {taxRates.length === 0 && (
                <Button onClick={initializeDefaultRates} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Default Rates
                </Button>
              )}
              {userBusinesses.length > 1 && taxRates.length > 0 && (
                <Button onClick={copyRatesToAllBusinesses} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to All Businesses
                </Button>
              )}
              <Button onClick={() => setShowAddRate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tax Rate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAddRate && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-4">Add New Tax Rate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tax Name *
                  </label>
                  <input
                    type="text"
                    value={newRate.name}
                    onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., VAT 16%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tax Type *
                  </label>
                  <select
                    value={newRate.tax_type}
                    onChange={(e) => setNewRate({ ...newRate, tax_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(TAX_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newRate.rate}
                    onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="16.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newRate.description}
                    onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddRate(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleAddRate}>
                  <Check className="w-4 h-4 mr-2" />
                  Add Rate
                </Button>
              </div>
            </div>
          )}

          {taxRates.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No tax rates configured yet</p>
              <Button onClick={() => setShowAddRate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Tax Rate
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(TAX_TYPE_LABELS).map(([type, label]) => {
                const rates = getTaxRatesByType(type)
                if (rates.length === 0) return null

                return (
                  <div key={type} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">{label}</h3>
                    <div className="space-y-2">
                      {rates.map(rate => (
                        <div
                          key={rate.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            rate.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {editingRate?.id === rate.id ? (
                            <div className="flex-1 grid grid-cols-4 gap-2">
                              <input
                                type="text"
                                value={editingRate.name}
                                onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                                className="px-2 py-1 border rounded"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={editingRate.rate}
                                onChange={(e) => setEditingRate({ ...editingRate, rate: e.target.value })}
                                className="px-2 py-1 border rounded"
                              />
                              <input
                                type="text"
                                value={editingRate.description}
                                onChange={(e) => setEditingRate({ ...editingRate, description: e.target.value })}
                                className="px-2 py-1 border rounded"
                                placeholder="Description"
                              />
                              <div className="flex gap-1">
                                <Button size="sm" onClick={handleUpdateRate}>
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-slate-800">{rate.name}</span>
                                  <span className="text-lg font-bold text-blue-600">
                                    {formatTaxRate(rate.rate)}
                                  </span>
                                  {!rate.is_active && (
                                    <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                {rate.description && (
                                  <p className="text-sm text-slate-600 mt-1">{rate.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleActive(rate)}
                                >
                                  {rate.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingRate(rate)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteRate(rate.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
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
    </div>
  )
}
