import { FileText, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import KPICards from '../dashboard/KPICards'
import SalesChart from '../dashboard/SalesChart'
import TrendChart from '../dashboard/TrendChart'
import TopProducts from '../dashboard/TopProducts'
import { useTheme } from '../../context/ThemeContext'
import { formatMetric } from '../../utils/formatters'

function ExecutiveSummaryCard({ analysis, meta }) {
  if (!analysis?.layer1_whatHappened?.executiveSummary) return null
  const l1 = analysis.layer1_whatHappened

  return (
    <div className="card border border-gray-200 dark:border-navy-700">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg p-2 flex-shrink-0">
          <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Resumen Ejecutivo</h3>
          {analysis.dataDescription && (
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{analysis.dataDescription}</p>
          )}
        </div>
        {analysis.confidence != null && (
          <span className="text-xs bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-slate-400 px-2 py-1 rounded-full flex-shrink-0">
            Confianza: {analysis.confidence}%
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-4">
        {l1.executiveSummary}
      </p>

      {l1.anomalies?.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Anomalías detectadas</p>
          {l1.anomalies.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
              a.impact === 'high'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : a.impact === 'medium'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{a.description} <strong>{a.value}</strong></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TopCategoriesChart({ categories = [], meta }) {
  const { dark } = useTheme()
  if (!categories.length) return null

  const isMonetary = meta?.isMonetary ?? true
  const colors = ['#4F7FFF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
  const tickColor = dark ? '#64748b' : '#9ca3af'
  const gridColor = dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const item = categories.find(c => c.name === label)
    const bg = dark ? '#1a2540' : '#fff'
    const border = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
    const text = dark ? '#f1f5f9' : '#111827'
    return (
      <div style={{ background: bg, border: `1px solid ${border}`, color: text }}
        className="rounded-xl shadow-lg p-3 text-xs space-y-1">
        <p className="font-semibold">{label}</p>
        <p style={{ color: payload[0]?.fill }}>{formatMetric(payload[0]?.value, isMonetary)}</p>
        {item?.percentage && <p className="text-gray-400">{item.percentage.toFixed(1)}% del total</p>}
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">
        Top Categorías
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => isMonetary ? `$${(v/1000).toFixed(0)}k` : v.toLocaleString()}
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category" dataKey="name" width={90}
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {categories.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Layer1WhatHappened({ kpis, analysis, monthlySales, topProducts, topLabel, meta }) {
  const l1 = analysis?.layer1_whatHappened

  return (
    <div className="space-y-6">
      <ExecutiveSummaryCard analysis={analysis} meta={meta} />
      <KPICards kpis={kpis} meta={meta} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={monthlySales} meta={meta} />
        <TrendChart data={monthlySales} meta={meta} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts data={topProducts} label={topLabel || 'Products'} meta={meta} />
        {l1?.topCategories?.length > 0 && (
          <TopCategoriesChart categories={l1.topCategories} meta={meta} />
        )}
      </div>
    </div>
  )
}
