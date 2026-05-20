import { useState } from 'react'
import { Target, BookOpen, Download, ChevronRight, Check, X, HelpCircle, ArrowRight } from 'lucide-react'

const INDUSTRY_KPIS = {
  importexport: [
    { name: 'Costo FOB Total y promedio', desc: 'Valor de mercancía en origen sin flete ni seguros', how: 'Columna "FOB" o "Valor Mercadería"', freq: 'Por operación' },
    { name: 'Costo por kg', desc: 'Costo total dividido kilos totales — eficiencia de compra', how: 'Columna "Peso" o "Kg" más columna de costo', freq: 'Por operación' },
    { name: 'Concentración por proveedor', desc: '% del total de compras por cada proveedor', how: 'Columna "Proveedor" o "País de origen"', freq: 'Mensual' },
    { name: 'Arancel efectivo promedio', desc: '% Arancel / Valor FOB', how: 'Columna "Arancel" + columna FOB', freq: 'Por operación' },
    { name: 'Costo de flete como % del FOB', desc: 'Cuánto representa el flete sobre el costo de mercadería', how: 'Columna "Flete" + columna FOB', freq: 'Mensual' },
  ],
  retail: [
    { name: 'Ticket promedio de venta', desc: 'Monto promedio por transacción', how: 'Total ventas / Número de transacciones', freq: 'Diario' },
    { name: 'Margen bruto %', desc: '(Venta - Costo) / Venta × 100', how: 'Columna "Precio venta" + "Costo compra"', freq: 'Mensual' },
    { name: 'Rotación de productos', desc: 'Unidades vendidas vs stock disponible', how: 'Columna "Unidades" + "Stock"', freq: 'Mensual' },
    { name: 'Productos estrella (80/20)', desc: 'El 20% de productos que genera el 80% de ingresos', how: 'Columna "Producto" + "Ventas"', freq: 'Mensual' },
    { name: 'Días de inventario', desc: 'Cuántos días durarías con stock actual', how: 'Stock actual / Ventas diarias promedio', freq: 'Semanal' },
  ],
  saas: [
    { name: 'MRR (Monthly Recurring Revenue)', desc: 'Ingresos recurrentes mensuales — métrica clave de SaaS', how: 'Suma de suscripciones activas del mes', freq: 'Mensual' },
    { name: 'Churn rate mensual', desc: '% de clientes que cancelaron en el mes', how: 'Clientes cancelados / Clientes inicio mes × 100', freq: 'Mensual' },
    { name: 'CAC (Costo de adquisición)', desc: 'Cuánto cuesta conseguir cada nuevo cliente', how: 'Gasto marketing / Nuevos clientes', freq: 'Mensual' },
    { name: 'LTV (Lifetime Value)', desc: 'Ingresos totales esperados por cliente', how: 'Ticket promedio × Tiempo promedio de vida', freq: 'Trimestral' },
    { name: 'LTV/CAC ratio', desc: 'Debe ser > 3 para un negocio SaaS saludable', how: 'LTV / CAC', freq: 'Mensual' },
  ],
  gastronomy: [
    { name: 'Ticket promedio por mesa', desc: 'Ingreso promedio por mesa o reserva', how: 'Total ventas / Mesas atendidas', freq: 'Diario' },
    { name: 'Food cost %', desc: 'Costo de materia prima sobre ventas — debe ser < 35%', how: 'Costo ingredientes / Ventas totales × 100', freq: 'Semanal' },
    { name: 'Ocupación por período', desc: '% de mesas ocupadas sobre capacidad total', how: 'Mesas ocupadas / Capacidad × 100', freq: 'Diario' },
    { name: 'Productos más vendidos', desc: 'Ranking de platos por unidades vendidas', how: 'Columna "Plato" + "Unidades"', freq: 'Semanal' },
  ],
  logistics: [
    { name: 'Costo por entrega', desc: 'Costo operativo dividido número de entregas', how: 'Costos totales / Entregas realizadas', freq: 'Mensual' },
    { name: 'On-time delivery rate', desc: '% de entregas a tiempo sobre el total', how: 'Entregas a tiempo / Total entregas × 100', freq: 'Semanal' },
    { name: 'Costo de combustible %', desc: 'Proporción del combustible sobre costos totales', how: 'Gasto combustible / Costos totales × 100', freq: 'Mensual' },
    { name: 'Costo por km', desc: 'Eficiencia operativa de la flota', how: 'Costos operativos / Km recorridos', freq: 'Mensual' },
  ],
  construction: [
    { name: 'Costo por m²', desc: 'Costo de construcción dividido metros cuadrados', how: 'Costos totales / m² construidos', freq: 'Por proyecto' },
    { name: 'Avance vs presupuesto', desc: '% ejecutado vs % presupuestado', how: 'Columna "Ejecutado" + "Presupuestado"', freq: 'Semanal' },
    { name: 'Costo materiales vs mano de obra', desc: 'Distribución del presupuesto', how: 'Columnas separadas por categoría', freq: 'Mensual' },
    { name: 'Desvío de presupuesto', desc: '% de sobrecosto vs presupuesto original', how: '(Costo real - Presupuesto) / Presupuesto × 100', freq: 'Por proyecto' },
  ],
  manufacturing: [
    { name: 'Costo de producción por unidad', desc: 'Cuánto cuesta producir una unidad', how: 'Costos totales / Unidades producidas', freq: 'Mensual' },
    { name: 'Eficiencia de línea %', desc: 'Producción real vs capacidad instalada', how: 'Unidades producidas / Capacidad máxima × 100', freq: 'Diario' },
    { name: 'Scrap/desperdicio %', desc: 'Material o producción descartada', how: 'Unidades descartadas / Unidades producidas × 100', freq: 'Diario' },
    { name: 'OEE (Overall Equipment Effectiveness)', desc: 'Disponibilidad × Rendimiento × Calidad', how: 'Requiere datos de disponibilidad, velocidad y calidad', freq: 'Diario' },
  ],
  academic: [
    { name: 'Promedio general', desc: 'Nota promedio del grupo o período', how: 'Columna "Nota" o "Calificación"', freq: 'Por evaluación' },
    { name: 'Tasa de aprobación %', desc: '% de alumnos que aprobaron (nota ≥ 60)', how: 'Aprobados / Total × 100', freq: 'Por evaluación' },
    { name: 'Distribución de notas', desc: 'Rangos: <60, 60-75, 75-90, >90', how: 'Columna de notas agrupada por rangos', freq: 'Por evaluación' },
    { name: 'Alumnos en riesgo', desc: 'Con promedio < 60 o tendencia negativa', how: 'Filtrar alumnos con nota < 60', freq: 'Mensual' },
  ],
  professional: [
    { name: 'Horas facturadas vs trabajadas', desc: 'Eficiencia del equipo en horas cobrables', how: 'Columna "Horas facturadas" + "Horas totales"', freq: 'Mensual' },
    { name: 'Revenue por empleado', desc: 'Ingresos generados por cada integrante del equipo', how: 'Ingresos totales / Empleados activos', freq: 'Mensual' },
    { name: 'Costo por proyecto', desc: 'Rentabilidad por proyecto o cliente', how: 'Costos asignados / Ingresos por proyecto', freq: 'Por proyecto' },
    { name: 'Utilización %', desc: 'Debe ser > 70% para ser rentable', how: 'Horas facturables / Horas disponibles × 100', freq: 'Mensual' },
  ],
  general: [
    { name: 'Total valor principal', desc: 'Suma del indicador más importante del negocio', how: 'Columna principal numérica', freq: 'Mensual' },
    { name: 'Promedio por período', desc: 'Valor promedio mensual/semanal', how: 'Total / Número de períodos', freq: 'Mensual' },
    { name: 'Top categorías', desc: 'Las categorías o ítems más importantes', how: 'Columna de categoría + valor', freq: 'Mensual' },
    { name: 'Tendencia y crecimiento', desc: 'Variación entre períodos', how: 'Columna de fecha + valor', freq: 'Mensual' },
  ],
}

const OBJECTIVES = [
  { id: 'grow', label: 'Crecer ventas', kpis: ['Ticket promedio', 'Tasa de conversión', 'Nuevos clientes', 'Revenue por canal'] },
  { id: 'reduce', label: 'Reducir costos', kpis: ['Costo por unidad', 'Margen bruto %', 'Desperdicio %', 'Costo operativo'] },
  { id: 'profit', label: 'Mejorar rentabilidad', kpis: ['Margen neto', 'ROI', 'EBITDA', 'Costo de captación'] },
  { id: 'expand', label: 'Expandirme', kpis: ['Market share', 'Nuevos mercados', 'Costo de expansión', 'LTV/CAC'] },
]

const EXCEL_HEADERS = {
  importexport: ['Fecha', 'Proveedor', 'País Origen', 'Descripción Producto', 'HS Code', 'Kg', 'Valor FOB (USD)', 'Flete (USD)', 'Arancel (%)', 'Seguro (USD)', 'Costo Total (USD)'],
  retail: ['Fecha', 'Producto', 'Categoría', 'Unidades Vendidas', 'Precio Unitario', 'Costo Unitario', 'Total Venta', 'Sucursal'],
  saas: ['Fecha', 'Cliente', 'Plan', 'MRR', 'Estado', 'Fecha Alta', 'Fecha Baja', 'Canal Adquisición', 'CAC'],
  gastronomy: ['Fecha', 'Turno', 'Plato', 'Categoría', 'Unidades', 'Precio', 'Costo Ingredientes', 'Mesa', 'Reserva'],
  logistics: ['Fecha', 'Ruta', 'Zona', 'Entregas', 'Km Recorridos', 'Combustible (L)', 'Costo Combustible', 'Entregas a Tiempo', 'Devoluciones'],
  construction: ['Fecha', 'Proyecto', 'Partida', 'Presupuestado', 'Ejecutado', 'Metros Cuadrados', 'Tipo Costo', 'Responsable'],
  manufacturing: ['Fecha', 'Línea', 'Producto', 'Unidades Producidas', 'Unidades Descartadas', 'Costo Materiales', 'Costo MO', 'Horas Máquina', 'Capacidad Max'],
  academic: ['Fecha', 'Alumno', 'Materia', 'Evaluación', 'Nota', 'Asistencia %', 'Docente', 'Curso'],
  professional: ['Fecha', 'Empleado', 'Proyecto', 'Cliente', 'Horas Trabajadas', 'Horas Facturadas', 'Tarifa/Hora', 'Total Facturado'],
  general: ['Fecha', 'Categoría', 'Subcategoría', 'Descripción', 'Valor', 'Unidades', 'Responsable', 'Notas'],
}

function generateCsvTemplate(industry) {
  const headers = EXCEL_HEADERS[industry] || EXCEL_HEADERS.general
  const sampleRows = [
    headers.map((h, i) => {
      if (h.toLowerCase().includes('fecha')) return '2025-01-15'
      if (h.toLowerCase().includes('valor') || h.toLowerCase().includes('costo') || h.toLowerCase().includes('fob') || h.toLowerCase().includes('precio') || h.toLowerCase().includes('total') || h.toLowerCase().includes('mrr')) return '1500.00'
      if (h.toLowerCase().includes('unidades') || h.toLowerCase().includes('kg') || h.toLowerCase().includes('horas')) return '100'
      if (h.toLowerCase().includes('%')) return '15'
      return 'Ejemplo ' + (i + 1)
    }),
    headers.map((h, i) => {
      if (h.toLowerCase().includes('fecha')) return '2025-02-20'
      if (h.toLowerCase().includes('valor') || h.toLowerCase().includes('costo') || h.toLowerCase().includes('fob') || h.toLowerCase().includes('precio') || h.toLowerCase().includes('total') || h.toLowerCase().includes('mrr')) return '2200.00'
      if (h.toLowerCase().includes('unidades') || h.toLowerCase().includes('kg') || h.toLowerCase().includes('horas')) return '150'
      if (h.toLowerCase().includes('%')) return '12'
      return 'Ejemplo ' + (i + 1)
    }),
  ]

  const lines = [
    headers.join(','),
    ...sampleRows.map(row => row.map(v => `"${v}"`).join(',')),
  ]
  return lines.join('\n')
}

export default function WhatToMeasure({ files, industry = 'general' }) {
  const [mode, setMode] = useState(null)
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [trackedKpis, setTrackedKpis] = useState([])

  const kpis = INDUSTRY_KPIS[industry] || INDUSTRY_KPIS.general

  // Auto-detect missing data from uploaded files
  const missing = []
  const hasFiles = files?.length > 0
  if (hasFiles) {
    const firstKpi = files[0]?.user_files?.kpi_data
    const meta = firstKpi?.meta || {}
    const warnings = meta.warnings || []
    if (warnings.includes('no_date_column')) missing.push({ icon: '📅', label: 'Fechas', impact: 'sin esto no podemos mostrar tendencias temporales' })
    if (warnings.includes('no_category_column')) missing.push({ icon: '📂', label: 'Categorías/Productos', impact: 'sin esto no podemos desglosar por tipo' })
    if (firstKpi?.summary?.totalRevenue === 0) missing.push({ icon: '💰', label: 'Columna de valores correcta', impact: 'los datos muestran $0 — revisá el selector de columna' })
  }

  function downloadTemplate() {
    const csv = generateCsvTemplate(industry)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `okapi-plantilla-${industry}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-electric-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">¿Qué medir?</h3>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Guía de KPIs para tu industria</p>
      </div>

      {mode === null && (
        <div className="p-5 space-y-4">
          {/* Auto-detect missing */}
          {missing.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                ⚠️ Okapi detectó que podrías agregar estos datos:
              </p>
              <div className="space-y-1.5">
                {missing.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span>{m.icon}</span>
                    <div>
                      <span className="font-medium text-amber-700 dark:text-amber-300">{m.label}</span>
                      <span className="text-amber-600 dark:text-amber-500"> — {m.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs list */}
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">KPIs recomendados para tu industria:</p>
            <div className="space-y-1.5">
              {kpis.slice(0, 4).map((kpi, i) => (
                <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <div className="w-5 h-5 rounded-full bg-electric-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-electric-500">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">{kpi.name}</p>
                    <p className="text-gray-400 dark:text-slate-500">{kpi.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => setMode('wizard')}
              className="flex items-center justify-between px-4 py-3 bg-electric-500/10 hover:bg-electric-500/20 text-electric-600 dark:text-electric-400 rounded-xl transition-colors text-sm font-medium"
            >
              <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Ayudame a saber qué medir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-600 dark:text-slate-300 rounded-xl transition-colors text-sm font-medium"
            >
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Descargar plantilla de Excel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {mode === 'wizard' && (
        <div className="p-5">
          {wizardStep === 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">¿Cuál es tu principal objetivo de negocio ahora mismo?</p>
              <div className="space-y-2">
                {OBJECTIVES.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => { setSelectedObjective(obj); setWizardStep(2) }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/[0.04] hover:bg-electric-500/10 dark:hover:bg-electric-500/15 text-gray-700 dark:text-slate-300 rounded-xl transition-colors text-sm"
                  >
                    {obj.label}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
              <button onClick={() => setMode(null)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">← Volver</button>
            </div>
          )}

          {wizardStep === 2 && selectedObjective && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Para <strong>{selectedObjective.label}</strong>, estos son los KPIs más importantes:
              </p>
              <div className="space-y-2 mb-4 mt-3">
                {selectedObjective.kpis.map((kpi, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <div className="w-4 h-4 rounded-full bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-electric-500">{i + 1}</span>
                    </div>
                    <span className="text-gray-700 dark:text-slate-300">{kpi}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">¿Actualmente medís alguno de estos?</p>
              <div className="space-y-1.5">
                {selectedObjective.kpis.map((kpi, i) => (
                  <button
                    key={i}
                    onClick={() => setTrackedKpis(t => t.includes(kpi) ? t.filter(k => k !== kpi) : [...t, kpi])}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                      trackedKpis.includes(kpi)
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                        : 'bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-slate-400 border border-transparent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      trackedKpis.includes(kpi) ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {trackedKpis.includes(kpi) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {kpi}
                  </button>
                ))}
              </div>
              {trackedKpis.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                    ✅ Medís {trackedKpis.length} de {selectedObjective.kpis.length} KPIs clave.
                  </p>
                  {selectedObjective.kpis.filter(k => !trackedKpis.includes(k)).length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-500">
                      💡 Descargá la plantilla para empezar a medir los que te faltan.
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setWizardStep(1)} className="text-xs text-gray-400 hover:text-gray-600">← Atrás</button>
                <button onClick={downloadTemplate} className="ml-auto text-xs px-3 py-1.5 bg-electric-500 text-white rounded-lg">
                  Descargar plantilla
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
