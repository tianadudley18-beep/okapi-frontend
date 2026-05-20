import { Search, GitBranch, Link2, AlertTriangle } from 'lucide-react'
import ConcentrationGauge from './ConcentrationGauge'

const CONFIDENCE_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

function RootCauseCard({ finding, evidence, confidence = 'medium' }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-navy-700 p-4 space-y-2 bg-white dark:bg-navy-800">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-snug flex-1">{finding}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${CONFIDENCE_COLORS[confidence]}`}>
          {confidence === 'high' ? 'Alta certeza' : confidence === 'medium' ? 'Media' : 'Baja'}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed border-l-2 border-gray-200 dark:border-navy-600 pl-3">
        {evidence}
      </p>
    </div>
  )
}

function PatternCard({ pattern, description, dataPoints }) {
  const PATTERN_ICONS = {
    seasonality: '🔄',
    concentration: '🎯',
    growth_acceleration: '🚀',
    decline: '📉',
    stability: '➡️',
    volatility: '〰️',
  }
  const icon = PATTERN_ICONS[pattern] || '📊'

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-navy-700 border border-gray-100 dark:border-navy-600 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{description}</p>
      </div>
      {dataPoints && (
        <p className="text-xs text-gray-400 dark:text-slate-500">{dataPoints}</p>
      )}
    </div>
  )
}

export default function Layer2WhyItHappened({ analysis }) {
  const l2 = analysis?.layer2_whyItHappened
  if (!l2) return null

  const hasRootCauses = l2.rootCauses?.length > 0
  const hasPatterns = l2.patterns?.length > 0
  const hasCorrelations = l2.correlations?.length > 0
  const hasConcentration = l2.concentrationRisks?.length > 0

  return (
    <div className="space-y-6">
      {/* Root causes */}
      {hasRootCauses && (
        <div className="card border border-gray-200 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
              <Search className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Causas Raíz Identificadas</h3>
          </div>
          <div className="space-y-3">
            {l2.rootCauses.map((rc, i) => (
              <RootCauseCard key={i} {...rc} />
            ))}
          </div>
        </div>
      )}

      {/* Patterns + Concentration side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasPatterns && (
          <div className="card border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
                <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Patrones Detectados</h3>
            </div>
            <div className="space-y-3">
              {l2.patterns.map((p, i) => (
                <PatternCard key={i} {...p} />
              ))}
            </div>
          </div>
        )}

        {hasConcentration && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Riesgo de Concentración</h3>
            </div>
            {l2.concentrationRisks.map((cr, i) => (
              <ConcentrationGauge
                key={i}
                percentage={cr.percentage}
                name={cr.name}
                type={cr.type}
              />
            ))}
          </div>
        )}
      </div>

      {/* Correlations */}
      {hasCorrelations && (
        <div className="card border border-gray-200 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Correlaciones</h3>
          </div>
          <div className="space-y-3">
            {l2.correlations.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 dark:text-slate-300">{c.factor1}</span>
                <span className="text-gray-400 dark:text-slate-600">↔</span>
                <span className="font-medium text-gray-700 dark:text-slate-300">{c.factor2}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 ml-auto text-right max-w-48">{c.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasRootCauses && !hasPatterns && !hasConcentration && (
        <div className="card border border-gray-200 dark:border-navy-700 text-center py-8">
          <p className="text-gray-400 dark:text-slate-500 text-sm">Análisis de causas no disponible para este dataset.</p>
        </div>
      )}
    </div>
  )
}
