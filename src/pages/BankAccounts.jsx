import { CreditCard, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function BankAccounts() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bank Accounts
          </h1>
          <p className="text-slate-600">
            Connect and manage your bank accounts
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Connect Bank</span>
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Bank Accounts Connected
          </h3>
          <p className="text-slate-600 mb-4">
            Connect your bank account to automatically track transactions
          </p>
          <Button>Connect Your First Bank</Button>
        </CardContent>
      </Card>
    </div>
  )
}
