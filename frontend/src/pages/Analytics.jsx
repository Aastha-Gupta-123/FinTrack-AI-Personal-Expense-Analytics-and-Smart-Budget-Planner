import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaChartPie, FaArrowTrendUp, FaWallet,
  FaPiggyBank, FaFire, FaTriangleExclamation, FaCircleCheck, FaXmark,
} from 'react-icons/fa6'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import Loader from '../components/Loader'
import { ChartCard } from '../components/ChartCards'
import { getAnalytics } from '../services/dashboardApi'

ChartJS.register(
  ArcElement, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler, Tooltip, Legend,
)

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

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, accent }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur"
  >
    <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="mt-1 text-xl font-semibold text-slate-900">{value}</h3>
    {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
  </motion.div>
)

const CHART_COLORS = ['#6366f1','#14b8a6','#f59e0b','#ec4899','#8b5cf6','#10b981','#f97316','#06b6d4']

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i)

// ─── Main Page ────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const now = new Date()
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAnalytics({ month: filters.month, year: filters.year })
      setData(res.data.data)
    } catch {
      notify('Failed to load analytics', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) return <Loader />

  // ── Chart datasets ──────────────────────────────────────────────────────────

  const barData = data?.monthly_trend ? {
    labels: data.monthly_trend.labels,
    datasets: [
      { label: 'Income',  data: data.monthly_trend.income,  backgroundColor: '#6366f1' },
      { label: 'Expense', data: data.monthly_trend.expense, backgroundColor: '#f59e0b' },
    ],
  } : null

  const pieData = data?.category_breakdown?.length ? {
    labels: data.category_breakdown.map((c) => c.category),
    datasets: [{
      data: data.category_breakdown.map((c) => c.amount),
      backgroundColor: CHART_COLORS,
      borderWidth: 2,
      borderColor: '#fff',
    }],
  } : null

  const lineData = data?.savings_trend ? {
    labels: data.savings_trend.labels,
    datasets: [{
      label: 'Savings',
      data: data.savings_trend.values,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
    }],
  } : null

  const doughnutData = data?.budget_utilization ? {
    labels: ['Spent', 'Remaining'],
    datasets: [{
      data: [
        data.budget_utilization.spent,
        Math.max(data.budget_utilization.remaining, 0),
      ],
      backgroundColor: ['#f59e0b', '#6366f1'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  } : null

  const topCatBarData = data?.top_categories?.length ? {
    labels: data.top_categories.map((c) => c.category),
    datasets: [{
      label: 'Amount',
      data: data.top_categories.map((c) => c.amount),
      backgroundColor: CHART_COLORS.slice(0, data.top_categories.length),
    }],
  } : null

  const chartOpts = { responsive: true, maintainAspectRatio: false }

  const statCards = data ? [
    {
      title: 'Savings Rate',
      value: `${data.savings_percentage?.toFixed(1)}%`,
      sub: 'Overall savings',
      icon: FaPiggyBank,
      accent: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Total Income',
      value: `$${data.total_income?.toFixed(2)}`,
      sub: 'All time',
      icon: FaWallet,
      accent: 'from-indigo-500 to-violet-500',
    },
    {
      title: 'Total Expenses',
      value: `$${data.total_expenses?.toFixed(2)}`,
      sub: 'All time',
      icon: FaArrowTrendUp,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Highest Expense',
      value: data.highest_expense ? `$${data.highest_expense.amount.toFixed(2)}` : '—',
      sub: data.highest_expense?.title || '',
      icon: FaFire,
      accent: 'from-rose-500 to-red-400',
    },
    {
      title: 'Highest Income',
      value: data.highest_income ? `$${data.highest_income.amount.toFixed(2)}` : '—',
      sub: data.highest_income?.title || '',
      icon: FaChartLine,
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      title: 'Budget Utilization',
      value: data.budget_utilization ? `${data.budget_utilization.usage_pct?.toFixed(1)}%` : 'No budget',
      sub: data.budget_utilization?.status || 'Set a budget',
      icon: FaChartPie,
      accent: 'from-violet-500 to-purple-500',
    },
  ] : []

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Analytics</p>
            <h2 className="text-2xl font-semibold text-slate-900">Financial Analytics & Insights</h2>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.month}
              onChange={(e) => setFilters((f) => ({ ...f, month: Number(e.target.value) }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {MONTHS_SHORT.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters((f) => ({ ...f, year: Number(e.target.value) }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((c) => <StatCard key={c.title} {...c} />)}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Bar — Income vs Expense */}
        <ChartCard title="Income vs Expense" subtitle={`${filters.year}`}>
          {barData
            ? <div className="h-64"><Bar data={barData} options={chartOpts} /></div>
            : <EmptyChart />}
        </ChartCard>

        {/* Pie — Expense by Category */}
        <ChartCard title="Expense by Category" subtitle={`${MONTHS_SHORT[filters.month - 1]} ${filters.year}`}>
          {pieData
            ? <div className="h-64"><Pie data={pieData} options={chartOpts} /></div>
            : <EmptyChart />}
        </ChartCard>

        {/* Line — Savings Trend (Area) */}
        <ChartCard title="Savings Trend" subtitle={`${filters.year}`}>
          {lineData
            ? <div className="h-64"><Line data={lineData} options={chartOpts} /></div>
            : <EmptyChart />}
        </ChartCard>

        {/* Doughnut — Budget Utilization */}
        <ChartCard title="Budget Utilization" subtitle={`${MONTHS_SHORT[filters.month - 1]} ${filters.year}`}>
          {doughnutData ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-56 w-56">
                <Doughnut data={doughnutData} options={{ ...chartOpts, cutout: '70%' }} />
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <FaChartPie className="mb-2 text-3xl text-slate-300" />
              <p className="text-sm">No budget set for this month</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Categories Bar (full width) */}
      {topCatBarData && (
        <ChartCard title="Top Spending Categories" subtitle="All time">
          <div className="h-56">
            <Bar
              data={topCatBarData}
              options={{ ...chartOpts, plugins: { legend: { display: false } }, indexAxis: 'y' }}
            />
          </div>
        </ChartCard>
      )}

      {/* Highest Expense / Income highlight */}
      {(data?.highest_expense || data?.highest_income) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.highest_expense && (
            <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-5">
              <p className="text-xs font-medium uppercase text-rose-400">Highest Expense</p>
              <h3 className="mt-1 text-xl font-semibold text-rose-700">${data.highest_expense.amount.toFixed(2)}</h3>
              <p className="mt-1 text-sm text-rose-600">{data.highest_expense.title} · {data.highest_expense.category}</p>
              <p className="mt-0.5 text-xs text-rose-400">{data.highest_expense.date}</p>
            </div>
          )}
          {data.highest_income && (
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-medium uppercase text-emerald-400">Highest Income</p>
              <h3 className="mt-1 text-xl font-semibold text-emerald-700">${data.highest_income.amount.toFixed(2)}</h3>
              <p className="mt-1 text-sm text-emerald-600">{data.highest_income.title} · {data.highest_income.source}</p>
              <p className="mt-0.5 text-xs text-emerald-400">{data.highest_income.date}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const EmptyChart = () => (
  <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
    No data available
  </div>
)

export default Analytics
