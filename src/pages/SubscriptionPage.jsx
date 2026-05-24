import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft, X } from 'lucide-react'

const MONTHLY_FEATURES = [
  'Proyectos ilimitados',
  'Archivos ilimitados',
  '150 mensajes IA/mes',
  'Análisis completo 3 capas',
  'Alertas inteligentes',
  'Okapi Score',
]

const ANNUAL_FEATURES = [
  'Todo del plan mensual',
  'Mensajes IA ilimitados',
  'Soporte prioritario',
]

function ComingSoonToast({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm p-8 rounded-2xl text-center"
        style={{ backgroundColor: '#0d1338', border: '1px solid rgba(79,127,255,0.3)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(79,127,255,0.12)', border: '1px solid rgba(79,127,255,0.2)' }}
        >
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="font-heading font-bold text-xl mb-2" style={{ color: '#F5EDD6' }}>
          Próximamente
        </h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(245,237,214,0.55)' }}>
          Los pagos estarán disponibles muy pronto. Te notificaremos cuando estén listos.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 font-medium px-6 py-2.5 rounded-xl text-sm transition-all duration-200"
          style={{ backgroundColor: '#4F7FFF', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2B5EEF'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F7FFF'}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  const [showToast, setShowToast] = useState(false)

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0F2E', color: '#F5EDD6' }}>

      {showToast && <ComingSoonToast onClose={() => setShowToast(false)} />}

      {/* ── Back link ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'rgba(245,237,214,0.50)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F5EDD6'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,237,214,0.50)'}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis proyectos
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-3" style={{ color: '#F5EDD6' }}>
          Activá tu plan
        </h1>
        <p style={{ color: 'rgba(245,237,214,0.55)' }}>
          Desbloqueá el análisis completo, el chat de IA y todas las funciones de Okapi.
        </p>
      </div>

      {/* ── Plans ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
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
              {MONTHLY_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,237,214,0.75)' }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#7FA6FF' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.open('https://okapi.lemonsqueezy.com/checkout/buy/33256972-c017-4608-83dd-42bd935d5e61', '_blank')}
              className="block w-full text-center font-semibold py-2.5 rounded-xl text-sm text-white transition-all duration-200"
              style={{ backgroundColor: '#4F7FFF' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2B5EEF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F7FFF'}
            >
              Elegir plan
            </button>
          </div>

          {/* Annual */}
          <div
            className="p-7 rounded-2xl border flex flex-col"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.025)' }}
          >
            <div className="mb-6">
              <p className="text-sm font-medium mb-2" style={{ color: 'rgba(245,237,214,0.50)' }}>Anual</p>
              <div className="flex items-end gap-1">
                <span className="font-heading font-bold text-4xl" style={{ color: '#F5EDD6' }}>$54.99</span>
                <span className="pb-1 text-sm" style={{ color: 'rgba(245,237,214,0.35)' }}>/año</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(165,191,255,0.8)' }}>
                equivale a $4.58/mes · ahorrás 39%
              </p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-8">
              {ANNUAL_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,237,214,0.65)' }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(79,127,255,0.65)' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.open('https://okapi.lemonsqueezy.com/checkout/buy/5ff74d23-3258-4d10-a5fb-8f3d96e08e6f', '_blank')}
              className="block w-full text-center font-medium py-2.5 rounded-xl text-sm border transition-all duration-200"
              style={{ borderColor: 'rgba(79,127,255,0.4)', color: '#A5BFFF', backgroundColor: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(79,127,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Elegir plan
            </button>
          </div>

        </div>

        {/* Skip link */}
        <p className="text-center mt-8 text-sm" style={{ color: 'rgba(245,237,214,0.30)' }}>
          <Link
            to="/projects"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'rgba(245,237,214,0.30)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(245,237,214,0.60)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,237,214,0.30)'}
          >
            Continuar sin suscripción por ahora
          </Link>
        </p>

        {/* Dev bypass */}
        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(245,237,214,0.15)' }}>
          <Link
            to="/projects"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'rgba(245,237,214,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(245,237,214,0.40)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,237,214,0.15)'}
          >
            Continuar sin suscripción (modo prueba)
          </Link>
        </p>
      </div>

    </div>
  )
}
