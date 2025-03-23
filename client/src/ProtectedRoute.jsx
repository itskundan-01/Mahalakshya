// filepath: /client/src/ProtectedRoute.jsx
import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  // While loading, render a simple loader (or nothing)
  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default ProtectedRoute