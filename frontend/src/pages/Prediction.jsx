import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBrain, FaChartLine, FaPiggyBank, FaWallet, FaFire,
  FaShieldHalved, FaTriangleExclamation, FaCircleCheck,
  FaLightbulb, FaArrowTrendUp, FaXmark, FaRotate,
} from 'react-icons/fa6'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js'
import Loader from '../components/Loader'
import { ChartCard } from '../components/ChartCards'
import {
  getPredictExpense, getBudgetRecommendation,
  getSpendingAnalysis, getSavingTips,
} from '../services/dashboardApi'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
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

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ h = 'h-40' }) => (
  <div className={`${h} animate-pulse rounded-2xl bg-slate-100`} />
)

// ─── Risk Badge ───────────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const styles = {
    High:   'bg-rose-50 border-rose-200 text-rose-700',
    Medium: 'bg-amber-50 border-amber-200 text-amber-700',
    Low:    'bg-emerald-50 border-emerald-200 text-emerald-700',
  }
  const icons = { High: FaFire, Medium: FaTriangleExclamation, Low: FaShieldHalved }
  const Icon = icons[level] || FaShieldHalved
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles[level] || styles.Low}`}>
      <Icon /> {level} Risk
    </span>
  )
}

// ─── Tip Card ─────────────────────────────────────────────────────────────────
const TipCard = ({ tip, index }) => {
  const styles = {
    critical: { border: 'border-rose-200',   bg: 'bg-rose-50',    text: 'text-rose-700',    icon: FaFire,              badge: 'bg-rose-100 text-rose-600' },
    warning:  { border: 'border-amber-200',  bg: 'bg-amber-50',   text: 'text-amber-700',   icon: FaTriangleExclamation, badge: 'bg-amber-100 text-amber-600' },
    info:     { border: 'border-indigo-200', bg: 'bg-indigo-50',  text: 'text-indigo-700',  icon: FaLightbulb,         badge: 'bg-indigo-100 text-indigo-600' },
  }
  const s = styles[tip.level] || styles.info
  const Icon = s.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border ${s.border} ${s.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${s.badge}`}>
          <Icon className="text-sm" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase ${s.text}`}>{tip.category}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>{tip.level}</span>
          </div>
          <p className={`mt-1 text-sm ${s.text}`}>{tip.message}</p>
          {tip.potential_saving > 0 && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              Potential monthly saving: <span className="text-emerald-600">${tip.potential_saving.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Model Accuracy Card ──────────────────────────────────────────────────────
const MetricPill = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-0.5 text-base font-semibold text-slate-900">{value}</p>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const Prediction = () => {
  const [prediction, setPrediction]   = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [analysis, setAnalysis]       = useState(null)
  const [tips, setTips]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [toast, setToast]             = useState(null)

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [predRes, recRes, anaRes, tipsRes] = await Promise.all([
        getPredictExpense(),
        getBudgetRecommendation(),
        getSpendingAnalysis(),
        getSavingTips(),
      ])
      setPrediction(predRes.data.data)
      setRecommendation(recRes.data.data)
      setAnalysis(anaRes.data.data)
      setTips(tipsRes.data.data)
      if (isRefresh) notify('AI insights refreshed')
    } catch {
      notify('Failed to load AI insights', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Chart data ──────────────────────────────────────────────────────────────

  const predLineData = prediction?.trend ? {
    labels: [...prediction.trend.labels, 'Next Month'],
    datasets: [
      {
        label: 'Actual Expense',
        data: [...prediction.trend.actuals, null],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Predicted',
        data: [...prediction.trend.actuals.map(() => null), prediction.predicted_expense],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.15)',
        borderDash: [6, 3],
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 6,
      },
    ],
  } : null

  const catSplitBarData = recommendation?.category_split ? {
    labels: Object.keys(recommendation.category_split),
    datasets: [{
      label: 'Recommended ($)',
      data: Object.values(recommendation.category_split),
      backgroundColor: ['#6366f1','#14b8a6','#f59e0b','#ec4899','#8b5cf6','#10b981','#f97316','#06b6d4'],
    }],
  } : null

  const trendLineData = analysis?.trend ? {
    labels: analysis.trend.labels,
    datasets: [
      { label: 'Income',  data: analysis.trend.income,  borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4 },
      { label: 'Expense', data: analysis.trend.expense, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4 },
      { label: 'Savings', data: analysis.trend.savings, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', fill: true, tension: 0.4 },
    ],
  } : null

  const catDoughnutData = analysis?.top_categories?.length ? {
    labels: analysis.top_categories.map((c) => c.category),
    datasets: [{
      data: analysis.top_categories.map((c) => c.amount),
      backgroundColor: ['#6366f1','#14b8a6','#f59e0b','#ec4899','#8b5cf6','#10b981'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  } : null

  const chartOpts = { responsive: true, maintainAspectRatio: false }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">AI & Machine Learning</p>
            <h2 className="text-2xl font-semibold text-slate-900">Smart Financial Predictions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Powered by Linear Regression & Random Forest · Trained on your financial history
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            <FaRotate className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh Insights'}
          </motion.button>
        </div>
      </div>

      {/* ── Synthetic data notice ───────────────────────────────────────────── */}
      {prediction?.used_synthetic && (
        <div className="flex items-center gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
          <FaTriangleExclamation />
          Limited transaction history detected — synthetic data was used to supplement model training. Add more records for personalised predictions.
        </div>
      )}

      {/* ── Row 1: Expense Prediction + Budget Recommendation ──────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Expense Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-3 text-white">
              <FaBrain className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Expense Prediction</h3>
              <p className="text-xs text-slate-500">Best model: <span className="font-medium text-indigo-600">{prediction?.best_model?.replace('_', ' ')}</span></p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <p className="text-sm text-slate-500">Predicted Next Month Expense</p>
            <h2 className="mt-1 text-3xl font-bold text-indigo-700">
              ${prediction?.predicted_expense?.toFixed(2) ?? '—'}
            </h2>
          </div>

          {predLineData ? (
            <div className="h-52">
              <Line data={predLineData} options={chartOpts} />
            </div>
          ) : <Skeleton />}
        </motion.div>

        {/* Budget Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-3 text-white">
              <FaPiggyBank className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Budget Recommendation</h3>
              <p className="text-xs text-slate-500">Based on income & spending history</p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <p className="text-sm text-slate-500">Recommended Monthly Budget</p>
            <h2 className="mt-1 text-3xl font-bold text-emerald-700">
              ${recommendation?.recommended_budget?.toFixed(2) ?? '—'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Savings rate: <span className="font-semibold text-emerald-600">{recommendation?.savings_rate?.toFixed(1)}%</span>
            </p>
          </div>

          {catSplitBarData ? (
            <div className="h-52">
              <Bar data={catSplitBarData} options={{ ...chartOpts, plugins: { legend: { display: false } }, indexAxis: 'y' }} />
            </div>
          ) : <Skeleton />}
        </motion.div>
      </div>

      {/* ── Model Accuracy Card ─────────────────────────────────────────────── */}
      {prediction?.all_metrics && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 p-3 text-white">
              <FaChartLine className="text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Model Evaluation</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {['linear_regression', 'random_forest'].map((model) => {
              const m = prediction.all_metrics[model]
              if (!m) return null
              const isBest = prediction.best_model === model
              return (
                <div key={model} className={`rounded-2xl border p-4 ${isBest ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 capitalize">{model.replace('_', ' ')}</p>
                    {isBest && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">Best</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricPill label="MAE"  value={`$${m.mae}`} />
                    <MetricPill label="RMSE" value={`$${m.rmse}`} />
                    <MetricPill label="MSE"  value={`$${m.mse}`} />
                    <MetricPill label="R²"   value={m.r2} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Spending Analysis ───────────────────────────────────────────────── */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Risk + stats row */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Avg Monthly Income',  value: `$${analysis.avg_monthly_income?.toFixed(2)}`,  icon: FaWallet,       accent: 'from-indigo-500 to-violet-500' },
              { label: 'Avg Monthly Expense', value: `$${analysis.avg_monthly_expense?.toFixed(2)}`, icon: FaArrowTrendUp, accent: 'from-amber-500 to-orange-500' },
              { label: 'Most Expensive Month',value: analysis.most_expensive_month?.period,           icon: FaFire,         accent: 'from-rose-500 to-red-400' },
              { label: 'Least Expensive Month',value: analysis.least_expensive_month?.period,         icon: FaShieldHalved, accent: 'from-emerald-500 to-green-500' },
            ].map(({ label, value, icon: Icon, accent }) => (
              <motion.div key={label} whileHover={{ y: -4 }}
                className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur"
              >
                <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
                  <Icon className="text-lg" />
                </div>
                <p className="text-sm text-slate-500">{label}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Overspending risk banner */}
          {analysis.overspending_risk && (
            <div className={`flex items-center gap-3 rounded-[24px] border px-5 py-4 text-sm font-medium
              ${analysis.overspending_risk.level === 'High'   ? 'border-rose-200 bg-rose-50 text-rose-700' :
                analysis.overspending_risk.level === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                                                 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
            >
              <RiskBadge level={analysis.overspending_risk.level} />
              <span>{analysis.overspending_risk.message}</span>
              <span className="ml-auto text-xs opacity-70">Z-score: {analysis.overspending_risk.z_score}</span>
            </div>
          )}

          {/* Charts */}
          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Income vs Expense vs Savings Trend" subtitle="Last 12 months">
              {trendLineData
                ? <div className="h-64"><Line data={trendLineData} options={chartOpts} /></div>
                : <Skeleton h="h-64" />}
            </ChartCard>
            <ChartCard title="Spending by Category" subtitle="All time">
              {catDoughnutData
                ? <div className="flex h-64 items-center justify-center"><div className="h-56 w-56"><Doughnut data={catDoughnutData} options={{ ...chartOpts, cutout: '65%' }} /></div></div>
                : <Skeleton h="h-64" />}
            </ChartCard>
          </div>

          {/* Top categories table */}
          {analysis.top_categories?.length > 0 && (
            <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Spending Categories</h3>
              <div className="space-y-3">
                {analysis.top_categories.map((cat, i) => (
                  <div key={cat.category}>
                    <div className="mb-1 flex justify-between text-sm text-slate-600">
                      <span>{i + 1}. {cat.category}</span>
                      <span>${cat.amount.toFixed(2)} <span className="text-slate-400">({cat.percentage}%)</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Saving Tips ─────────────────────────────────────────────────────── */}
      {tips && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 text-white">
              <FaLightbulb className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Personalised Saving Tips</h3>
              <p className="text-xs text-slate-500">Generated from your financial patterns</p>
            </div>
          </div>

          {/* Summary strip */}
          {tips.summary && (
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Avg Income',  value: `$${tips.summary.avg_monthly_income?.toFixed(2)}` },
                { label: 'Avg Expense', value: `$${tips.summary.avg_monthly_expense?.toFixed(2)}` },
                { label: 'Avg Savings', value: `$${tips.summary.avg_savings?.toFixed(2)}` },
                { label: 'Savings Rate', value: `${tips.summary.savings_rate?.toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-0.5 text-base font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {tips.tips?.length > 0
              ? tips.tips.map((tip, i) => <TipCard key={i} tip={tip} index={i} />)
              : <p className="text-sm text-slate-500">No tips available yet. Add more financial records.</p>
            }
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Prediction
