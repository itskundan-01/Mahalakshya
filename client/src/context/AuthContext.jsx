// filepath: /client/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from token when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios
        .get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data)
          setLoading(false)
        })
        .catch(() => {
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // Add logout function
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}