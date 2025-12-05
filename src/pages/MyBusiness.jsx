import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CheckCircle2, Circle, DollarSign, TrendingUp, MessageSquare, Send, Video, FileText, ChevronDown, Briefcase, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../lib/utils'
import { motion } from 'framer-motion'

const sampleSteps = [
  { 
    id: 1, 
    title: 'Market Research', 
    description: 'Understand your target market and competitors',
    videoUrl: 'https://example.com/video1',
    estimatedCost: 100,
    completed: true,
    checklist: ['Identify target customers', 'Analyze competitors', 'Survey potential customers']
  },
  { 
    id: 2, 
    title: 'Business Registration', 
    description: 'Register your business legally',
    videoUrl: 'https://example.com/video2',
    estimatedCost: 200,
    completed: true,
    checklist: ['Choose business structure', 'Register with authorities', 'Get tax ID']
  },
  { 
    id: 3, 
    title: 'Location & Setup', 
    description: 'Find and prepare your business location',
    videoUrl: 'https://example.com/video3',
    estimatedCost: 2000,
    completed: false,
    checklist: ['Scout locations', 'Negotiate lease', 'Setup workspace']
  },
  { 
    id: 4, 
    title: 'Equipment Purchase', 
    description: 'Buy necessary equipment and supplies',
    videoUrl: 'https://example.com/video4',
    estimatedCost: 3000,
    completed: false,
    checklist: ['List required equipment', 'Compare suppliers', 'Purchase items']
  },
  { 
    id: 5, 
    title: 'Marketing Launch', 
    description: 'Create and execute marketing strategy',
    videoUrl: 'https://example.com/video5',
    estimatedCost: 500,
    completed: false,
    checklist: ['Design logo', 'Create social media', 'Launch campaign']
  },
]

export function MyBusiness() {
  const location = useLocation()
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [steps, setSteps] = useState(sampleSteps)
  const [selectedStep, setSelectedStep] = useState(steps[0])
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI business advisor. How can I help you today?' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  // Step completion modal state
  const [showStepModal, setShowStepModal] = useState(false)
  const [stepToComplete, setStepToComplete] = useState(null)
  const [stepNotes, setStepNotes] = useState('')
  const [stepCompletionDate, setStepCompletionDate] = useState(new Date().toISOString().split('T')[0])
  const [stepChecklist, setStepChecklist] = useState([])
  const [stepActualCost, setStepActualCost] = useState('')
  const [stepExpenseType, setStepExpenseType] = useState('CAPEX')

  // Fetch user's businesses
  useEffect(() => {
    fetchUserBusinesses()
  }, [])

  // Handle business passed from location state
  useEffect(() => {
    if (location.state?.selectedBusiness) {
      setSelectedBusiness(location.state.selectedBusiness)
    }
  }, [location.state])

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

  const handleDeleteClick = () => {
    setBusinessToDelete(selectedBusiness)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!businessToDelete) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('user_businesses')
        .delete()
        .eq('id', businessToDelete.userBusinessId)

      if (error) throw error

      // Remove from local state
      const updatedBusinesses = userBusinesses.filter(b => b.id !== businessToDelete.userBusinessId)
      setUserBusinesses(updatedBusinesses)

      // Select another business or clear
      if (updatedBusinesses.length > 0) {
        setSelectedBusinessId(updatedBusinesses[0].id)
        setSelectedBusiness({
          ...updatedBusinesses[0].business_types,
          userBusinessId: updatedBusinesses[0].id,
          businessName: updatedBusinesses[0].name,
          budget: updatedBusinesses[0].budget,
          capex_budget: updatedBusinesses[0].capex_budget,
          opex_budget: updatedBusinesses[0].opex_budget,
          start_date: updatedBusinesses[0].start_date,
          expected_monthly_profit: updatedBusinesses[0].expected_monthly_profit
        })
      } else {
        setSelectedBusinessId(null)
        setSelectedBusiness(null)
      }

      setShowDeleteModal(false)
      setBusinessToDelete(null)
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Failed to delete business. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const completedSteps = steps.filter(s => s.completed).length
  const totalCost = steps.reduce((sum, step) => sum + step.estimatedCost, 0)
  const spentCost = steps.filter(s => s.completed).reduce((sum, step) => sum + step.estimatedCost, 0)

  // Open step completion modal
  const openStepModal = (step) => {
    setStepToComplete(step)
    setStepNotes(step.notes || '')
    setStepCompletionDate(step.completedAt || new Date().toISOString().split('T')[0])
    setStepActualCost(step.actualCost || step.estimatedCost || '')
    setStepExpenseType(step.expenseType || 'CAPEX')
    // Initialize checklist with current state or all unchecked
    setStepChecklist(step.checklistStatus || step.checklist.map(item => ({ text: item, checked: false })))
    setShowStepModal(true)
  }

  // Toggle checklist item
  const toggleChecklistItem = (index) => {
    setStepChecklist(stepChecklist.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    ))
  }

  // Save step progress
  const saveStepProgress = async () => {
    const allChecked = stepChecklist.every(item => item.checked)
    const actualCostValue = parseFloat(stepActualCost) || 0
    
    // Update step in local state
    setSteps(steps.map(step => 
      step.id === stepToComplete.id 
        ? { 
            ...step, 
            completed: allChecked,
            completedAt: allChecked ? stepCompletionDate : null,
            notes: stepNotes,
            checklistStatus: stepChecklist,
            actualCost: actualCostValue,
            expenseType: stepExpenseType
          } 
        : step
    ))

    // If step is completed and has a cost, save to financial_records
    if (allChecked && actualCostValue > 0 && selectedBusiness?.userBusinessId) {
      try {
        await supabase
          .from('financial_records')
          .insert([{
            user_business_id: selectedBusiness.userBusinessId,
            type: stepExpenseType,
            category: stepToComplete.title,
            amount: actualCostValue,
            description: `${stepToComplete.title} - ${stepNotes || stepToComplete.description}`,
            date: stepCompletionDate
          }])
        console.log('Transaction saved for step:', stepToComplete.title)
      } catch (error) {
        console.error('Error saving transaction:', error)
      }
    }
    
    setShowStepModal(false)
    setStepToComplete(null)
    setStepNotes('')
    setStepChecklist([])
    setStepActualCost('')
    setStepExpenseType('CAPEX')
  }

  // Mark step as complete (all items checked)
  const markStepComplete = () => {
    setStepChecklist(stepChecklist.map(item => ({ ...item, checked: true })))
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return
    
    setAiMessages([...aiMessages, 
      { role: 'user', content: inputMessage },
      { role: 'assistant', content: 'That\'s a great question! Based on your business type, I recommend...' }
    ])
    setInputMessage('')
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
      {/* Business Selector & Header */}
      <div className="mb-8">
        {/* Business Dropdown */}
        {userBusinesses.length > 0 && (
          <div className="mb-4">
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
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {selectedBusiness.businessName || selectedBusiness.name}
        </h1>
        <div className="flex items-center space-x-2 text-slate-600">
          <Briefcase className="h-4 w-4" />
          <span>{selectedBusiness.category}</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Progress</div>
            <div className="text-2xl font-bold text-slate-900">
              {completedSteps}/{steps.length} Steps
            </div>
            <div className="mt-2 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedSteps / steps.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Budget Spent</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(spentCost)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              of {formatCurrency(totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Total Budget</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(selectedBusiness?.budget || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Expected Profit</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(selectedBusiness?.expected_monthly_profit || selectedBusiness?.monthly_profit || 0)}
            </div>
            <div className="text-sm text-slate-500 mt-1">per month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roadmap Steps */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Business Roadmap</h2>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStep.id === step.id ? 'ring-2 ring-blue-500' : ''
                } ${step.completed ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => openStepModal(step)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          step.completed ? 'text-green-700' : 'text-slate-900'
                        }`}>
                          {step.title}
                        </h3>
                        <span className="text-sm font-medium text-slate-600">
                          {formatCurrency(step.estimatedCost)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-2">{step.description}</p>

                      {/* Show completion info */}
                      {step.completed && step.completedAt && (
                        <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed on {new Date(step.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Show actual cost and expense type */}
                      {step.actualCost && (
                        <div className="flex items-center space-x-2 text-sm mb-2">
                          <DollarSign className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-700">
                            Spent: <strong>{formatCurrency(step.actualCost)}</strong>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            step.expenseType === 'CAPEX' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {step.expenseType}
                          </span>
                        </div>
                      )}

                      {/* Show checklist progress */}
                      {step.checklistStatus && (
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <span>
                            {step.checklistStatus.filter(i => i.checked).length}/{step.checklistStatus.length} tasks done
                          </span>
                        </div>
                      )}

                      {/* Click to manage hint */}
                      <div className="mt-2 text-xs text-blue-600">
                        Click to manage progress →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Business Advisor */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>AI Business Advisor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Delete Business?
                </h3>
                <p className="text-slate-600 mb-4">
                  Are you sure you want to delete <strong>{businessToDelete?.businessName || businessToDelete?.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Warning:</strong> This action cannot be undone. All data associated with this business will be permanently deleted, including:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 ml-4 space-y-1">
                    <li>• Business roadmap and progress</li>
                    <li>• Financial records and transactions</li>
                    <li>• Budget allocations</li>
                    <li>• All business settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false)
                  setBusinessToDelete(null)
                }}
                variant="outline"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Business
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Step Completion Modal */}
      {showStepModal && stepToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {stepToComplete.completed ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <Circle className="h-8 w-8 text-slate-300" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{stepToComplete.title}</h3>
                    <p className="text-sm text-slate-500">{stepToComplete.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStepModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Checklist */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Tasks to Complete ({stepChecklist.filter(i => i.checked).length}/{stepChecklist.length})
                </h4>
                <div className="space-y-2">
                  {stepChecklist.map((item, index) => (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        item.checked ? 'bg-green-50 border border-green-200' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(index)}
                        className="h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 ${item.checked ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Mark all complete button */}
                {!stepChecklist.every(i => i.checked) && (
                  <button
                    onClick={markStepComplete}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    ✓ Mark all as complete
                  </button>
                )}
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={stepCompletionDate}
                  onChange={(e) => setStepCompletionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes / Description
                </label>
                <textarea
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Add any notes about this step..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Actual Cost Input */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Estimated Cost:</span>
                  <span className="font-medium">{formatCurrency(stepToComplete.estimatedCost)}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Actual Cost Spent
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={stepActualCost}
                      onChange={(e) => setStepActualCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Expense Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setStepExpenseType('CAPEX')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        stepExpenseType === 'CAPEX'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      CAPEX
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepExpenseType('OPEX')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        stepExpenseType === 'OPEX'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      OPEX
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {stepExpenseType === 'CAPEX' 
                      ? 'Capital Expenditure: One-time investments (equipment, setup, etc.)'
                      : 'Operating Expense: Recurring costs (rent, utilities, supplies, etc.)'}
                  </p>
                </div>
              </div>

              {/* Video Tutorial Link */}
              <div className="flex items-center space-x-2 text-blue-600">
                <Video className="h-5 w-5" />
                <a href={stepToComplete.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Watch Tutorial Video
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {stepChecklist.every(i => i.checked) ? (
                  <span className="text-green-600 font-medium">✓ All tasks completed!</span>
                ) : (
                  <span>{stepChecklist.filter(i => !i.checked).length} tasks remaining</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowStepModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveStepProgress}
                  className={stepChecklist.every(i => i.checked) ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {stepChecklist.every(i => i.checked) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save & Complete
                    </>
                  ) : (
                    'Save Progress'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
