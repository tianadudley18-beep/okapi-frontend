import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area,
} from 'recharts'
import { formatMetric } from '../../utils/formatters'
import { useTheme } from '../../context/ThemeContext'

export default function ScenarioForecast({ forecast, monthlySales, meta }) {
  const { dark } = useTheme()
  if (!forecast?.scenarios) return null

  const isMonetary = meta?.isMonetary ?? true
  const { optimistic, realistic, pessimistic, confidence, assumptions } = forecast

  // Build chart data: last 6 historical + 3 forecast points
  const historical = (monthlySales || []).slice(-6).map(m => ({
    period: m.month,
    actual: m.revenue,
  }))

  const forecastPoints = [
    { period: 'F+1', optimistic, realistic, pessimistic },
    { period: 'F+2', optimistic: optimistic * 1.05, realistic: realistic * 1.02, pessimistic: pessimistic * 0.98 },
    { period: 'F+3', optimistic: optimistic * 1.1, realistic: realistic * 1.04, pessimistic: pessimistic * 0.95 },
  ]

  const combined = [
    ...historical,
    // Bridge point (last actual repeated for all scenarios)
    historical.length > 0 ? {
      period: historical[historical.length - 1].period,
      actual: historical[historical.length - 1].actual,
      optimistic: historical[historical.length - 1].actual,
      realistic: historical[historical.length - 1].actual,
      pessimistic: historical[historical.length - 1].actual,
    } : null,
    ...forecastPoints,
  ].filter(Boolean)

  const tickColor = dark ? '#64748b' : '#9ca3af'
  const gridColor = dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const bg = dark ? '#1a2540' : '#fff'
    const border = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
    const text = dark ? '#f1f5f9' : '#111827'
    return (
      <div style={{ background: bg, border: `1px solid ${border}`, color: text }}
        className="rounded-xl shadow-lg p-3 text-xs space-y-1">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => p.value != null && (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name}: {formatMetric(p.value, isMonetary)}
          </p>
        ))}
      </div>
    )
  }

  const scenarioColor = { optimistic: '#10b981', realistic: '#4F7FFF', pessimistic: '#f59e0b' }

  return (
    <div className="card border border-gray-200 dark:border-navy-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Proyección por Escenarios
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          confidence >= 70
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : confidence >= 50
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-slate-400'
        }`}>
          Confianza: {confidence ?? 55}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={combined} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={v => isMonetary ? `$${(v/1000).toFixed(0)}k` : v.toLocaleString()}
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false} tickLine={false} width={48}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Historical area */}
          <Area
            type="monotone" dataKey="actual" name="Histórico"
            stroke="#7c3aed" strokeWidth={2.5}
            fill={dark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)'}
            dot={false} activeDot={{ r: 4 }}
          />

          {/* Forecast lines */}
          {['optimistic', 'realistic', 'pessimistic'].map(key => (
            <Line
              key={key}
              type="monotone" dataKey={key}
              name={key === 'optimistic' ? 'Optimista' : key === 'realistic' ? 'Realista' : 'Pesimista'}
              stroke={scenarioColor[key]}
              strokeWidth={key === 'realistic' ? 2.5 : 1.5}
              strokeDasharray={key === 'realistic' ? '0' : '5 3'}
              dot={false} activeDot={{ r: 3 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          {[
            { key: 'optimistic', label: 'Optimista', value: optimistic },
            { key: 'realistic', label: 'Realista', value: realistic },
            { key: 'pessimistic', label: 'Pesimista', value: pessimistic },
          ].map(({ key, label, value }) => (
            <div key={key} className="flex items-center gap-1.5">
              <svg width="16" height="8">
                <line x1="0" y1="4" x2="16" y2="4" stroke={scenarioColor[key]} strokeWidth="2"
                  strokeDasharray={key !== 'realistic' ? '4 2' : undefined} />
              </svg>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {label}: <strong className="text-gray-700 dark:text-slate-200">{formatMetric(value, isMonetary)}</strong>
              </span>
            </div>
          ))}
        </div>
        {assumptions && (
          <p className="text-xs text-gray-400 dark:text-slate-600 italic">{assumptions}</p>
        )}
      </div>
    </div>
  )
}
