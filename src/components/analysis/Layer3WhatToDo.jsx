import { Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react'
import ScenarioForecast from './ScenarioForecast'
import { formatMetric } from '../../utils/formatters'

const PRIORITY_STYLES = {
  critical: {
    badge: 'bg-red-600 text-white',
    border: 'border-red-200 dark:border-red-800/40',
    bg: 'bg-red-50 dark:bg-red-900/15',
    deadline: 'text-red-600 dark:text-red-400',
  },
  high: {
    badge: 'bg-orange-500 text-white',
    border: 'border-orange-200 dark:border-orange-800/40',
    bg: 'bg-orange-50 dark:bg-orange-900/15',
    deadline: 'text-orange-600 dark:text-orange-400',
  },
  medium: {
    badge: 'bg-amber-400 text-white',
    border: 'border-amber-200 dark:border-amber-800/40',
    bg: 'bg-amber-50 dark:bg-amber-900/15',
    deadline: 'text-amber-600 dark:text-amber-400',
  },
}

const DEADLINE_LABELS = {
  immediate: 'Inmediato',
  this_week: 'Esta semana',
  this_month: 'Este mes',
  this_quarter: 'Este trimestre',
}

const EFFORT_LABELS = { low: 'Bajo', medium: 'Medio', high: 'Alto' }
const EFFORT_COLORS = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const RISK_LEVEL = {
  low: { label: 'Bajo', color: '#10b981', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  medium: { label: 'Medio', color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  high: { label: 'Alto', color: '#ef4444', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  critical: { label: 'Crítico', color: '#dc2626', bg: 'bg-red-200 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300' },
}

function RiskScoreGauge({ score = 0, level = 'low' }) {
  const rl = RISK_LEVEL[level] || RISK_LEVEL.low
  const radius = 40
  const cx = 50, cy = 50
  const circ = Math.PI * radius
  const arc = circ * Math.min(score / 100, 1)
  const filledDeg = (score / 100) * 180
  const toRad = (deg) => (deg - 180) * (Math.PI / 180)
  const startX = cx + radius * Math.cos(toRad(0))
  const startY = cy + radius * Math.sin(toRad(0))
  const endX = cx + radius * Math.cos(toRad(180))
  const endY = cy + radius * Math.sin(toRad(180))
  const fillX = cx + radius * Math.cos(toRad(filledDeg))
  const fillY = cy + radius * Math.sin(toRad(filledDeg))
  const largeArc = filledDeg > 90 ? 1 : 0

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none" stroke="currentColor" strokeWidth={8}
          className="text-gray-100 dark:text-navy-700" strokeLinecap="round" />
        {score > 0 && (
          <path d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX} ${fillY}`}
            fill="none" stroke={rl.color} strokeWidth={8} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${rl.color}60)` }} />
        )}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="14" fontWeight="bold" fill={rl.color}>{score}</text>
        <text x={cx} y={cx + 6} textAnchor="middle" fontSize="7" fill={rl.color} fontWeight="600">/100</text>
      </svg>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-500">Nivel de riesgo</p>
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${rl.bg} ${rl.text}`}>
          {rl.label}
        </span>
      </div>
    </div>
  )
}

export default function Layer3WhatToDo({ analysis, monthlySales, meta }) {
  const l3 = analysis?.layer3_whatToDo
  if (!l3) return null

  const urgentActions = l3.urgentActions || []
  const opportunities = l3.opportunities || []
  const risk = l3.riskAssessment
  const isMonetary = meta?.isMonetary ?? true

  return (
    <div className="space-y-6">
      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <div className="card border border-gray-200 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
              <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Acciones Urgentes</h3>
          </div>
          <div className="space-y-3">
            {urgentActions.map((action, i) => {
              const style = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.medium
              return (
                <div key={i} className={`rounded-xl border p-4 ${style.border} ${style.bg}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 ${style.badge}`}>
                      {action.priority === 'critical' ? 'CRÍTICO' : action.priority === 'high' ? 'ALTA' : 'MEDIA'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{action.title}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">{action.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {action.deadline && (
                          <span className={`text-xs font-medium ${style.deadline}`}>
                            ⏱ {DEADLINE_LABELS[action.deadline] || action.deadline}
                          </span>
                        )}
                        {action.expectedImpact && (
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            → {action.expectedImpact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Opportunities + Risk side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.length > 0 && (
          <div className="card border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Oportunidades</h3>
            </div>
            <div className="space-y-3">
              {opportunities.map((opp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-800/30">
                  <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">{opp.title}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 leading-relaxed">{opp.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {opp.potentialValue && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          💰 {opp.potentialValue}
                        </span>
                      )}
                      {opp.effort && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EFFORT_COLORS[opp.effort]}`}>
                          Esfuerzo: {EFFORT_LABELS[opp.effort]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {risk && (
          <div className="card border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Evaluación de Riesgos</h3>
            </div>

            <RiskScoreGauge score={risk.score || 0} level={risk.overallLevel || 'low'} />

            {risk.topRisks?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Riesgos principales</p>
                {risk.topRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      r.probability === 'high' ? 'bg-red-500' : r.probability === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <span className="text-gray-700 dark:text-slate-300">{r.risk}</span>
                    <span className={`ml-auto flex-shrink-0 ${
                      r.impact === 'high' ? 'text-red-500' : r.impact === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      Impacto: {r.impact === 'high' ? 'Alto' : r.impact === 'medium' ? 'Medio' : 'Bajo'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {risk.mitigations?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-navy-700 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Mitigaciones</p>
                {risk.mitigations.map((m, i) => (
                  <p key={i} className="text-xs text-gray-600 dark:text-slate-400 flex items-start gap-1.5">
                    <span className="text-green-500 flex-shrink-0">✓</span> {m}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenario Forecast */}
      <ScenarioForecast
        forecast={l3.forecast}
        monthlySales={monthlySales}
        meta={meta}
      />
    </div>
  )
}
