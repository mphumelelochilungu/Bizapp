import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { COUNTRIES_CURRENCIES, CURRENCIES_MAP, getCurrencyByCountry } from './currencies'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Re-export from currencies.js for backward compatibility
export { COUNTRIES_CURRENCIES, CURRENCIES_MAP, getCurrencyByCountry }

// Legacy CURRENCIES object - now uses the comprehensive list
export const CURRENCIES = CURRENCIES_MAP

// Legacy COUNTRIES array - now uses the comprehensive list
export const COUNTRIES = COUNTRIES_CURRENCIES.map(c => ({
  code: c.code,
  name: c.country,
  currency: c.currency
}))

export const BUSINESS_CATEGORIES = [
  'Agriculture & Farming',
  'Food Processing & Hospitality',
  'Retail & Trading',
  'Services & Personal Care',
  'Manufacturing & Crafts',
  'Digital & Creative',
  'Transport & Logistics',
  'Construction & Real Estate',
  'Green & Environmental',
  'Health & Social Services'
]

export const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
  'Insurance', 'Debt Payments', 'Entertainment', 'Clothing',
  'Personal Care', 'Education', 'Gifts', 'Savings', 'Investments',
  'Childcare', 'Pet Care', 'Travel', 'Other'
]

// Get user's currency from localStorage
export function getUserCurrency() {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    return profile.currency || 'USD'
  } catch {
    return 'USD'
  }
}

export function formatCurrency(amount, currency = null) {
  // Use provided currency or get from user profile
  const currencyCode = currency || getUserCurrency()
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES['USD']
  const symbol = currencyInfo?.symbol || '$'
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date) {
  if (!date) return ''
  
  // Handle date string without timezone conversion
  // If date is in YYYY-MM-DD format, parse it as local date
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  const [year, month, day] = dateStr.split('T')[0].split('-')
  
  // Create date in local timezone to avoid timezone shifts
  const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  
  return localDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
