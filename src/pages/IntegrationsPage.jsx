import { useState, useEffect } from 'react'
import { Link2, CheckCircle, AlertCircle, Circle, RefreshCw, X, Upload, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const INTEGRATIONS_META = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Conecta una hoja de cálculo y mantén tus datos siempre actualizados. Se sincroniza automáticamente cada 6 horas.',
    logo: '📊',
    color: '#22c55e',
    actionLabel: 'Conectar Google Sheets',
    fields: [{ key: 'sheetUrl', label: 'URL de la hoja', placeholder: 'https://docs.google.com/spreadsheets/d/...' }],
    endpoint: '/api/integrations/google-sheets',
    comingSoon: false,
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    description: 'Importa campañas, conjuntos de anuncios y métricas de rendimiento: gasto, ROAS, CPC, CTR y más.',
    logo: '📘',
    color: '#3b82f6',
    actionLabel: 'Conectar Meta Business',
    comingSoon: true,
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Sincroniza tus campañas de Google y compara rendimiento vs Meta lado a lado.',
    logo: '🔵',
    color: '#ef4444',
    actionLabel: 'Conectar Google Ads',
    comingSoon: true,
  },
  {
    id: 'csv_upload',
    name: 'CSV / Excel',
    description: 'Siempre disponible. Sube cualquier archivo de datos manualmente cuando lo necesites.',
    logo: '📁',
    color: '#8b5cf6',
    actionLabel: 'Subir archivo',
    isLink: '/upload',
  },
]

function StatusDot({ status }) {
  if (status === 'connected') return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Conectado" />
  if (status === 'error') return <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" title="Error de sincronización" />
  return <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 inline-block" title="No conectado" />
}

export default function IntegrationsPage() {
  const { session } = useAuth()
  const [connected, setConnected] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const headers = { Authorization: `Bearer ${session?.access_token}` }

  async function load() {
    try {
      const res = await fetch(`${API}/api/integrations`, { headers })
      const data = await res.json()
      setConnected(data.integrations || [])
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function connect(intg) {
    setConnecting(true)
    setError('')
    setSuccess('')
    try {
      const body = {}
      intg.fields?.forEach(f => { body[f.key] = formValues[f.key] || '' })

      const res = await fetch(`${API}${intg.endpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'not_configured') {
          setError('Esta integración requiere configuración en el servidor. Agrega GOOGLE_SHEETS_API_KEY al archivo .env del backend.')
        } else {
          setError(data.message || 'Error al conectar')
        }
        return
      }
      setSuccess(`"${data.title || intg.name}" conectado correctamente`)
      setActiveForm(null)
      setFormValues({})
      await load()
    } catch (err) {
      setError('No se pudo conectar. Verifica la URL e intenta de nuevo.')
    } finally {
      setConnecting(false)
    }
  }

  async function disconnect(id) {
    if (!window.confirm('¿Desconectar esta fuente?')) return
    try {
      await fetch(`${API}/api/integrations/${id}`, { method: 'DELETE', headers })
      await load()
    } catch { }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fuentes de datos</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Conecta tus herramientas para mantener los datos siempre actualizados en Okapi
        </p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS_META.map(intg => {
          const conn = connected.find(c => c.type === intg.id)
          const isConnected = !!conn
          const isFormOpen = activeForm === intg.id

          if (intg.isLink) {
            return (
              <div key={intg.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{intg.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{intg.name}</h3>
                        <StatusDot status="connected" />
                        <span className="text-xs text-green-500 font-medium">Disponible</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{intg.description}</p>
                <Link
                  to={intg.isLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-sm font-medium transition-colors"
                  // Using a regular anchor since Link might not be imported
                >
                  <Upload className="w-4 h-4" />
                  {intg.actionLabel}
                </Link>
              </div>
            )
          }

          return (
            <div key={intg.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{intg.logo}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{intg.name}</h3>
                      <StatusDot status={conn?.status || 'disconnected'} />
                      {isConnected && (
                        <span className="text-xs text-green-500 font-medium">Conectado</span>
                      )}
                      {intg.comingSoon && !isConnected && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-slate-500 font-medium">
                          Próximamente
                        </span>
                      )}
                    </div>
                    {isConnected && conn.last_synced_at && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                        Sync: {new Date(conn.last_synced_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
                {isConnected && (
                  <button
                    onClick={() => disconnect(conn.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    title="Desconectar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{intg.description}</p>

              {/* Connection form */}
              {isFormOpen && intg.fields && (
                <div className="mb-4 space-y-3">
                  {intg.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={formValues[field.key] || ''}
                        onChange={e => setFormValues(v => ({ ...v, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/[0.12] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-electric-500/40 focus:border-electric-500"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveForm(null); setError('') }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/[0.12] rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => connect(intg)}
                      disabled={connecting}
                      className="flex-1 px-3 py-2 text-sm bg-electric-500 hover:bg-electric-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      {connecting ? 'Conectando…' : 'Conectar'}
                    </button>
                  </div>
                </div>
              )}

              {!isConnected && !intg.comingSoon && !isFormOpen && (
                <button
                  onClick={() => { setActiveForm(intg.id); setError('') }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  {intg.actionLabel}
                </button>
              )}

              {intg.comingSoon && !isConnected && (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              )}

              {isConnected && (
                <button
                  onClick={load}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/[0.12] text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-xl text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar ahora
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
