import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useSupabase'
import { 
  Home, Briefcase, DollarSign, TrendingUp, CreditCard, 
  Wallet, FileText, User, Menu, X, Settings, BarChart3,
  Building2, Users, Database, Code, ArrowLeft, Shield, Tag
} from 'lucide-react'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Business', href: '/mybusiness', icon: Briefcase },
  { name: 'Finances', href: '/finances', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
  { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
  { name: 'Loans & Savings', href: '/loans', icon: Building2 },
  { name: 'Wallet Planner', href: '/wallet', icon: Wallet },
  { name: 'Business Plans', href: '/business-plans', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
]

const adminNavigation = [
  { name: 'Manage Business Types', href: '/admin/business-types', icon: BarChart3 },
  { name: 'Manage Categories', href: '/admin/categories', icon: Tag },
  { name: 'Manage Steps', href: '/admin/steps', icon: Settings },
  { name: 'Manage Lenders', href: '/admin/lenders', icon: Users },
  { name: 'Test Supabase', href: '/admin/test-supabase', icon: Database },
  { name: 'SQL Setup', href: '/admin/sql-setup', icon: Code },
]

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { data: user } = useAuth()
  const userRole = user?.user_metadata?.role || 'user'
  const isAdmin = location.pathname.startsWith('/admin')
  const canAccessAdmin = userRole === 'admin'

  const navItems = isAdmin ? adminNavigation : navigation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">BizStep 💼</span>
            </div>
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Navigation Toggle Button - Only show for admins */}
            {canAccessAdmin && (
              <div className="mt-4 px-4">
                {isAdmin ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/business-types"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            )}

            {!isAdmin && canAccessAdmin && (
              <>
                <div className="my-4 border-t border-slate-200" />
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Admin Access
                </div>
                <div className="space-y-1">
                  {adminNavigation.slice(0, 3).map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-xl font-semibold text-slate-900">
                {navItems.find(item => item.href === location.pathname)?.name || 'BizStep'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
