import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { 
  Rocket, Briefcase, ChevronRight, ChevronLeft, DollarSign, 
  Calendar, Target, Check, X, Search, AlertCircle, Wallet, TrendingUp, CheckCircle2, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useSupabase'
import { useBusinessTypes } from '../hooks/useSupabase'
import { formatCurrency } from '../lib/utils'

const CATEGORIES = [
  { name: 'Agriculture & Farming', icon: '🌾' },
  { name: 'Food Processing & Hospitality', icon: '🍽️' },
  { name: 'Retail & Trading', icon: '🛒' },
  { name: 'Services & Personal Care', icon: '✂️' },
  { name: 'Manufacturing & Crafts', icon: '🔨' },
  { name: 'Digital & Creative', icon: '💻' },
  { name: 'Transport & Logistics', icon: '🚚' },
  { name: 'Construction & Real Estate', icon: '🏗️' },
  { name: 'Green & Environmental', icon: '♻️' },
  { name: 'Health & Social Services', icon: '🏥' },
]

const ROADMAP_STEPS = [
  {
    title: 'Market Research',
    description: 'Understand your target market, identify customers, and analyze competitors. This helps you know who to sell to and how to position your business.',
    why: 'Prevents wasting money on products/services nobody wants'
  },
  {
    title: 'Licenses & Registration',
    description: 'Register your business legally, get necessary permits, and obtain tax IDs. This makes your business official and compliant with regulations.',
    why: 'Protects you legally and builds customer trust'
  },
  {
    title: 'Setup Location',
    description: 'Find and prepare your business location, whether physical shop or online presence. This includes rent, renovations, and basic setup.',
    why: 'Creates the foundation where your business operates'
  },
  {
    title: 'Buy Equipment or Stock',
    description: 'Purchase necessary equipment, tools, inventory, or initial stock. This is your main CAPEX investment to get operational.',
    why: 'Gives you the tools and products needed to serve customers'
  },
  {
    title: 'Start Operations',
    description: 'Begin selling products or services, track revenue, manage expenses, and serve customers. Your business is now live!',
    why: 'This is where you start making money and growing'
  }
]

export function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useAuth()
  const { data: businessTypes } = useBusinessTypes()
  
  const preSelectedBusiness = location.state?.preSelectedBusiness
  
  const [currentStep, setCurrentStep] = useState(preSelectedBusiness ? 2 : 1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState({
    selectedBusiness: null,
    businessName: '',
    totalBudget: '',
    capexBudget: '',
    opexBudget: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedMonthlyProfit: ''
  })
  const [saving, setSaving] = useState(false)

  // Auto-fill if business was pre-selected from Home page
  useEffect(() => {
    if (preSelectedBusiness) {
      setFormData({
        selectedBusiness: preSelectedBusiness,
        businessName: preSelectedBusiness.name,
        totalBudget: preSelectedBusiness.startup_cost.toString(),
        capexBudget: '',
        opexBudget: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedMonthlyProfit: preSelectedBusiness.monthly_profit.toString()
      })
    }
  }, [preSelectedBusiness])

  // Filter businesses by search and category
  const filteredBusinesses = businessTypes?.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  const handleComplete = async () => {
    setSaving(true)
    try {
      // Update user onboarding status
      const { error: profileError } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true
        }
      })

      if (profileError) throw profileError

      // Create user business with all details
      if (formData.selectedBusiness) {
        const { error: businessError } = await supabase
          .from('user_businesses')
          .insert([{
            user_id: user.id,
            business_type_id: formData.selectedBusiness.id,
            name: formData.businessName,
            budget: parseFloat(formData.totalBudget),
            capex_budget: parseFloat(formData.capexBudget),
            opex_budget: parseFloat(formData.opexBudget),
            start_date: formData.startDate,
            expected_monthly_profit: parseFloat(formData.expectedMonthlyProfit),
            created_at: new Date().toISOString()
          }])

        if (businessError) throw businessError
      }

      // Redirect to My Business page
      navigate('/mybusiness', { 
        state: { 
          selectedBusiness: formData.selectedBusiness,
          businessName: formData.businessName,
          isNewBusiness: true 
        } 
      })
    } catch (error) {
      console.error('Onboarding error:', error)
      alert(`Failed to start business: ${error.message}\n\nPlease make sure you've updated the database schema with the new fields (capex_budget, opex_budget, start_date, expected_monthly_profit).`)
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    try {
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true
        }
      })
      
      navigate('/home')
    } catch (error) {
      console.error('Skip error:', error)
    }
  }

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Budget validation
  const budgetTotal = parseFloat(formData.capexBudget || 0) + parseFloat(formData.opexBudget || 0)
  const isBudgetValid = budgetTotal <= parseFloat(formData.totalBudget || 0)

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.selectedBusiness !== null
      case 2: return formData.businessName.trim() !== ''
      case 3: return formData.totalBudget && formData.capexBudget && formData.opexBudget && isBudgetValid
      case 4: return formData.startDate !== ''
      case 5: return formData.expectedMonthlyProfit !== ''
      case 6: return true
      default: return false
    }
  }

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of 6
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1"
            >
              <span>Skip</span>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-8">
                {/* Step 1: Choose Business */}
                {currentStep === 1 && (
                  <div className="text-center space-y-6">
                    <Briefcase className="h-24 w-24 text-blue-600 mx-auto" />
                    <h1 className="text-4xl font-bold text-slate-900">
                      Choose Your Business
                    </h1>
                    <p className="text-lg text-slate-600">
                      Select from 119 business types or search for your idea
                    </p>
                    <div className="text-sm text-slate-500">
                      Step 1 content coming soon...
                    </div>
                  </div>
                )}

                {/* Step 2: Name Your Business */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Briefcase className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-slate-900">Name Your Business</h2>
                      <p className="text-slate-600 mt-2">Give your business a unique name</p>
                    </div>

                    {formData.selectedBusiness && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Business Type:</strong> {formData.selectedBusiness.name}
                        </p>
                      </div>
                    )}

                    <Input
                      label="Business Name"
                      placeholder="e.g., John's Poultry Farm"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>
                )}

                {/* Step 3: Set Budget */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-slate-900">Set Your Budget</h2>
                      <p className="text-slate-600 mt-2">Allocate your budget between CAPEX and OPEX</p>
                    </div>

                    {formData.selectedBusiness && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 mb-1">
                          <strong>Business:</strong> {formData.businessName || formData.selectedBusiness.name}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Suggested Startup Cost:</strong> {formatCurrency(formData.selectedBusiness.startup_cost)}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Budget Allocation</span>
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        <strong>Budget</strong> is your total available money. Allocate it between CAPEX (one-time investments) and OPEX (recurring costs).
                      </p>

                      <div className="space-y-4">
                        <div>
                          <Input
                            label="Total Budget"
                            type="number"
                            placeholder="10000"
                            value={formData.totalBudget}
                            onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            💰 <strong>Total Budget:</strong> All the money you have available for this business
                          </p>
                        </div>

                        <div>
                          <Input
                            label="CAPEX Budget"
                            type="number"
                            placeholder="5000"
                            value={formData.capexBudget}
                            onChange={(e) => setFormData({ ...formData, capexBudget: e.target.value })}
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            🏗️ <strong>CAPEX (Capital Expenditure):</strong> One-time investments like equipment, furniture, machines, initial setup costs, renovations
                          </p>
                        </div>

                        <div>
                          <Input
                            label="OPEX Budget"
                            type="number"
                            placeholder="5000"
                            value={formData.opexBudget}
                            onChange={(e) => setFormData({ ...formData, opexBudget: e.target.value })}
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            🔄 <strong>OPEX (Operating Expenditure):</strong> Monthly/recurring costs like rent, utilities, salaries, supplies, marketing
                          </p>
                        </div>
                      </div>

                      {/* Budget Summary */}
                      {formData.totalBudget && formData.capexBudget && formData.opexBudget && (
                        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Budget Summary</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Total Budget:</span>
                              <span className="font-semibold text-slate-900">{formatCurrency(parseFloat(formData.totalBudget))}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">CAPEX + OPEX:</span>
                              <span className={`font-semibold ${isBudgetValid ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(budgetTotal)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Unallocated:</span>
                              <span className={`font-semibold ${(parseFloat(formData.totalBudget) - budgetTotal) >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                {formatCurrency(parseFloat(formData.totalBudget) - budgetTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Validation Warning */}
                      {!isBudgetValid && formData.totalBudget && formData.capexBudget && formData.opexBudget && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-red-800">
                              <strong>Budget Error:</strong> CAPEX ({formatCurrency(parseFloat(formData.capexBudget))}) + OPEX ({formatCurrency(parseFloat(formData.opexBudget))}) = {formatCurrency(budgetTotal)}
                            </p>
                            <p className="text-sm text-red-800 mt-1">
                              This exceeds your Total Budget of {formatCurrency(parseFloat(formData.totalBudget))}. Please adjust your allocations.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {isBudgetValid && formData.totalBudget && formData.capexBudget && formData.opexBudget && budgetTotal > 0 && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-800">
                            <strong>Budget Valid!</strong> Your allocations fit within your total budget.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Start Date */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-slate-900">Select Start Date</h2>
                      <p className="text-slate-600 mt-2">When will you begin operations?</p>
                    </div>

                    {formData.selectedBusiness && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 mb-1">
                          <strong>Business:</strong> {formData.businessName || formData.selectedBusiness.name}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Budget:</strong> {formatCurrency(parseFloat(formData.totalBudget || 0))}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Business Start Date</span>
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Select your tentative start date - when you plan to officially begin business operations.
                      </p>

                      <Input
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                      
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-600 mb-2">
                          📅 <strong>What is a Start Date?</strong>
                        </p>
                        <p className="text-xs text-slate-500">
                          This is the date you plan to officially launch your business and begin serving customers. It helps you:
                        </p>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1 ml-4">
                          <li>• Set a clear timeline and deadline</li>
                          <li>• Plan your setup activities</li>
                          <li>• Track progress toward launch</li>
                          <li>• Stay motivated and focused</li>
                        </ul>
                      </div>

                      {formData.startDate && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            <strong>Target Launch:</strong> {new Date(formData.startDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {new Date(formData.startDate) > new Date() && (
                            <p className="text-xs text-green-700 mt-1">
                              {Math.ceil((new Date(formData.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days from today
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Expected Profit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-slate-900">Set Your Profit Target</h2>
                      <p className="text-slate-600 mt-2">What's your profit goal?</p>
                    </div>

                    {formData.selectedBusiness && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 mb-1">
                          <strong>Business:</strong> {formData.businessName || formData.selectedBusiness.name}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Suggested Monthly Profit:</strong> {formatCurrency(formData.selectedBusiness.monthly_profit)}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Expected Monthly Profit</span>
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Set your profit target - the amount of money you expect to make after covering all expenses.
                      </p>

                      <Input
                        label="Monthly Profit Target"
                        type="number"
                        placeholder="850"
                        value={formData.expectedMonthlyProfit}
                        onChange={(e) => setFormData({ ...formData, expectedMonthlyProfit: e.target.value })}
                        required
                      />
                      
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-600 mb-2">
                          💰 <strong>What is Expected Profit?</strong>
                        </p>
                        <p className="text-xs text-slate-500">
                          This is the money you aim to keep after paying all business expenses (OPEX). It's your take-home income from the business.
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          <strong>Formula:</strong> Profit = Revenue - OPEX
                        </p>
                      </div>

                      {/* Profit Breakdown by Timeframe */}
                      {formData.expectedMonthlyProfit && parseFloat(formData.expectedMonthlyProfit) > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700">Your Profit Targets:</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {/* Daily */}
                            <div className="p-3 bg-white border border-slate-200 rounded-lg">
                              <div className="text-xs text-slate-500 mb-1">Daily Target</div>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(parseFloat(formData.expectedMonthlyProfit) / 30)}
                              </div>
                              <div className="text-xs text-slate-400">per day</div>
                            </div>

                            {/* Monthly */}
                            <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                              <div className="text-xs text-green-700 mb-1">Monthly Target</div>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(parseFloat(formData.expectedMonthlyProfit))}
                              </div>
                              <div className="text-xs text-green-600">per month</div>
                            </div>

                            {/* Quarterly */}
                            <div className="p-3 bg-white border border-slate-200 rounded-lg">
                              <div className="text-xs text-slate-500 mb-1">Quarterly Target</div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(parseFloat(formData.expectedMonthlyProfit) * 3)}
                              </div>
                              <div className="text-xs text-slate-400">per quarter (3 months)</div>
                            </div>

                            {/* Annual */}
                            <div className="p-3 bg-white border border-slate-200 rounded-lg">
                              <div className="text-xs text-slate-500 mb-1">Annual Target</div>
                              <div className="text-lg font-bold text-purple-600">
                                {formatCurrency(parseFloat(formData.expectedMonthlyProfit) * 12)}
                              </div>
                              <div className="text-xs text-slate-400">per year</div>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              <strong>💡 Tip:</strong> These targets help you track progress and stay motivated. You can adjust them anytime based on actual performance!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Review Roadmap */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-slate-900">Review & Start! 🎉</h2>
                      <p className="text-slate-600 mt-2">Preview your business roadmap</p>
                    </div>
                    <div className="text-sm text-slate-500 text-center">
                      Roadmap preview coming soon...
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Ready to Start Your Journey?
                      </h3>
                      <p className="text-sm text-green-700">
                        Click "Start My Business" to begin!
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>

                  {currentStep < 6 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex items-center space-x-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <span>{saving ? 'Setting up...' : 'Start My Business'}</span>
                      <Rocket className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
