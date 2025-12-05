import { SupabaseTest } from '../components/SupabaseTest'

export function SupabaseTestPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Supabase Connection Test
        </h1>
        <p className="text-slate-600">
          Verify your Supabase configuration and database setup
        </p>
      </div>

      <SupabaseTest />

      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📚 Setup Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Make sure you've run <code className="bg-blue-100 px-1 rounded">npm install</code></li>
            <li>Verify your <code className="bg-blue-100 px-1 rounded">.env</code> file has the correct credentials</li>
            <li>If tables don't exist, run <code className="bg-blue-100 px-1 rounded">supabase-schema.sql</code> in Supabase SQL Editor</li>
            <li>Restart your dev server if you just created the <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
