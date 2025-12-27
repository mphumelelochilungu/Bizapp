import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseHelpers } from '../lib/supabase'

// Business Types Hooks
export function useBusinessTypes() {
  return useQuery({
    queryKey: ['businessTypes'],
    queryFn: supabaseHelpers.getBusinessTypes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useBusinessType(id) {
  return useQuery({
    queryKey: ['businessType', id],
    queryFn: () => supabaseHelpers.getBusinessTypeById(id),
    enabled: !!id,
  })
}

// User Businesses Hooks
export function useUserBusinesses(userId) {
  return useQuery({
    queryKey: ['userBusinesses', userId],
    queryFn: () => supabaseHelpers.getUserBusinesses(userId),
    enabled: !!userId,
  })
}

export function useCreateUserBusiness() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: supabaseHelpers.createUserBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBusinesses'] })
    },
  })
}

// Financial Records Hooks
export function useFinancialRecords(userBusinessId) {
  return useQuery({
    queryKey: ['financialRecords', userBusinessId],
    queryFn: () => supabaseHelpers.getFinancialRecords(userBusinessId),
    enabled: !!userBusinessId,
  })
}

export function useAddFinancialRecord() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: supabaseHelpers.addFinancialRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialRecords'] })
    },
  })
}

// Personal Finance Hooks
export function usePersonalIncome(userId) {
  return useQuery({
    queryKey: ['personalIncome', userId],
    queryFn: () => supabaseHelpers.getPersonalIncome(userId),
    enabled: !!userId,
  })
}

export function usePersonalExpenses(userId) {
  return useQuery({
    queryKey: ['personalExpenses', userId],
    queryFn: () => supabaseHelpers.getPersonalExpenses(userId),
    enabled: !!userId,
  })
}

export function useAddPersonalExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: supabaseHelpers.addPersonalExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalExpenses'] })
    },
  })
}

// Savings Goals Hooks
export function useSavingsGoals(userId) {
  return useQuery({
    queryKey: ['savingsGoals', userId],
    queryFn: () => supabaseHelpers.getSavingsGoals(userId),
    enabled: !!userId,
  })
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: supabaseHelpers.createSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] })
    },
  })
}

// Lenders Hooks
export function useLenders() {
  return useQuery({
    queryKey: ['lenders'],
    queryFn: supabaseHelpers.getLenders,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Country Authorities Hooks
export function useCountryAuthority(countryCode) {
  return useQuery({
    queryKey: ['countryAuthority', countryCode],
    queryFn: async () => {
      if (!countryCode) return null
      const { data, error } = await supabase
        .from('country_authorities')
        .select('*')
        .eq('country_code', countryCode)
        .single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      return data
    },
    enabled: !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// User Profile Hook
export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!userId,
  })
}

// Check if user profile is completed
export function useProfileCompletion(userId) {
  return useQuery({
    queryKey: ['profileCompletion', userId],
    queryFn: async () => {
      if (!userId) return { isCompleted: false, profile: null }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      // Profile is complete if it exists and has required fields filled
      const isCompleted = data && 
        data.profile_completed === true &&
        data.full_name && 
        data.full_name.trim() !== ''
      
      return { isCompleted, profile: data }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Business Steps Hooks
export function useBusinessSteps(businessTypeId) {
  return useQuery({
    queryKey: ['businessSteps', businessTypeId],
    queryFn: () => supabaseHelpers.getBusinessSteps(businessTypeId),
    enabled: !!businessTypeId,
  })
}

export function useStepProgress(userBusinessId) {
  return useQuery({
    queryKey: ['stepProgress', userBusinessId],
    queryFn: () => supabaseHelpers.getStepProgress(userBusinessId),
    enabled: !!userBusinessId,
  })
}

export function useToggleStepCompletion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ stepProgressId, completed }) => 
      supabaseHelpers.toggleStepCompletion(stepProgressId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stepProgress'] })
    },
  })
}

// Auth Hooks
export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    },
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
