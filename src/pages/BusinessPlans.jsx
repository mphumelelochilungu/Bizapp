import { FileText, Plus } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function BusinessPlans() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Business Plans
          </h1>
          <p className="text-slate-600">
            Create and manage your business plans
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Business Plan</span>
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Business Plans Yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first business plan to get started
          </p>
          <Button>Create Business Plan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
