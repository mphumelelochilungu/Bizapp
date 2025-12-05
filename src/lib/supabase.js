import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Business Types
  async getBusinessTypes() {
    const { data, error } = await supabase
      .from('business_types')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getBusinessTypeById(id) {
    const { data, error } = await supabase
      .from('business_types')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // User Businesses
  async getUserBusinesses(userId) {
    const { data, error } = await supabase
      .from('user_businesses')
      .select(`
        *,
        business_types (*)
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  async createUserBusiness(businessData) {
    const { data, error } = await supabase
      .from('user_businesses')
      .insert(businessData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Financial Records
  async getFinancialRecords(userBusinessId) {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('user_business_id', userBusinessId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addFinancialRecord(record) {
    const { data, error } = await supabase
      .from('financial_records')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Personal Finances
  async getPersonalIncome(userId) {
    const { data, error } = await supabase
      .from('personal_income')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  async getPersonalExpenses(userId) {
    const { data, error } = await supabase
      .from('personal_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addPersonalExpense(expense) {
    const { data, error } = await supabase
      .from('personal_expenses')
      .insert(expense)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Savings Goals
  async getSavingsGoals(userId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  async createSavingsGoal(goal) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Lenders
  async getLenders() {
    const { data, error } = await supabase
      .from('lenders')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Business Steps
  async getBusinessSteps(businessTypeId) {
    const { data, error } = await supabase
      .from('business_steps')
      .select('*')
      .eq('business_type_id', businessTypeId)
      .order('order_index')
    
    if (error) throw error
    return data
  },

  async getStepProgress(userBusinessId) {
    const { data, error } = await supabase
      .from('step_progress')
      .select(`
        *,
        business_steps (*)
      `)
      .eq('user_business_id', userBusinessId)
    
    if (error) throw error
    return data
  },

  async toggleStepCompletion(stepProgressId, completed) {
    const { data, error } = await supabase
      .from('step_progress')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', stepProgressId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
