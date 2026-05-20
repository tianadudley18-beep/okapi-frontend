import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'

export default function DataQualityBadge({ score = 0 }) {
  const good = score >= 80
  const ok = score >= 60

  const Icon = good ? ShieldCheck : ok ? Shield : ShieldAlert
  const color = good
    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
    : ok
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      Calidad de datos: {score}%
    </div>
  )
}
