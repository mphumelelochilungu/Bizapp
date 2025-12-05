import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function SupabaseTest() {
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState(null)

  const testConnection = async () => {
    setStatus('loading')
    setMessage('Testing Supabase connection...')
    
    try {
      // Test 1: Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Extract project details from URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const projectRef = supabaseUrl ? supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] : null
      const projectName = projectRef || 'Unknown'
      const databaseName = `postgres` // Supabase uses postgres as default

      // Test 2: Try to query a table (will fail if tables don't exist yet)
      const { data, error, count } = await supabase
        .from('business_types')
        .select('*', { count: 'exact', head: true })

      if (error) {
        // If error is about table not existing, that's expected
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setStatus('warning')
          setMessage('✅ Connection successful! ⚠️ Database tables not created yet.')
          setDetails({
            connected: true,
            tablesExist: false,
            projectRef,
            projectName,
            databaseName,
            instruction: 'Run the SQL schema in Supabase SQL Editor to create tables.'
          })
          return
        }
        throw error
      }

      // Success - tables exist
      setStatus('success')
      setMessage('✅ Supabase connection successful!')
      setDetails({
        connected: true,
        tablesExist: true,
        projectRef,
        projectName,
        databaseName,
        businessTypesCount: count || 0,
        message: count > 0 
          ? `Found ${count} business types in database` 
          : 'Tables exist but no data yet'
      })

    } catch (error) {
      setStatus('error')
      setMessage('❌ Connection failed')
      setDetails({
        connected: false,
        error: error.message,
        possibleCauses: [
          'Environment variables not set correctly',
          'Dev server needs restart after .env changes',
          'Invalid Supabase credentials'
        ]
      })
    }
  }

  // Auto-test on mount
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🔌 Supabase Connection Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center space-x-3">
            {status === 'loading' && (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
            {status === 'warning' && (
              <CheckCircle2 className="h-6 w-6 text-yellow-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <span className="text-lg font-semibold">{message}</span>
          </div>

          {/* Details */}
          {details && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-slate-700">Details:</div>
              
              {details.connected !== undefined && (
                <div className="text-sm">
                  <span className="font-medium">Connection Status:</span>{' '}
                  <span className={details.connected ? 'text-green-600' : 'text-red-600'}>
                    {details.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              )}

              {details.tablesExist !== undefined && (
                <div className="text-sm">
                  <span className="font-medium">Database Tables:</span>{' '}
                  <span className={details.tablesExist ? 'text-green-600' : 'text-yellow-600'}>
                    {details.tablesExist ? 'Created' : 'Not Created'}
                  </span>
                </div>
              )}

              {details.projectRef && (
                <div className="text-sm">
                  <span className="font-medium">Project Reference:</span>{' '}
                  <span className="text-slate-900 font-mono">{details.projectRef}</span>
                </div>
              )}

              {details.projectName && (
                <div className="text-sm">
                  <span className="font-medium">Project Name:</span>{' '}
                  <span className="text-slate-900">{details.projectName}</span>
                </div>
              )}

              {details.databaseName && (
                <div className="text-sm">
                  <span className="font-medium">Database:</span>{' '}
                  <span className="text-slate-900 font-mono">{details.databaseName}</span>
                </div>
              )}

              {details.businessTypesCount !== undefined && (
                <div className="text-sm">
                  <span className="font-medium">Business Types:</span>{' '}
                  <span className="text-slate-900">{details.businessTypesCount}</span>
                </div>
              )}

              {details.message && (
                <div className="text-sm text-slate-600 mt-2">
                  {details.message}
                </div>
              )}

              {details.instruction && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <div className="font-medium text-yellow-800 mb-1">Next Step:</div>
                  <div className="text-yellow-700">{details.instruction}</div>
                  <a 
                    href="https://app.supabase.com/project/itegkamzyvjchhstmuao/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    → Open Supabase SQL Editor
                  </a>
                </div>
              )}

              {details.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                  <div className="font-medium text-red-800 mb-1">Error:</div>
                  <div className="text-red-700 font-mono text-xs">{details.error}</div>
                </div>
              )}

              {details.possibleCauses && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-slate-700 mb-1">Possible causes:</div>
                  <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                    {details.possibleCauses.map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Environment Variables Check */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Environment Variables:</div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">VITE_SUPABASE_URL:</span>{' '}
                <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
              <div>
                <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>{' '}
                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Retest Button */}
          <Button onClick={testConnection} className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Testing...' : 'Test Again'}
          </Button>

          {/* Quick Links */}
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm font-medium text-slate-700">Quick Links:</div>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://app.supabase.com/project/itegkamzyvjchhstmuao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Supabase Dashboard
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://app.supabase.com/project/itegkamzyvjchhstmuao/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                SQL Editor
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://app.supabase.com/project/itegkamzyvjchhstmuao/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                API Settings
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
