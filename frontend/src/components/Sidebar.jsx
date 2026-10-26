import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaChartPie, FaReceipt, FaWallet, FaArrowRightArrowLeft,
  FaPiggyBank, FaBrain, FaChartLine, FaUser, FaGear, FaRightFromBracket,
  FaChartBar,
} from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard',      label: 'Dashboard',     icon: FaChartPie },
  { to: '/expenses',       label: 'Expenses',       icon: FaReceipt },
  { to: '/income',         label: 'Income',         icon: FaWallet },
  { to: '/transactions',   label: 'Transactions',   icon: FaArrowRightArrowLeft },
  { to: '/budget-planner', label: 'Budget Planner', icon: FaPiggyBank },
  { to: '/reports',        label: 'Reports',        icon: FaChartBar },
  { to: '/prediction',     label: 'AI Prediction',  icon: FaBrain },
  { to: '/analytics',      label: 'Analytics',      icon: FaChartLine },
  { to: '/profile',        label: 'Profile',        icon: FaUser },
  { to: '/settings',       label: 'Settings',       icon: FaGear },
]

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userName, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full shrink-0 rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur xl:w-72"
    >
      {/* User greeting */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 p-4 text-white">
        <p className="text-sm font-medium text-indigo-100">Welcome back</p>
        <h2 className="mt-1 truncate text-xl font-semibold">{userName || 'User'}</h2>
      </div>

      {/* Navigation links */}
      <nav className="space-y-1" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon className="shrink-0 text-base" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* AI promo */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-800">Need more insight?</p>
        <p className="mt-1 text-xs text-slate-500">Explore AI prediction and analytics modules.</p>
        <Link
          to="/prediction"
          className="mt-3 inline-block rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          Explore AI
        </Link>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-rose-500"
        aria-label="Sign out"
      >
        <FaRightFromBracket aria-hidden="true" />
        Sign Out
      </button>
    </motion.aside>
  )
}

export default Sidebar
