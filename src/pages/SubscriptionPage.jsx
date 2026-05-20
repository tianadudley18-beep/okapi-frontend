import { useState, useEffect } from 'react'
import { CheckCircle, Calendar, CreditCard, AlertTriangle, ExternalLink, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getSubscription, createPortalSession } from '../services/api'
import PricingPlans from '../components/subscription/PricingPlans'

function SubscriptionStatus({ sub, t, lang }) {
  const isActive = sub?.status === 'active'
  const planLabel = sub?.plan === 'annual' ? t('subscription.annualPlan') : t('subscription.monthlyPlan')
  const renewDate = sub?.current_period_end
    ? new Date(sub.current_period_end * 1000).toLocaleDateString(lang.startsWith('es') ? 'es-ES' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className={`card border-2 ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {isActive ? planLabel : t('subscription.freePlan')}
            </p>
            <p className="text-sm text-gray-500">
              {isActive && renewDate ? (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('subscription.renews', { date: renewDate })}
                </span>
              ) : (
                t('subscription.limitedAccess')
              )}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? t('subscription.active') : t('subscription.free')}
        </span>
      </div>

      {isActive && (
        <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            t('subscription.unlimitedUploads'),
            t('subscription.fullDashboard'),
            t('subscription.aiChatFeature'),
          ].map((label) => (
            <div key={label} className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SubscriptionPage() {
  const { setSubscription } = useAuth()
  const { t, i18n } = useTranslation()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const openBillingPortal = async () => {
    setPortalLoading(true)
    try {
      const { data } = await createPortalSession()
      window.location.href = data.url
    } catch {
      // Portal not configured — fall through
    } finally {
      setPortalLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      setTimeout(() => {
        getSubscription()
          .then(({ data }) => {
            setSub(data.subscription)
            setSubscription(data.subscription)
          })
          .finally(() => setLoading(false))
      }, 2000)
      return
    }

    getSubscription()
      .then(({ data }) => {
        setSub(data.subscription)
        setSubscription(data.subscription)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setSubscription])

  const isSuccess = new URLSearchParams(window.location.search).get('success') === '1'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('subscription.title')}</h1>
        <p className="text-gray-500 mt-1">{t('subscription.subtitle')}</p>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">{t('subscription.paymentSuccess')}</p>
            <p className="text-sm">{t('subscription.paymentSuccessDesc')}</p>
          </div>
        </div>
      )}

      {new URLSearchParams(window.location.search).get('canceled') === '1' && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-yellow-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{t('subscription.checkoutCanceled')}</p>
        </div>
      )}

      {loading ? (
        <div className="card animate-pulse h-24 bg-gray-50" />
      ) : (
        <SubscriptionStatus sub={sub} t={t} lang={i18n.language} />
      )}

      {(!sub || sub?.status !== 'active') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('subscription.choosePlan')}</h2>
          <PricingPlans currentPlan={sub} />
        </div>
      )}

      {sub?.status === 'active' && (
        <div className="card border border-gray-200 space-y-4">
          <div>
            <p className="font-medium text-gray-700 dark:text-slate-300 mb-1">{t('subscription.manageBillingTitle')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('subscription.manageBillingDesc')}</p>
          </div>
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {portalLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {t('subscription.openPortal')}
          </button>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {t('subscription.cancelNote')}
          </p>
        </div>
      )}
    </div>
  )
}
