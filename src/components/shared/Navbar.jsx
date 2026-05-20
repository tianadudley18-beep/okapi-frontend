import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, LogOut, Menu, X, Globe, Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import OkapiLogo from './OkapiLogo'
import AlertsBell from './AlertsBell'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const navItems = [
    { to: '/app', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/projects', label: t('nav.projects', 'Proyectos'), icon: Folder },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')
  }

  const isSpanish = i18n.language.startsWith('es')

  const navLinkClass = (to) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === to
        ? 'bg-electric-500/10 text-electric-500 dark:bg-electric-500/15 dark:text-electric-300'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/[0.07]'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur-md dark:bg-navy-900/95 dark:border-white/[0.08] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/app">
              <OkapiLogo size={36} showText={true} />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={navLinkClass(to)}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 dark:border-white/[0.12] dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-slate-100"
              title={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-3.5 h-3.5" />
              {isSpanish ? 'EN' : 'ES'}
            </button>

            {/* Alerts bell */}
            <AlertsBell />

            <span className="hidden md:block text-sm text-gray-500 dark:text-slate-500 truncate max-w-[140px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.signOut')}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/[0.08] bg-white dark:bg-navy-900 transition-colors duration-300">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-electric-500/10 text-electric-500 dark:bg-electric-500/15 dark:text-electric-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/[0.07]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] space-y-1">
              <div className="flex gap-2 px-1 pt-1">
                <button
                  onClick={toggleLanguage}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-white/[0.07] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {isSpanish ? 'English' : 'Español'}
                </button>
              </div>
              <p className="px-3 py-1 text-xs text-gray-400 dark:text-slate-600">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
