import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Plus, Edit, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useQuery } from '@tanstack/react-query'

export function ManageCategories() {
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Fetch categories and count business types
  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: businessTypes, error } = await supabase
        .from('business_types')
        .select('category')
      
      if (error) throw error

      // Group by category and count
      const categoryMap = {}
      businessTypes.forEach(bt => {
        if (!categoryMap[bt.category]) {
          categoryMap[bt.category] = {
            name: bt.category,
            count: 0
          }
        }
        categoryMap[bt.category].count++
      })

      return Object.values(categoryMap).sort((a, b) => a.name.localeCompare(b.name))
    }
  })

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      icon: ''
    })
    setFormError('')
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError('')
    
    // Validation
    if (!formData.name) {
      setFormError('Category name is required')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        // Update existing - rename category in all business types
        const { error } = await supabase
          .from('business_types')
          .update({ category: formData.name })
          .eq('category', editingCategory.name)
        
        if (error) throw error
      } else {
        // Check if category already exists
        const { data: existing } = await supabase
          .from('business_types')
          .select('category')
          .eq('category', formData.name)
          .limit(1)
        
        if (existing && existing.length > 0) {
          setFormError('Category already exists')
          setSaving(false)
          return
        }
      }
      
      await refetch()
      setShowModal(false)
    } catch (err) {
      setFormError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryName) => {
    // Check if category has business types
    const category = categories.find(c => c.name === categoryName)
    if (category && category.count > 0) {
      alert(`Cannot delete category "${categoryName}" because it has ${category.count} business type(s). Please reassign or delete those business types first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) return
    
    try {
      // Category will be automatically removed when no business types use it
      await refetch()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading categories...</p>
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
            <p className="text-red-800 mb-4">Failed to load categories</p>
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
            Manage Categories
          </h1>
          <p className="text-slate-600">
            {categories?.length || 0} categories for organizing business types
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Info Box */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">About Categories</p>
              <p>Categories help organize business types. When you create a business type, you can assign it to a category. Categories are automatically created when business types use them.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Card key={category.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {category.count} business {category.count === 1 ? 'type' : 'types'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Rename category"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    disabled={category.count > 0}
                    title={category.count > 0 ? 'Cannot delete - has business types' : 'Delete category'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    category.count > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {category.count > 0 ? 'Active' : 'Empty'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Categories Yet
            </h3>
            <p className="text-slate-600 mb-4">
              Categories are created automatically when you add business types, or you can create them manually.
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Rename Category' : 'Add New Category'}
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
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Agriculture & Farming"
                  required
                />

                {editingCategory && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Renaming this category will update all {editingCategory.count} business type(s) that use it.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : (editingCategory ? 'Rename' : 'Create')}
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
