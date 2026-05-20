import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Zap, Shield, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import OkapiLogo from '../components/shared/OkapiLogo'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user) navigate('/app')
  }, [user, navigate])

  const features = [
    { icon: BarChart3, title: t('login.feature1Title'), desc: t('login.feature1Desc') },
    { icon: Zap, title: t('login.feature2Title'), desc: t('login.feature2Desc') },
    { icon: Shield, title: t('login.feature3Title'), desc: t('login.feature3Desc') },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — animated gradient */}
      <div className="hidden lg:flex lg:w-1/2 login-panel text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-electric-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        <OkapiLogo size={42} showText={true} className="relative z-10" />

        <div className="space-y-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5 text-cream-DEFAULT" />
              <span className="text-cream-100">Your data. Your edge.</span>
            </div>
            <h1 className="text-4xl font-heading font-bold leading-tight mb-4">
              {t('login.tagline')}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">{t('login.taglineDesc')}</p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 group">
                <div className="bg-electric-500/20 border border-electric-500/20 rounded-xl p-2.5 flex-shrink-0 group-hover:bg-electric-500/30 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-electric-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm text-slate-400 relative z-10 flex-wrap">
          <span>{t('login.trustedBy')}</span>
          <span className="text-slate-600">·</span>
          <span>{t('login.uptime')}</span>
          <span className="text-slate-600">·</span>
          <span>{t('login.soc2')}</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-navy-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <OkapiLogo size={36} showText={true} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-slate-100">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">{t('auth.signInToAccess')}</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
