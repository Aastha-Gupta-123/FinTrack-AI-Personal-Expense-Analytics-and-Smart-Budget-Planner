import { motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import BudgetPlanner from './pages/BudgetPlanner'
import Prediction from './pages/Prediction'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Pages that show the sidebar layout
const sidebarPages = [
  '/dashboard', '/expenses', '/income', '/transactions',
  '/reports', '/budget-planner', '/prediction', '/analytics',
  '/profile', '/settings',
]

function App() {
  const location = useLocation()
  const showSidebar = sidebarPages.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {showSidebar ? (
          <div className="flex flex-col gap-6 xl:flex-row">
            <Sidebar />
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="min-w-0 flex-1"
            >
              <Routes>
                <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/expenses"      element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                <Route path="/income"        element={<ProtectedRoute><Income /></ProtectedRoute>} />
                <Route path="/transactions"  element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/reports"       element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/budget-planner" element={<ProtectedRoute><BudgetPlanner /></ProtectedRoute>} />
                <Route path="/prediction"    element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
                <Route path="/analytics"     element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*"             element={<NotFound />} />
              </Routes>
            </motion.main>
          </div>
        ) : (
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Routes>
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*"         element={<NotFound />} />
            </Routes>
          </motion.main>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default App
