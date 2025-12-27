import { createContext, useContext, useMemo } from 'react'
import { useAuth, useUserProfile } from '../hooks/useSupabase'
import { CURRENCIES_MAP } from '../lib/currencies'

const CurrencyContext = createContext({
  currencyCode: 'USD',
  currencySymbol: '$',
  currencyName: 'US Dollar',
  formatCurrency: (amount) => `$${Number(amount).toLocaleString()}`,
})

export function CurrencyProvider({ children }) {
  const { data: user } = useAuth()
  const { data: profile } = useUserProfile(user?.id)
  
  const currencyCode = profile?.currency_code || 'USD'
  const currencyInfo = CURRENCIES_MAP[currencyCode] || CURRENCIES_MAP['USD']
  
  const value = useMemo(() => ({
    currencyCode,
    currencySymbol: currencyInfo?.symbol || '$',
    currencyName: currencyInfo?.name || 'US Dollar',
    formatCurrency: (amount) => {
      if (amount === null || amount === undefined) return '-'
      const symbol = currencyInfo?.symbol || '$'
      return `${symbol}${Number(amount).toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`
    },
    formatCurrencyDetailed: (amount) => {
      if (amount === null || amount === undefined) return '-'
      const symbol = currencyInfo?.symbol || '$'
      return `${symbol}${Number(amount).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    },
  }), [currencyCode, currencyInfo])
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
