import { useState, useEffect } from 'react'
import { 
  BookOpen, Plus, FileText, Scale, List, ChevronDown, ChevronRight,
  Edit2, Trash2, X, Check, RefreshCw, Download, Building2, Calendar,
  ArrowUpRight, ArrowDownRight, Info, Search, Wallet, Banknote
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AccountGuideModal } from '../components/AccountGuideModal'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import { DEFAULT_CHART_OF_ACCOUNTS, ACCOUNT_TYPE_GROUPS } from '../lib/defaultChartOfAccounts'
import { DEFAULT_SUBCATEGORIES } from '../lib/defaultSubcategories'
import { ACCOUNT_GUIDE, searchAccountGuide, getAccountInfo } from '../lib/accountGuide'

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense']

// Account type code prefixes
const ACCOUNT_TYPE_PREFIXES = {
  'Asset': '1',
  'Liability': '2',
  'Equity': '3',
  'Revenue': '4',
  'COGS': '5',
  'Expense': '6',
  'Other Income': '7',
  'Other Expense': '7'
}

export function Accounting() {
  const [activeTab, setActiveTab] = useState('trial-balance')
  const [userBusinesses, setUserBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Chart of Accounts
  const [accounts, setAccounts] = useState([])
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccount, setNewAccount] = useState({ code: '', name: '', account_type: 'Asset', subcategory: '', codeDigits: '' })
  
  // Subcategories
  const [subcategories, setSubcategories] = useState([])
  const [showManageSubcategories, setShowManageSubcategories] = useState(false)
  const [newSubcategory, setNewSubcategory] = useState({ account_type: 'Asset', name: '' })
  
  // Journal Entries
  const [journalEntries, setJournalEntries] = useState([])
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    description: '',
    lines: [
      { account_id: '', debit_amount: '', credit_amount: '', memo: '' },
      { account_id: '', debit_amount: '', credit_amount: '', memo: '' }
    ]
  })
  
  // Trial Balance data
  const [trialBalance, setTrialBalance] = useState([])
  
  // General Ledger
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  
  // Account Guide
  const [showAccountGuide, setShowAccountGuide] = useState(false)
  const [guideSearchTerm, setGuideSearchTerm] = useState('')
  const [selectedGuideSection, setSelectedGuideSection] = useState('assets')
  
  // Bank Account Modal
  const [showBankAccountModal, setShowBankAccountModal] = useState(false)
  const [newBankAccount, setNewBankAccount] = useState({
    account_name: '',
    account_type: 'Bank Account',
    institution_name: '',
    account_number: '',
    currency_code: 'USD',
    notes: ''
  })

  // Fetch businesses on mount
  useEffect(() => {
    fetchUserBusinesses()
  }, [])

  // Fetch data when business changes
  useEffect(() => {
    if (selectedBusinessId) {
      fetchSubcategories()
      fetchAccounts()
      fetchJournalEntries()
    }
  }, [selectedBusinessId])

  // Calculate trial balance when accounts or entries change
  useEffect(() => {
    if (accounts.length > 0 && journalEntries.length >= 0) {
      calculateTrialBalance()
    }
  }, [accounts, journalEntries])

  const fetchUserBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_businesses')
        .select('*, business_types(name, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserBusinesses(data || [])
      if (data && data.length > 0) {
        setSelectedBusinessId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('account_subcategories')
        .select('*')
        .eq('user_business_id', selectedBusinessId)
        .order('account_type, display_order')

      if (error) throw error
      setSubcategories(data || [])
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const fetchAccounts = async () => {
    try {
      // Fetch all accounts from Chart of Accounts
      // Bank accounts are automatically created in the accounts table via database trigger
      // Only fetch active accounts
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_business_id', selectedBusinessId)
        .eq('is_active', true)
        .order('code')

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
        .select(`
          *,
          journal_entry_lines (
            *,
            accounts (code, name, account_type)
          )
        `)
        .eq('user_business_id', selectedBusinessId)
        .order('entry_date', { ascending: false })

      if (error) throw error
      setJournalEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    }
  }

  const calculateTrialBalance = () => {
    const balances = accounts.map(account => {
      let totalDebit = 0
      let totalCredit = 0

      journalEntries.forEach(entry => {
        if (entry.is_posted) {
          entry.journal_entry_lines?.forEach(line => {
            if (line.account_id === account.id) {
              totalDebit += parseFloat(line.debit_amount) || 0
              totalCredit += parseFloat(line.credit_amount) || 0
            }
          })
        }
      })

      const rawBalance = totalDebit - totalCredit
      
      // Display in debit column if positive, credit column if negative
      const displayDebit = rawBalance > 0 ? rawBalance : 0
      const displayCredit = rawBalance < 0 ? Math.abs(rawBalance) : 0

      return {
        ...account,
        debit_balance: totalDebit,
        credit_balance: totalCredit,
        net_balance: rawBalance,
        displayDebit: displayDebit,
        displayCredit: displayCredit
      }
    })

    setTrialBalance(balances)
  }

  const initializeDefaultAccounts = async () => {
    if (!selectedBusinessId) return

    try {
      // First, create default subcategories
      const subcategoriesToInsert = DEFAULT_SUBCATEGORIES.map(sub => ({
        ...sub,
        user_business_id: selectedBusinessId
      }))

      const { error: subError } = await supabase
        .from('account_subcategories')
        .insert(subcategoriesToInsert)

      if (subError && !subError.message.includes('duplicate')) throw subError

      // Then create accounts
      const accountsToInsert = DEFAULT_CHART_OF_ACCOUNTS.map(acc => ({
        ...acc,
        user_business_id: selectedBusinessId
      }))

      const { error } = await supabase
        .from('accounts')
        .insert(accountsToInsert)

      if (error) throw error
      
      fetchSubcategories()
      fetchAccounts()
      alert(`Successfully created ${DEFAULT_SUBCATEGORIES.length} subcategories and ${DEFAULT_CHART_OF_ACCOUNTS.length} accounts!`)
    } catch (error) {
      console.error('Error initializing accounts:', error)
      alert('Error creating default accounts: ' + error.message)
    }
  }

  const handleAddSubcategory = async () => {
    if (!newSubcategory.name) {
      alert('Please enter a subcategory name')
      return
    }

    try {
      const maxOrder = subcategories
        .filter(s => s.account_type === newSubcategory.account_type)
        .reduce((max, s) => Math.max(max, s.display_order || 0), 0)

      const { error } = await supabase
        .from('account_subcategories')
        .insert({
          ...newSubcategory,
          user_business_id: selectedBusinessId,
          display_order: maxOrder + 1,
          is_system: false
        })

      if (error) throw error

      setNewSubcategory({ account_type: 'Asset', name: '' })
      fetchSubcategories()
    } catch (error) {
      console.error('Error adding subcategory:', error)
      alert('Error adding subcategory: ' + error.message)
    }
  }

  const handleDeleteSubcategory = async (subcategoryId, isSystem) => {
    if (isSystem) {
      alert('Cannot delete system subcategories')
      return
    }

    if (!confirm('Are you sure you want to delete this subcategory?')) return

    try {
      const { error } = await supabase
        .from('account_subcategories')
        .delete()
        .eq('id', subcategoryId)

      if (error) throw error
      fetchSubcategories()
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      alert('Error deleting subcategory: ' + error.message)
    }
  }

  const handleAddAccount = async () => {
    if (!newAccount.code || !newAccount.name) {
      alert('Please fill in account code and name')
      return
    }

    // Validate code is 4 digits
    if (newAccount.code.length !== 4) {
      alert('Account code must be 4 digits (1 prefix + 3 digits)')
      return
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          code: newAccount.code,
          name: newAccount.name,
          account_type: newAccount.account_type,
          subcategory: newAccount.subcategory || null,
          user_business_id: selectedBusinessId
        })

      if (error) throw error

      setNewAccount({ code: '', name: '', account_type: 'Asset', subcategory: '', codeDigits: '' })
      setShowAddAccount(false)
      fetchAccounts()
    } catch (error) {
      console.error('Error adding account:', error)
      alert('Error adding account: ' + error.message)
    }
  }

  const handleDeleteAccount = async (accountId) => {
    const account = accounts.find(a => a.id === accountId)
    const isBankAccount = ['Bank Account', 'Digital Wallet', 'Cash'].includes(account?.subcategory)
    
    if (!confirm(`Are you sure you want to delete "${account?.name}"?${isBankAccount ? ' This will also delete the associated bank account.' : ''}`)) return

    try {
      if (isBankAccount) {
        // Delete from bank_accounts table first (trigger will handle accounts table)
        const { error: bankError } = await supabase
          .from('bank_accounts')
          .delete()
          .eq('chart_account_id', accountId)

        if (bankError) throw bankError
      } else {
        // Delete regular account
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', accountId)

        if (error) throw error
      }
      
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error deleting account: ' + error.message)
    }
  }

  const handleSaveBankAccount = async () => {
    if (!newBankAccount.account_name || !newBankAccount.account_type) {
      alert('Please fill in required fields')
      return
    }

    if (newBankAccount.account_type !== 'Cash' && !newBankAccount.institution_name) {
      alert('Institution name is required for Bank Accounts and Digital Wallets')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const accountData = {
        account_name: newBankAccount.account_name,
        account_type: newBankAccount.account_type,
        institution_name: newBankAccount.account_type !== 'Cash' ? newBankAccount.institution_name : null,
        account_number: newBankAccount.account_number || null,
        currency_code: newBankAccount.currency_code,
        notes: newBankAccount.notes || null,
        user_id: user.id,
        user_business_id: selectedBusinessId
      }

      const { error } = await supabase
        .from('bank_accounts')
        .insert([accountData])
      
      if (error) throw error

      // Reset form and close modal
      setNewBankAccount({
        account_name: '',
        account_type: 'Bank Account',
        institution_name: '',
        account_number: '',
        currency_code: 'USD',
        notes: ''
      })
      setShowBankAccountModal(false)
      
      // Refresh accounts list
      fetchAccounts()
      alert('Bank account created successfully!')
    } catch (error) {
      console.error('Error saving bank account:', error)
      alert('Error: ' + error.message)
    }
  }

  const resetBankAccountForm = () => {
    setNewBankAccount({
      account_name: '',
      account_type: 'Bank Account',
      institution_name: '',
      account_number: '',
      currency_code: 'USD',
      notes: ''
    })
    setShowBankAccountModal(false)
  }

  const addEntryLine = () => {
    setNewEntry({
      ...newEntry,
      lines: [...newEntry.lines, { account_id: '', debit_amount: '', credit_amount: '', memo: '' }]
    })
  }

  const updateEntryLine = (index, field, value) => {
    const updatedLines = [...newEntry.lines]
    updatedLines[index][field] = value
    
    // If setting debit, clear credit and vice versa
    if (field === 'debit_amount' && value) {
      updatedLines[index].credit_amount = ''
    } else if (field === 'credit_amount' && value) {
      updatedLines[index].debit_amount = ''
    }
    
    setNewEntry({ ...newEntry, lines: updatedLines })
  }

  const removeEntryLine = (index) => {
    if (newEntry.lines.length <= 2) {
      alert('Journal entry must have at least 2 lines')
      return
    }
    const updatedLines = newEntry.lines.filter((_, i) => i !== index)
    setNewEntry({ ...newEntry, lines: updatedLines })
  }

  const calculateEntryTotals = () => {
    const totalDebit = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.debit_amount) || 0), 0)
    const totalCredit = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.credit_amount) || 0), 0)
    return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 }
  }

  const validateInventoryFlow = async (lines) => {
    // Get inventory account IDs
    const rawMaterialsAcc = accounts.find(a => a.code === '1210')
    const wipAcc = accounts.find(a => a.code === '1220' || a.code === '1320')
    const finishedGoodsAcc = accounts.find(a => a.code === '1230' || a.code === '1330')
    const cogsAcc = accounts.find(a => a.code === '5000')

    // Check for COGS without Finished Goods credit
    const cogsLine = lines.find(l => l.account_id == cogsAcc?.id && parseFloat(l.debit_amount) > 0)
    if (cogsLine) {
      const fgLine = lines.find(l => l.account_id == finishedGoodsAcc?.id && parseFloat(l.credit_amount) > 0)
      if (!fgLine) {
        return { valid: false, message: '⚠️ Manufacturing Flow: COGS entry must credit Finished Goods inventory' }
      }
      
      // Check if sufficient finished goods inventory exists
      const fgBalance = await getAccountBalance(finishedGoodsAcc.id)
      const cogsAmount = parseFloat(cogsLine.debit_amount)
      if (fgBalance < cogsAmount) {
        return { 
          valid: false, 
          message: `⚠️ Insufficient Inventory: Finished Goods balance (${formatCurrency(fgBalance)}) is less than COGS amount (${formatCurrency(cogsAmount)}). You cannot sell more than you have in stock.` 
        }
      }
    }

    // Check for Finished Goods debit without WIP credit
    const fgDebitLine = lines.find(l => l.account_id == finishedGoodsAcc?.id && parseFloat(l.debit_amount) > 0)
    if (fgDebitLine) {
      const wipLine = lines.find(l => l.account_id == wipAcc?.id && parseFloat(l.credit_amount) > 0)
      if (!wipLine) {
        return { valid: false, message: '⚠️ Manufacturing Flow: Production entry must credit Work in Progress' }
      }
    }

    // Check for WIP debit without Raw Materials credit
    const wipDebitLine = lines.find(l => l.account_id == wipAcc?.id && parseFloat(l.debit_amount) > 0)
    if (wipDebitLine) {
      const rmLine = lines.find(l => l.account_id == rawMaterialsAcc?.id && parseFloat(l.credit_amount) > 0)
      if (!rmLine) {
        return { valid: false, message: '⚠️ Manufacturing Flow: WIP entry must credit Raw Materials. Raw Materials must be consumed before production.' }
      }
      
      // Check if sufficient raw materials exist
      const rmBalance = await getAccountBalance(rawMaterialsAcc.id)
      const wipAmount = parseFloat(wipDebitLine.debit_amount)
      if (rmBalance < wipAmount) {
        return { 
          valid: false, 
          message: `⚠️ Insufficient Inventory: Raw Materials balance (${formatCurrency(rmBalance)}) is less than WIP amount (${formatCurrency(wipAmount)})` 
        }
      }
    }

    return { valid: true }
  }

  const getAccountBalance = async (accountId) => {
    try {
      const { data, error } = await supabase
        .from('journal_entry_lines')
        .select('debit_amount, credit_amount, journal_entries!inner(user_business_id, is_posted)')
        .eq('account_id', accountId)
        .eq('journal_entries.user_business_id', selectedBusinessId)
        .eq('journal_entries.is_posted', true)

      if (error) throw error

      const balance = data.reduce((sum, line) => {
        return sum + (parseFloat(line.debit_amount) || 0) - (parseFloat(line.credit_amount) || 0)
      }, 0)

      return balance
    } catch (error) {
      console.error('Error getting account balance:', error)
      return 0
    }
  }

  const handleSaveJournalEntry = async (post = false) => {
    const { totalDebit, totalCredit, isBalanced } = calculateEntryTotals()

    if (!newEntry.description) {
      alert('Please enter a description')
      return
    }

    if (newEntry.lines.some(line => !line.account_id)) {
      alert('Please select an account for each line')
      return
    }

    if (totalDebit === 0 && totalCredit === 0) {
      alert('Please enter amounts')
      return
    }

    if (post && !isBalanced) {
      alert('Cannot post: Debits must equal Credits')
      return
    }

    // Validate inventory flow for posted entries
    if (post) {
      const inventoryValidation = await validateInventoryFlow(newEntry.lines)
      if (!inventoryValidation.valid) {
        alert(inventoryValidation.message)
        return
      }
    }

    try {
      // Generate reference number if not provided
      let referenceNumber = newEntry.reference_number
      if (!referenceNumber) {
        // Get the count of existing journal entries for this business
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_business_id', selectedBusinessId)
        
        // Generate reference number: JE-YYYY-NNNN
        const year = new Date().getFullYear()
        const nextNumber = (count || 0) + 1
        referenceNumber = `JE-${year}-${String(nextNumber).padStart(4, '0')}`
      }

      // Create journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_business_id: selectedBusinessId,
          entry_date: newEntry.entry_date,
          reference_number: referenceNumber,
          description: newEntry.description,
          is_posted: post
        })
        .select()
        .single()

      if (entryError) throw entryError

      // Create entry lines
      const linesToInsert = newEntry.lines
        .filter(line => line.account_id && (line.debit_amount || line.credit_amount))
        .map(line => ({
          journal_entry_id: entry.id,
          account_id: line.account_id, // Don't parse - let database handle the type
          debit_amount: parseFloat(line.debit_amount) || 0,
          credit_amount: parseFloat(line.credit_amount) || 0,
          memo: line.memo
        }))

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesToInsert)

      if (linesError) throw linesError

      // Reset form
      setNewEntry({
        entry_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        description: '',
        lines: [
          { account_id: '', debit_amount: '', credit_amount: '', memo: '' },
          { account_id: '', debit_amount: '', credit_amount: '', memo: '' }
        ]
      })
      setShowAddEntry(false)
      fetchJournalEntries()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Error saving journal entry: ' + error.message)
    }
  }

  const handlePostEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_posted: true })
        .eq('id', entryId)

      if (error) throw error
      fetchJournalEntries()
    } catch (error) {
      console.error('Error posting entry:', error)
      alert('Error posting entry: ' + error.message)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      fetchJournalEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Error deleting entry: ' + error.message)
    }
  }

  const fetchLedgerForAccount = (accountId) => {
    setSelectedAccountId(accountId)
    
    const entries = []
    let runningBalance = 0

    journalEntries
      .filter(je => je.is_posted)
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .forEach(entry => {
        entry.journal_entry_lines?.forEach(line => {
          if (line.account_id === accountId) {
            const debit = parseFloat(line.debit_amount) || 0
            const credit = parseFloat(line.credit_amount) || 0
            runningBalance += debit - credit
            
            entries.push({
              date: entry.entry_date,
              reference: entry.reference_number,
              description: entry.description,
              memo: line.memo,
              debit,
              credit,
              balance: runningBalance
            })
          }
        })
      })

    setLedgerEntries(entries)
  }

  const tabs = [
    { id: 'trial-balance', name: 'Trial Balance', icon: Scale },
    { id: 'journal-entries', name: 'Journal Entries', icon: FileText },
    { id: 'general-ledger', name: 'General Ledger', icon: List },
    { id: 'chart-of-accounts', name: 'Chart of Accounts', icon: BookOpen },
  ]

  // Get subcategories for selected account type
  const getSubcategoriesForType = (accountType) => {
    return subcategories
      .filter(s => s.account_type === accountType)
      .sort((a, b) => a.display_order - b.display_order)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (userBusinesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Businesses Yet</h3>
            <p className="text-slate-600 mb-4">Start a business first to use accounting features.</p>
            <Button onClick={() => window.location.href = '/home'}>
              Browse Businesses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { totalDebit, totalCredit, isBalanced } = calculateEntryTotals()

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Double-Entry Accounting</h1>
        <p className="text-slate-600">Manage your chart of accounts, journal entries, and financial reports</p>
      </div>

      {/* Business Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Business</label>
        <div className="flex flex-wrap gap-2">
          {userBusinesses.map((business) => (
            <button
              key={business.id}
              onClick={() => setSelectedBusinessId(business.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedBusinessId === business.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {business.name}
            </button>
          ))}
        </div>
      </div>

      {/* Account Guide Modal - Global */}
      <AccountGuideModal 
        isOpen={showAccountGuide} 
        onClose={() => setShowAccountGuide(false)} 
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Trial Balance Tab */}
      {activeTab === 'trial-balance' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <span>Trial Balance</span>
              </CardTitle>
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No accounts set up yet</p>
                <Button onClick={initializeDefaultAccounts}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Default Accounts
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Account Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.filter(acc => acc.displayDebit > 0 || acc.displayCredit > 0).map((account) => (
                      <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-sm">{account.code}</td>
                        <td className="py-3 px-4">{account.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            account.account_type === 'Asset' ? 'bg-green-100 text-green-700' :
                            account.account_type === 'Liability' ? 'bg-red-100 text-red-700' :
                            account.account_type === 'Equity' ? 'bg-purple-100 text-purple-700' :
                            account.account_type === 'Revenue' ? 'bg-blue-100 text-blue-700' :
                            account.account_type === 'COGS' ? 'bg-orange-100 text-orange-700' :
                            account.account_type === 'Expense' ? 'bg-amber-100 text-amber-700' :
                            account.account_type === 'Other Income' ? 'bg-teal-100 text-teal-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {account.account_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {account.displayDebit > 0 ? formatCurrency(account.displayDebit) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {account.displayCredit > 0 ? formatCurrency(account.displayCredit) : '-'}
                        </td>
                      </tr>
                    ))}
                    {trialBalance.filter(acc => acc.displayDebit > 0 || acc.displayCredit > 0).length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No posted transactions yet. Create and post journal entries to see the trial balance.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan="3" className="py-3 px-4 text-right">Totals</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.displayDebit, 0))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.displayCredit, 0))}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="py-3 px-4 text-center">
                        {Math.abs(
                          trialBalance.reduce((sum, acc) => sum + acc.displayDebit, 0) -
                          trialBalance.reduce((sum, acc) => sum + acc.displayCredit, 0)
                        ) < 0.01 ? (
                          <span className="text-green-600 font-medium flex items-center justify-center">
                            <Check className="h-4 w-4 mr-1" /> Books are balanced
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            ⚠️ Out of balance by {formatCurrency(Math.abs(
                              trialBalance.reduce((sum, acc) => sum + acc.displayDebit, 0) -
                              trialBalance.reduce((sum, acc) => sum + acc.displayCredit, 0)
                            ))}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Journal Entries Tab */}
      {activeTab === 'journal-entries' && (
        <div className="space-y-6">
          {/* Add New Entry */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Journal Entries</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowAccountGuide(!showAccountGuide)}>
                    <Info className="h-4 w-4 mr-2" />
                    Chart of Accounts (COA)
                  </Button>
                  <Button onClick={() => setShowAddEntry(!showAddEntry)}>
                    {showAddEntry ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {showAddEntry ? 'Cancel' : 'New Entry'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {showAddEntry && (
              <CardContent className="border-t">
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={newEntry.entry_date}
                        onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reference # (Optional)</label>
                      <input
                        type="text"
                        value={newEntry.reference_number}
                        onChange={(e) => setNewEntry({ ...newEntry, reference_number: e.target.value })}
                        placeholder="Auto-generated if left blank"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">Leave blank to auto-generate (e.g., JE-2026-0001)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                      <input
                        type="text"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                        placeholder="e.g., Cash sale to customer"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Entry Lines */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 text-sm font-medium">Account</th>
                          <th className="text-left py-2 px-3 text-sm font-medium">Memo</th>
                          <th className="text-right py-2 px-3 text-sm font-medium w-32">Debit</th>
                          <th className="text-right py-2 px-3 text-sm font-medium w-32">Credit</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newEntry.lines.map((line, index) => (
                          <tr key={index} className="border-t">
                            <td className="py-2 px-3">
                              <select
                                value={line.account_id}
                                onChange={(e) => updateEntryLine(index, 'account_id', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select account...</option>
                                {ACCOUNT_TYPES.map(type => (
                                  <optgroup key={type} label={type}>
                                    {accounts.filter(a => a.account_type === type).map(acc => (
                                      <option key={acc.id} value={acc.id}>
                                        {acc.code} - {acc.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={line.memo}
                                onChange={(e) => updateEntryLine(index, 'memo', e.target.value)}
                                placeholder="Optional memo"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={line.debit_amount}
                                onChange={(e) => updateEntryLine(index, 'debit_amount', e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={line.credit_amount}
                                onChange={(e) => updateEntryLine(index, 'credit_amount', e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <button
                                onClick={() => removeEntryLine(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-slate-50">
                          <td colSpan="2" className="py-2 px-3">
                            <button
                              onClick={addEntryLine}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Line
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right font-bold">{formatCurrency(totalDebit)}</td>
                          <td className="py-2 px-3 text-right font-bold">{formatCurrency(totalCredit)}</td>
                          <td></td>
                        </tr>
                        <tr className="border-t">
                          <td colSpan="5" className="py-2 px-3 text-center">
                            {isBalanced ? (
                              <span className="text-green-600 font-medium">✓ Balanced</span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                ⚠️ Out of balance: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                              </span>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => handleSaveJournalEntry(false)}>
                      Save as Draft
                    </Button>
                    <Button onClick={() => handleSaveJournalEntry(true)} disabled={!isBalanced}>
                      <Check className="h-4 w-4 mr-2" />
                      Save & Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Journal Entries List */}
          <Card>
            <CardContent className="pt-6">
              {journalEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No journal entries yet. Create your first entry above.
                </div>
              ) : (
                <div className="space-y-4">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className={`border rounded-lg p-4 ${entry.is_posted ? 'bg-white' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-sm text-slate-500">{entry.reference_number || `JE-${entry.id}`}</span>
                          <span className="font-medium">{entry.description}</span>
                          <span className="text-sm text-slate-500">{formatDate(entry.entry_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {entry.is_posted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Posted</span>
                          ) : (
                            <>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Draft</span>
                              <Button size="sm" variant="outline" onClick={() => handlePostEntry(entry.id)}>
                                Post
                              </Button>
                            </>
                          )}
                          <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <tbody>
                          {entry.journal_entry_lines?.map((line, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="py-2 w-1/3">
                                <span className="font-mono text-slate-500">{line.accounts?.code}</span>
                                <span className="ml-2">{line.accounts?.name}</span>
                              </td>
                              <td className="py-2 text-slate-500">{line.memo}</td>
                              <td className="py-2 text-right w-24">
                                {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : ''}
                              </td>
                              <td className="py-2 text-right w-24">
                                {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* General Ledger Tab */}
      {activeTab === 'general-ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Account List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Select Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {ACCOUNT_TYPES.map(type => (
                  <div key={type}>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">{type}</div>
                    {accounts.filter(a => a.account_type === type).map(account => (
                      <button
                        key={account.id}
                        onClick={() => fetchLedgerForAccount(account.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedAccountId === account.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-mono text-slate-500">{account.code}</span>
                        <span className="ml-2">{account.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ledger Details */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5 text-blue-600" />
                <span>
                  {selectedAccountId 
                    ? `Ledger: ${accounts.find(a => a.id === selectedAccountId)?.name}`
                    : 'General Ledger'
                  }
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedAccountId ? (
                <div className="text-center py-12 text-slate-500">
                  <List className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Select an account to view its ledger</p>
                </div>
              ) : ledgerEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No transactions for this account yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left py-2 px-3 text-sm font-semibold">Date</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Ref</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Description</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Debit</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Credit</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="py-2 px-3 text-sm">{formatDate(entry.date)}</td>
                          <td className="py-2 px-3 text-sm font-mono text-slate-500">{entry.reference || '-'}</td>
                          <td className="py-2 px-3 text-sm">
                            {entry.description}
                            {entry.memo && <span className="text-slate-400 ml-1">({entry.memo})</span>}
                          </td>
                          <td className="py-2 px-3 text-sm text-right">
                            {entry.debit > 0 && (
                              <span className="text-green-600 flex items-center justify-end">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {formatCurrency(entry.debit)}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-sm text-right">
                            {entry.credit > 0 && (
                              <span className="text-red-600 flex items-center justify-end">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                {formatCurrency(entry.credit)}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-sm text-right font-medium">
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan="3" className="py-2 px-3 text-right">Ending Balance</td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(ledgerEntries.reduce((sum, e) => sum + e.debit, 0))}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(ledgerEntries.reduce((sum, e) => sum + e.credit, 0))}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(ledgerEntries[ledgerEntries.length - 1]?.balance || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'chart-of-accounts' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Chart of Accounts</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowAccountGuide(!showAccountGuide)}>
                  <Info className="h-4 w-4 mr-2" />
                  Chart of Accounts (COA)
                </Button>
                {accounts.length === 0 && (
                  <Button variant="outline" onClick={initializeDefaultAccounts}>
                    Initialize Defaults
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowManageSubcategories(!showManageSubcategories)}>
                  {showManageSubcategories ? <X className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
                  {showManageSubcategories ? 'Close' : 'Manage Subcategories'}
                </Button>
                <Button onClick={() => setShowAddAccount(!showAddAccount)}>
                  {showAddAccount ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {showAddAccount ? 'Cancel' : 'Add Account'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Manage Subcategories Section */}
            {showManageSubcategories && (
              <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Manage Subcategories</h4>
                <p className="text-xs text-slate-600 mb-4">Add custom subcategories to organize your chart of accounts. System subcategories cannot be deleted.</p>
                
                {/* Add Subcategory Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                    <select
                      value={newSubcategory.account_type}
                      onChange={(e) => setNewSubcategory({ ...newSubcategory, account_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory Name</label>
                    <input
                      type="text"
                      value={newSubcategory.name}
                      onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                      placeholder="e.g., Office Equipment"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddSubcategory} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </div>
                </div>

                {/* Subcategories List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ACCOUNT_TYPES.map(type => {
                    const typeSubs = getSubcategoriesForType(type)
                    if (typeSubs.length === 0) return null
                    
                    return (
                      <div key={type} className="bg-white rounded-lg p-3 border border-slate-200">
                        <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase">{type}</h5>
                        <div className="space-y-1">
                          {typeSubs.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between text-sm py-1">
                              <span className="text-slate-600">{sub.name}</span>
                              {!sub.is_system && (
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id, sub.is_system)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add Account Form */}
            {showAddAccount && (
              <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* 1. Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                    <select
                      value={newAccount.account_type}
                      onChange={(e) => {
                        const newType = e.target.value
                        setNewAccount({ 
                          ...newAccount, 
                          account_type: newType,
                          subcategory: '', // Reset subcategory when type changes
                          code: ACCOUNT_TYPE_PREFIXES[newType] + newAccount.codeDigits
                        })
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Prefix: {ACCOUNT_TYPE_PREFIXES[newAccount.account_type]}XXX</p>
                  </div>
                  
                  {/* 2. Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
                    <select
                      value={newAccount.subcategory}
                      onChange={(e) => {
                        const selectedSubcategory = e.target.value
                        // Check if it's a bank-related subcategory
                        if (['Bank Account', 'Digital Wallet', 'Cash'].includes(selectedSubcategory)) {
                          // Open bank account modal instead
                          setNewBankAccount({
                            ...newBankAccount,
                            account_type: selectedSubcategory
                          })
                          setShowBankAccountModal(true)
                          setShowAddAccount(false)
                        } else {
                          setNewAccount({ ...newAccount, subcategory: selectedSubcategory })
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="">None</option>
                      {getSubcategoriesForType(newAccount.account_type).map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {newAccount.account_type === 'Asset' ? 'Bank accounts open special form' : 'Optional grouping'}
                    </p>
                  </div>
                  
                  {/* 3. Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="e.g., Cash"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  
                  {/* 4. Code (last 3 digits) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-semibold text-slate-600">{ACCOUNT_TYPE_PREFIXES[newAccount.account_type]}</span>
                      <input
                        type="text"
                        value={newAccount.codeDigits}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                          setNewAccount({ 
                            ...newAccount, 
                            codeDigits: value,
                            code: ACCOUNT_TYPE_PREFIXES[newAccount.account_type] + value
                          })
                        }}
                        placeholder="000"
                        maxLength="3"
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Enter 3 digits (e.g., 000)</p>
                  </div>
                  
                  {/* 5. Add Button */}
                  <div className="flex items-end">
                    <Button onClick={handleAddAccount} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts List */}
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No accounts set up yet</p>
                <Button onClick={initializeDefaultAccounts}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Default Accounts
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {ACCOUNT_TYPES.map(type => {
                  const typeAccounts = accounts.filter(a => a.account_type === type)
                  if (typeAccounts.length === 0) return null
                  
                  // Calculate type total
                  const typeTotal = typeAccounts.reduce((sum, account) => {
                    const balance = trialBalance.find(tb => tb.id === account.id)
                    return sum + (balance?.net_balance || 0)
                  }, 0)
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                            type === 'Asset' ? 'text-green-600' :
                            type === 'Liability' ? 'text-red-600' :
                            type === 'Equity' ? 'text-purple-600' :
                            type === 'Revenue' ? 'text-blue-600' :
                            type === 'COGS' ? 'text-orange-600' :
                            type === 'Expense' ? 'text-amber-600' :
                            type === 'Other Income' ? 'text-teal-600' :
                            'text-pink-600'
                          }`}>
                            {type === 'COGS' ? 'Cost of Goods Sold' : type === 'Other Income' || type === 'Other Expense' ? type : `${type}s`}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {ACCOUNT_TYPE_GROUPS.find(g => g.type === type)?.range}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          type === 'Asset' ? 'text-green-600' :
                          type === 'Liability' ? 'text-red-600' :
                          type === 'Equity' ? 'text-purple-600' :
                          type === 'Revenue' ? 'text-blue-600' :
                          type === 'COGS' ? 'text-orange-600' :
                          type === 'Expense' ? 'text-amber-600' :
                          type === 'Other Income' ? 'text-teal-600' :
                          'text-pink-600'
                        }`}>
                          {typeTotal !== 0 ? formatCurrency(Math.abs(typeTotal)) : ''}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {typeAccounts.map(account => {
                          const balance = trialBalance.find(tb => tb.id === account.id)
                          const netBalance = balance?.net_balance || 0
                          
                          const isBankAccount = ['Bank Account', 'Digital Wallet', 'Cash'].includes(account.subcategory)
                          
                          return (
                            <div key={account.id} className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 ${
                              isBankAccount ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                            }`}>
                              <div className="flex items-center space-x-4 flex-1">
                                <span className="font-mono text-slate-500 w-16">{account.code}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span>{account.name}</span>
                                    {isBankAccount && (
                                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">{account.subcategory}</span>
                                    )}
                                  </div>
                                  {account.subcategory && !isBankAccount && (
                                    <span className="ml-2 text-xs text-slate-400">• {account.subcategory}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {netBalance !== 0 && (
                                  <span className={`font-medium ${netBalance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>
                                    {formatCurrency(Math.abs(netBalance))}
                                    {netBalance < 0 && ' CR'}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteAccount(account.id)}
                                  className="text-red-500 hover:text-red-700 opacity-50 hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bank Account Modal */}
      {showBankAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Bank Account</CardTitle>
                <button onClick={resetBankAccountForm} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Account Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'Bank Account', label: 'Bank Account', icon: Building2, color: 'blue' },
                      { value: 'Digital Wallet', label: 'Digital Wallet', icon: Wallet, color: 'purple' },
                      { value: 'Cash', label: 'Cash', icon: Banknote, color: 'green' }
                    ].map(type => {
                      const Icon = type.icon
                      const isSelected = newBankAccount.account_type === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewBankAccount({ ...newBankAccount, account_type: type.value, institution_name: type.value === 'Cash' ? '' : newBankAccount.institution_name })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mx-auto mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <p className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                            {type.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Name *</label>
                  <input
                    type="text"
                    value={newBankAccount.account_name}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, account_name: e.target.value })}
                    placeholder="e.g., Main Checking, Savings, Petty Cash"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Institution Name - Only for Bank Account and Digital Wallet */}
                {newBankAccount.account_type !== 'Cash' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      value={newBankAccount.institution_name}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, institution_name: e.target.value })}
                      placeholder={newBankAccount.account_type === 'Bank Account' ? 'e.g., Chase, Bank of America' : 'e.g., PayPal, Venmo, Cash App'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Account Number - Optional */}
                {newBankAccount.account_type !== 'Cash' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Number (Optional)</label>
                    <input
                      type="text"
                      value={newBankAccount.account_number}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, account_number: e.target.value })}
                      placeholder="Last 4 digits for reference"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    value={newBankAccount.currency_code}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, currency_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="GHS">GHS - Ghanaian Cedi</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={newBankAccount.notes}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, notes: e.target.value })}
                    placeholder="Any additional notes about this account"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-blue-700">
                      <p className="font-semibold mb-1">Account Code Assignment</p>
                      <p className="mb-2">A unique 4-digit account code will be automatically assigned:</p>
                      <ul className="space-y-1 ml-2">
                        <li><span className="font-mono font-semibold">10XX</span> - Bank Account (e.g., 1001, 1002)</li>
                        <li><span className="font-mono font-semibold">11XX</span> - Digital Wallet (e.g., 1101, 1102)</li>
                        <li><span className="font-mono font-semibold">12XX</span> - Cash (e.g., 1201, 1202)</li>
                      </ul>
                      <p className="mt-2 text-xs">
                        <strong>Note:</strong> This account will appear in your Chart of Accounts under <strong>Assets</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSaveBankAccount} className="flex-1">
                    Add Account
                  </Button>
                  <Button onClick={resetBankAccountForm} variant="secondary" className="flex-1">
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
