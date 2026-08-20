import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      if (token) {
        try {
          const { data } = await api.get('/me')
          if (data?.data) {
            setUser(data.data)
            localStorage.setItem('auth_user', JSON.stringify(data.data))
          } else if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        } catch {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/login', { username, password })
    const { token, user: userData } = data.data
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const value = { user, login, logout, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
