import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatMetric, formatPercent } from '../../utils/formatters'

function buildSummaryText(kpis, topProducts, topLabel, meta, t) {
  const { totalRevenue, totalTransactions, revenueTrend, monthlyAverage, bestMonth } = kpis
  const isMonetary = meta?.isMonetary ?? true
  const metricName = meta?.primaryMetricName || (isMonetary ? 'Revenue' : 'Value')
  const fmt = v => formatMetric(v, isMonetary)

  const isPositive = revenueTrend >= 0
  const trendWord = revenueTrend >= 5
    ? t('dashboard.executive.trendStrong')
    : revenueTrend >= 0
    ? t('dashboard.executive.trendStable')
    : revenueTrend >= -10
    ? t('dashboard.executive.trendModerate')
    : t('dashboard.executive.trendSignificant')

  const topCat = topProducts?.[0]?.name || 'N/A'
  const topCatShare = topProducts?.[0]?.share?.toFixed(1) || '0'
  const key = isPositive ? 'dashboard.executive.summaryPositive' : 'dashboard.executive.summaryNegative'

  return t(key, {
    revenue: fmt(totalRevenue),
    transactions: totalTransactions.toLocaleString(),
    trendWord,
    trend: formatPercent(Math.abs(revenueTrend)),
    monthly: fmt(monthlyAverage),
    bestMonth: bestMonth?.month || 'N/A',
    topLabel: (topLabel || metricName).toLowerCase(),
    topCat,
    topCatShare,
  })
}

function buildAlerts(kpis, t) {
  const alerts = []
  const { revenueTrend, consecutiveDeclines, topCategoryShare, latestMomGrowth } = kpis

  if (consecutiveDeclines >= 3) {
    alerts.push({ level: 'red', text: t('dashboard.executive.alertConsecutiveHigh', { count: consecutiveDeclines }) })
  } else if (consecutiveDeclines >= 2) {
    alerts.push({ level: 'yellow', text: t('dashboard.executive.alertConsecutiveMid') })
  }
  if (revenueTrend <= -15) {
    alerts.push({ level: 'red', text: t('dashboard.executive.alertRevenueTrend', { pct: Math.abs(revenueTrend).toFixed(1) }) })
  }
  if (topCategoryShare > 60) {
    alerts.push({ level: 'yellow', text: t('dashboard.executive.alertConcentration', { pct: topCategoryShare.toFixed(1) }) })
  }
  if (latestMomGrowth !== null && latestMomGrowth < -20) {
    alerts.push({ level: 'red', text: t('dashboard.executive.alertMomSharp', { pct: latestMomGrowth.toFixed(1) }) })
  }
  return alerts
}

function buildHighlights(kpis, monthlySales, meta, t) {
  const highlights = []
  const { revenueTrend, bestMonth, latestMomGrowth, totalTransactions } = kpis
  const isMonetary = meta?.isMonetary ?? true
  const fmt = v => formatMetric(v, isMonetary)

  if (revenueTrend >= 10) {
    highlights.push(t('dashboard.executive.highlightStrongTrend', { pct: formatPercent(revenueTrend) }))
  } else if (revenueTrend >= 0) {
    highlights.push(t('dashboard.executive.highlightPositiveTrend', { pct: formatPercent(revenueTrend) }))
  }
  if (bestMonth) {
    highlights.push(t('dashboard.executive.highlightBestMonth', { month: bestMonth.month, revenue: fmt(bestMonth.revenue) }))
  }
  if (latestMomGrowth !== null && latestMomGrowth >= 10) {
    highlights.push(t('dashboard.executive.highlightMomGrowth', { pct: formatPercent(latestMomGrowth) }))
  }
  if (totalTransactions > 100) {
    highlights.push(t('dashboard.executive.highlightVolume', { count: totalTransactions.toLocaleString() }))
  }
  return highlights
}

export default function ExecutiveSummary({ kpis, monthlySales, topProducts, topLabel, meta }) {
  const { t, i18n } = useTranslation()
  if (!kpis) return null

  const summaryText = buildSummaryText(kpis, topProducts, topLabel, meta, t)
  const alerts = buildAlerts(kpis, t)
  const highlights = buildHighlights(kpis, monthlySales, meta, t)
  const today = new Date().toLocaleDateString(i18n.language.startsWith('es') ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="card border border-gray-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 rounded-lg p-1.5">
            <Info className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{t('dashboard.executive.title')}</h2>
            {meta?.dataLabel && (
              <span className="text-xs text-primary-600 font-medium">{meta.dataLabel}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">{t('dashboard.executive.generatedOn', { date: today })}</span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-5">{summaryText}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">{t('dashboard.executive.alerts')}</span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-red-400">{t('dashboard.executive.noAlerts')}</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs ${a.level === 'yellow' ? 'text-yellow-700' : 'text-red-700'}`}>
                  <TrendingDown className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${a.level === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`} />
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{t('dashboard.executive.highlights')}</span>
          </div>
          {highlights.length === 0 ? (
            <p className="text-xs text-green-400">{t('dashboard.executive.noHighlights')}</p>
          ) : (
            <ul className="space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                  <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Additional metrics row */}
      {meta?.additionalMetrics?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
          {meta.additionalMetrics.map(m => (
            <div key={m.key} className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{m.label}</p>
              <p className="text-sm font-bold text-gray-800">
                {m.format === 'currency' ? formatMetric(m.value, true) : m.value?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
