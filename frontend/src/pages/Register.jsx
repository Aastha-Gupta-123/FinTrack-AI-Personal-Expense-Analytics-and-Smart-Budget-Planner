import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaEye, FaEyeSlash, FaTriangleExclamation } from 'react-icons/fa6'
import { PrimaryButton } from '../components/Buttons'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[0-9\-\s]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
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
      await axios.post(`${API_BASE}/auth/register`, form)
      // Auto-login after registration
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: form.email,
        password: form.password,
      })
      const { access_token, user } = loginRes.data.data
      login(access_token, user.full_name)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Ava Johnson', autoComplete: 'name' },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 890', autoComplete: 'tel' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com', autoComplete: 'email' },
  ]

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">F</div>
            <h2 className="text-3xl font-semibold">Create your account</h2>
            <p className="mt-3 text-emerald-50">Join FinTrack AI and build a brighter financial future.</p>
            <div className="mt-10 space-y-3">
              {['Free forever plan', 'AI-powered insights', 'Secure & private'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="p-8 sm:p-10">
            <h3 className="text-2xl font-semibold text-slate-900">Start your journey</h3>
            <p className="mt-2 text-sm text-slate-500">Create your FinTrack AI account in seconds.</p>

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
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map(({ name, label, type, placeholder, autoComplete }) => (
                  <div key={name}>
                    <label htmlFor={`reg-${name}`} className="mb-1 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      id={`reg-${name}`}
                      type={type}
                      name={name}
                      autoComplete={autoComplete}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`w-full rounded-2xl border py-3 px-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-emerald-400
                        ${errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    />
                    {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name]}</p>}
                  </div>
                ))}
              </div>

              {/* Password fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={`w-full rounded-2xl border py-3 pl-4 pr-10 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-emerald-400
                        ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      autoComplete="new-password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full rounded-2xl border py-3 pl-4 pr-10 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-emerald-400
                        ${errors.confirm_password ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="mt-1 text-xs text-rose-600">{errors.confirm_password}</p>}
                </div>
              </div>

              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Account…
                  </span>
                ) : (
                  <>Create Account <FaArrowRight /></>
                )}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
