import { Card, CardContent } from '../../components/ui/Card'
import { Users } from 'lucide-react'

export function ManageLenders() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manage Lenders
        </h1>
        <p className="text-slate-600">
          Add and manage microfinance lenders in the marketplace
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Lenders Management
          </h3>
          <p className="text-slate-600">
            This feature is coming soon. You'll be able to manage lender profiles and loan terms.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
