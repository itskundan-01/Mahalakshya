import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { API_URL } from './config'
import { AuthContext } from './context/AuthContext'
import { toast } from 'react-toastify'
import './Profile.css'

function Profile() {
  const { user, setUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/user/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setUser({
        ...user,
        ...response.data
      })
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading profile information...</div>
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            disabled 
          />
          <small>Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="text" 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
          />
        </div>
        
        <button type="submit" className="update-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      <div className="account-info">
        <h3>Account Information</h3>
        <div className="info-item">
          <span className="info-label">Account Created</span>
          <span className="info-value">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">2FA Enabled</span>
          <span className="info-value">{user.twoFactorEnabled ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  )
}

export default Profile
