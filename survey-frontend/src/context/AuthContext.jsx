import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    let mounted = true

    const rehydrate = async () => {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (!token) {
        if (mounted) setLoading(false)
        return
      }

      if (stored) {
        try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
      }

      try {
        const { data } = await authApi.me()
        if (!mounted) return
        setUser(data.data)
        localStorage.setItem('user', JSON.stringify(data.data))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    rehydrate()
    return () => { mounted = false }
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (info) => {
    const { data } = await authApi.register(info)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const { data } = await authApi.updateMe(payload)
    const updatedUser = data.data
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return data
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
