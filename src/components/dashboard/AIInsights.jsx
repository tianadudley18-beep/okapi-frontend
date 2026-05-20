import { Lightbulb, AlertTriangle, TrendingUp, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatMetric, formatPercent } from '../../utils/formatters'

function generateRecommendations(kpis, topProducts, topLabel, meta, t) {
  const recs = []
  const { revenueTrend, topCategoryShare, consecutiveDeclines, avgTransactionValue, monthlyAverage } = kpis
  const isMonetary = meta?.isMonetary ?? true
  const label = topLabel || meta?.categoryLabel || 'item'
  const fmt = v => formatMetric(v, isMonetary)

  if (topCategoryShare > 50) {
    recs.push(t('dashboard.insights.recDiversify', { label: label.toLowerCase(), pct: topCategoryShare.toFixed(1) }))
  }
  if (revenueTrend < 0) {
    recs.push(t('dashboard.insights.recRecovery'))
  } else if (revenueTrend < 10) {
    recs.push(t('dashboard.insights.recUpsell', { value: fmt(avgTransactionValue) }))
  }
  if (consecutiveDeclines >= 2) {
    recs.push(t('dashboard.insights.recDeclineAnalysis', { count: consecutiveDeclines }))
  } else if (revenueTrend > 10) {
    recs.push(t('dashboard.insights.recScaleUp'))
  }
  if (recs.length < 3) {
    recs.push(t('dashboard.insights.recBenchmark', { value: fmt(monthlyAverage) }))
  }
  return recs.slice(0, 3)
}

function generateRisks(kpis, t) {
  const risks = []
  const { consecutiveDeclines, revenueTrend, topCategoryShare, latestMomGrowth } = kpis

  if (consecutiveDeclines >= 2) {
    risks.push(t('dashboard.insights.riskStructural', { count: consecutiveDeclines }))
  }
  if (topCategoryShare > 70) {
    risks.push(t('dashboard.insights.riskConcentration', { pct: topCategoryShare.toFixed(1) }))
  }
  if (revenueTrend < -20) {
    risks.push(t('dashboard.insights.riskSharpDecline', { pct: formatPercent(revenueTrend) }))
  }
  if (latestMomGrowth !== null && latestMomGrowth < -15) {
    risks.push(t('dashboard.insights.riskMomContraction', { pct: formatPercent(latestMomGrowth) }))
  }
  return risks
}

function generateOpportunities(kpis, topProducts, meta, t) {
  const opps = []
  const { revenueTrend, bestMonth, latestMomGrowth } = kpis
  const isMonetary = meta?.isMonetary ?? true
  const fmt = v => formatMetric(v, isMonetary)

  if (revenueTrend > 5) {
    opps.push(t('dashboard.insights.oppScale', { pct: formatPercent(revenueTrend) }))
  }
  if (bestMonth) {
    opps.push(t('dashboard.insights.oppReplicate', { month: bestMonth.month, revenue: fmt(bestMonth.revenue) }))
  }
  if (latestMomGrowth !== null && latestMomGrowth > 5) {
    opps.push(t('dashboard.insights.oppDemand', { pct: formatPercent(latestMomGrowth) }))
  }
  if (topProducts?.length >= 3) {
    opps.push(t('dashboard.insights.oppTopPerformers'))
  }
  return opps.slice(0, 3)
}

export default function AIInsights({ kpis, topProducts, topLabel, meta }) {
  const { t } = useTranslation()
  if (!kpis) return null

  const recommendations = generateRecommendations(kpis, topProducts, topLabel, meta, t)
  const risks = generateRisks(kpis, t)
  const opportunities = generateOpportunities(kpis, topProducts, meta, t)

  const Section = ({ icon: Icon, title, items, iconColor, bgColor, textColor, emptyKey }) => (
    <div className={`${bgColor} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={`text-sm font-semibold ${textColor}`}>{title}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">{t(emptyKey)}</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-xs">
              <span className={`w-5 h-5 rounded-full bg-current/15 flex items-center justify-center font-bold flex-shrink-0 text-xs ${textColor}`}>
                {i + 1}
              </span>
              <span className={`${textColor} leading-relaxed`}>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )

  return (
    <div className="card border border-gray-200 dark:border-navy-700">
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-accent-100 dark:bg-electric-500/20 rounded-lg p-1.5">
          <Lightbulb className="w-4 h-4 text-accent-600 dark:text-electric-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t('dashboard.insights.title')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section
          icon={Target}
          title={t('dashboard.insights.recommendations')}
          items={recommendations}
          iconColor="text-primary-600 dark:text-primary-400"
          bgColor="bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800/40"
          textColor="text-primary-900 dark:text-primary-200"
          emptyKey="dashboard.insights.noData"
        />
        <Section
          icon={AlertTriangle}
          title={t('dashboard.insights.risks')}
          items={risks}
          iconColor="text-red-500 dark:text-red-400"
          bgColor="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/40"
          textColor="text-red-800 dark:text-red-200"
          emptyKey="dashboard.executive.noAlerts"
        />
        <Section
          icon={TrendingUp}
          title={t('dashboard.insights.opportunities')}
          items={opportunities}
          iconColor="text-green-600 dark:text-green-400"
          bgColor="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/40"
          textColor="text-green-800 dark:text-green-200"
          emptyKey="dashboard.executive.noHighlights"
        />
      </div>
    </div>
  )
}
