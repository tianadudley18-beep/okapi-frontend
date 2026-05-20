export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

// Universal metric formatter — uses currency for monetary, plain number for non-monetary
export const formatMetric = (value, isMonetary = true) => {
  if (value === null || value === undefined) return '—'
  if (isMonetary) return formatCurrency(value)
  if (typeof value !== 'number') return String(value)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US').format(value)

export const formatPercent = (value) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

export const getMonthName = (monthNum) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return months[monthNum - 1] || monthNum
}
