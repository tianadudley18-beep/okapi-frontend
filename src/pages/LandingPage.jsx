import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, Upload, MessageSquare, TrendingUp, AlertTriangle, Globe,
  CheckCircle, ChevronDown, ArrowRight, Sparkles,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Upload,
    title: 'Cargá tus archivos',
    desc: 'CSV o Excel en segundos. Okapi detecta automáticamente el tipo de datos y las columnas clave sin configuración.',
  },
  {
    icon: BarChart3,
    title: 'KPIs en tiempo real',
    desc: 'Métricas clave al instante: tendencias, comparativas de períodos y alertas automáticas de cambios bruscos.',
  },
  {
    icon: MessageSquare,
    title: 'Chateá con tu data',
    desc: 'Preguntá en español o inglés. Okapi responde con números reales de tu negocio, no respuestas genéricas.',
  },
  {
    icon: TrendingUp,
    title: 'Análisis profundo',
    desc: 'Detección automática de patrones, riesgos y oportunidades. Tres capas: qué pasó, por qué y qué hacer.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertas inteligentes',
    desc: 'Notificaciones automáticas ante caídas, anomalías o concentraciones de riesgo en tus datos.',
  },
  {
    icon: Globe,
    title: 'Multilenguaje',
    desc: 'Disponible en español e inglés. Diseñado para equipos latinoamericanos que trabajan con datos globales.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Subí tu archivo',
    desc: 'Arrastrá tu CSV o Excel. Okapi lo procesa en segundos y detecta automáticamente el tipo de datos.',
  },
  {
    step: '02',
    title: 'Explorá tus KPIs',
    desc: 'Vé al instante tus métricas clave, tendencias históricas, top categorías y alertas de riesgo.',
  },
  {
    step: '03',
    title: 'Tomá decisiones',
    desc: 'Chateá con tu data y recibí recomendaciones accionables basadas en tus propios números.',
  },
]

const FAQS = [
  {
    q: '¿Qué tipos de archivos acepta Okapi?',
    a: 'Okapi acepta archivos CSV y Excel (.xlsx, .xls). Podés subir datos de ventas, inventario, importaciones, nómina, académicos o cualquier dataset tabular.',
  },
  {
    q: '¿Es seguro subir mis datos?',
    a: 'Sí. Tus archivos se almacenan encriptados y nunca se comparten con terceros. Solo vos tenés acceso a tu información.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, podés cancelar tu suscripción cuando quieras. No hay contratos ni penalizaciones.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Tus datos permanecen disponibles durante 30 días después de la cancelación para que puedas exportarlos.',
  },
  {
    q: '¿En qué idiomas funciona el chat de IA?',
    a: 'El chat responde en el idioma en que escribís: español o inglés. La interfaz también está disponible en ambos idiomas.',
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'No. Okapi está diseñado para dueños de negocios, gerentes y analistas sin conocimientos de programación.',
  },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/okapi.jpg"
        alt="Okapi"
        style={{ width: 34, height: 34, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
      />
      <span
        className="font-heading text-cream-DEFAULT"
        style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}
      >
        Okapi
      </span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-cream-DEFAULT text-sm">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-electric-400 flex-shrink-0 transition-transform duration-200 ml-4 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed border-t border-white/[0.06] pt-4" style={{ color: 'rgba(245,237,214,0.55)' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0F2E', color: '#F5EDD6' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07]" style={{ backgroundColor: 'rgba(10,15,46,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'rgba(245,237,214,0.55)' }}>
            <a href="#features" className="hover:text-cream-DEFAULT transition-colors">Funciones</a>
            <a href="#pricing" className="hover:text-cream-DEFAULT transition-colors">Precios</a>
            <a href="#faq" className="hover:text-cream-DEFAULT transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 transition-colors"
              style={{ color: 'rgba(245,237,214,0.55)' }}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all duration-200"
              style={{ backgroundColor: '#4F7FFF' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2B5EEF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F7FFF'}
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-36">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,127,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border"
            style={{ backgroundColor: 'rgba(79,127,255,0.1)', borderColor: 'rgba(79,127,255,0.25)', color: '#A5BFFF' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Análisis de negocio con IA — sin código
          </div>

          <h1 className="font-heading font-bold leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: '#F5EDD6' }}>
            Tus datos hablan.{' '}
            <span style={{ color: '#7FA6FF' }}>Okapi los traduce.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(245,237,214,0.60)' }}>
            Subí tu Excel o CSV y en segundos tenés KPIs, tendencias, alertas y un analista de IA listo para responder tus preguntas de negocio.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
              style={{ backgroundColor: '#4F7FFF' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2B5EEF'; e.currentTarget.style.boxShadow = '0 0 24px rgba(79,127,255,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#4F7FFF'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Empezar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-base border"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#F5EDD6' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
            >
              Ya tengo cuenta
            </Link>
          </div>

        </div>
      </section>

      {/* ── Problem / Solution ─────────────────────────────────────── */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Problem */}
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                El problema
              </div>
              <h2 className="font-heading font-bold leading-snug text-3xl sm:text-4xl" style={{ color: '#F5EDD6' }}>
                Excel te dice <em className="not-italic" style={{ color: '#f87171' }}>qué pasó</em>, pero no por qué ni qué hacer
              </h2>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(245,237,214,0.55)' }}>
                {[
                  'Horas armando tablas dinámicas que nadie lee',
                  'No sabés cuándo hay un problema hasta que es tarde',
                  'Los insights están escondidos en miles de filas',
                  'Tu equipo toma decisiones con datos desactualizados',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(248,113,113,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border"
                style={{ backgroundColor: 'rgba(79,127,255,0.1)', borderColor: 'rgba(79,127,255,0.25)', color: '#7FA6FF' }}
              >
                La solución
              </div>
              <h2 className="font-heading font-bold leading-snug text-3xl sm:text-4xl" style={{ color: '#F5EDD6' }}>
                Okapi convierte tu data en{' '}
                <span style={{ color: '#7FA6FF' }}>decisiones claras</span>
              </h2>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(245,237,214,0.60)' }}>
                {[
                  'KPIs automáticos en segundos, sin fórmulas',
                  'Alertas cuando hay caídas o anomalías',
                  'Chat de IA que responde con tus propios números',
                  'Análisis de 3 capas: qué, por qué y qué hacer',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#4F7FFF' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: '#F5EDD6' }}>Cómo funciona</h2>
            <p style={{ color: 'rgba(245,237,214,0.55)' }}>Tres pasos y tu negocio tiene un analista de IA</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center group">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border transition-all duration-200"
                  style={{ backgroundColor: 'rgba(79,127,255,0.08)', borderColor: 'rgba(79,127,255,0.2)' }}
                >
                  <span className="font-heading font-bold text-lg" style={{ color: '#7FA6FF' }}>{step}</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3" style={{ color: '#F5EDD6' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,237,214,0.55)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: '#F5EDD6' }}>Todo lo que necesitás</h2>
            <p style={{ color: 'rgba(245,237,214,0.55)' }}>Un copiloto completo para tu negocio</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border transition-all duration-200 group cursor-default"
                style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(79,127,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(79,127,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                  style={{ backgroundColor: 'rgba(79,127,255,0.1)', borderColor: 'rgba(79,127,255,0.2)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#7FA6FF' }} />
                </div>
                <h3 className="font-heading font-semibold mb-2" style={{ color: '#F5EDD6' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,237,214,0.50)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: '#F5EDD6' }}>Precios simples</h2>
            <p style={{ color: 'rgba(245,237,214,0.55)' }}>Un solo plan completo, elegí cómo pagarlo</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Monthly — highlighted */}
            <div
              className="relative p-7 rounded-2xl border flex flex-col"
              style={{ borderColor: 'rgba(79,127,255,0.45)', backgroundColor: 'rgba(79,127,255,0.07)', boxShadow: '0 0 0 1px rgba(79,127,255,0.15)' }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#4F7FFF' }}
              >
                Más popular
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium mb-2" style={{ color: '#A5BFFF' }}>Mensual</p>
                <div className="flex items-end gap-1">
                  <span className="font-heading font-bold text-4xl" style={{ color: '#A5BFFF' }}>$7.45</span>
                  <span className="pb-1 text-sm" style={{ color: 'rgba(165,191,255,0.55)' }}>/mes</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {['Proyectos ilimitados', 'Archivos ilimitados', '150 mensajes IA/mes', 'Análisis completo 3 capas', 'Alertas inteligentes', 'Okapi Score'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,237,214,0.75)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#7FA6FF' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center font-semibold py-2.5 rounded-xl text-sm text-white transition-all duration-200"
                style={{ backgroundColor: '#4F7FFF' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2B5EEF'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F7FFF'}
              >
                Empezar ahora
              </Link>
            </div>

            {/* Annual */}
            <div className="p-7 rounded-2xl border flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.025)' }}>
              <div className="mb-6">
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(245,237,214,0.50)' }}>Anual</p>
                <div className="flex items-end gap-1">
                  <span className="font-heading font-bold text-4xl" style={{ color: '#F5EDD6' }}>$54.99</span>
                  <span className="pb-1 text-sm" style={{ color: 'rgba(245,237,214,0.35)' }}>/año</span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(165,191,255,0.8)' }}>equivale a $4.58/mes · ahorrás 39%</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {['Todo del plan mensual', 'Mensajes IA ilimitados', 'Soporte prioritario'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,237,214,0.65)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(79,127,255,0.65)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center font-medium py-2.5 rounded-xl text-sm border transition-all duration-200"
                style={{ borderColor: 'rgba(79,127,255,0.4)', color: '#A5BFFF' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(79,127,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Suscribirme anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: '#F5EDD6' }}>Preguntas frecuentes</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: '#F5EDD6' }}>
            Empezá a entender tu negocio hoy
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(245,237,214,0.55)' }}>
            Creá tu cuenta gratis y cargá tu primer archivo en menos de 2 minutos.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-white font-semibold px-10 py-4 rounded-xl text-base transition-all duration-200"
            style={{ backgroundColor: '#4F7FFF' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2B5EEF'; e.currentTarget.style.boxShadow = '0 0 32px rgba(79,127,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#4F7FFF'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Crear cuenta gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo />
            <p className="text-sm" style={{ color: 'rgba(245,237,214,0.30)' }}>
              © {new Date().getFullYear()} Okapi. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(245,237,214,0.35)' }}>
              <Link to="/login" className="hover:text-cream-DEFAULT transition-colors">Iniciar sesión</Link>
              <Link to="/register" className="hover:text-cream-DEFAULT transition-colors">Registrarse</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
