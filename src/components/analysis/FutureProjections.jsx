import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Target, TrendingUp } from 'lucide-react'

const fmt = (n) => {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
}

const fmtShort = (n) => {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString('es-ES')}`
}

function linearRegression(data) {
  if (!data || data.length < 2) return { slope: 0, intercept: data?.[0]?.revenue || 0 }
  const n = data.length
  const x = data.map((_, i) => i)
  const y = data.map(d => d.revenue || 0)
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0)
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function addFutureMonths(lastMonth, n) {
  const months = []
  const parts = lastMonth?.match(/(\d{4})-(\d{2})/)
  let year = parts ? parseInt(parts[1]) : new Date().getFullYear()
  let month = parts ? parseInt(parts[2]) : new Date().getMonth() + 1
  const NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  for (let i = 1; i <= n; i++) {
    month++
    if (month > 12) { month = 1; year++ }
    months.push(`${NAMES[month - 1]} ${year}`)
  }
  return months
}

function labelMonth(m) {
  const parts = m?.match(/(\d{4})-(\d{2})/)
  if (!parts) return m?.slice(0, 7) || m
  const NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${NAMES[parseInt(parts[2]) - 1]} ${parts[1].slice(2)}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/[0.08] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function FutureProjections({ monthlySales = [], kpis }) {
  const [targetInput, setTargetInput] = useState('')

  if (monthlySales.length < 3) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-6 text-center">
        <TrendingUp className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Necesitás al menos 3 períodos de datos para generar proyecciones.</p>
      </div>
    )
  }

  const { slope, intercept } = linearRegression(monthlySales)
  const lastIdx = monthlySales.length - 1
  const lastMonth = monthlySales[lastIdx]?.month || ''
  const lastRevenue = monthlySales[lastIdx]?.revenue || 0
  const PESSIMIST = 0.8
  const OPTIMIST = 1.2

  // Build chart data: historical + 12 projected months
  const FUTURE_MONTHS = addFutureMonths(lastMonth, 12)
  const chartData = [
    ...monthlySales.map((m, i) => ({
      month: labelMonth(m.month),
      historical: m.revenue,
      realistic: null,
      optimistic: null,
      pessimistic: null,
    })),
    ...FUTURE_MONTHS.map((label, i) => {
      const projected = intercept + slope * (lastIdx + i + 1)
      return {
        month: label,
        historical: null,
        realistic: Math.max(0, projected),
        optimistic: Math.max(0, projected * OPTIMIST),
        pessimistic: Math.max(0, projected * PESSIMIST),
      }
    }),
  ]

  const proj3  = Math.max(0, intercept + slope * (lastIdx + 3))
  const proj6  = Math.max(0, intercept + slope * (lastIdx + 6))
  const proj12 = Math.max(0, intercept + slope * (lastIdx + 12))
  const pct = (v) => {
    const p = ((v - lastRevenue) / lastRevenue) * 100
    return `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`
  }

  // Milestone calculator
  const target = parseFloat(targetInput.replace(/[^0-9.]/g, ''))
  let monthsToTarget = null
  let extraGrowthNeeded = null
  if (!isNaN(target) && target > 0 && slope !== 0) {
    const m = (target - intercept) / slope - lastIdx
    monthsToTarget = m > 0 ? Math.ceil(m) : null
    if (monthsToTarget !== null) {
      extraGrowthNeeded = Math.max(0, Math.round(monthsToTarget / 2))
      const neededSlope = (target - lastRevenue) / (monthsToTarget / 2)
      extraGrowthNeeded = Math.round(((neededSlope / (lastRevenue || 1)) * 100))
    }
  }

  const targetDate = (() => {
    if (!monthsToTarget) return null
    const d = new Date()
    d.setMonth(d.getMonth() + monthsToTarget)
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  })()

  const projSections = [
    { label: '3 meses', realistic: proj3, optimistic: proj3 * OPTIMIST, pessimistic: proj3 * PESSIMIST },
    { label: '6 meses', realistic: proj6, optimistic: proj6 * OPTIMIST, pessimistic: proj6 * PESSIMIST },
    { label: '12 meses', realistic: proj12, optimistic: proj12 * OPTIMIST, pessimistic: proj12 * PESSIMIST },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-xl border px-5 py-4 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50 dark:bg-cyan-900/15">
        <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 w-8 text-center">04</div>
        <div className="w-px h-8 bg-current opacity-20" />
        <div>
          <h2 className="text-lg font-black text-cyan-600 dark:text-cyan-400 tracking-tight">Proyecciones</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Basadas en la tendencia actual de tus datos</p>
        </div>
      </div>

      {/* Projection cards */}
      <div className="grid grid-cols-3 gap-3">
        {projSections.map(({ label, realistic, optimistic, pessimistic }) => (
          <div key={label} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4 text-center">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">En {label}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{fmtShort(realistic)}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{pct(realistic)}</p>
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.06] flex justify-between text-[10px]">
              <span className="text-red-400">{fmtShort(pessimistic)}</span>
              <span className="text-gray-300 dark:text-slate-600">·</span>
              <span className="text-green-500">{fmtShort(optimistic)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-gray-300 dark:text-slate-600 mt-0.5">
              <span>pesimista</span>
              <span>optimista</span>
            </div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Proyección a 12 meses</h4>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-electric-500 inline-block" /> Histórico</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-500 inline-block" /> Realista</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-400 inline-block" /> Optimista</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block" /> Pesimista</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRealistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPessimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={labelMonth(lastMonth)} stroke="rgba(148,163,184,0.4)" strokeDasharray="4 2" label={{ value: 'Hoy', position: 'insideTopRight', fontSize: 9, fill: '#94a3b8' }} />
            <Area type="monotone" dataKey="historical" name="Histórico" stroke="#6366f1" strokeWidth={2} fill="url(#gHistorical)" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="optimistic" name="Optimista" stroke="#22c55e" strokeWidth={1.5} fill="url(#gOptimistic)" strokeDasharray="4 2" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="realistic" name="Realista" stroke="#06b6d4" strokeWidth={2} fill="url(#gRealistic)" strokeDasharray="6 3" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="pessimistic" name="Pesimista" stroke="#fb923c" strokeWidth={1.5} fill="url(#gPessimistic)" strokeDasharray="4 2" connectNulls={false} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center mt-1">
          Optimista +20% · Pesimista −20% de la tendencia lineal actual
        </p>
      </div>

      {/* Milestone calculator */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-electric-500" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">¿Cuándo llegás a tu próxima meta?</h4>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Quiero llegar a este ingreso mensual</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                placeholder="Ej: 50000"
                className="w-full pl-7 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-electric-500/30"
              />
            </div>
          </div>
        </div>

        {targetInput && (
          <div className="mt-4">
            {isNaN(target) || target <= 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">Ingresá un número válido</p>
            ) : target <= lastRevenue ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 rounded-xl text-sm text-green-700 dark:text-green-300">
                ✅ Ya superás esa meta. Tu ingreso actual es {fmt(lastRevenue)}.
              </div>
            ) : monthsToTarget !== null ? (
              <div className="space-y-3">
                <div className="p-3 bg-electric-500/5 dark:bg-electric-500/10 border border-electric-500/20 rounded-xl">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    A tu ritmo actual, lo lográs en <span className="text-electric-500">{monthsToTarget} meses</span>
                  </p>
                  {targetDate && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Estimado: {targetDate}</p>
                  )}
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  Para lograrlo en la mitad del tiempo, necesitás crecer ~{extraGrowthNeeded}% adicional por mes.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl text-sm text-red-700 dark:text-red-300">
                Con la tendencia actual esa meta no es alcanzable. Necesitás revertir la tendencia primero.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
