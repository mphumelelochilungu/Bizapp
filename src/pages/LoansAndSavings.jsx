import { useState } from 'react'
import { Building2, TrendingUp, Percent, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatCurrency } from '../lib/utils'

const sampleLenders = [
  { 
    id: 1, 
    name: 'MicroFinance Plus', 
    type: 'Microfinance', 
    maxAmount: 10000, 
    interestRate: 8.5, 
    term: '12-36 months',
    requirements: 'Business plan, ID, proof of address'
  },
  { 
    id: 2, 
    name: 'Small Business Bank', 
    type: 'Bank', 
    maxAmount: 50000, 
    interestRate: 12, 
    term: '24-60 months',
    requirements: 'Credit score 650+, collateral, business registration'
  },
  { 
    id: 3, 
    name: 'Community Lenders', 
    type: 'Cooperative', 
    maxAmount: 5000, 
    interestRate: 6, 
    term: '6-24 months',
    requirements: 'Membership, guarantor'
  },
]

const sampleSavingsGoals = [
  { id: 1, name: 'Emergency Fund', target: 5000, current: 3200, deadline: '2024-12-31' },
  { id: 2, name: 'Equipment Upgrade', target: 8000, current: 2500, deadline: '2025-06-30' },
]

export function LoansAndSavings() {
  const [savingsGoals, setSavingsGoals] = useState(sampleSavingsGoals)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [selectedLender, setSelectedLender] = useState(null)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Loans & Savings
        </h1>
        <p className="text-slate-600">
          Find financing options and track your savings goals
        </p>
      </div>

      {/* Loan Marketplace */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Loan Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleLenders.map(lender => (
            <Card key={lender.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{lender.name}</h3>
                    <p className="text-sm text-slate-500">{lender.type}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Max Amount:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(lender.maxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Interest Rate:</span>
                    <span className="font-semibold text-slate-900">{lender.interestRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Term:</span>
                    <span className="font-semibold text-slate-900">{lender.term}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-600 mb-1">Requirements:</p>
                  <p className="text-xs text-slate-500">{lender.requirements}</p>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    setSelectedLender(lender)
                    setShowLoanModal(true)
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Savings Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Savings Goals</CardTitle>
            <Button size="sm">
              <Target className="h-4 w-4 mr-1" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {savingsGoals.map(goal => {
              const percentage = (goal.current / goal.target) * 100
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{goal.name}</h4>
                      <p className="text-sm text-slate-500">Target: {goal.deadline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {formatCurrency(goal.current)}
                      </div>
                      <div className="text-sm text-slate-500">
                        of {formatCurrency(goal.target)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {percentage.toFixed(1)}% complete • {formatCurrency(goal.target - goal.current)} remaining
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Loan Application Modal */}
      {showLoanModal && selectedLender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Apply for Loan - {selectedLender.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="Loan Amount" type="number" placeholder="0.00" />
                <Input label="Purpose" placeholder="e.g., Equipment purchase" />
                <Input label="Business Name" placeholder="Your business name" />
                <Input label="Monthly Revenue" type="number" placeholder="0.00" />
                <div className="flex space-x-3 pt-4">
                  <Button className="flex-1">Submit Application</Button>
                  <Button 
                    onClick={() => {
                      setShowLoanModal(false)
                      setSelectedLender(null)
                    }} 
                    variant="secondary" 
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
