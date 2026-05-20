import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { formatMetric } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label, tRevenue, tGrowth, isMonetary, dark }) => {
  if (!active || !payload?.length) return null
  const mom = payload[0]?.payload?.momGrowth
  const bg = dark ? '#151e50' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#111827'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, color: text }}
      className="rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p style={{ color: '#4F7FFF' }} className="font-medium">{tRevenue}: {formatMetric(payload[0].value, isMonetary)}</p>
      {mom !== null && mom !== undefined && (
        <p className={`mt-1 font-semibold ${mom >= 0 ? 'text-green-500' : 'text-red-400'}`}>
          {tGrowth}: {mom >= 0 ? '+' : ''}{mom.toFixed(1)}%
        </p>
      )}
    </div>
  )
}

const GrowthLabel = ({ x, y, width, value }) => {
  if (value === null || value === undefined) return null
  const isPos = value >= 0
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={isPos ? '#16a34a' : '#dc2626'}
      textAnchor="middle"
      fontSize={10}
      fontWeight="600"
    >
      {isPos ? '+' : ''}{value.toFixed(1)}%
    </text>
  )
}

export default function SalesChart({ data, meta }) {
  const { t } = useTranslation()
  const { dark } = useTheme()
  if (!data?.length) return null

  const isMonetary = meta?.isMonetary ?? true
  const metricName = meta?.primaryMetricName || t('dashboard.charts.tooltipRevenue')
  const maxValue = Math.max(...data.map((d) => d.revenue))

  const tickColor = dark ? '#64748b' : '#9ca3af'
  const gridColor = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'
  // Dark: cream highlight + electric blue; Light: navy highlight + electric blue
  const barHighlight = dark ? '#F5EDD6' : '#0A0F2E'
  const barNormal = dark ? '#4F7FFF' : '#93c5fd'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          {t('dashboard.charts.salesByMonth')}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: barNormal }} />
            {metricName}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-green-500">↑</span>
            {t('dashboard.charts.growth')}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => isMonetary ? `$${(v / 1000).toFixed(0)}k` : v.toLocaleString()}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false} tickLine={false} width={48}
          />
          <Tooltip content={
            <CustomTooltip tRevenue={metricName} tGrowth={t('dashboard.charts.growth')} isMonetary={isMonetary} dark={dark} />
          } />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={56}>
            <LabelList dataKey="momGrowth" content={<GrowthLabel />} />
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.revenue === maxValue ? barHighlight : barNormal} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
