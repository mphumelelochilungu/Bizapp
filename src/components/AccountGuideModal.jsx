import { useState } from 'react'
import { X, Search, BookOpen, ChevronRight } from 'lucide-react'
import { ACCOUNT_GUIDE, searchAccountGuide } from '../lib/accountGuide'

export function AccountGuideModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('assets')
  const [expandedCategories, setExpandedCategories] = useState({})

  if (!isOpen) return null

  const searchResults = searchTerm.length > 2 ? searchAccountGuide(searchTerm) : []
  const currentSection = ACCOUNT_GUIDE[selectedSection]

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const sections = [
    { key: 'assets', label: 'Assets', color: 'green' },
    { key: 'liabilities', label: 'Liabilities', color: 'red' },
    { key: 'equity', label: 'Equity', color: 'purple' },
    { key: 'revenue', label: 'Revenue', color: 'blue' },
    { key: 'cogs', label: 'COGS', color: 'orange' },
    { key: 'expenses', label: 'Expenses', color: 'amber' },
    { key: 'other', label: 'Other Income/Expenses', color: 'teal' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Account Categorization Guide</h2>
              <p className="text-sm text-slate-600">Learn where to categorize your transactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for an account or transaction type... (e.g., 'office supplies', 'rent', 'inventory')"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Section Navigation */}
          <div className="w-64 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="p-4 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => {
                    setSelectedSection(section.key)
                    setSearchTerm('')
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedSection === section.key
                      ? `bg-${section.color}-100 text-${section.color}-700`
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchTerm.length > 2 ? (
              // Search Results
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.length === 0 ? (
                  <p className="text-slate-600">No results found. Try different keywords.</p>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((account, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-mono text-sm text-blue-600 font-semibold">{account.code}</span>
                            <h4 className="text-lg font-semibold text-slate-900">{account.name}</h4>
                            <p className="text-xs text-slate-500">{account.section} → {account.category}</p>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-3">{account.description}</p>
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-slate-700 mb-1">Examples:</p>
                          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                            {account.examples.map((example, i) => (
                              <li key={i}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                          <p className="text-sm font-semibold text-blue-900 mb-1">When to use:</p>
                          <p className="text-sm text-blue-800">{account.whenToUse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Section Content
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentSection.title}</h3>
                  <p className="text-slate-700">{currentSection.description}</p>
                </div>

                <div className="space-y-6">
                  {Object.entries(currentSection.categories || {}).map(([categoryKey, category]) => (
                    <div key={categoryKey} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(categoryKey)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-slate-900">{category.title}</h4>
                          <p className="text-sm text-slate-600">{category.description}</p>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${expandedCategories[categoryKey] ? 'rotate-90' : ''}`} />
                      </button>

                      {expandedCategories[categoryKey] && (
                        <div className="p-4 space-y-4 bg-white">
                          {category.accounts?.map((account, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="mb-2">
                                <span className="font-mono text-sm text-blue-600 font-semibold">{account.code}</span>
                                <h5 className="text-base font-semibold text-slate-900">{account.name}</h5>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">{account.description}</p>
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-slate-700 mb-1">Examples:</p>
                                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                                  {account.examples.map((example, i) => (
                                    <li key={i}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-green-50 border border-green-200 p-2 rounded">
                                <p className="text-xs font-semibold text-green-900">When to use:</p>
                                <p className="text-xs text-green-800">{account.whenToUse}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-600 text-center">
            💡 <strong>Tip:</strong> Use the search bar to quickly find where to categorize specific transactions
          </p>
        </div>
      </div>
    </div>
  )
}
