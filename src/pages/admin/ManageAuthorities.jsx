import { useState, useEffect } from 'react'
import { Building2, Search, Edit2, Save, X, ExternalLink, Loader2, Plus, Trash2, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function ManageAuthorities() {
  const [authorities, setAuthorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAuthority, setNewAuthority] = useState({
    country_code: '',
    country_name: '',
    authority_name: '',
    authority_website: ''
  })
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetchAuthorities()
  }, [])

  const fetchAuthorities = async () => {
    try {
      const { data, error } = await supabase
        .from('country_authorities')
        .select('*')
        .order('country_name', { ascending: true })

      if (error) throw error
      setAuthorities(data || [])
    } catch (error) {
      console.error('Error fetching authorities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAuthorities = authorities.filter(auth =>
    auth.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auth.authority_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auth.country_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const startEdit = (authority) => {
    setEditingId(authority.id)
    setEditData({
      authority_name: authority.authority_name,
      authority_website: authority.authority_website || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('country_authorities')
        .update({
          authority_name: editData.authority_name,
          authority_website: editData.authority_website || null
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setAuthorities(prev => prev.map(auth =>
        auth.id === id
          ? { ...auth, ...editData }
          : auth
      ))
      setEditingId(null)
      setEditData({})
    } catch (error) {
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddAuthority = async () => {
    setAddError('')
    
    // Validation
    if (!newAuthority.country_code || !newAuthority.country_name || !newAuthority.authority_name) {
      setAddError('Country code, name, and authority name are required')
      return
    }

    if (newAuthority.country_code.length !== 2) {
      setAddError('Country code must be exactly 2 characters (e.g., US, GB, ZW)')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('country_authorities')
        .insert({
          country_code: newAuthority.country_code.toUpperCase(),
          country_name: newAuthority.country_name,
          authority_name: newAuthority.authority_name,
          authority_website: newAuthority.authority_website || null
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          setAddError('A country with this code already exists')
        } else {
          throw error
        }
        return
      }

      setAuthorities(prev => [...prev, data].sort((a, b) => 
        a.country_name.localeCompare(b.country_name)
      ))
      setShowAddModal(false)
      setNewAuthority({
        country_code: '',
        country_name: '',
        authority_name: '',
        authority_website: ''
      })
    } catch (error) {
      setAddError('Failed to add: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAuthority = async (id, countryName) => {
    if (!confirm(`Are you sure you want to delete the authority for ${countryName}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('country_authorities')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAuthorities(prev => prev.filter(auth => auth.id !== id))
    } catch (error) {
      alert('Failed to delete: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manage Country Authorities
        </h1>
        <p className="text-slate-600">
          Manage business registration authorities for each country. These appear in the Licenses & Registration step.
        </p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by country or authority name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Country
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{authorities.length}</p>
                <p className="text-sm text-slate-600">Total Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <ExternalLink className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {authorities.filter(a => a.authority_website).length}
                </p>
                <p className="text-sm text-slate-600">With Websites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {authorities.filter(a => !a.authority_website).length}
                </p>
                <p className="text-sm text-slate-600">Missing Websites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authorities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Authority Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAuthorities.map((authority) => (
                  <tr key={authority.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-sm">
                        {authority.country_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{authority.country_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === authority.id ? (
                        <input
                          type="text"
                          value={editData.authority_name}
                          onChange={(e) => setEditData({ ...editData, authority_name: e.target.value })}
                          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-slate-700">{authority.authority_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === authority.id ? (
                        <input
                          type="url"
                          value={editData.authority_website}
                          onChange={(e) => setEditData({ ...editData, authority_website: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : authority.authority_website ? (
                        <a
                          href={authority.authority_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <span className="truncate max-w-[200px]">{authority.authority_website}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No website</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === authority.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(authority.id)}
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(authority)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAuthority(authority.id, authority.country_name)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAuthorities.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm ? 'No countries match your search' : 'No country authorities found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Country Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Add Country Authority</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddError('')
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country Code *
                </label>
                <input
                  type="text"
                  value={newAuthority.country_code}
                  onChange={(e) => setNewAuthority({ ...newAuthority, country_code: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="e.g., US, GB, ZW"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <p className="text-xs text-slate-500 mt-1">2-letter ISO country code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country Name *
                </label>
                <input
                  type="text"
                  value={newAuthority.country_name}
                  onChange={(e) => setNewAuthority({ ...newAuthority, country_name: e.target.value })}
                  placeholder="e.g., United States"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Authority Name *
                </label>
                <input
                  type="text"
                  value={newAuthority.authority_name}
                  onChange={(e) => setNewAuthority({ ...newAuthority, authority_name: e.target.value })}
                  placeholder="e.g., Companies House"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={newAuthority.authority_website}
                  onChange={(e) => setNewAuthority({ ...newAuthority, authority_website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setAddError('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAuthority} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Country
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
