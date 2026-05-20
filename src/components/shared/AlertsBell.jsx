import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, AlertTriangle, TrendingDown, TrendingUp, Zap, CheckCheck, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
  high:     { color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-500' },
  medium:   { color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' },
  low:      { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
}

const TYPE_ICON = {
  consecutive_decline: TrendingDown,
  sharp_decline:       TrendingDown,
  concentration_risk:  AlertTriangle,
  sudden_spike:        TrendingUp,
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export default function AlertsBell() {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const headers = { Authorization: `Bearer ${session?.access_token}` }

  const loadUnread = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch(`${API}/api/alerts/unread-count`, { headers })
      const data = await res.json()
      setUnread(data.count || 0)
    } catch { /* silent */ }
  }, [session?.access_token])

  const loadAlerts = useCallback(async () => {
    if (!session?.access_token) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/alerts?limit=20`, { headers })
      const data = await res.json()
      setAlerts(data.alerts || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [session?.access_token])

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 60_000)
    return () => clearInterval(interval)
  }, [loadUnread])

  useEffect(() => {
    if (open) loadAlerts()
  }, [open, loadAlerts])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markAllRead() {
    try {
      await fetch(`${API}/api/alerts/read-all`, { method: 'PUT', headers })
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      setUnread(0)
    } catch { /* silent */ }
  }

  async function markOneRead(id) {
    try {
      await fetch(`${API}/api/alerts/${id}/read`, { method: 'PUT', headers })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 dark:border-white/[0.12] dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-slate-100"
        title="Alertas"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white dark:bg-navy-900 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Alertas</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-electric-500 hover:text-electric-600 dark:text-electric-400 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todo
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-500">Sin alertas por ahora</p>
                <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Te avisaremos cuando detectemos algo importante</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {alerts.map(alert => {
                  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium
                  const Icon = TYPE_ICON[alert.type] || Zap
                  return (
                    <li
                      key={alert.id}
                      className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors ${!alert.is_read ? 'bg-gray-50/60 dark:bg-white/[0.02]' : ''}`}
                    >
                      {!alert.is_read && (
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      )}
                      <div className="flex gap-3 items-start pl-2">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center ${cfg.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 dark:text-slate-300 leading-snug">{alert.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-0.5">{timeAgo(alert.triggered_at)}</p>
                        </div>
                        {!alert.is_read && (
                          <button
                            onClick={() => markOneRead(alert.id)}
                            className="flex-shrink-0 text-gray-300 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
                            title="Marcar como leído"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
