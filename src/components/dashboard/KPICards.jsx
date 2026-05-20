import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart2, AlertTriangle, CreditCard, Activity, Hash, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatMetric, formatPercent } from '../../utils/formatters'

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!target || target === 0) { setValue(0); return }
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * ease))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
      else setValue(target)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return value
}

const ACCENT_GRADIENTS = [
  'linear-gradient(90deg,#4F7FFF,#8B5CF6)',
  'linear-gradient(90deg,#8B5CF6,#EC4899)',
  'linear-gradient(90deg,#10B981,#4F7FFF)',
  'linear-gradient(90deg,#F59E0B,#EF4444)',
  'linear-gradient(90deg,#06B6D4,#4F7FFF)',
  'linear-gradient(90deg,#EF4444,#F97316)',
]

function AnimatedMetric({ rawValue, formatted, isMonetary }) {
  const animated = useCountUp(typeof rawValue === 'number' ? Math.abs(rawValue) : 0)
  if (rawValue == null || typeof rawValue !== 'number') return <span>{formatted}</span>
  const ratio = rawValue !== 0 ? animated / Math.abs(rawValue) : 0
  const sign = rawValue < 0 ? '-' : ''
  const display = formatMetric(Math.abs(rawValue) * ratio, isMonetary)
  return <span>{sign}{display}</span>
}

function MetricCard({ title, value, rawValue, isMonetary, subtitle, trend, trendLabel, icon: Icon, iconBg, accentIdx }) {
  const isPositive = trend >= 0
  return (
    <div
      className="kpi-card"
      style={{ '--accent-gradient': ACCENT_GRADIENTS[accentIdx % ACCENT_GRADIENTS.length] }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
            {title}
          </p>
          <p className="text-2xl font-heading font-bold text-gray-900 dark:text-slate-100 truncate tabular-nums">
            {rawValue != null && typeof rawValue === 'number'
              ? <AnimatedMetric rawValue={rawValue} formatted={value} isMonetary={isMonetary} />
              : value
            }
          </p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg w-fit ${
          isPositive
            ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400'
            : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{formatPercent(Math.abs(trend))} {trendLabel}</span>
        </div>
      )}
    </div>
  )
}

export default function KPICards({ kpis, meta }) {
  const { t } = useTranslation()
  if (!kpis) return null

  const isMonetary = meta?.isMonetary ?? true
  const metricName = meta?.primaryMetricName || (isMonetary ? 'Revenue' : 'Value')
  const fmt = (v) => formatMetric(v, isMonetary)
  const primaryIcon = isMonetary ? DollarSign : (meta?.dataType === 'academic' ? Award : Hash)

  const cards = [
    {
      title: t('dashboard.kpis.totalMetric', { metric: metricName }),
      value: fmt(kpis.totalRevenue),
      rawValue: kpis.totalRevenue,
      subtitle: t('dashboard.kpis.transactions', { count: kpis.totalTransactions?.toLocaleString() }),
      trend: kpis.revenueTrend,
      trendLabel: t('dashboard.kpis.vsPrevPeriod'),
      icon: primaryIcon,
      iconBg: 'bg-electric-500',
    },
    {
      title: t('dashboard.kpis.avgMetric', { metric: metricName }),
      value: fmt(kpis.monthlyAverage),
      rawValue: kpis.monthlyAverage,
      subtitle: t('dashboard.kpis.perMonth'),
      icon: BarChart2,
      iconBg: 'bg-accent-500',
    },
    {
      title: t('dashboard.kpis.avgTransactionMetric', { metric: metricName }),
      value: fmt(kpis.avgTransactionValue || 0),
      rawValue: kpis.avgTransactionValue,
      subtitle: t('dashboard.kpis.perTransaction'),
      icon: CreditCard,
      iconBg: 'bg-indigo-500',
    },
    {
      title: t('dashboard.kpis.momGrowth'),
      value: kpis.latestMomGrowth !== null && kpis.latestMomGrowth !== undefined
        ? formatPercent(kpis.latestMomGrowth) : '—',
      rawValue: null,
      subtitle: t('dashboard.kpis.vsLastMonth'),
      trend: kpis.latestMomGrowth,
      trendLabel: '',
      icon: Activity,
      iconBg: kpis.latestMomGrowth >= 0 ? 'bg-emerald-500' : 'bg-orange-500',
    },
    {
      title: t('dashboard.kpis.bestMonth'),
      value: kpis.bestMonth?.month || '—',
      rawValue: null,
      subtitle: kpis.bestMonth ? fmt(kpis.bestMonth.revenue) : '',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500',
    },
    {
      title: t('dashboard.kpis.worstMonth'),
      value: kpis.worstMonth?.month || '—',
      rawValue: null,
      subtitle: kpis.worstMonth ? fmt(kpis.worstMonth.revenue) : '',
      icon: AlertTriangle,
      iconBg: 'bg-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <MetricCard key={card.title} {...card} isMonetary={isMonetary} accentIdx={i} />
      ))}
    </div>
  )
}
