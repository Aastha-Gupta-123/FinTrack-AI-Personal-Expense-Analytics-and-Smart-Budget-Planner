import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FaMoon, FaSun, FaBell, FaShieldHalved, FaGlobe,
  FaIndianRupeeSign, FaRightFromBracket, FaCircleCheck,
  FaTriangleExclamation, FaXmark,
} from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-xl
      ${type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
  >
    {type === 'error' ? <FaTriangleExclamation /> : <FaCircleCheck />}
    {message}
    <button onClick={onClose}><FaXmark /></button>
  </motion.div>
)

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition-colors duration-200
      ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
      ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
)

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-center gap-3">
      <Icon className={`text-lg ${iconColor}`} />
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
)

// ─── Row ──────────────────────────────────────────────────────────────────────
const SettingRow = ({ label, sub, children }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
    {children}
  </div>
)

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
const Settings = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [toast, setToast] = useState(null)

  // Persisted settings
  const [darkMode,  setDarkMode]  = useState(() => localStorage.getItem('theme') === 'dark')
  const [currency,  setCurrency]  = useState(() => localStorage.getItem('currency') || 'INR')
  const [language,  setLanguage]  = useState(() => localStorage.getItem('language') || 'en')
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_prefs') || '{}') }
    catch { return {} }
  })

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const saveCurrency = (val) => {
    setCurrency(val)
    localStorage.setItem('currency', val)
    notify(`Currency set to ${val}`)
  }

  const saveLanguage = (val) => {
    setLanguage(val)
    localStorage.setItem('language', val)
    notify('Language preference saved')
  }

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    localStorage.setItem('notif_prefs', JSON.stringify(updated))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notifOptions = [
    { key: 'budget_alerts',    label: 'Budget Alerts',         sub: 'Notify when budget is exceeded' },
    { key: 'expense_added',    label: 'Expense Added',         sub: 'Confirm each expense entry' },
    { key: 'income_added',     label: 'Income Added',          sub: 'Confirm each income entry' },
    { key: 'monthly_reminder', label: 'Monthly Budget Reminder', sub: 'Remind at start of each month' },
    { key: 'weekly_reports',   label: 'Weekly Reports',        sub: 'Summary every Monday' },
  ]

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm font-medium text-indigo-600">Settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Preferences & Account</h2>
        <p className="mt-1 text-sm text-slate-500">Personalise your FinTrack AI experience.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Theme */}
        <SectionCard icon={darkMode ? FaMoon : FaSun} iconColor={darkMode ? 'text-indigo-600' : 'text-amber-500'} title="Theme Preferences">
          <div className="space-y-3">
            <SettingRow label="Dark Mode" sub="Switch between light and dark interface">
              <Toggle checked={darkMode} onChange={(v) => { setDarkMode(v); notify(v ? 'Dark mode enabled' : 'Light mode enabled') }} />
            </SettingRow>
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition
                  ${!darkMode ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <FaSun /> Light
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition
                  ${darkMode ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <FaMoon /> Dark
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Currency & Language */}
        <SectionCard icon={FaGlobe} iconColor="text-cyan-500" title="Regional Settings">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Currency</label>
              <select
                value={currency}
                onChange={(e) => saveCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.label} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Language</label>
              <select
                value={language}
                onChange={(e) => saveLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
              Selected currency: <span className="font-semibold">{CURRENCIES.find((c) => c.code === currency)?.symbol} {currency}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Notifications */}
      <SectionCard icon={FaBell} iconColor="text-amber-500" title="Notification Preferences">
        <div className="space-y-3">
          {notifOptions.map(({ key, label, sub }) => (
            <SettingRow key={key} label={label} sub={sub}>
              <Toggle
                checked={notifPrefs[key] !== false}
                onChange={() => toggleNotif(key)}
              />
            </SettingRow>
          ))}
        </div>
      </SectionCard>

      {/* Account */}
      <SectionCard icon={FaShieldHalved} iconColor="text-emerald-600" title="Account Preferences">
        <div className="space-y-3">
          <SettingRow label="Two-Factor Authentication" sub="Coming soon">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Soon</span>
          </SettingRow>
          <SettingRow label="Data Export" sub="Download all your financial data">
            <button
              onClick={() => notify('Data export coming soon', 'error')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Export
            </button>
          </SettingRow>
          <SettingRow label="Delete Account" sub="Permanently remove your account and data">
            <button
              onClick={() => notify('Please contact support to delete your account', 'error')}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"
            >
              Delete
            </button>
          </SettingRow>
        </div>
      </SectionCard>

      {/* Logout */}
      <div className="rounded-[28px] border border-rose-100 bg-rose-50/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Sign Out</p>
            <p className="text-sm text-slate-500">You will be redirected to the login page.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600"
          >
            <FaRightFromBracket /> Sign Out
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Settings
