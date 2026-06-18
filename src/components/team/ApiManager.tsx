import { useState, useCallback } from 'react'
import { Plus, Trash2, Play, Copy, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  description: string
  headers: { key: string; value: string }[]
  body: string
}

interface ApiTestResult {
  status: number
  statusText: string
  body: string
  time: number
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
}

const INITIAL_ENDPOINTS: ApiEndpoint[] = [
  {
    id: '1',
    method: 'GET',
    url: '/api/narrative/generate',
    description: 'Generate audit narrative from findings',
    headers: [{ key: 'Authorization', value: 'Bearer {token}' }],
    body: '',
  },
  {
    id: '2',
    method: 'POST',
    url: '/api/sampling/preview',
    description: 'Get AI sampling preview for control points',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: '{\n  "controlIds": ["CTRL-002", "CTRL-004"],\n  "confidence": 95\n}',
  },
  {
    id: '3',
    method: 'GET',
    url: '/api/pbc/list',
    description: 'Retrieve PBC request list with status',
    headers: [],
    body: '',
  },
  {
    id: '4',
    method: 'PUT',
    url: '/api/impact/run',
    description: 'Trigger impact simulation for a change event',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: '{\n  "eventType": "org_change",\n  "severity": "medium"\n}',
  },
]

export default function ApiManager() {
  const { t } = useTranslation()
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(INITIAL_ENDPOINTS)
  const [editOpen, setEditOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpoint | null>(null)
  const [testResult, setTestResult] = useState<Record<string, ApiTestResult | null>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  const openAdd = () => {
    setEditingEndpoint({
      id: String(Date.now()),
      method: 'GET',
      url: '',
      description: '',
      headers: [],
      body: '',
    })
    setEditOpen(true)
  }

  const openEdit = (ep: ApiEndpoint) => {
    setEditingEndpoint({ ...ep, headers: [...ep.headers] })
    setEditOpen(true)
  }

  const handleSave = () => {
    if (!editingEndpoint) return
    setEndpoints((prev) => {
      const idx = prev.findIndex((e) => e.id === editingEndpoint.id)
      if (idx >= 0) {
        return prev.map((e) => (e.id === editingEndpoint.id ? editingEndpoint : e))
      }
      return [...prev, editingEndpoint]
    })
    setEditOpen(false)
    setEditingEndpoint(null)
  }

  const handleDelete = (id: string) => {
    setEndpoints((prev) => prev.filter((e) => e.id !== id))
  }

  const handleTest = useCallback(async (ep: ApiEndpoint) => {
    setTesting((prev) => ({ ...prev, [ep.id]: true }))
    setTestResult((prev) => ({ ...prev, [ep.id]: null }))

    // Simulate API call with 800ms delay
    await new Promise((r) => setTimeout(r, 800))

    const success = Math.random() > 0.2
    const result: ApiTestResult = success
      ? {
          status: 200,
          statusText: 'OK',
          body: JSON.stringify({ success: true, data: { message: 'Mock response — endpoint simulation successful', timestamp: new Date().toISOString() } }, null, 2),
          time: Math.round(Math.random() * 300 + 100),
        }
      : {
          status: 500,
          statusText: 'Internal Server Error',
          body: JSON.stringify({ success: false, error: 'Mock error — simulated server error response', timestamp: new Date().toISOString() }, null, 2),
          time: Math.round(Math.random() * 500 + 200),
        }

    setTestResult((prev) => ({ ...prev, [ep.id]: result }))
    setTesting((prev) => ({ ...prev, [ep.id]: false }))
  }, [])

  const copyResponse = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">{t('team.api.endpoints')}</CardTitle>
          <button
            onClick={openAdd}
            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-interactive transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('team.api.addEndpoint')}
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {endpoints.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              {t('team.api.noEndpoints')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-500 text-xs w-24">
                      {t('team.api.method')}
                    </th>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-500 text-xs">
                      {t('team.api.url')}
                    </th>
                    <th className="text-left py-2.5 px-4 font-semibold text-gray-500 text-xs">
                      {t('team.api.description')}
                    </th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-500 text-xs w-28">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((ep) => (
                    <tr key={ep.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className={`text-[10px] font-bold ${METHOD_COLORS[ep.method]}`}>
                          {ep.method}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-700">{ep.url}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{ep.description}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTest(ep)}
                            disabled={testing[ep.id]}
                            className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                            title={t('team.api.test')}
                          >
                            {testing[ep.id] ? (
                              <Clock className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(ep)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(ep.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.entries(testResult).map(([id, result]) =>
        result ? (
          <Card key={`result-${id}`} className="border-l-4 border-l-brand-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{t('team.api.response')}</CardTitle>
                  <Badge variant={result.status < 400 ? 'success' : 'danger'}>
                    {result.status} {result.statusText}
                  </Badge>
                  <span className="text-[11px] text-gray-400">{result.time}ms</span>
                </div>
                <button
                  onClick={() => copyResponse(result.body)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {t('team.api.copyResponse')}
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-b-card overflow-x-auto max-h-48 font-mono">
                {result.body}
              </pre>
            </CardContent>
          </Card>
        ) : null
      )}

      {/* Add/Edit Modal */}
      {editOpen && editingEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-[480px] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                {editingEndpoint.url ? t('team.api.editEndpoint') : t('team.api.addEndpoint')}
              </h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Method */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('team.api.method')}</label>
                <select
                  value={editingEndpoint.method}
                  onChange={(e) => setEditingEndpoint((prev) => prev ? { ...prev, method: e.target.value as ApiEndpoint['method'] } : prev)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* URL */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('team.api.url')}</label>
                <input
                  type="text"
                  value={editingEndpoint.url}
                  onChange={(e) => setEditingEndpoint((prev) => prev ? { ...prev, url: e.target.value } : prev)}
                  placeholder="/api/endpoint"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('team.api.description')}</label>
                <input
                  type="text"
                  value={editingEndpoint.description}
                  onChange={(e) => setEditingEndpoint((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                  placeholder="Endpoint description"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
                />
              </div>

              {/* Headers */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('team.api.headers')}</label>
                <div className="space-y-1.5">
                  {editingEndpoint.headers.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={h.key}
                        onChange={(e) => {
                          const headers = [...editingEndpoint.headers]
                          headers[i] = { ...headers[i], key: e.target.value }
                          setEditingEndpoint((prev) => prev ? { ...prev, headers } : prev)
                        }}
                        placeholder="Key"
                        className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-interactive/30"
                      />
                      <input
                        type="text"
                        value={h.value}
                        onChange={(e) => {
                          const headers = [...editingEndpoint.headers]
                          headers[i] = { ...headers[i], value: e.target.value }
                          setEditingEndpoint((prev) => prev ? { ...prev, headers } : prev)
                        }}
                        placeholder="Value"
                        className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-interactive/30"
                      />
                      <button
                        onClick={() => {
                          setEditingEndpoint((prev) => prev ? { ...prev, headers: prev.headers.filter((_, j) => j !== i) } : prev)
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setEditingEndpoint((prev) =>
                        prev ? { ...prev, headers: [...prev.headers, { key: '', value: '' }] } : prev
                      )
                    }
                    className="text-[11px] text-brand-primary hover:text-brand-interactive flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {t('team.api.addEndpoint')}
                  </button>
                </div>
              </div>

              {/* Body (only for POST/PUT) */}
              {(editingEndpoint.method === 'POST' || editingEndpoint.method === 'PUT') && (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('team.api.body')}</label>
                  <textarea
                    value={editingEndpoint.body}
                    onChange={(e) => setEditingEndpoint((prev) => prev ? { ...prev, body: e.target.value } : prev)}
                    rows={5}
                    placeholder='{"key": "value"}'
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-3 flex gap-2 justify-end">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('team.api.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-medium text-white bg-brand-primary hover:bg-brand-interactive rounded-lg transition-colors"
              >
                {t('team.api.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
