import { useState } from 'react'
import { CheckCircle, Zap, Crown, ArrowRight, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createCheckoutSession } from '../../services/api'

export default function PricingPlans({ currentPlan }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(null)

  const PLANS = [
    {
      id: 'monthly',
      name: t('pricing.monthly'),
      price: '$7.45',
      period: t('pricing.monthlyPeriod'),
      annualNote: null,
      icon: Zap,
      color: 'border-primary-200 hover:border-primary-400',
      badge: null,
      features: [
        t('pricing.monthlyFeature1'),
        t('pricing.monthlyFeature2'),
        t('pricing.monthlyFeature3'),
        t('pricing.monthlyFeature4'),
        t('pricing.monthlyFeature5'),
      ],
    },
    {
      id: 'annual',
      name: t('pricing.annual'),
      price: '$34.99',
      period: t('pricing.annualPeriod'),
      annualNote: t('pricing.annualSaving'),
      icon: Crown,
      color: 'border-accent-400 hover:border-accent-500',
      badge: t('pricing.bestValue'),
      features: [
        t('pricing.annualFeature1'),
        t('pricing.annualFeature2'),
        t('pricing.annualFeature3'),
        t('pricing.annualFeature4'),
        t('pricing.annualFeature5'),
        t('pricing.annualFeature6'),
      ],
    },
  ]

  const handleSubscribe = async (planId) => {
    setLoading(planId)
    try {
      const { data } = await createCheckoutSession(planId)
      window.location.href = data.url
    } catch {
      alert(t('subscription.failedCheckout'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {PLANS.map(({ id, name, price, period, annualNote, icon: Icon, color, badge, features }) => {
        const isActive = currentPlan?.plan === id && currentPlan?.status === 'active'
        return (
          <div
            key={id}
            className={`card relative border-2 transition-all duration-200 ${color} ${isActive ? 'ring-2 ring-primary-500' : ''}`}
          >
            {badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {badge}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${id === 'annual' ? 'bg-accent-100' : 'bg-primary-100'}`}>
                <Icon className={`w-5 h-5 ${id === 'annual' ? 'text-accent-600' : 'text-primary-600'}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{name}</h3>
                {annualNote && (
                  <span className="text-xs text-green-600 font-medium">{annualNote}</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{price}</span>
              <span className="text-gray-500">{period}</span>
            </div>

            <ul className="space-y-2.5 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive ? (
              <div className="w-full text-center py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200 text-sm">
                {t('pricing.currentPlan')}
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(id)}
                disabled={loading === id}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  id === 'annual'
                    ? 'bg-accent-600 hover:bg-accent-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                } disabled:opacity-60`}
              >
                {loading === id ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>{t('pricing.getStarted')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
