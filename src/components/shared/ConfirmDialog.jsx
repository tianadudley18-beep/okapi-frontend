import { useEffect } from 'react'
import { AlertTriangle, X, Loader } from 'lucide-react'

export default function ConfirmDialog({ open = true, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true, loading = false }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel, loading])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="w-full max-w-sm card p-6 space-y-4 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-500/15' : 'bg-amber-50 dark:bg-amber-500/15'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <button onClick={() => !loading && onCancel?.()} className="btn-ghost p-1.5 -mt-0.5 -mr-0.5 ml-auto" disabled={loading}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-heading font-bold text-base text-gray-900 dark:text-slate-100">{title}</h3>
          {message && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{message}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70 ${danger ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' : ''}`}
          >
            {loading && <Loader className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
