import { useState } from 'react'

function computeOkapiScore(kpis, topProducts, monthlySales) {
  const s = kpis || {}
  let growth = 0, stability = 0, diversification = 0, trend = 0

  // Growth (30 pts): based on revenueTrend
  if (s.revenueTrend >= 10) growth = 30
  else if (s.revenueTrend >= 0) growth = 15
  else growth = 0

  // Stability (20 pts): based on consecutive declines and volatility
  if (s.consecutiveDeclines === 0) stability = 20
  else if (s.consecutiveDeclines <= 1) stability = 10
  else stability = 0

  // Diversification (25 pts): based on top category concentration
  const topShare = s.topCategoryShare || 0
  if (topShare <= 60) diversification = 25
  else if (topShare <= 80) diversification = 12
  else diversification = 0

  // Trend (25 pts): based on latest MoM growth direction
  const latestMom = s.latestMomGrowth
  if (latestMom == null) {
    trend = 12
  } else if (latestMom >= 5) {
    trend = 25
  } else if (latestMom >= 0) {
    trend = 12
  } else {
    trend = 0
  }

  const total = growth + stability + diversification + trend

  return {
    total,
    growth: Math.round((growth / 30) * 100),
    stability: Math.round((stability / 20) * 100),
    diversification: Math.round((diversification / 25) * 100),
    trend: Math.round((trend / 25) * 100),
  }
}

function scoreColor(s) {
  if (s >= 91) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500', label: 'Excelente ✨', emoji: '✨' }
  if (s >= 76) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-500', label: 'Saludable', emoji: '🟢' }
  if (s >= 61) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-500', label: 'Estable', emoji: '🟡' }
  if (s >= 41) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500', label: 'En riesgo', emoji: '🟠' }
  return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-500', label: 'Crítico', emoji: '🔴' }
}

function subScoreEmoji(s) {
  if (s >= 76) return '✅'
  if (s >= 50) return '🟡'
  return '🔴'
}

const TOOLTIPS = {
  growth: 'Mide si tu métrica principal está creciendo. Calculado a partir de la tendencia general (primera mitad vs segunda mitad del período).',
  stability: 'Mide qué tan estable es tu negocio. Penaliza las caídas consecutivas de período a período.',
  diversification: 'Mide el riesgo de concentración. Si una sola categoría representa más del 80% del total, hay un riesgo alto.',
  trend: 'Mide la dirección más reciente del negocio basado en el crecimiento MoM del último período disponible.',
}

export default function OkapiScore({ kpis, topProducts, monthlySales }) {
  const [tooltip, setTooltip] = useState(null)
  const scores = computeOkapiScore(kpis, topProducts, monthlySales)
  const color = scoreColor(scores.total)

  const breakdown = [
    { key: 'growth', label: 'Crecimiento', value: scores.growth, weight: '30 pts' },
    { key: 'stability', label: 'Estabilidad', value: scores.stability, weight: '20 pts' },
    { key: 'diversification', label: 'Diversificación', value: scores.diversification, weight: '25 pts' },
    { key: 'trend', label: 'Tendencia', value: scores.trend, weight: '25 pts' },
  ]

  return (
    <div className="card bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Okapi Score</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Salud general del negocio</p>
        </div>
        <div className={`text-center px-4 py-2 rounded-2xl ring-2 ring-offset-2 ring-offset-white dark:ring-offset-navy-800 ${color.ring}`}>
          <p className={`text-3xl font-black ${color.text}`}>{scores.total}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">/100</p>
        </div>
      </div>

      <div className={`text-sm font-semibold mb-4 ${color.text}`}>{color.emoji} {color.label}</div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-white/[0.05] rounded-full h-2.5 mb-5">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${color.bg}`}
          style={{ width: `${scores.total}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {breakdown.map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-slate-400">{item.label}</span>
                <button
                  className="text-gray-300 dark:text-slate-600 hover:text-gray-500 relative"
                  onMouseEnter={() => setTooltip(item.key)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {tooltip === item.key && (
                    <div className="absolute left-4 top-0 z-20 w-56 p-2 text-xs bg-gray-900 text-white rounded-lg shadow-xl">
                      {TOOLTIPS[item.key]}
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-white/[0.05] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${scoreColor(item.value).bg}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 w-10 text-right">
              {subScoreEmoji(item.value)} {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
