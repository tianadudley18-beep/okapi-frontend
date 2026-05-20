import { useState } from 'react'
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

const fmt = (n) => {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
}

function detectWins(kpis, topProducts = [], monthlySales = [], analysis) {
  const wins = []
  const trend = kpis?.revenueTrend ?? 0
  const topCats = analysis?.layer1_whatHappened?.topCategories || []

  if (trend > 5 && monthlySales.length >= 2) {
    const last = monthlySales[monthlySales.length - 1]?.revenue || 0
    const first = monthlySales[0]?.revenue || 0
    if (last > first) {
      wins.push({
        title: `Crecimiento sostenido del ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`,
        detail: `Pasaste de ${fmt(first)} a ${fmt(last)} en el período analizado. El negocio está en trayectoria positiva.`,
        impact: 'high',
      })
    }
  }

  // Best category
  const bestCat = topCats[0] || topProducts[0]
  if (bestCat) {
    const catName = bestCat.name
    const catPct = bestCat.percentage?.toFixed(1) || bestCat.share?.toFixed(1)
    wins.push({
      title: `"${catName}" es tu motor principal`,
      detail: `Representa el ${catPct}% de tu total. Es tu mayor palanca de crecimiento — invertí en mantenerlo y escalarlo.`,
      impact: catPct > 50 ? 'medium' : 'high',
    })
  }

  // Best month far above average
  const avg = kpis?.monthlyAverage
  const best = kpis?.bestMonth
  if (best && avg && best.revenue > avg * 1.3) {
    wins.push({
      title: `${best.month} fue un mes excepcional (+${(((best.revenue - avg) / avg) * 100).toFixed(0)}% del promedio)`,
      detail: `Revisá qué pasó ese mes: ¿hubo una campaña, un cliente grande, una temporada? Podés reproducirlo.`,
      impact: 'medium',
    })
  }

  if (wins.length === 0) {
    wins.push({
      title: 'Datos cargados y listos para análisis',
      detail: 'Subí más períodos para detectar patrones de crecimiento específicos.',
      impact: 'low',
    })
  }

  return wins
}

function detectLeaks(kpis, topProducts = [], monthlySales = [], analysis) {
  const leaks = []
  const declines = kpis?.consecutiveDeclines ?? 0
  const topShare = kpis?.topCategoryShare ?? 0
  const trend = kpis?.revenueTrend ?? 0
  const concentrationRisks = analysis?.layer2_whyItHappened?.concentrationRisks || []

  if (declines >= 2) {
    leaks.push({
      title: `${declines} períodos consecutivos en caída`,
      detail: `Es una señal de alerta. Revisá precios, mix de clientes y factores externos que puedan explicarlo.`,
      severity: 'high',
    })
  }

  if (topShare > 70) {
    leaks.push({
      title: `Alta concentración: ${topShare.toFixed(0)}% del negocio en una sola categoría`,
      detail: `Si esa categoría cae, el negocio entero sufre. Diversificar el mix podría reducir el riesgo significativamente.`,
      severity: topShare > 85 ? 'high' : 'medium',
    })
  }

  if (trend < -10) {
    const periods = monthlySales.length
    leaks.push({
      title: `Tendencia negativa del ${trend.toFixed(1)}% en ${periods} períodos`,
      detail: `Los ingresos cayeron ${Math.abs(trend).toFixed(1)}% en el período analizado. Necesitás identificar la causa raíz antes de actuar.`,
      severity: 'high',
    })
  }

  concentrationRisks.slice(0, 1).forEach(r => {
    if (!leaks.some(l => l.title.includes('concentración'))) {
      leaks.push({
        title: `Dependencia de "${r.name}" (${r.percentage?.toFixed(0)}% del ${r.type || 'total'})`,
        detail: `Si "${r.name}" reduce o cancela, el impacto es inmediato. Considerá mitigar esta dependencia.`,
        severity: r.percentage > 60 ? 'high' : 'medium',
      })
    }
  })

  if (leaks.length === 0 && trend < 0) {
    leaks.push({
      title: `Tendencia levemente negativa (${trend.toFixed(1)}%)`,
      detail: 'Monitoreá de cerca las próximas semanas. No es crítico aún, pero conviene actuar preventivamente.',
      severity: 'low',
    })
  }

  return leaks
}

function detectOpportunities(kpis, analysis) {
  const ops = []
  const trend = kpis?.revenueTrend ?? 0
  const topShare = kpis?.topCategoryShare ?? 0
  const total = kpis?.totalRevenue ?? 0
  const avg = kpis?.monthlyAverage ?? 0

  const analysisOps = analysis?.layer3_whatToDo?.opportunities || []
  analysisOps.slice(0, 2).forEach(o => {
    ops.push({
      title: o.title,
      detail: o.description,
      value: o.potentialValue,
      effort: o.effort,
    })
  })

  if (topShare > 60 && !ops.some(o => o.title?.toLowerCase().includes('diversific'))) {
    ops.push({
      title: 'Diversificar fuentes de ingreso',
      detail: 'Con más de 60% concentrado en una categoría, expandir el mix podría reducir riesgo y potencialmente sumar 10–15% de ingresos adicionales.',
      value: `~${fmt(total * 0.12)} potencial`,
      effort: 'medium',
    })
  }

  if (trend > 20) {
    ops.push({
      title: 'Sistematizar el crecimiento',
      detail: `Con +${trend.toFixed(0)}% de crecimiento, es el momento de documentar qué está funcionando y crear procesos para escalarlo.`,
      value: 'Mantener momentum',
      effort: 'low',
    })
  }

  if (avg > 0 && !ops.some(o => o.title?.toLowerCase().includes('precio'))) {
    ops.push({
      title: 'Revisión de pricing',
      detail: 'Un aumento del 5–10% en precio con mismo volumen impacta directamente el margen. Si el mercado lo permite, es la palanca de mayor ROI.',
      value: `+${fmt(avg * 0.07)}/mes estimado`,
      effort: 'low',
    })
  }

  return ops.slice(0, 4)
}

const EFFORT_LABEL = { low: 'Fácil', medium: 'Moderado', high: 'Complejo' }
const EFFORT_COLOR = {
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

export default function GrowthPlan({ kpis, monthlySales = [], topProducts = [], analysis }) {
  const [priceIncrease, setPriceIncrease] = useState(0)
  const [costReduction, setCostReduction] = useState(0)
  const [volumeIncrease, setVolumeIncrease] = useState(0)
  const [showScenario, setShowScenario] = useState(false)

  const wins = detectWins(kpis, topProducts, monthlySales, analysis)
  const leaks = detectLeaks(kpis, topProducts, monthlySales, analysis)
  const opportunities = detectOpportunities(kpis, analysis)

  const baseRevenue = kpis?.totalRevenue || 0
  const baseMonthly = kpis?.monthlyAverage || 0

  // Scenario calculations
  const priceImpact = baseRevenue * (priceIncrease / 100)
  const volumeImpact = baseRevenue * (volumeIncrease / 100)
  const estimatedCosts = baseRevenue * 0.70
  const costSavings = estimatedCosts * (costReduction / 100)
  const projectedRevenue = baseRevenue + priceImpact + volumeImpact
  const projectedProfit = (baseRevenue - estimatedCosts) + priceImpact + volumeImpact + costSavings
  const baseProfit = baseRevenue - estimatedCosts
  const profitDelta = projectedProfit - baseProfit
  const revenueMonthly = (priceImpact + volumeImpact) / (monthlySales.length || 12)
  const hasScenario = priceIncrease > 0 || costReduction > 0 || volumeIncrease > 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-xl border px-5 py-4 border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-900/15">
        <div className="text-2xl font-black text-violet-600 dark:text-violet-400 w-8 text-center">05</div>
        <div className="w-px h-8 bg-current opacity-20" />
        <div>
          <h2 className="text-lg font-black text-violet-600 dark:text-violet-400 tracking-tight">Tu plan de crecimiento</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Basado en tus datos reales</p>
        </div>
      </div>

      {/* Wins */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Lo que está funcionando</h4>
        </div>
        <div className="space-y-3">
          {wins.map((w, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/15 rounded-xl border border-green-100 dark:border-green-700/20">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{w.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{w.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaks */}
      {leaks.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Dónde se pierde dinero</h4>
          </div>
          <div className="space-y-3">
            {leaks.map((l, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                l.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-700/20'
                  : 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-700/20'
              }`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  l.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                }`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{l.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-electric-500/10 dark:bg-electric-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-electric-500" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Oportunidades detectadas</h4>
          </div>
          <div className="space-y-3">
            {opportunities.map((o, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-electric-500/5 dark:bg-electric-500/10 rounded-xl border border-electric-500/10 dark:border-electric-500/20">
                <span className="text-electric-500 font-bold text-sm mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{o.title}</p>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {o.effort && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EFFORT_COLOR[o.effort] || EFFORT_COLOR.medium}`}>
                          {EFFORT_LABEL[o.effort] || o.effort}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{o.detail}</p>
                  {o.value && (
                    <p className="text-xs text-electric-500 font-medium mt-1">💰 {o.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario builder */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={() => setShowScenario(s => !s)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <span className="text-sm">🎛️</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Constructor de escenarios</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">¿Qué pasa si…? Mové los controles y ve el impacto</p>
            </div>
          </div>
          {showScenario ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showScenario && (
          <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="pt-4 space-y-4">
              {/* Price slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">📈 Aumento de precio promedio</label>
                  <span className="text-sm font-bold text-electric-500">+{priceIncrease}%</span>
                </div>
                <input
                  type="range" min={0} max={30} value={priceIncrease}
                  onChange={e => setPriceIncrease(Number(e.target.value))}
                  className="w-full accent-electric-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                  <span>Sin cambio</span><span>+30%</span>
                </div>
              </div>

              {/* Cost slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">✂️ Reducción de costos</label>
                  <span className="text-sm font-bold text-green-500">−{costReduction}%</span>
                </div>
                <input
                  type="range" min={0} max={20} value={costReduction}
                  onChange={e => setCostReduction(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                  <span>Sin cambio</span><span>−20%</span>
                </div>
              </div>

              {/* Volume slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">📦 Aumento de volumen</label>
                  <span className="text-sm font-bold text-cyan-500">+{volumeIncrease}%</span>
                </div>
                <input
                  type="range" min={0} max={50} value={volumeIncrease}
                  onChange={e => setVolumeIncrease(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                  <span>Sin cambio</span><span>+50%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            {hasScenario ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-electric-500/5 dark:bg-electric-500/10 rounded-xl p-3 text-center border border-electric-500/10">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1">Ingreso proyectado</p>
                  <p className="text-base font-black text-gray-900 dark:text-white">{fmt(projectedRevenue)}</p>
                  <p className="text-[10px] text-electric-500 mt-0.5">+{fmt(priceImpact + volumeImpact)} vs actual</p>
                </div>
                <div className="bg-green-500/5 dark:bg-green-500/10 rounded-xl p-3 text-center border border-green-500/10">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1">Impacto en margen</p>
                  <p className={`text-base font-black ${profitDelta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{fmt(profitDelta)}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">sobre margen actual estimado</p>
                </div>
                <div className="bg-cyan-500/5 dark:bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/10">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1">Ingreso extra / mes</p>
                  <p className="text-base font-black text-cyan-600 dark:text-cyan-400">{fmt(revenueMonthly + costSavings / (monthlySales.length || 12))}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">promedio</p>
                </div>
              </div>
            ) : (
              <div className="pt-2 text-center text-sm text-gray-400 dark:text-slate-500">
                Mové los controles para simular el impacto en tu negocio
              </div>
            )}

            <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
              * Los costos se estiman al 70% de los ingresos. Ajustá con tus datos reales para mayor precisión.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
