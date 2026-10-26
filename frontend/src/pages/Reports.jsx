import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaDownload, FaFileCsv, FaFilePdf, FaCalendarDays,
  FaArrowTrendUp, FaWallet, FaPiggyBank, FaReceipt,
  FaTriangleExclamation, FaCircleCheck, FaXmark,
} from 'react-icons/fa6'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js'
import Loader from '../components/Loader'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { getDailyReport, getWeeklyReport, getMonthlyReport, getYearlyReport } from '../services/dashboardApi'
import { exportPDF, exportCSV } from '../utils/exportHelpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

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

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ title, value, icon: Icon, accent }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur"
  >
    <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
  </motion.div>
)

// ─── Period Tabs ──────────────────────────────────────────────────────────────
const TABS = ['Daily', 'Weekly', 'Monthly', 'Yearly']

const MONTHS = [
  { label: 'January', value: 1 }, { label: 'February', value: 2 },
  { label: 'March', value: 3 },   { label: 'April', value: 4 },
  { label: 'May', value: 5 },     { label: 'June', value: 6 },
  { label: 'July', value: 7 },    { label: 'August', value: 8 },
  { label: 'September', value: 9 },{ label: 'October', value: 10 },
  { label: 'November', value: 11 },{ label: 'December', value: 12 },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i)

// ─── Main Page ────────────────────────────────────────────────────────────────
const Reports = () => {
  const [tab, setTab] = useState('Monthly')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const now = new Date()
  const [filters, setFilters] = useState({
    date: now.toISOString().split('T')[0],
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  })

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'Daily')   res = await getDailyReport({ date: filters.date })
      if (tab === 'Weekly')  res = await getWeeklyReport({ date: filters.date })
      if (tab === 'Monthly') res = await getMonthlyReport({ month: filters.month, year: filters.year })
      if (tab === 'Yearly')  res = await getYearlyReport({ year: filters.year })
      setReport(res.data.data)
    } catch {
      notify('Failed to load report', 'error')
    } finally {
      setLoading(false)
    }
  }, [tab, filters])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))

  // Chart data — pick the best breakdown available
  const chartData = (() => {
    const bd = report?.monthly_breakdown || report?.weekly_breakdown || report?.daily_breakdown
    if (!bd) return null
    return {
      labels: bd.labels,
      datasets: [
        { label: 'Income',  data: bd.income,  backgroundColor: '#6366f1' },
        { label: 'Expense', data: bd.expense, backgroundColor: '#f59e0b' },
      ],
    }
  })()

  const summaryCards = report ? [
    { title: 'Total Income',   value: `$${report.total_income.toFixed(2)}`,   icon: FaWallet,       accent: 'from-indigo-500 to-violet-500' },
    { title: 'Total Expenses', value: `$${report.total_expenses.toFixed(2)}`, icon: FaArrowTrendUp, accent: 'from-amber-500 to-orange-500' },
    { title: 'Total Savings',  value: `$${report.total_savings.toFixed(2)}`,  icon: FaPiggyBank,    accent: 'from-emerald-500 to-green-500' },
    { title: 'Transactions',   value: String(report.transaction_count),        icon: FaReceipt,      accent: 'from-cyan-500 to-sky-500' },
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
            <p className="text-sm font-medium text-indigo-600">Reports</p>
            <h2 className="text-2xl font-semibold text-slate-900">Financial Reports & Insights</h2>
          </div>
          <div className="flex gap-3">
            <SecondaryButton
              className="flex items-center gap-2 text-sm"
              onClick={() => { if (report) { exportCSV(report, `fintrack_${tab.toLowerCase()}_report`); notify('CSV downloaded') } }}
              disabled={!report}
            >
              <FaFileCsv /> CSV
            </SecondaryButton>
            <PrimaryButton
              className="flex items-center gap-2 text-sm"
              onClick={() => { if (report) { exportPDF(report, `FinTrack ${tab} Report`); notify('PDF downloaded') } }}
              disabled={!report}
            >
              <FaFilePdf /> PDF
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition
              ${tab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
        <FaCalendarDays className="text-indigo-500" />
        {(tab === 'Daily' || tab === 'Weekly') && (
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilter('date', e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        )}
        {tab === 'Monthly' && (
          <>
            <select
              value={filters.month}
              onChange={(e) => handleFilter('month', Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              value={filters.year}
              onChange={(e) => handleFilter('year', Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
        {tab === 'Yearly' && (
          <select
            value={filters.year}
            onChange={(e) => handleFilter('year', Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <span className="ml-auto text-xs text-slate-400">Period: {report?.period || '—'}</span>
      </div>

      {loading ? <Loader /> : report && (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + JSON.stringify(filters)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((c) => <SummaryCard key={c.title} {...c} />)}
            </div>

            {/* Extra stats row */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Savings Rate</p>
                <h3 className="mt-1 text-2xl font-semibold text-emerald-600">{report.savings_percentage?.toFixed(1)}%</h3>
              </div>
              {report.remaining_budget != null && (
                <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Remaining Budget</p>
                  <h3 className={`mt-1 text-2xl font-semibold ${report.remaining_budget < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                    ${report.remaining_budget.toFixed(2)}
                  </h3>
                </div>
              )}
              {report.budget_utilization != null && (
                <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Budget Utilization</p>
                  <h3 className="mt-1 text-2xl font-semibold text-amber-600">{report.budget_utilization?.toFixed(1)}%</h3>
                </div>
              )}
            </div>

            {/* Chart */}
            {chartData && (
              <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Income vs Expense — {report.period}</h3>
                <div className="h-64">
                  <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            )}

            {/* Top Categories */}
            {report.top_categories?.length > 0 && (
              <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Spending Categories</h3>
                <div className="space-y-3">
                  {report.top_categories.map((cat, i) => {
                    const max = report.top_categories[0].amount
                    const pct = max ? Math.round((cat.amount / max) * 100) : 0
                    return (
                      <div key={cat.category}>
                        <div className="mb-1 flex justify-between text-sm text-slate-600">
                          <span>{i + 1}. {cat.category}</span>
                          <span>${cat.amount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {report.transactions?.length > 0 && (
              <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Transactions ({report.transaction_count})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-400">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Title</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {report.transactions.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="py-3 pr-4 text-slate-500">{t.date}</td>
                          <td className="py-3 pr-4 font-medium text-slate-800">{t.title}</td>
                          <td className="py-3 pr-4 text-slate-500">{t.category}</td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                              ${t.type === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className={`py-3 text-right font-semibold ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {report.transaction_count === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white/60 py-16 text-slate-500">
                <FaReceipt className="mb-3 text-4xl text-slate-300" />
                <p className="font-medium">No transactions for this period</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default Reports
