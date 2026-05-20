import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import RegisterForm from '../components/auth/RegisterForm'
import OkapiLogo from '../components/shared/OkapiLogo'

export default function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user) navigate('/app')
  }, [user, navigate])

  const perks = [
    t('register.perk1'),
    t('register.perk2'),
    t('register.perk3'),
    t('register.perk4'),
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — same animated gradient */}
      <div className="hidden lg:flex lg:w-1/2 login-panel text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-electric-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-accent-500/08 blur-3xl pointer-events-none" />

        <OkapiLogo size={42} showText={true} className="relative z-10" />

        <div className="space-y-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t('register.freeTrial')}
            </div>
            <h1 className="text-4xl font-heading font-bold leading-tight mb-4">
              {t('register.tagline')}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">{t('register.taglineDesc')}</p>
          </div>

          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="bg-green-400/20 border border-green-400/20 rounded-full p-0.5">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                </div>
                <span className="text-slate-300">{perk}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-white/85 italic mb-4 text-sm leading-relaxed">{t('register.testimonial')}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-electric-500/30 border border-electric-500/20 rounded-full flex items-center justify-center font-bold text-sm text-electric-200">
                MR
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{t('register.testimonialName')}</p>
                <p className="text-slate-400 text-xs">{t('register.testimonialRole')}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 relative z-10">{t('register.plans')}</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-navy-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <OkapiLogo size={36} showText={true} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-slate-100">{t('auth.createAccount')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">{t('auth.freeTrialSubtitle')}</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-xs text-gray-400 text-center">
            {t('auth.termsPrefix')}{' '}
            <a href="#" className="underline">{t('auth.termsOfService')}</a>{' '}
            {t('auth.and')}{' '}
            <a href="#" className="underline">{t('auth.privacyPolicy')}</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
