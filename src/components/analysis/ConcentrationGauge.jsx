export default function ConcentrationGauge({ percentage = 0, name = '', type = 'product' }) {
  const radius = 52
  const stroke = 10
  const cx = 70
  const cy = 70
  const circumference = Math.PI * radius // half circle
  const arc = circumference * Math.min(percentage / 100, 1)

  const color = percentage >= 70 ? '#ef4444' : percentage >= 40 ? '#f59e0b' : '#10b981'
  const level = percentage >= 70 ? 'CRÍTICO' : percentage >= 40 ? 'ALTO' : 'BAJO'

  const toRad = (deg) => (deg - 180) * (Math.PI / 180)
  const startX = cx + radius * Math.cos(toRad(0))
  const startY = cy + radius * Math.sin(toRad(0))
  const endX = cx + radius * Math.cos(toRad(180))
  const endY = cy + radius * Math.sin(toRad(180))

  const filledDeg = (percentage / 100) * 180
  const fillX = cx + radius * Math.cos(toRad(filledDeg))
  const fillY = cy + radius * Math.sin(toRad(filledDeg))
  const largeArc = filledDeg > 90 ? 1 : 0

  return (
    <div className="card border border-gray-200 dark:border-navy-700">
      <h4 className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-3">
        Riesgo de Concentración — {type}
      </h4>
      <div className="flex items-center gap-4">
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* Background arc */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-100 dark:text-navy-700"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {percentage > 0 && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX} ${fillY}`}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
            />
          )}
          {/* Center text */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>
            {percentage.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">
            {level}
          </text>
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">{name}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {percentage >= 70
              ? 'Concentración crítica — cualquier interrupción impacta severamente el total'
              : percentage >= 40
              ? 'Concentración elevada — considera diversificar fuentes'
              : 'Concentración saludable — riesgo distribuido adecuadamente'}
          </p>
        </div>
      </div>
    </div>
  )
}
