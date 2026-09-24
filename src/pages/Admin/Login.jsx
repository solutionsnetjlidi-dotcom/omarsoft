import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Monitor, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const { t } = useLang()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [email,     setEmail]    = useState('')
  const [password,  setPassword] = useState('')
  const [showPass,  setShowPass] = useState(false)
  const [loading,   setLoading]  = useState(false)
  const [error,     setError]    = useState(null)

  const from = location.state?.from?.pathname || '/admin'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(t('admin.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ocean/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-ocean flex items-center justify-center shadow-lg shadow-ocean/30">
                <Monitor size={22} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-extrabold">
                  <span className="text-white">OMAR</span>
                  <span className="text-ocean">SOFT</span>
                </div>
                <p className="text-white/40 text-[10px] tracking-widest">BACK-OFFICE</p>
              </div>
            </div>
          </div>

          {/* Headings */}
          <h1 className="text-2xl font-extrabold text-white text-center mb-1">
            {t('admin.login.title')}
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            {t('admin.login.subtitle')}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                {t('admin.login.email')}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@omarsoft.tn"
                className="w-full bg-white/10 border border-white/15 focus:border-ocean text-white placeholder:text-white/30 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ocean transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/15 focus:border-ocean text-white placeholder:text-white/30 px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ocean transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ocean hover:bg-ocean-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-ocean/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('admin.login.signingIn')}
                </>
              ) : (
                t('admin.login.signIn')
              )}
            </button>
          </form>

          {/* Back to site */}
          <div className="mt-6 text-center">
            <a href="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              ← Retour au site public
            </a>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-white/20 text-xs mt-4">
          OMARSOFT Back-Office v1.0.0
        </p>
      </div>
    </div>
  )
}
