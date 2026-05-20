import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function RegisterForm() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return t('auth.passwordMinLength')
    if (!/[A-Z]/.test(pwd)) return t('auth.passwordNeedsUppercase')
    if (!/[0-9]/.test(pwd)) return t('auth.passwordNeedsNumber')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { fullName, email, password, confirmPassword } = form

    if (!fullName || !email || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'))
      return
    }
    const pwdError = validatePassword(password)
    if (pwdError) { setError(pwdError); return }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'))
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName)
      setSuccess(true)
      setTimeout(() => navigate('/app'), 2000)
    } catch (err) {
      setError(err.message || t('auth.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const pwd = form.password
    if (!pwd) return null
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const levels = [
      { label: t('auth.passwordWeak'), color: 'bg-red-400' },
      { label: t('auth.passwordFair'), color: 'bg-yellow-400' },
      { label: t('auth.passwordGood'), color: 'bg-blue-400' },
      { label: t('auth.passwordStrong'), color: 'bg-green-500' },
    ]
    return { score, ...levels[score - 1] }
  }

  const strength = passwordStrength()

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{t('auth.accountCreated')}</h3>
        <p className="text-gray-500 text-sm text-center">{t('auth.redirectingToDashboard')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          {t('auth.fullName')}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            placeholder={t('auth.namePlaceholder')}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('auth.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('auth.password')}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('auth.minChars')}
            className="input-field pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {strength && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength.score ? strength.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">{t('auth.passwordStrengthLabel', { label: strength.label })}</p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          {t('auth.confirmPassword')}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t('auth.repeatPassword')}
            className="input-field pl-10"
          />
          {form.confirmPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {form.password === form.confirmPassword
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <AlertCircle className="w-4 h-4 text-red-400" />
              }
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('auth.creatingAccount')}
          </>
        ) : t('auth.createAccountBtn')}
      </button>

      <p className="text-center text-sm text-gray-600">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  )
}
