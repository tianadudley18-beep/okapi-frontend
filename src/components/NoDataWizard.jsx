import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Download, Upload, ChevronDown, ChevronUp, Info } from 'lucide-react'

// ── Industry metric definitions ─────────────────────────────────────────────
const INDUSTRY_METRICS = {
  importacion: [
    { name: 'Costo FOB por proveedor', why: 'Te dice exactamente dónde perdés dinero', frequency: 'Por operación', alert: 'Si un proveedor supera 50% del total, es riesgo crítico', column: 'costo_fob' },
    { name: 'Arancel efectivo %', why: 'Detecta oportunidades de ahorro por clasificación arancelaria', frequency: 'Mensual', alert: 'Si supera 15% del FOB, revisar clasificación', column: 'arancel' },
    { name: 'Flete como % del FOB', why: 'Mide eficiencia logística', frequency: 'Por shipment', alert: 'Si supera 12%, buscar alternativas logísticas', column: 'flete' },
    { name: 'Tiempo entre orden y recepción', why: 'Impacta tu capital de trabajo', frequency: 'Por operación', alert: 'Más de 60 días afecta flujo de caja', column: 'fecha_orden' },
    { name: 'Margen neto por producto', why: 'Muestra cuáles productos realmente convienen importar', frequency: 'Mensual', column: 'precio_venta' },
    { name: 'Concentración por proveedor %', why: 'Mide tu riesgo de dependencia', frequency: 'Trimestral', alert: 'Más de 60% en un proveedor = riesgo alto', column: 'proveedor' },
    { name: 'Costo total por unidad', why: 'Base para fijar precio de venta correcto', frequency: 'Por operación', column: 'costo_unitario' },
  ],
  exportacion: [
    { name: 'Costo FOB por proveedor', why: 'Te dice exactamente dónde perdés dinero', frequency: 'Por operación', alert: 'Si un proveedor supera 50% del total, es riesgo crítico', column: 'costo_fob' },
    { name: 'Arancel efectivo %', why: 'Detecta oportunidades de ahorro', frequency: 'Mensual', alert: 'Si supera 15% del FOB, revisar clasificación', column: 'arancel' },
    { name: 'Flete como % del FOB', why: 'Mide eficiencia logística', frequency: 'Por shipment', alert: 'Si supera 12%, buscar alternativas', column: 'flete' },
    { name: 'Margen neto por producto', why: 'Muestra cuáles productos convienen exportar', frequency: 'Mensual', column: 'precio_venta' },
    { name: 'Concentración por destino %', why: 'Riesgo de depender de un solo mercado', frequency: 'Trimestral', alert: 'Más de 60% en un destino = riesgo alto', column: 'pais_destino' },
  ],
  retail: [
    { name: 'Ticket promedio', why: 'Indica el valor de cada venta', frequency: 'Diaria', column: 'ticket_promedio' },
    { name: 'Margen bruto %', why: 'Sin esto no sabés si ganás o perdés', frequency: 'Mensual', alert: 'Menos de 30% es peligroso en retail', column: 'margen_bruto' },
    { name: 'Rotación de inventario', why: 'Detecta productos muertos que inmovilizan capital', frequency: 'Mensual', alert: 'Menos de 4 veces/año es bajo', column: 'rotacion_inventario' },
    { name: 'Productos estrella (80/20)', why: 'El 20% de productos genera el 80% de ingresos', frequency: 'Mensual', column: 'producto' },
    { name: 'Costo de adquisición de cliente', why: 'Mide eficiencia del marketing', frequency: 'Mensual', column: 'cac' },
    { name: 'Tasa de devolución %', why: 'Alta devolución indica problema de calidad o expectativas', frequency: 'Mensual', alert: 'Más de 5% requiere atención', column: 'devoluciones' },
  ],
  comercio: [
    { name: 'Ticket promedio', why: 'Indica el valor de cada venta', frequency: 'Diaria', column: 'ticket_promedio' },
    { name: 'Margen bruto %', why: 'Sin esto no sabés si ganás o perdés', frequency: 'Mensual', alert: 'Menos de 30% es peligroso', column: 'margen_bruto' },
    { name: 'Rotación de inventario', why: 'Detecta productos que inmovilizan capital', frequency: 'Mensual', column: 'rotacion' },
    { name: 'Productos estrella', why: 'El 20% genera el 80% de ingresos', frequency: 'Mensual', column: 'producto' },
    { name: 'Tasa de devolución %', why: 'Alta devolución indica problema de calidad', frequency: 'Mensual', alert: 'Más de 5% requiere atención', column: 'devoluciones' },
  ],
  saas: [
    { name: 'MRR (Monthly Recurring Revenue)', why: 'La métrica más importante en SaaS', frequency: 'Mensual', column: 'mrr' },
    { name: 'Churn rate mensual %', why: 'Si perdés más clientes de los que ganás, el negocio decrece', frequency: 'Mensual', alert: 'Más de 5% mensual es crítico', column: 'churn' },
    { name: 'CAC (Costo de adquisición)', why: 'Cuánto costó conseguir cada cliente nuevo', frequency: 'Mensual', column: 'cac' },
    { name: 'LTV (Lifetime Value)', why: 'Cuánto vale un cliente durante toda su vida', frequency: 'Trimestral', column: 'ltv' },
    { name: 'LTV/CAC ratio', why: 'Debe ser mayor a 3 para ser sostenible', frequency: 'Mensual', alert: 'Menor a 3 indica modelo insostenible', column: 'ltv_cac' },
    { name: 'NPS (Net Promoter Score)', why: 'Mide satisfacción y probabilidad de recomendación', frequency: 'Trimestral', column: 'nps' },
  ],
  tecnologia: [
    { name: 'MRR (Monthly Recurring Revenue)', why: 'La métrica más importante', frequency: 'Mensual', column: 'mrr' },
    { name: 'Churn rate mensual %', why: 'Pérdida de clientes mensual', frequency: 'Mensual', alert: 'Más de 5% mensual es crítico', column: 'churn' },
    { name: 'CAC (Costo de adquisición)', why: 'Eficiencia en conseguir clientes', frequency: 'Mensual', column: 'cac' },
    { name: 'LTV/CAC ratio', why: 'Debe ser mayor a 3 para ser sostenible', frequency: 'Mensual', alert: 'Menor a 3 indica modelo insostenible', column: 'ltv_cac' },
    { name: 'NPS', why: 'Satisfacción de clientes', frequency: 'Trimestral', column: 'nps' },
  ],
  gastronomia: [
    { name: 'Food cost %', why: 'El costo de ingredientes no debe superar 30-35%', frequency: 'Semanal', alert: 'Más de 35% destruye rentabilidad', column: 'costo_ingredientes' },
    { name: 'Ticket promedio por mesa', why: 'Indica rendimiento por servicio', frequency: 'Diaria', column: 'ticket_promedio' },
    { name: 'Ocupación por turno %', why: 'Mide eficiencia del espacio', frequency: 'Diaria', alert: 'Menos de 60% indica problema de demanda', column: 'ocupacion' },
    { name: 'Revenue por hora', why: 'Identifica los horarios más rentables', frequency: 'Semanal', column: 'revenue_hora' },
    { name: 'Costo de personal % ventas', why: 'No debe superar 30-35%', frequency: 'Mensual', alert: 'Más de 40% es insostenible', column: 'costo_personal' },
    { name: 'Desperdicio %', why: 'Pérdida directa de dinero', frequency: 'Semanal', alert: 'Más de 5% requiere revisión de compras', column: 'desperdicio' },
  ],
  servicios: [
    { name: 'Utilización %', why: 'Horas facturadas / horas disponibles', frequency: 'Semanal', alert: 'Menos de 70% indica capacidad ociosa', column: 'horas_facturadas' },
    { name: 'Revenue por empleado', why: 'Mide productividad del equipo', frequency: 'Mensual', column: 'revenue_por_empleado' },
    { name: 'Margen por proyecto', why: 'Muestra qué proyectos convienen', frequency: 'Por proyecto', column: 'margen_proyecto' },
    { name: 'Tasa de retención de clientes', why: 'Clientes recurrentes son más baratos que nuevos', frequency: 'Trimestral', alert: 'Menos de 70% indica problema de satisfacción', column: 'retencion' },
    { name: 'Tiempo promedio de cobro', why: 'Impacta directamente el flujo de caja', frequency: 'Mensual', alert: 'Más de 45 días es riesgo de liquidez', column: 'dias_cobro' },
  ],
  manufactura: [
    { name: 'Costo por unidad producida', why: 'Base de toda decisión de pricing', frequency: 'Por lote', column: 'costo_unitario' },
    { name: 'OEE (Eficiencia global equipos) %', why: 'Mide rendimiento real de producción', frequency: 'Diaria', alert: 'Menos de 65% es bajo en manufactura', column: 'oee' },
    { name: 'Scrap/desperdicio %', why: 'Material perdido = dinero perdido', frequency: 'Diaria', alert: 'Más de 3% requiere revisión de proceso', column: 'scrap' },
    { name: 'Tiempo de ciclo', why: 'Tiempo real vs tiempo estándar', frequency: 'Por turno', column: 'tiempo_ciclo' },
    { name: 'Costo de reproceso', why: 'Indica fallas de calidad', frequency: 'Mensual', column: 'reproceso' },
  ],
  general: [
    { name: 'Ingreso total', why: 'Punto de partida de todo análisis', frequency: 'Mensual', column: 'ingresos' },
    { name: 'Costo total', why: 'Sin esto no podés calcular rentabilidad', frequency: 'Mensual', column: 'costos' },
    { name: 'Margen neto %', why: 'Muestra si el negocio es viable', frequency: 'Mensual', alert: 'Negativo significa que perdés dinero', column: 'margen' },
    { name: 'Crecimiento mes a mes', why: 'Indica si el negocio está mejorando', frequency: 'Mensual', column: 'crecimiento_mom' },
    { name: 'Top 5 categorías/clientes/productos', why: 'El 80/20 siempre aplica', frequency: 'Mensual', column: 'categoria' },
  ],
}

const INDUSTRY_NAMES = {
  importacion: 'Importación', exportacion: 'Exportación', retail: 'Retail',
  comercio: 'Comercio', saas: 'SaaS', tecnologia: 'Tecnología',
  gastronomia: 'Gastronomía', servicios: 'Servicios Profesionales',
  manufactura: 'Manufactura', general: 'General',
}

// ── Steps data ───────────────────────────────────────────────────────────────
const SITUATIONS = [
  { id: 'starting', emoji: '🚀', title: 'Recién empezando', desc: 'Menos de 1 año, quiero ordenar mis números' },
  { id: 'growing',  emoji: '📈', title: 'Creciendo',        desc: 'Tengo ventas pero no controlo bien los números' },
  { id: 'stuck',    emoji: '😐', title: 'Estancado',        desc: 'No crezco y no sé por qué' },
  { id: 'profitable',emoji:'💰', title: 'Rentable',         desc: 'Gano dinero pero quiero ganar más' },
  { id: 'problems', emoji: '🆘', title: 'Con problemas',    desc: 'Necesito entender qué está fallando' },
]

const GOALS = [
  { id: 'sales',    emoji: '💵', title: 'Aumentar ventas' },
  { id: 'costs',    emoji: '✂️', title: 'Reducir costos' },
  { id: 'margin',   emoji: '📊', title: 'Mejorar rentabilidad' },
  { id: 'expand',   emoji: '🌍', title: 'Expandirme' },
  { id: 'viable',   emoji: '🔍', title: 'Entender si soy viable' },
  { id: 'hire',     emoji: '👥', title: 'Contratar con confianza' },
]

// ── CSV template generator ───────────────────────────────────────────────────
function generateCSV(industry) {
  const metrics = INDUSTRY_METRICS[industry] || INDUSTRY_METRICS.general
  const columns = ['fecha', ...metrics.map(m => m.column || m.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))]
  const whyRow = ['¿Por qué importa?', ...metrics.map(m => m.why)]
  const freqRow = ['Frecuencia', ...metrics.map(m => m.frequency)]
  const alertRow = ['Alerta', ...metrics.map(m => m.alert || 'N/A')]
  const sample1 = ['2024-01', ...metrics.map(() => '')]
  const sample2 = ['2024-02', ...metrics.map(() => '')]
  const sample3 = ['2024-03', ...metrics.map(() => '')]
  const rows = [columns, whyRow, freqRow, alertRow, ['--- DATOS ---', ...metrics.map(() => '')], sample1, sample2, sample3]
  return rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(industry) {
  const csv = generateCSV(industry)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `okapi_plantilla_${industry}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main component ───────────────────────────────────────────────────────────
export default function NoDataWizard({ industry = 'general', onUpload, projectName }) {
  const [step, setStep] = useState(0)
  const [situation, setSituation] = useState(null)
  const [goals, setGoals] = useState([])
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState({})

  const metrics = INDUSTRY_METRICS[industry] || INDUSTRY_METRICS.general
  const industryLabel = INDUSTRY_NAMES[industry] || 'tu industria'

  function toggleGoal(id) {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function toggleChecked(name) {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }))
  }

  function toggleExpanded(name) {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const canNext = step === 0 ? !!situation : step === 1 ? goals.length > 0 : true

  const STEPS = ['Situación', 'Objetivos', 'Métricas', 'Plantilla']

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
              i < step ? 'bg-electric-500 text-white' :
              i === step ? 'bg-electric-500/10 text-electric-500 ring-2 ring-electric-500/30' :
              'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-slate-500'
            }`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1 ${i < step ? 'bg-electric-500' : 'bg-gray-200 dark:bg-white/[0.08]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 0: Situation ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Contanos sobre tu negocio</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">¿Cuál es tu situación actual?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SITUATIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSituation(s.id)}
                className={`text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${
                  situation === s.id
                    ? 'border-electric-500 bg-electric-500/5 dark:bg-electric-500/10'
                    : 'border-gray-200 dark:border-white/[0.08] hover:border-electric-500/40 bg-white dark:bg-navy-800'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                </div>
                {situation === s.id && (
                  <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-electric-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1: Goals ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">¿Qué querés lograr en los próximos 6 meses?</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Podés elegir más de uno</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`text-left flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  goals.includes(g.id)
                    ? 'border-electric-500 bg-electric-500/5 dark:bg-electric-500/10'
                    : 'border-gray-200 dark:border-white/[0.08] hover:border-electric-500/40 bg-white dark:bg-navy-800'
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white text-center">{g.title}</p>
                {goals.includes(g.id) && (
                  <div className="w-5 h-5 rounded-full bg-electric-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Metric plan ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Tu plan de métricas</h2>
              <span className="text-xs bg-electric-500/10 text-electric-500 px-2 py-0.5 rounded-full font-medium">{industryLabel}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Estas son las métricas clave para tu negocio. Marcá las que ya medís.</p>
          </div>
          <div className="space-y-3">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleChecked(m.name)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        checked[m.name]
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-white/[0.20] hover:border-electric-500'
                      }`}
                    >
                      {checked[m.name] && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${checked[m.name] ? 'text-green-600 dark:text-green-400 line-through opacity-60' : 'text-gray-900 dark:text-white'}`}>
                          {m.name}
                        </p>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <span className="text-[10px] bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{m.frequency}</span>
                          {m.column && (
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-mono">{m.column}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-gray-700 dark:text-slate-300">¿Por qué importa?</span> {m.why}
                      </p>

                      {m.alert && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          <span>Alerta: {m.alert}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* "Cómo empezar" expandable — only show for unchecked */}
                  {!checked[m.name] && (
                    <button
                      onClick={() => toggleExpanded(m.name)}
                      className="mt-3 ml-8 flex items-center gap-1 text-xs text-electric-500 hover:text-electric-600 transition-colors"
                    >
                      {expanded[m.name] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Cómo empezar a medirlo
                    </button>
                  )}
                </div>

                {!checked[m.name] && expanded[m.name] && (
                  <div className="px-4 pb-4 ml-8 border-t border-gray-100 dark:border-white/[0.06]">
                    <div className="mt-3 p-3 bg-electric-500/5 dark:bg-electric-500/10 rounded-xl border border-electric-500/10">
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Para empezar:</p>
                      <ol className="text-xs text-gray-500 dark:text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                        <li>Agregá una columna llamada <code className="bg-white dark:bg-white/[0.06] px-1 rounded font-mono">{m.column || m.name.toLowerCase().replace(/ /g, '_')}</code> en tu planilla</li>
                        <li>Registrá el valor con frecuencia: <strong>{m.frequency.toLowerCase()}</strong></li>
                        {m.alert && <li>Configurá una alerta cuando: {m.alert.toLowerCase()}</li>}
                        <li>Subí el archivo a Okapi y el sistema lo detectará automáticamente</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.08] text-sm text-center">
            <span className="font-semibold text-gray-900 dark:text-white">
              {Object.values(checked).filter(Boolean).length}/{metrics.length} métricas
            </span>
            <span className="text-gray-500 dark:text-slate-400"> ya las medís · </span>
            <span className="text-electric-500 font-semibold">
              {metrics.length - Object.values(checked).filter(Boolean).length} por implementar
            </span>
          </div>
        </div>
      )}

      {/* ── STEP 3: Download ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Tu plantilla personalizada está lista</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Creamos una plantilla con las columnas correctas para {industryLabel}.
            </p>
          </div>

          {/* Template preview */}
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">¿Qué incluye la plantilla?</h3>
            <div className="space-y-2">
              {metrics.slice(0, 5).map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-md bg-yellow-400/20 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-mono text-[10px] flex-shrink-0">
                    {String.fromCharCode(65 + i + 1)}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">{m.column || m.name.toLowerCase().replace(/ /g, '_')}</span>
                  <span className="text-gray-400 dark:text-slate-500">— {m.name}</span>
                </div>
              ))}
              {metrics.length > 5 && (
                <p className="text-xs text-gray-400 dark:text-slate-500 ml-7">+ {metrics.length - 5} columnas más…</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center text-[11px]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Hoja 1</p>
                <p className="text-gray-400 dark:text-slate-500">Ingreso de datos</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Fila 2</p>
                <p className="text-gray-400 dark:text-slate-500">Instrucciones</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Fila 3+</p>
                <p className="text-gray-400 dark:text-slate-500">Tus datos</p>
              </div>
            </div>
          </div>

          {/* Download CTA */}
          <button
            onClick={() => downloadCSV(industry)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-electric-500 hover:bg-electric-600 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-electric-500/20"
          >
            <Download className="w-5 h-5" />
            Descargar plantilla para {industryLabel}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.08]" />
            <span className="text-xs text-gray-400 dark:text-slate-500">o si ya tenés datos</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.08]" />
          </div>

          {/* Upload CTA */}
          <button
            onClick={onUpload}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-electric-500/30 hover:border-electric-500/60 text-electric-500 rounded-2xl font-bold text-sm transition-colors hover:bg-electric-500/5"
          >
            <Upload className="w-5 h-5" />
            Subir mi archivo ahora
          </button>

          <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
            Formatos soportados: .xlsx · .csv · .tsv · Google Sheets
          </p>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          className={`flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors ${step === 0 ? 'invisible' : ''}`}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-electric-500' : i < step ? 'w-3 bg-electric-500/50' : 'w-3 bg-gray-200 dark:bg-white/[0.08]'}`}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => canNext && setStep(s => s + 1)}
            disabled={!canNext}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
              canNext
                ? 'bg-electric-500 text-white hover:bg-electric-600'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 bg-electric-500 text-white rounded-xl hover:bg-electric-600 transition-all"
          >
            Subir datos
            <Upload className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
