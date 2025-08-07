import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('[AUTH] Error al parsear userData', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password)
       console.log('[LOGIN] Respuesta del backend:', response.data) 

    
      const { token, user: userData } = response.data.data


      if (token && userData) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        console.log('[LOGIN] Token guardado:', token)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
