import { useState, useEffect } from 'react'
import { X, ChevronRight, BarChart3, Upload, MessageCircle, Zap } from 'lucide-react'

const STEPS = [
  {
    icon: '🎉',
    title: 'Bienvenido a Okapi',
    desc: 'Tu copiloto inteligente de datos. Te mostramos cómo empezar en 3 pasos.',
    visual: null,
  },
  {
    icon: null,
    title: 'Creá tu primer proyecto',
    desc: 'Un proyecto agrupa tus archivos y datos relacionados. Podés tener uno para ventas, otro para costos, etc.',
    visual: 'project',
    highlight: 'Hacé clic en "Nuevo proyecto" para empezar',
  },
  {
    icon: null,
    title: 'Subí tus datos',
    desc: 'Subí cualquier archivo Excel (.xlsx) o CSV. Okapi detecta automáticamente qué tipo de datos son.',
    visual: 'upload',
    highlight: 'Arrastrá tu archivo o hacé clic en el área de carga',
  },
  {
    icon: null,
    title: 'Obtené insights al instante',
    desc: 'Okapi analiza tus datos y te da KPIs, Okapi Score, recomendaciones y alertas — sin configuración.',
    visual: 'insights',
    highlight: 'Todo se genera automáticamente al subir',
  },
  {
    icon: null,
    title: 'Hablá con tus datos',
    desc: 'Preguntale cualquier cosa al chat IA. Responde como un analista experto con contexto de tus datos.',
    visual: 'chat',
    highlight: '"¿Cuál es mi mayor riesgo?" o "Comparame los períodos"',
  },
]

function StepVisual({ type }) {
  if (type === 'project') return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex gap-3">
        {['Ventas 2025', 'Importaciones', 'Gastos'].map((name, i) => (
          <div key={i} className="bg-white dark:bg-navy-700 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/[0.08] w-28">
            <div className="w-6 h-6 rounded-lg mb-2" style={{ backgroundColor: ['#6366f120', '#8b5cf620', '#22c55e20'][i] }}>
              <BarChart3 className="w-full h-full p-1" style={{ color: ['#6366f1', '#8b5cf6', '#22c55e'][i] }} />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{name}</p>
          </div>
        ))}
      </div>
      <div className="px-5 py-2 bg-electric-500 rounded-xl text-white text-sm font-medium">+ Nuevo proyecto</div>
    </div>
  )
  if (type === 'upload') return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="border-2 border-dashed border-electric-500/40 rounded-2xl px-8 py-6 text-center bg-electric-500/5">
        <Upload className="w-8 h-8 text-electric-500/40 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Arrastrá un archivo aquí</p>
        <p className="text-xs text-gray-400">.xlsx · .csv · .tsv</p>
      </div>
    </div>
  )
  if (type === 'insights') return (
    <div className="grid grid-cols-2 gap-2 py-4">
      {[
        { label: 'Total ventas', value: '$1.2M', color: 'text-green-500' },
        { label: 'Okapi Score', value: '78/100', color: 'text-yellow-500' },
        { label: 'Tendencia', value: '+12.5%', color: 'text-green-500' },
        { label: 'Top producto', value: 'Modelo A', color: 'text-electric-500' },
      ].map((item, i) => (
        <div key={i} className="bg-white dark:bg-navy-700 rounded-xl p-3 border border-gray-100 dark:border-white/[0.08]">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">{item.label}</p>
          <p className={`text-sm font-bold mt-0.5 ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
  if (type === 'chat') return (
    <div className="space-y-2 py-4">
      <div className="flex gap-2 justify-end">
        <div className="bg-electric-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs max-w-[80%]">
          ¿Cuál es mi mayor riesgo?
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-lg bg-electric-500/10 flex-shrink-0" />
        <div className="bg-gray-100 dark:bg-white/[0.06] rounded-2xl rounded-tl-sm px-3 py-2 text-xs max-w-[80%] text-gray-700 dark:text-slate-300">
          Tu mayor riesgo es la alta concentración: el 73% de tus ventas depende de un solo proveedor. Te recomiendo diversificar hacia al menos 3 fuentes...
        </div>
      </div>
    </div>
  )
  return null
}

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('okapi_onboarding_completed')
    if (!done) {
      setTimeout(() => setVisible(true), 800)
    }
  }, [])

  function finish() {
    localStorage.setItem('okapi_onboarding_completed', '1')
    setVisible(false)
    onComplete?.()
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-navy-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-electric-500' : 'bg-gray-200 dark:bg-white/[0.08]'}`}
            />
          ))}
        </div>

        <div className="p-6">
          {current.icon && (
            <div className="text-4xl mb-4 text-center">{current.icon}</div>
          )}

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{current.desc}</p>

          {current.visual && <StepVisual type={current.visual} />}

          {current.highlight && (
            <div className="flex items-center gap-2 p-2 bg-electric-500/10 rounded-xl text-xs text-electric-600 dark:text-electric-400 mb-2">
              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
              {current.highlight}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={finish} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">
              Saltear
            </button>
            <button
              onClick={() => { if (isLast) finish(); else setStep(s => s + 1) }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {isLast ? '¡Empezar!' : 'Siguiente'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function resetOnboarding() {
  localStorage.removeItem('okapi_onboarding_completed')
}
