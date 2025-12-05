import { Card, CardContent } from '../../components/ui/Card'
import { Settings } from 'lucide-react'

export function ManageSteps() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manage Business Steps
        </h1>
        <p className="text-slate-600">
          Create and edit roadmap steps for each business type
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Settings className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Steps Management
          </h3>
          <p className="text-slate-600">
            This feature is coming soon. You'll be able to create roadmap steps with videos and checklists.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
