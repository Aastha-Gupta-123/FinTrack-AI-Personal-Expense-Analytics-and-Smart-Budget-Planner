/**
 * Centralized Axios instance with:
 * - Auto-attach JWT Bearer token
 * - 401 → redirect to /login
 * - Consistent base URL
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('user_name')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const getDashboardSummary      = ()       => api.get('/dashboard/summary')
export const getRecentTransactions    = ()       => api.get('/dashboard/recent-transactions')
export const getDashboardChartData    = ()       => api.get('/dashboard/chart-data')

// ── Expenses ───────────────────────────────────────────────────────────────────
export const getExpenses    = (params)      => api.get('/expenses', { params })
export const createExpense  = (payload)     => api.post('/expenses', payload)
export const getExpense     = (id)          => api.get(`/expenses/${id}`)
export const updateExpense  = (id, payload) => api.put(`/expenses/${id}`, payload)
export const deleteExpense  = (id)          => api.delete(`/expenses/${id}`)

// ── Income ─────────────────────────────────────────────────────────────────────
export const getIncomes     = (params)      => api.get('/income', { params })
export const createIncome   = (payload)     => api.post('/income', payload)
export const getIncome      = (id)          => api.get(`/income/${id}`)
export const updateIncome   = (id, payload) => api.put(`/income/${id}`, payload)
export const deleteIncome   = (id)          => api.delete(`/income/${id}`)

// ── Budget ─────────────────────────────────────────────────────────────────────
export const getBudgets     = ()            => api.get('/budget')
export const createBudget   = (payload)     => api.post('/budget', payload)
export const getBudget      = (id)          => api.get(`/budget/${id}`)
export const updateBudget   = (id, payload) => api.put(`/budget/${id}`, payload)
export const deleteBudget   = (id)          => api.delete(`/budget/${id}`)

// ── Reports ────────────────────────────────────────────────────────────────────
export const getDailyReport   = (params) => api.get('/reports/daily',   { params })
export const getWeeklyReport  = (params) => api.get('/reports/weekly',  { params })
export const getMonthlyReport = (params) => api.get('/reports/monthly', { params })
export const getYearlyReport  = (params) => api.get('/reports/yearly',  { params })
export const getAnalytics     = (params) => api.get('/reports/analytics', { params })

// ── Machine Learning ───────────────────────────────────────────────────────────
export const getPredictExpense       = () => api.get('/ml/predict-expense')
export const getBudgetRecommendation = () => api.get('/ml/budget-recommendation')
export const getSpendingAnalysis     = () => api.get('/ml/spending-analysis')
export const getSavingTips           = () => api.get('/ml/saving-tips')

// ── Profile ────────────────────────────────────────────────────────────────────
export const getProfile          = ()          => api.get('/profile')
export const updateProfile       = (payload)   => api.put('/profile', payload)
export const uploadProfilePicture = (formData) =>
  api.post('/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteProfilePicture = ()         => api.delete('/profile/picture')
export const changePassword      = (payload)   => api.put('/profile/change-password', payload)

// ── Notifications ──────────────────────────────────────────────────────────────
export const getNotifications      = ()    => api.get('/notifications')
export const markNotificationsRead = (id)  => api.post('/notifications/read', id ? { notification_id: id } : {})
export const deleteNotification    = (id)  => api.delete(`/notifications/${id}`)

export default api
