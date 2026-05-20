import { useTranslation } from 'react-i18next'
import { formatMetric } from '../../utils/formatters'

const COLORS = [
  { bg: 'bg-primary-600', text: 'text-primary-600', bar: 'bg-primary-600' },
  { bg: 'bg-accent-500', text: 'text-accent-500', bar: 'bg-accent-500' },
  { bg: 'bg-green-500', text: 'text-green-500', bar: 'bg-green-500' },
  { bg: 'bg-yellow-500', text: 'text-yellow-500', bar: 'bg-yellow-500' },
  { bg: 'bg-red-400', text: 'text-red-400', bar: 'bg-red-400' },
]

export default function TopProducts({ data, label = 'Products', meta }) {
  const { t } = useTranslation()
  if (!data?.length) return null

  const isMonetary = meta?.isMonetary ?? true
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
        {t('dashboard.topProducts', { label })}
      </h3>
      <div className="space-y-4">
        {data.slice(0, 5).map((item, i) => {
          const pct = (item.revenue / maxRevenue) * 100
          const c = COLORS[i]
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full ${c.bg} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800 truncate max-w-[160px]" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-gray-900 font-semibold">{formatMetric(item.revenue, isMonetary)}</span>
                  {item.share != null && (
                    <span className={`text-xs font-semibold ${c.text}`}>{item.share.toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">{t('dashboard.ofTotal')}: 100%</p>
    </div>
  )
}
