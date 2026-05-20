import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatMetric } from '../../utils/formatters'
import { useTheme } from '../../context/ThemeContext'

function linearForecast(data, periods = 3) {
  const n = data.length
  if (n < 2) return []
  const xs = data.map((_, i) => i)
  const ys = data.map((d) => d.revenue)
  const xMean = xs.reduce((s, x) => s + x, 0) / n
  const yMean = ys.reduce((s, y) => s + y, 0) / n
  const slope = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) /
    xs.reduce((s, x) => s + (x - xMean) ** 2, 0)
  const intercept = yMean - slope * xMean

  return Array.from({ length: periods }, (_, i) => ({
    month: `F${i + 1}`,
    forecast: Math.max(0, parseFloat((intercept + slope * (n + i)).toFixed(2))),
    isForecast: true,
  }))
}

function movingAverage(data, window = 3) {
  return data.map((d, i) => {
    if (i < window - 1) return { ...d, movingAvg: null }
    const slice = data.slice(i - window + 1, i + 1)
    const avg = slice.reduce((s, x) => s + x.revenue, 0) / window
    return { ...d, movingAvg: parseFloat(avg.toFixed(2)) }
  })
}

const CustomTooltip = ({ active, payload, label, isMonetary, dark }) => {
  if (!active || !payload?.length) return null
  const bg = dark ? '#1a2540' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#111827'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, color: text }}
      className="rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatMetric(p.value, isMonetary)}
        </p>
      ))}
    </div>
  )
}

export default function TrendChart({ data, meta }) {
  const { t } = useTranslation()
  const { dark } = useTheme()
  if (!data?.length) return null

  const isMonetary = meta?.isMonetary ?? true
  const metricName = meta?.primaryMetricName || t('dashboard.charts.tooltipRevenue')
  const withMA = movingAverage(data)
  // Scale forecast periods to data size: 1 if <6 periods, 2 if <12, else 3
  const forecastPeriods = data.length < 6 ? 1 : data.length < 12 ? 2 : 3
  const forecast = linearForecast(data, forecastPeriods)
  const avg = data.reduce((s, d) => s + d.revenue, 0) / data.length

  const combined = [
    ...withMA.map((d) => ({ ...d, isForecast: false })),
    ...forecast,
  ]

  const tickColor = dark ? '#64748b' : '#9ca3af'
  const gridColor = dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
  const refLineColor = dark ? 'rgba(255,255,255,0.12)' : '#d1d5db'
  const avgBg = dark ? 'bg-navy-700 text-slate-400' : 'bg-gray-100 text-gray-400'

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          {t('dashboard.charts.revenueTrend')}
        </h3>
        <span className={`text-xs rounded-full px-2.5 py-1 ${avgBg}`}>
          {t('dashboard.charts.avg')}: {formatMetric(avg, isMonetary)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={combined} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRevenueTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={dark ? 0.25 : 0.15} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => isMonetary ? `$${(v / 1000).toFixed(0)}k` : v.toLocaleString()}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip isMonetary={isMonetary} dark={dark} />} />
          <ReferenceLine y={avg} stroke={refLineColor} strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="revenue"
            name={metricName}
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#colorRevenueTrend)"
            dot={false}
            activeDot={{ r: 5, fill: '#7c3aed' }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            name={t('dashboard.charts.movingAvg')}
            stroke="#06b6d4"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name={t('dashboard.charts.forecast')}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { color: '#7c3aed', label: metricName, dash: false },
            { color: '#06b6d4', label: t('dashboard.charts.movingAvg'), dash: true },
            { color: '#f59e0b', label: t('dashboard.charts.forecast'), dash: true },
          ].map(({ color, label, dash }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
              <svg width="20" height="8">
                {dash
                  ? <line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
                  : <line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" />
                }
              </svg>
              {label}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-600 italic">{t('dashboard.charts.forecastNote')}</p>
      </div>
    </div>
  )
}
