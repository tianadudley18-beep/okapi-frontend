import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, PlusCircle } from 'lucide-react'

const fmt = (n) => {
  if (n == null) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
}

function getVerdict(kpis, monthlySales) {
  const trend = kpis?.revenueTrend ?? 0
  const declines = kpis?.consecutiveDeclines ?? 0
  const total = kpis?.totalRevenue ?? 0
  const latestMom = kpis?.latestMomGrowth

  // Detect strong positive
  if (trend > 10 && declines === 0) {
    return {
      type: 'winning',
      icon: TrendingUp,
      color: 'green',
      badge: '🟢 CRECIENDO',
      title: `Tu negocio crece ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% en el período`,
      sub: `Ingreso total analizado: ${fmt(total)} · Tendencia positiva sostenida`,
      detail: null,
    }
  }

  // Detect critical decline (3+ consecutive)
  if (declines >= 3) {
    const periodsToZero = Math.round(total / (Math.abs(trend / 100) * (total / monthlySales.length || 1)))
    return {
      type: 'losing',
      icon: TrendingDown,
      color: 'red',
      badge: '🔴 TENDENCIA CRÍTICA',
      title: `${declines} períodos consecutivos en caída`,
      sub: `Total analizado: ${fmt(total)} · Tendencia: ${trend.toFixed(1)}%`,
      detail: `Si esta tendencia continúa, los ingresos seguirán cayendo. Revisá precios, mix de productos y costos.`,
    }
  }

  // Detect negative trend
  if (trend < -5) {
    const needsGrowth = Math.abs(trend).toFixed(1)
    return {
      type: 'negative',
      icon: AlertTriangle,
      color: 'orange',
      badge: '🟠 TENDENCIA NEGATIVA',
      title: `Ingresos cayeron ${trend.toFixed(1)}% en el período analizado`,
      sub: `Total: ${fmt(total)} · Último mes: ${latestMom != null ? `${latestMom >= 0 ? '+' : ''}${latestMom.toFixed(1)}%` : 'N/D'}`,
      detail: `Para revertir la tendencia necesitás crecer al menos ${needsGrowth}% adicional. Revisá la sección de recomendaciones.`,
    }
  }

  // Stable / positive
  if (trend >= 0) {
    return {
      type: 'stable',
      icon: TrendingUp,
      color: 'blue',
      badge: '🔵 ESTABLE',
      title: `Ingresos estables con tendencia ${trend > 0 ? `+${trend.toFixed(1)}%` : 'plana'}`,
      sub: `Total analizado: ${fmt(total)}`,
      detail: `El negocio es estable. Para crecer más rápido revisá la sección "Tu plan de crecimiento".`,
    }
  }

  return {
    type: 'unknown',
    icon: DollarSign,
    color: 'gray',
    badge: '🟡 INGRESOS REGISTRADOS',
    title: `${fmt(total)} en ingresos analizados`,
    sub: 'Insuficientes períodos para calcular tendencia completa',
    detail: null,
  }
}

const COLORS = {
  green:  { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-700/40',  text: 'text-green-700 dark:text-green-300',  icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-700/40',      text: 'text-red-700 dark:text-red-300',      icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20',border: 'border-orange-200 dark:border-orange-700/40',text: 'text-orange-700 dark:text-orange-300', icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-700/40',    text: 'text-blue-700 dark:text-blue-300',    icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  gray:   { bg: 'bg-gray-50 dark:bg-white/[0.03]',   border: 'border-gray-200 dark:border-white/[0.08]',   text: 'text-gray-700 dark:text-gray-300',    icon: 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400' },
}

export default function ProfitLossDetector({ kpis, monthlySales = [] }) {
  const verdict = getVerdict(kpis, monthlySales)
  const c = COLORS[verdict.color]
  const Icon = verdict.icon

  // Break-even: show if we have enough periods
  const avg = kpis?.monthlyAverage
  const hasPeriods = monthlySales.length >= 3

  return (
    <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center text-[11px] font-bold tracking-wider mb-2 ${c.text}`}>
            {verdict.badge}
          </div>
          <h3 className={`text-base font-bold mb-1 text-gray-900 dark:text-white`}>{verdict.title}</h3>
          <p className={`text-sm ${c.text}`}>{verdict.sub}</p>
          {verdict.detail && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{verdict.detail}</p>
          )}
        </div>

        {/* Quick stats */}
        {hasPeriods && (
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Promedio mensual</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(avg)}</p>
            </div>
            {kpis?.bestMonth && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-slate-500">Mejor período</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{kpis.bestMonth.month}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breakdown bar: best vs worst visual */}
      {kpis?.bestMonth && kpis?.worstMonth && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10 grid grid-cols-2 gap-3">
          <div className="bg-white/50 dark:bg-white/[0.04] rounded-xl px-3 py-2">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-0.5">Mejor período 🏆</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(kpis.bestMonth.revenue)}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">{kpis.bestMonth.month}</p>
          </div>
          <div className="bg-white/50 dark:bg-white/[0.04] rounded-xl px-3 py-2">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-0.5">Período más bajo</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(kpis.worstMonth.revenue)}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">{kpis.worstMonth.month}</p>
          </div>
        </div>
      )}

      {/* Break-even note if monthly data available */}
      {hasPeriods && avg > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Punto de equilibrio estimado: necesitás mantener ingresos ≥ {fmt(avg * 0.9)}/mes (−10% del promedio actual) para no retroceder.</span>
        </div>
      )}
    </div>
  )
}
