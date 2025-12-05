import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useSupabase'

export function ProtectedRoute({ children, requireAdmin = false, skipOnboarding = false }) {
  const { data: user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if admin access is required
  if (requireAdmin) {
    const userRole = user.user_metadata?.role || 'user'
    if (userRole !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Check if onboarding is completed (skip for onboarding page itself)
  if (!skipOnboarding && location.pathname !== '/onboarding') {
    const onboardingCompleted = user.user_metadata?.onboarding_completed || false
    if (!onboardingCompleted) {
      return <Navigate to="/onboarding" replace />
    }
  }

  return children
}
