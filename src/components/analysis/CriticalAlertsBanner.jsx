import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export default function CriticalAlertsBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState(false)
  if (!alerts.length || dismissed) return null

  return (
    <div className="bg-red-600 dark:bg-red-700 rounded-xl px-5 py-4 flex items-start gap-3 shadow-lg shadow-red-500/20">
      <div className="bg-red-500 rounded-lg p-1.5 flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white mb-1">Alertas críticas detectadas</p>
        <ul className="space-y-0.5">
          {alerts.map((alert, i) => (
            <li key={i} className="text-xs text-red-100 flex items-start gap-1.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-red-300 flex-shrink-0" />
              {alert}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-200 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
