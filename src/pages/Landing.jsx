import { Link } from 'react-router-dom'
import { Briefcase, TrendingUp, DollarSign, Users, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export function Landing() {
  const features = [
    {
      icon: Briefcase,
      title: '119 Business Templates',
      description: 'Browse businesses across 10 categories with detailed startup costs and profit projections'
    },
    {
      icon: TrendingUp,
      title: 'Step-by-Step Roadmaps',
      description: 'Follow guided instructions with video tutorials, checklists, and cost tracking'
    },
    {
      icon: DollarSign,
      title: 'Financial Management',
      description: 'Track CAPEX, OPEX, revenue, and personal finances all in one place'
    },
    {
      icon: Users,
      title: 'AI Business Advisor',
      description: 'Get personalized insights and answers to your business questions'
    }
  ]

  const benefits = [
    'CAPEX vs OPEX separation for clear financial tracking',
    'Personal finance tracker with budget alerts',
    'Loan marketplace with microfinance options',
    'Savings goals and progress tracking',
    'Visual reports with income vs expenses charts',
    'Multi-currency support for global users'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">BizStep 💼</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Your Personal Business Coach
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Launch and grow your dream business with step-by-step guidance, financial tracking, 
            and AI-powered insights. Everything you need in one platform.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" className="flex items-center space-x-2">
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Comprehensive Business & Financial Management
              </h2>
              <p className="text-slate-600 mb-6">
                BizStep combines business coaching with powerful financial tools to help 
                aspiring entrepreneurs turn their ideas into successful businesses.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-blue-600 mb-2">119</div>
                  <div className="text-slate-600">Business Types</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-green-600 mb-2">10</div>
                  <div className="text-slate-600">Categories</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
                  <div className="text-slate-600">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Business Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are building their dreams with BizStep
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 BizStep. Your Personal Business Coach.</p>
        </div>
      </footer>
    </div>
  )
}
