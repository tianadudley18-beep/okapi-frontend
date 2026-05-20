import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'

function analyzeQuality(files) {
  const alerts = []
  const warnings = []
  const info = []

  files.forEach(pf => {
    const f = pf.user_files
    if (!f) return
    const kpi = f.kpi_data
    const meta = kpi?.meta || {}
    const summary = kpi?.summary || {}
    const warnings_ = meta.warnings || []
    const fileName = f.original_name

    // Missing date column
    if (warnings_.includes('no_date_column')) {
      warnings.push({ file: fileName, msg: 'Sin columna de fechas → no podemos mostrar tendencias temporales' })
    }

    // Missing category column
    if (warnings_.includes('no_category_column')) {
      info.push({ file: fileName, msg: 'Sin columna de categorías → no podemos desglosar por producto/proveedor' })
    }

    // All values zero
    if (warnings_.includes('all_values_zero') || summary.totalRevenue === 0) {
      alerts.push({ file: fileName, msg: 'Todos los valores son cero — verificá que la columna correcta esté seleccionada' })
    }

    // Single period
    if (warnings_.includes('single_period')) {
      info.push({ file: fileName, msg: 'Datos de un solo período → no hay suficiente historia para calcular tendencias' })
    }

    // Skipped rows
    const skippedMatch = warnings_.find(w => w.endsWith('_rows_skipped'))
    if (skippedMatch) {
      const count = parseInt(skippedMatch)
      if (count > 0) {
        const pct = Math.round((count / f.row_count) * 100)
        if (pct > 20) {
          alerts.push({ file: fileName, msg: `${count} filas omitidas (${pct}%) por valores no numéricos en la columna principal` })
        } else {
          info.push({ file: fileName, msg: `${count} filas con valores vacíos/no numéricos fueron ignoradas` })
        }
      }
    }

    // High concentration
    if (summary.topCategoryShare > 80) {
      warnings.push({ file: fileName, msg: `Alta concentración: ${summary.topCategoryShare?.toFixed(0)}% del total en una sola categoría (riesgo de dependencia)` })
    }

    // Consecutive declines
    if (summary.consecutiveDeclines >= 3) {
      alerts.push({ file: fileName, msg: `${summary.consecutiveDeclines} períodos consecutivos en declive — requiere atención inmediata` })
    }
  })

  const totalRows = files.reduce((s, pf) => s + (pf.user_files?.row_count || 0), 0)
  let completeness = 100
  if (alerts.length > 0) completeness -= alerts.length * 15
  if (warnings.length > 0) completeness -= warnings.length * 7
  completeness = Math.max(10, completeness)

  return { alerts, warnings, info, completeness }
}

export default function DataQualityPanel({ files }) {
  const [expanded, setExpanded] = useState(false)

  if (!files?.length) return null

  const { alerts, warnings, info, completeness } = analyzeQuality(files)
  const hasIssues = alerts.length > 0 || warnings.length > 0

  const scoreColor = completeness >= 80 ? 'text-green-600 dark:text-green-400'
    : completeness >= 60 ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  const scoreBg = completeness >= 80 ? 'bg-green-500'
    : completeness >= 60 ? 'bg-yellow-500'
    : 'bg-red-500'

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${scoreBg}`} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Calidad de datos</h3>
          {alerts.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-medium">
              {alerts.length} alerta{alerts.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-medium">
              {warnings.length} advertencia{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {!hasIssues && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
              Todo bien
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${scoreColor}`}>{completeness}%</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-white/[0.06] pt-4">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 dark:bg-white/[0.05] rounded-full h-2">
            <div className={`h-2 rounded-full ${scoreBg} transition-all`} style={{ width: `${completeness}%` }} />
          </div>

          {alerts.length === 0 && warnings.length === 0 && info.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Los datos se ven bien — no se detectaron problemas críticos.
            </div>
          )}

          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-400">{a.msg}</p>
                {a.file && <p className="text-[10px] text-red-400 dark:text-red-500 mt-0.5">{a.file}</p>}
              </div>
            </div>
          ))}

          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{w.msg}</p>
                {w.file && <p className="text-[10px] text-yellow-500 dark:text-yellow-600 mt-0.5">{w.file}</p>}
              </div>
            </div>
          ))}

          {info.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">{item.msg}</p>
                {item.file && <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-0.5">{item.file}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
