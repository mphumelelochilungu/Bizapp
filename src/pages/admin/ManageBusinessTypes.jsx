import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useBusinessTypes } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

export function ManageBusinessTypes() {
  const { data: businessTypes, isLoading, error, refetch } = useBusinessTypes()
  
  // Extract unique categories from database
  const categories = useMemo(() => {
    if (!businessTypes) return []
    const uniqueCategories = [...new Set(businessTypes.map(b => b.category))]
    return uniqueCategories.sort()
  }, [businessTypes])
  const [showModal, setShowModal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    startup_cost: '',
    monthly_profit: '',
    difficulty: 'Easy',
    description: ''
  })
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const handleAdd = () => {
    setEditingBusiness(null)
    setFormData({
      name: '',
      category: categories[0] || '',
      startup_cost: '',
      monthly_profit: '',
      difficulty: 'Easy',
      description: ''
    })
    setCustomCategory('')
    setShowCustomCategory(false)
    setFormError('')
    setShowModal(true)
  }

  const handleEdit = (business) => {
    setEditingBusiness(business)
    setFormData({
      name: business.name,
      category: business.category,
      startup_cost: business.startup_cost,
      monthly_profit: business.monthly_profit,
      difficulty: business.difficulty,
      description: business.description
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError('')
    
    // Use custom category if provided
    const finalCategory = showCustomCategory && customCategory ? customCategory : formData.category
    
    // Validation
    if (!formData.name || !formData.description) {
      setFormError('Name and description are required')
      return
    }
    
    if (!finalCategory) {
      setFormError('Category is required')
      return
    }
    
    if (!formData.startup_cost || !formData.monthly_profit) {
      setFormError('Startup cost and monthly profit are required')
      return
    }

    setSaving(true)
    try {
      const dataToSave = { ...formData, category: finalCategory }
      
      if (editingBusiness) {
        // Update existing
        const { error } = await supabase
          .from('business_types')
          .update(dataToSave)
          .eq('id', editingBusiness.id)
        
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('business_types')
          .insert([dataToSave])
        
        if (error) throw error
      }
      
      await refetch()
      setShowModal(false)
    } catch (err) {
      setFormError(err.message || 'Failed to save business type')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this business type?')) return
    
    try {
      const { error } = await supabase
        .from('business_types')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await refetch()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const groupedByCategory = businessTypes?.reduce((acc, business) => {
    if (!acc[business.category]) {
      acc[business.category] = []
    }
    acc[business.category].push(business)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading business types...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-800 mb-4">Failed to load business types</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Manage Business Types
          </h1>
          <p className="text-slate-600">
            {businessTypes?.length || 0} business types across {Object.keys(groupedByCategory || {}).length} categories
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Business Type</span>
        </Button>
      </div>

      {/* Business Types by Category */}
      <div className="space-y-6">
        {Object.entries(groupedByCategory || {}).map(([category, businesses]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category} ({businesses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Difficulty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Startup Cost</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Monthly Profit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map(business => (
                      <tr key={business.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-900">{business.name}</div>
                            <div className="text-sm text-slate-500">{business.description}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            business.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            business.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {business.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900">
                          {formatCurrency(business.startup_cost)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">
                          {formatCurrency(business.monthly_profit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(business)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(business.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingBusiness ? 'Edit Business Type' : 'Add New Business Type'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{formError}</p>
                  </div>
                )}

                <Input
                  label="Business Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Poultry Farming"
                  required
                />

                <div>
                  <Select
                    label="Category"
                    value={showCustomCategory ? 'custom' : formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomCategory(true)
                      } else {
                        setShowCustomCategory(false)
                        setFormData({...formData, category: e.target.value})
                      }
                    }}
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">+ Create New Category</option>
                  </Select>
                  
                  {showCustomCategory && (
                    <div className="mt-2">
                      <Input
                        label="New Category Name"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="e.g., Technology & Innovation"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomCategory(false)
                          setCustomCategory('')
                        }}
                        className="text-sm text-blue-600 hover:underline mt-1"
                      >
                        Cancel - use existing category
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Startup Cost ($)"
                    type="number"
                    value={formData.startup_cost}
                    onChange={(e) => setFormData({...formData, startup_cost: e.target.value})}
                    placeholder="5000"
                    required
                  />

                  <Input
                    label="Monthly Profit ($)"
                    type="number"
                    value={formData.monthly_profit}
                    onChange={(e) => setFormData({...formData, monthly_profit: e.target.value})}
                    placeholder="1200"
                    required
                  />
                </div>

                <Select
                  label="Difficulty Level"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Select>

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the business..."
                  rows={3}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : (editingBusiness ? 'Update' : 'Create')}
                  </Button>
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="secondary"
                    disabled={saving}
                    className="flex-1"
                  >
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
