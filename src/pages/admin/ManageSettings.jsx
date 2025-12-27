import { useState, useEffect } from 'react'
import { Settings, Video, Save, Loader2, CheckCircle, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ManageSettings() {
  const [settings, setSettings] = useState({
    finance_video_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')

      if (error) throw error

      // Convert array to object
      const settingsObj = {}
      data?.forEach(item => {
        settingsObj[item.setting_key] = item.setting_value || ''
      })
      
      setSettings(prev => ({ ...prev, ...settingsObj }))
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSetting = async (key, value, description) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          description: description,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Failed to save setting: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    await saveSetting('finance_video_url', settings.finance_video_url, 'YouTube video URL for Financial Concepts tutorial')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          App Settings
        </h1>
        <p className="text-slate-600">
          Manage application-wide settings and content links
        </p>
      </div>

      {/* Financial Concepts Video */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Financial Concepts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Video className="h-4 w-4 inline mr-2" />
                YouTube Video URL
              </label>
              <Input
                type="url"
                value={settings.finance_video_url}
                onChange={(e) => setSettings({ ...settings, finance_video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-slate-500 mt-1">
                This video will appear in the Financial Concepts modal on the Finances page
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">About App Settings</h4>
              <p className="text-sm text-blue-700 mt-1">
                Settings configured here are used throughout the application. The Financial Concepts video 
                link will be displayed to users when they click the "Financial Concepts" button on the Finances page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
