import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTriangleExclamation } from 'react-icons/fa6'
import { PrimaryButton } from '../components/Buttons'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address'
    if (!form.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    setServerError('')
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, form)
      const { access_token, user } = res.data.data
      login(access_token, user.full_name)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-8 text-white">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">F</div>
            <h2 className="text-3xl font-semibold">Welcome back</h2>
            <p className="mt-3 text-indigo-100">Access your budget dashboard and keep your money habits thriving.</p>
            <div className="mt-10 space-y-3">
              {['Track every expense', 'AI-powered predictions', 'Smart budget planning'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="p-8 sm:p-10">
            <h3 className="text-2xl font-semibold text-slate-900">Login to FinTrack AI</h3>
            <p className="mt-2 text-sm text-slate-500">Enter your account details to continue.</p>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <FaTriangleExclamation className="shrink-0" />
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-400
                      ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-400
                      ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="accent-indigo-600" /> Remember me
                </label>
                <span className="text-indigo-600 hover:underline cursor-pointer">Forgot password?</span>
              </div>

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  <>Sign In <FaArrowRight /></>
                )}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
