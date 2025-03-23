//// filepath: /client/src/AdminPanel.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify'

function AdminPanel() {
  const [stats, setStats] = useState({})
  
  useEffect(() => {
    // Fetch some backend statistics (dummy endpoint).
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/stats`)
        setStats(res.data)
        toast.success('Admin panel loaded')
      } catch (error) {
        toast.error('Failed to load admin stats')
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h2>Admin Panel</h2>
      <p>User Count: {stats.userCount || 0}</p>
      <p>Trade Count: {stats.tradeCount || 0}</p>
      {/* Add more admin details and management options */}
    </div>
  )
}

export default AdminPanel