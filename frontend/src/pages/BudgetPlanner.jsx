import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPiggyBank, FaWallet, FaTriangleExclamation, FaCircleCheck,
  FaPen, FaTrash, FaPlus, FaXmark, FaChartLine,
} from 'react-icons/fa6'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import Loader from '../components/Loader'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../services/dashboardApi'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-xl
      ${type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
  >
    {type === 'error' ? <FaTriangleExclamation /> : <FaCircleCheck />}
    {message}
    <button onClick={onClose}><FaXmark /></button>
  </motion.div>
)

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, status }) => {
  const color =
    status === 'Overspent' ? 'from-rose-500 to-red-400' :
    status === 'Warning'   ? 'from-amber-500 to-yellow-400' :
                             'from-indigo-500 to-cyan-400'
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>Budget used</span>
        <span>{Math.min(pct, 100).toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-3 rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}

// ─── Budget Form ──────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const BudgetForm = ({ initial, onSubmit, onCancel, loading }) => {
  const now = new Date()
  const [form, setForm] = useState({
    month: initial?.month ?? now.getMonth() + 1,
    year: initial?.year ?? now.getFullYear(),
    monthly_budget: initial?.monthly_budget ?? '',
  })

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        {initial ? 'Edit Budget' : 'Set Monthly Budget'}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Month</label>
          <select
            name="month"
            value={form.month}
            onChange={handle}
            disabled={!!initial}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Year</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handle}
            disabled={!!initial}
            min="2000"
            max="2100"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Monthly Budget ($)</label>
          <input
            type="number"
            name="monthly_budget"
            value={form.monthly_budget}
            onChange={handle}
            min="0.01"
            step="0.01"
            placeholder="e.g. 3000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <PrimaryButton onClick={() => onSubmit(form)} disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Budget' : 'Set Budget'}
        </PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </motion.div>
  )
}

// ─── Budget Card ──────────────────────────────────────────────────────────────
const statusMeta = {
  Safe:      { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: FaCircleCheck },
  Warning:   { color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     icon: FaTriangleExclamation },
  Overspent: { color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200',       icon: FaTriangleExclamation },
}

const BudgetCard = ({ budget, suggestion, onEdit, onDelete }) => {
  const meta = statusMeta[budget.budget_status] || statusMeta.Safe
  const StatusIcon = meta.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">{MONTHS[budget.month - 1]} {budget.year}</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">${budget.monthly_budget.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">Monthly Budget</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <FaPen className="text-xs" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="rounded-xl border border-rose-100 bg-rose-50 p-2 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar pct={budget.usage_percentage} status={budget.budget_status} />

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Spent</p>
          <p className="mt-0.5 text-base font-semibold text-slate-800">${budget.spent_amount.toFixed(2)}</p>
        </div>
        <div className={`rounded-2xl p-3 ${budget.remaining_amount < 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
          <p className="text-xs text-slate-500">Remaining</p>
          <p className={`mt-0.5 text-base font-semibold ${budget.remaining_amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ${budget.remaining_amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`mt-4 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium ${meta.bg} ${meta.color}`}>
        <StatusIcon />
        {budget.budget_status}
        {budget.budget_status === 'Overspent' && ' — You have exceeded your budget!'}
        {budget.budget_status === 'Warning' && ' — Approaching budget limit'}
        {budget.budget_status === 'Safe' && ' — You are within budget'}
      </div>

      {/* Savings suggestion */}
      {suggestion && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          <FaChartLine className="mt-0.5 shrink-0" />
          {suggestion}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState([])
  const [suggestions, setSuggestions] = useState({})
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await getBudgets()
      setBudgets(res.data.data?.budgets || [])
    } catch {
      notify('Failed to load budgets', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleSubmit = async (form) => {
    if (!form.monthly_budget || Number(form.monthly_budget) <= 0) {
      notify('Budget must be greater than zero', 'error')
      return
    }
    setFormLoading(true)
    try {
      let res
      if (editTarget) {
        res = await updateBudget(editTarget.id, { monthly_budget: form.monthly_budget })
        notify('Budget updated successfully')
      } else {
        res = await createBudget(form)
        notify('Budget set successfully')
      }
      const { budget, suggestion } = res.data.data
      setSuggestions((prev) => ({ ...prev, [budget.id]: suggestion }))
      setShowForm(false)
      setEditTarget(null)
      fetchBudgets()
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to save budget', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (budget) => {
    setEditTarget(budget)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await deleteBudget(id)
      notify('Budget deleted')
      fetchBudgets()
    } catch {
      notify('Failed to delete budget', 'error')
    }
  }

  // Summary totals from current month budget
  const now = new Date()
  const currentBudget = budgets.find((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear())

  const summaryCards = [
    {
      label: 'Monthly Budget',
      value: currentBudget ? `$${currentBudget.monthly_budget.toFixed(2)}` : '—',
      icon: FaPiggyBank,
      accent: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Spent This Month',
      value: currentBudget ? `$${currentBudget.spent_amount.toFixed(2)}` : '—',
      icon: FaWallet,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Remaining',
      value: currentBudget ? `$${currentBudget.remaining_amount.toFixed(2)}` : '—',
      icon: FaChartLine,
      accent: currentBudget?.remaining_amount < 0 ? 'from-rose-500 to-red-400' : 'from-emerald-500 to-green-500',
    },
  ]

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Budget Planner</p>
            <h2 className="text-2xl font-semibold text-slate-900">Plan your month with confidence</h2>
          </div>
          {!showForm && (
            <PrimaryButton onClick={() => { setEditTarget(null); setShowForm(true) }} className="flex items-center gap-2">
              <FaPlus /> Set Budget
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Overspending warning banner */}
      <AnimatePresence>
        {currentBudget?.budget_status === 'Overspent' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700"
          >
            <FaTriangleExclamation className="text-lg" />
            ⚠ Overspending Alert: You have exceeded your budget for {MONTHS[currentBudget.month - 1]} {currentBudget.year}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ label, value, icon: Icon, accent }) => (
          <motion.div
            key={label}
            whileHover={{ y: -4 }}
            className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur"
          >
            <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
              <Icon className="text-lg" />
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Set / Edit form */}
      <AnimatePresence>
        {showForm && (
          <BudgetForm
            initial={editTarget}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditTarget(null) }}
            loading={formLoading}
          />
        )}
      </AnimatePresence>

      {/* Budget cards list */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white/60 py-16 text-slate-500">
          <FaPiggyBank className="mb-3 text-4xl text-slate-300" />
          <p className="font-medium">No budgets set yet</p>
          <p className="mt-1 text-sm">Click "Set Budget" to create your first monthly budget.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                suggestion={suggestions[b.id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default BudgetPlanner
