import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FaCircleUser, FaRightFromBracket } from 'react-icons/fa6'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, userName, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-semibold text-white">
            F
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">FinTrack AI</p>
            <p className="text-xs text-slate-500">Smart Budget Planner</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
              >
                <FaCircleUser className="text-indigo-500" />
                <span className="max-w-[100px] truncate text-sm font-medium text-slate-700">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-500"
                title="Sign out"
                aria-label="Sign out"
              >
                <FaRightFromBracket />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
            >
              <FaCircleUser />
              <span className="text-sm font-medium text-slate-700">Login</span>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar
