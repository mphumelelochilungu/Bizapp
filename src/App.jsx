import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { MyBusiness } from './pages/MyBusiness'
import { Finances } from './pages/Finances'
import { Reports } from './pages/Reports'
import { BankAccounts } from './pages/BankAccounts'
import { LoansAndSavings } from './pages/LoansAndSavings'
import { WalletPlanner } from './pages/WalletPlanner'
import { BusinessPlans } from './pages/BusinessPlans'
import { Profile } from './pages/Profile'
import { SupabaseTestPage } from './pages/SupabaseTestPage'
import { SQLSetup } from './pages/admin/SQLSetup'
import { ManageBusinessTypes } from './pages/admin/ManageBusinessTypes'
import { ManageCategories } from './pages/admin/ManageCategories'
import { ManageSteps } from './pages/admin/ManageSteps'
import { ManageLenders } from './pages/admin/ManageLenders'
import { Onboarding } from './pages/Onboarding'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Onboarding - protected but separate */}
          <Route path="/onboarding" element={
            <ProtectedRoute skipOnboarding={true}>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/mybusiness" element={
            <ProtectedRoute>
              <Layout><MyBusiness /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/finances" element={
            <ProtectedRoute>
              <Layout><Finances /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/bank-accounts" element={
            <ProtectedRoute>
              <Layout><BankAccounts /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/loans" element={
            <ProtectedRoute>
              <Layout><LoansAndSavings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <Layout><WalletPlanner /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/business-plans" element={
            <ProtectedRoute>
              <Layout><BusinessPlans /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin routes - require admin role */}
          <Route path="/admin/business-types" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><ManageBusinessTypes /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><ManageCategories /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/steps" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><ManageSteps /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/lenders" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><ManageLenders /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/test-supabase" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><SupabaseTestPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/sql-setup" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout><SQLSetup /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
