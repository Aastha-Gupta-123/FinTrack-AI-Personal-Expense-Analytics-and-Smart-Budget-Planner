import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFilter, FaMagnifyingGlass, FaArrowTrendUp, FaArrowTrendDown,
  FaTriangleExclamation, FaCircleCheck, FaXmark,
} from 'react-icons/fa6'
import Loader from '../components/Loader'
import { getExpenses, getIncomes } from '../services/dashboardApi'

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-xl
      ${type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
  >
    {type === 'error' ? <FaTriangleExclamation /> : <FaCircleCheck />}
    {message}
    <button onClick={onClose} aria-label="Close notification"><FaXmark /></button>
  </motion.div>
)

const TYPE_TABS = ['All', 'Income', 'Expense']

const Transactions = () => {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [typeTab, setTypeTab]   = useState('All')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [toast, setToast]       = useState(null)
  const perPage = 12

  const notify = (msg, type = 'error') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage, search, sort: 'date_desc' }
      const [expRes, incRes] = await Promise.all([
        typeTab !== 'Income' ? getExpenses(params) : Promise.resolve({ data: { data: { expenses: [], total: 0 } } }),
        typeTab !== 'Expense' ? getIncomes(params) : Promise.resolve({ data: { data: { incomes: [], total: 0 } } }),
      ])

      const expenses = (expRes.data.data.expenses || []).map((e) => ({
        id: `exp-${e.id}`,
        date: e.expense_date,
        title: e.title,
        category: e.category_name || 'General',
        type: 'Expense',
        amount: parseFloat(e.amount),
      }))
      const incomes = (incRes.data.data.incomes || []).map((i) => ({
        id: `inc-${i.id}`,
        date: i.income_date,
        title: i.title,
        category: i.source || 'Income',
        type: 'Income',
        amount: parseFloat(i.amount),
      }))

      const combined = [...expenses, ...incomes].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )
      setRows(combined)
      setTotal(expRes.data.data.total + incRes.data.data.total)
    } catch {
      notify('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [page, search, typeTab])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Reset page on filter change
  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleTab    = (t)   => { setTypeTab(t); setPage(1) }

  const totalIncome  = rows.filter((r) => r.type === 'Income').reduce((s, r) => s + r.amount, 0)
  const totalExpense = rows.filter((r) => r.type === 'Expense').reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm font-medium text-indigo-600">Transactions</p>
        <h2 className="text-2xl font-semibold text-slate-900">All financial activity in one place</h2>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
          <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-600"><FaArrowTrendUp /></div>
          <div>
            <p className="text-xs text-emerald-600">Total Income (this page)</p>
            <p className="text-lg font-semibold text-emerald-700">${totalIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[24px] border border-rose-100 bg-rose-50 p-4">
          <div className="rounded-2xl bg-rose-100 p-2.5 text-rose-600"><FaArrowTrendDown /></div>
          <div>
            <p className="text-xs text-rose-600">Total Expense (this page)</p>
            <p className="text-lg font-semibold text-rose-700">${totalExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaMagnifyingGlass className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Search transactions"
          />
        </label>
        <div className="flex gap-2" role="tablist" aria-label="Filter by type">
          {TYPE_TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={typeTab === t}
              onClick={() => handleTab(t)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition
                ${typeTab === t
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white/60 py-16 text-slate-400">
          <FaFilter className="mb-3 text-3xl text-slate-300" />
          <p className="font-medium">No transactions found</p>
          <p className="mt-1 text-sm">Try adjusting your search or adding income/expense records.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                        ${row.type === 'Income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-600'}`}>
                        {row.type === 'Income' ? <FaArrowTrendUp className="text-[10px]" /> : <FaArrowTrendDown className="text-[10px]" />}
                        {row.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold
                      ${row.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {row.type === 'Income' ? '+' : '-'}${row.amount.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing {rows.length} records{total > rows.length && ` of ${total} total`}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={rows.length < perPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Transactions
