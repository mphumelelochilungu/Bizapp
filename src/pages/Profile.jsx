import { useState, useEffect, useMemo } from 'react'
import { User, Mail, MapPin, DollarSign, Save, Search, Globe, Check, ChevronDown, X, Phone, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { COUNTRIES_CURRENCIES, CURRENCIES_MAP, formatCurrency } from '../lib/utils'
import { PHONE_CODES, getPhoneCode } from '../lib/phoneCodes'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { supabase } from '../lib/supabase'

export function Profile() {
  // Keep localStorage as fallback/cache
  const [localProfile, setLocalProfile] = useLocalStorage('userProfile', {
    name: '',
    email: '',
    country: 'US',
    currency: 'USD',
    phone: ''
  })

  const [formData, setFormData] = useState(localProfile)
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [stats, setStats] = useState({ businesses: 0, steps: 0, goals: 0 })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  // Load profile from Supabase on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Fetch profile from database
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          // Load from database
          const loadedProfile = {
            name: profile.full_name || '',
            email: user.email || '',
            country: profile.country_code || 'US',
            currency: profile.currency_code || 'USD',
            phone: profile.phone || ''
          }
          setFormData(loadedProfile)
          setLocalProfile(loadedProfile) // Sync to localStorage
        } else {
          // No profile in DB, use auth email
          setFormData(prev => ({ ...prev, email: user.email || '' }))
        }
        
        // Fetch stats
        const { data: businesses } = await supabase
          .from('user_businesses')
          .select('id')
          .eq('user_id', user.id)
        
        const { data: goals } = await supabase
          .from('savings_goals')
          .select('id')
          .eq('user_id', user.id)
        
        setStats({
          businesses: businesses?.length || 0,
          steps: 0,
          goals: goals?.length || 0
        })
      }
      setLoading(false)
    }
    fetchUserData()
  }, [])

  // Filter countries based on search (includes phone codes)
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES_CURRENCIES
    const search = countrySearch.toLowerCase()
    return COUNTRIES_CURRENCIES.filter(c => 
      c.country.toLowerCase().includes(search) ||
      c.currency.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      getPhoneCode(c.code).includes(search)
    )
  }, [countrySearch])

  // Get selected country info
  const selectedCountry = COUNTRIES_CURRENCIES.find(c => c.code === formData.country)
  const selectedCurrency = CURRENCIES_MAP[formData.currency]

  const handleCountrySelect = (country) => {
    setFormData({
      ...formData,
      country: country.code,
      currency: country.currency
    })
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  // Save to both Supabase and localStorage
  const handleSave = async () => {
    if (!userId) {
      // Fallback to localStorage only if not logged in
      setLocalProfile(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }

    setSaving(true)
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      let error
      
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.name,
            phone: formData.phone,
            country_code: formData.country,
            currency_code: formData.currency,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
        error = result.error
      } else {
        // Insert new profile
        const result = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: formData.name,
            phone: formData.phone,
            country_code: formData.country,
            currency_code: formData.currency
          })
        error = result.error
      }

      if (error) {
        console.error('Error saving profile:', error)
        alert('Failed to save profile: ' + error.message)
      } else {
        // Also save to localStorage as cache
        setLocalProfile(formData)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
    }
    
    setSaving(false)
  }

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-600">
          Manage your account information and currency preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter your name"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Country & Currency Selection */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Country & Currency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Select your country to set the currency and phone code used throughout the app.
          </p>

          {/* Country Selector */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country / Territory
            </label>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFlagEmoji(formData.country)}</span>
                <div className="text-left">
                  <div className="font-medium text-slate-900">{selectedCountry?.country || 'Select Country'}</div>
                  <div className="text-sm text-slate-500">
                    {selectedCountry?.symbol} {selectedCountry?.currency} • {getPhoneCode(formData.country)}
                  </div>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showCountryDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search countries..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    {countrySearch && (
                      <button
                        onClick={() => setCountrySearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Country List */}
                <div className="overflow-y-auto max-h-64">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      No countries found
                    </div>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${
                          formData.country === country.code ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getFlagEmoji(country.code)}</span>
                          <div className="text-left">
                            <div className="font-medium text-slate-900">{country.country}</div>
                            <div className="text-sm text-slate-500">
                              {country.symbol} {country.currency} • {getPhoneCode(country.code)}
                            </div>
                          </div>
                        </div>
                        {formData.country === country.code && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone with Country Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="flex">
              <div className="flex items-center px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-700 font-medium min-w-[90px]">
                <Phone className="h-4 w-4 mr-2 text-slate-500" />
                {getPhoneCode(formData.country)}
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="123 456 7890"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phone code is based on your selected country above
            </p>
          </div>

          {/* Currency Display */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Selected Currency</div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-blue-600">{selectedCurrency?.symbol}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{selectedCurrency?.name}</div>
                    <div className="text-sm text-slate-500">ISO Code: {formData.currency}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 mb-1">Example</div>
                <div className="text-xl font-bold text-slate-900">
                  {formatCurrency(1234.56, formData.currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Currency Override (Optional) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Override Currency (Optional)
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CURRENCIES_MAP).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.symbol} - {info.name} ({code})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              By default, the currency matches your selected country. You can override it here if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-6">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center space-x-2 ${saved ? 'bg-green-600 hover:bg-green-700' : ''} ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Saving to database...</span>
            </>
          ) : saved ? (
            <>
              <Check className="h-5 w-5" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {/* Account Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Active Businesses</div>
              <div className="text-2xl font-bold text-blue-600">{stats.businesses}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Currency</div>
              <div className="text-2xl font-bold text-green-600">{formData.currency}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Savings Goals</div>
              <div className="text-2xl font-bold text-purple-600">{stats.goals}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Country</div>
              <div className="text-2xl font-bold text-orange-600">{getFlagEmoji(formData.country)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
