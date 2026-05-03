// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ac_token')
    if (token) {
      authService.me()
        .then(profile => setUser(profile))
        .catch(() => localStorage.removeItem('ac_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await authService.login({ email, password })
    localStorage.setItem('ac_token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (body) => {
    // Solo crea la cuenta — NO guarda el token ni loguea automáticamente.
    // El usuario debe iniciar sesión manualmente después del registro.
    await authService.register(body)
  }

  const logout = () => {
    localStorage.removeItem('ac_token')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
