/**
 * AuthContext — provides token-based auth state to the entire app.
 * Replaces scattered localStorage.getItem('token') checks.
 */
import { createContext, useContext, useCallback, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || '')

  const login = useCallback((accessToken, name) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user_name', name)
    setToken(accessToken)
    setUserName(name)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    setToken(null)
    setUserName('')
  }, [])

  const updateUserName = useCallback((name) => {
    localStorage.setItem('user_name', name)
    setUserName(name)
  }, [])

  return (
    <AuthContext.Provider value={{ token, userName, isAuthenticated: !!token, login, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
