import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaTriangleExclamation } from 'react-icons/fa6'
import { DashboardCards } from '../components/Cards'
import { PrimaryButton } from '../components/Buttons'
import { DataTable } from '../components/Tables'
import { ChartCard } from '../components/ChartCards'
import Loader from '../components/Loader'
import { getDashboardChartData, getDashboardSummary, getRecentTransactions } from '../services/dashboardApi'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

const CHART_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#f97316', '#06b6d4']

const Dashboard = () => {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const [summaryRes, transactionsRes, chartsRes] = await Promise.all([
          getDashboardSummary(),
          getRecentTransactions(),
          getDashboardChartData(),
        ])
        setSummary(summaryRes.data.data)
        setTransactions(transactionsRes.data.data || [])
        setChartData(chartsRes.data.data)
      } catch {
        setError('Unable to load dashboard data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const currentDate = new Date().toLocaleDateString('en', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        <FaTriangleExclamation />
        {error}
      </div>
    )
  }

  const pieChartData = chartData?.expense_by_category?.length
    ? {
        labels: chartData.expense_by_category.map((item) => item.label),
        datasets: [{
          data: chartData.expense_by_category.map((item) => item.value),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      }
    : null

  const barChartData = chartData?.income_vs_expense
    ? {
        labels: chartData.income_vs_expense.labels,
        datasets: [
          { label: 'Income',  data: chartData.income_vs_expense.income,  backgroundColor: '#6366f1' },
          { label: 'Expense', data: chartData.income_vs_expense.expense, backgroundColor: '#f59e0b' },
        ],
      }
    : null

  const tableRows = Array.isArray(transactions)
    ? transactions.map((item) => ({
        date: item.date,
        category: item.category,
        type: item.type,
        amount: `$${parseFloat(item.amount).toFixed(2)}`,
      }))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Overview</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-900">
              {greeting}, {summary?.user_name || 'there'}.
            </h2>
            <p className="mt-2 text-slate-600">{currentDate}</p>
          </div>
          <PrimaryButton
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2"
          >
            <FaCalendarDays /> View Report <FaArrowRight />
          </PrimaryButton>
        </div>
      </div>

      {/* Summary Cards */}
      <DashboardCards summary={summary} />

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Monthly Income vs Expense" subtitle="Last recorded months">
          {barChartData ? (
            <div className="h-64">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              No data available
            </div>
          )}
        </ChartCard>

        <ChartCard title="Expense by Category" subtitle="All time">
          {pieChartData ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-56 w-56">
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              No chart data yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Recent Transactions</h3>
        </div>
        {tableRows.length > 0 ? (
          <DataTable
            headers={['Date', 'Category', 'Type', 'Amount']}
            rows={tableRows}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="text-sm">No transactions yet. Add your first expense or income!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
