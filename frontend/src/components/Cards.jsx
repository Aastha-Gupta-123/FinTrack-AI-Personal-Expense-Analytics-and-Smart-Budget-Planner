import { motion } from 'framer-motion'
import { FaArrowTrendUp, FaWallet, FaPiggyBank, FaChartLine } from 'react-icons/fa6'

export const StatCard = ({ title, value, subtitle, icon: Icon, accent }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.01 }}
    className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur"
  >
    <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
      <Icon className="text-xl" />
    </div>
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
  </motion.div>
)

export const DashboardCards = ({ summary }) => {
  const statCards = [
    { title: 'Total Income', value: `$${(summary?.total_income ?? 0).toFixed(2)}`, subtitle: 'Tracked income', icon: FaWallet, accent: 'from-indigo-500 to-violet-500' },
    { title: 'Total Expense', value: `$${(summary?.total_expenses ?? 0).toFixed(2)}`, subtitle: 'Tracked spending', icon: FaArrowTrendUp, accent: 'from-cyan-500 to-sky-500' },
    { title: 'Savings', value: `$${(summary?.total_savings ?? 0).toFixed(2)}`, subtitle: 'Current balance', icon: FaPiggyBank, accent: 'from-emerald-500 to-green-500' },
    {
      title: 'Remaining Budget',
      value: `$${(summary?.remaining_budget ?? 0).toFixed(2)}`,
      subtitle: summary?.monthly_budget ? `${(summary?.budget_usage ?? 0).toFixed(1)}% of $${(summary.monthly_budget).toFixed(2)} used` : 'No budget set',
      icon: FaChartLine,
      accent: (summary?.budget_usage ?? 0) > 90 ? 'from-rose-500 to-red-400' : (summary?.budget_usage ?? 0) > 70 ? 'from-amber-500 to-orange-500' : 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}

export default function Cards() {
  return null
}
