import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Settings, Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight, 
  Save, X, Loader2, CheckCircle2, Briefcase, ListChecks, Video, DollarSign,
  ShoppingCart, ExternalLink
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

const PHASES = [
  'Market Research',
  'Licenses & Registration', 
  'Setup Location',
  'Marketing & Branding',
  'Launch & Operations'
]

export function ManageSteps() {
  const [businessTypes, setBusinessTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedBusiness, setExpandedBusiness] = useState(null)
  const [businessSteps, setBusinessSteps] = useState({})
  const [loadingSteps, setLoadingSteps] = useState(null)
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [selectedBusinessType, setSelectedBusinessType] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [stepForm, setStepForm] = useState({
    phase: 'Launch & Operations',
    title: '',
    description: '',
    estimated_cost: '',
    video_url: '',
    supplier_name: '',
    supplier_url: '',
    checklist: ['']
  })

  // Fetch business types
  useEffect(() => {
    fetchBusinessTypes()
  }, [])

  const fetchBusinessTypes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('business_types')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching business types:', error)
    } else {
      setBusinessTypes(data || [])
    }
    setLoading(false)
  }

  // Fetch steps for a business type
  const fetchStepsForBusiness = async (businessTypeId) => {
    setLoadingSteps(businessTypeId)
    const { data, error } = await supabase
      .from('business_steps')
      .select('*')
      .eq('business_type_id', businessTypeId)
      .order('phase', { ascending: true })
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Error fetching steps:', error)
    } else {
      setBusinessSteps(prev => ({ ...prev, [businessTypeId]: data || [] }))
    }
    setLoadingSteps(null)
  }

  // Toggle expand business
  const toggleExpand = async (businessTypeId) => {
    if (expandedBusiness === businessTypeId) {
      setExpandedBusiness(null)
    } else {
      setExpandedBusiness(businessTypeId)
      if (!businessSteps[businessTypeId]) {
        await fetchStepsForBusiness(businessTypeId)
      }
    }
  }

  // Get unique categories
  const categories = [...new Set(businessTypes.map(b => b.category))].sort()

  // Filter business types
  const filteredBusinessTypes = businessTypes.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || b.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group by category
  const groupedByCategory = filteredBusinessTypes.reduce((acc, business) => {
    if (!acc[business.category]) acc[business.category] = []
    acc[business.category].push(business)
    return acc
  }, {})

  // Open add modal
  const openAddModal = (businessType) => {
    setSelectedBusinessType(businessType)
    setEditingStep(null)
    setStepForm({
      phase: 'Launch & Operations',
      title: '',
      description: '',
      estimated_cost: '',
      video_url: '',
      supplier_name: '',
      supplier_url: '',
      checklist: ['']
    })
    setShowAddModal(true)
  }

  // Open edit modal
  const openEditModal = (businessType, step) => {
    setSelectedBusinessType(businessType)
    setEditingStep(step)
    setStepForm({
      phase: step.phase || 'Launch & Operations',
      title: step.title,
      description: step.description || '',
      estimated_cost: step.estimated_cost || '',
      video_url: step.video_url || '',
      supplier_name: step.supplier_name || '',
      supplier_url: step.supplier_url || '',
      checklist: step.checklist?.length > 0 ? step.checklist : ['']
    })
    setShowAddModal(true)
  }

  // Add checklist item
  const addChecklistItem = () => {
    setStepForm(prev => ({ ...prev, checklist: [...prev.checklist, ''] }))
  }

  // Update checklist item
  const updateChecklistItem = (index, value) => {
    const newChecklist = [...stepForm.checklist]
    newChecklist[index] = value
    setStepForm(prev => ({ ...prev, checklist: newChecklist }))
  }

  // Remove checklist item
  const removeChecklistItem = (index) => {
    if (stepForm.checklist.length > 1) {
      const newChecklist = stepForm.checklist.filter((_, i) => i !== index)
      setStepForm(prev => ({ ...prev, checklist: newChecklist }))
    }
  }

  // Save step
  const handleSaveStep = async () => {
    if (!stepForm.title.trim()) {
      alert('Please enter a step title')
      return
    }

    setSaving(true)
    const cleanChecklist = stepForm.checklist.filter(item => item.trim() !== '')
    
    // Get next order index
    const existingSteps = businessSteps[selectedBusinessType.id] || []
    const phaseSteps = existingSteps.filter(s => s.phase === stepForm.phase)
    const nextOrderIndex = editingStep 
      ? editingStep.order_index 
      : (phaseSteps.length > 0 ? Math.max(...phaseSteps.map(s => s.order_index)) + 1 : 1)

    const stepData = {
      business_type_id: selectedBusinessType.id,
      phase: stepForm.phase,
      title: stepForm.title.trim(),
      description: stepForm.description.trim(),
      estimated_cost: stepForm.estimated_cost ? parseFloat(stepForm.estimated_cost) : null,
      video_url: stepForm.video_url.trim() || null,
      supplier_name: stepForm.supplier_name.trim() || null,
      supplier_url: stepForm.supplier_url.trim() || null,
      order_index: nextOrderIndex,
      checklist: cleanChecklist
    }

    let error
    if (editingStep) {
      const result = await supabase
        .from('business_steps')
        .update(stepData)
        .eq('id', editingStep.id)
      error = result.error
    } else {
      const result = await supabase
        .from('business_steps')
        .insert(stepData)
      error = result.error
    }

    if (error) {
      console.error('Error saving step:', error)
      alert('Failed to save step: ' + error.message)
    } else {
      await fetchStepsForBusiness(selectedBusinessType.id)
      setShowAddModal(false)
    }
    setSaving(false)
  }

  // Delete step
  const handleDeleteStep = async (stepId, businessTypeId) => {
    if (!confirm('Are you sure you want to delete this step?')) return

    const { error } = await supabase
      .from('business_steps')
      .delete()
      .eq('id', stepId)

    if (error) {
      console.error('Error deleting step:', error)
      alert('Failed to delete step')
    } else {
      await fetchStepsForBusiness(businessTypeId)
    }
  }

  // Get step count for a business
  const getStepCount = (businessTypeId) => {
    return businessSteps[businessTypeId]?.length || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manage Business Steps
        </h1>
        <p className="text-slate-600">
          Create unique Launch & Operations steps for each business type
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Business Types List */}
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, businesses]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>{category}</span>
                <span className="text-sm font-normal text-slate-500">({businesses.length} types)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {businesses.map(business => (
                  <div key={business.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Business Header */}
                    <button
                      onClick={() => toggleExpand(business.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {expandedBusiness === business.id ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-slate-900">{business.name}</div>
                          <div className="text-sm text-slate-500">
                            Startup: {formatCurrency(business.startup_cost)} • Profit: {formatCurrency(business.monthly_profit)}/mo
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {businessSteps[business.id] && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {getStepCount(business.id)} steps
                          </span>
                        )}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openAddModal(business)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Step
                        </Button>
                      </div>
                    </button>

                    {/* Expanded Steps */}
                    {expandedBusiness === business.id && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4">
                        {loadingSteps === business.id ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          </div>
                        ) : businessSteps[business.id]?.length > 0 ? (
                          <div className="space-y-4">
                            {PHASES.map(phase => {
                              const phaseSteps = businessSteps[business.id].filter(s => s.phase === phase)
                              if (phaseSteps.length === 0) return null
                              
                              return (
                                <div key={phase}>
                                  <h4 className="font-medium text-slate-700 mb-2 flex items-center">
                                    <ListChecks className="h-4 w-4 mr-2 text-blue-600" />
                                    {phase}
                                  </h4>
                                  <div className="space-y-2 ml-6">
                                    {phaseSteps.map((step, idx) => (
                                      <div 
                                        key={step.id}
                                        className="flex items-start justify-between p-3 bg-white rounded-lg border border-slate-200"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center flex-wrap gap-2">
                                            <span className="text-sm text-slate-400">{idx + 1}.</span>
                                            <span className="font-medium text-slate-900">{step.title}</span>
                                            {step.estimated_cost && (
                                              <span className="text-sm text-green-600 flex items-center">
                                                <DollarSign className="h-3 w-3" />
                                                {formatCurrency(step.estimated_cost)}
                                              </span>
                                            )}
                                            {step.video_url && (
                                              <a href={step.video_url} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-700" title="Watch Video">
                                                <Video className="h-4 w-4" />
                                              </a>
                                            )}
                                            {step.supplier_url && (
                                              <a href={step.supplier_url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-700 flex items-center text-sm" title="Buy from Supplier">
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                {step.supplier_name || 'Supplier'}
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                              </a>
                                            )}
                                          </div>
                                          {step.description && (
                                            <p className="text-sm text-slate-600 mt-1 ml-5">{step.description}</p>
                                          )}
                                          {step.checklist?.length > 0 && (
                                            <div className="mt-2 ml-5 flex flex-wrap gap-1">
                                              {step.checklist.map((item, i) => (
                                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                  {item}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                          <button
                                            onClick={() => openEditModal(business, step)}
                                            className="p-1 text-slate-400 hover:text-blue-600"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteStep(step.id, business.id)}
                                            className="p-1 text-slate-400 hover:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <Settings className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p>No steps defined yet</p>
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => openAddModal(business)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add First Step
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {editingStep ? 'Edit Step' : 'Add New Step'}
                  </h3>
                  <p className="text-sm text-slate-500">{selectedBusinessType?.name}</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Phase */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phase</label>
                <select
                  value={stepForm.phase}
                  onChange={(e) => setStepForm(prev => ({ ...prev, phase: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PHASES.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Step Title *</label>
                <input
                  type="text"
                  value={stepForm.title}
                  onChange={(e) => setStepForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Purchase Ice Cream Machine"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={stepForm.description}
                  onChange={(e) => setStepForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of this step..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  value={stepForm.estimated_cost}
                  onChange={(e) => setStepForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Video className="h-4 w-4 inline mr-1 text-purple-500" />
                  Video Tutorial URL (Optional)
                </label>
                <input
                  type="url"
                  value={stepForm.video_url}
                  onChange={(e) => setStepForm(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Supplier/Affiliate Link */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-orange-700 mb-3">
                  <ShoppingCart className="h-4 w-4 inline mr-1" />
                  Supplier / Affiliate Link (Optional)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Supplier Name</label>
                    <input
                      type="text"
                      value={stepForm.supplier_name}
                      onChange={(e) => setStepForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                      placeholder="e.g., Amazon, Alibaba, Local Supplier"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Supplier URL (Affiliate Link)</label>
                    <input
                      type="url"
                      value={stepForm.supplier_url}
                      onChange={(e) => setStepForm(prev => ({ ...prev, supplier_url: e.target.value }))}
                      placeholder="https://amazon.com/dp/B0123...?tag=youraffid"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  Add affiliate links to earn commission when users purchase through your links
                </p>
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Checklist Items</label>
                <div className="space-y-2">
                  {stepForm.checklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        placeholder={`Checklist item ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeChecklistItem(index)}
                        className="p-2 text-slate-400 hover:text-red-600"
                        disabled={stepForm.checklist.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addChecklistItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Checklist Item
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStep} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingStep ? 'Update Step' : 'Add Step'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
