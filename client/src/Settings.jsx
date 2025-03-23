import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from './config'
import { AuthContext } from './context/AuthContext'
import { toast } from 'react-toastify'
import './Settings.css'

function Settings() {
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/user/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.response?.data?.error || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h3>Security Settings</h3>
          
          <form className="password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>
            
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        <div className="settings-card">
          <h3>Two-Factor Authentication</h3>
          <p className="settings-description">
            Secure your account with two-factor authentication. This adds an extra layer of security by requiring a verification code.
          </p>
          
          <div className="tfa-status">
            <span className="status-label">Status:</span>
            <span className={`status-value ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <Link to="/2fa-setup" className="tfa-setup-btn">
            {user.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </Link>
        </div>
        
        <div className="settings-card">
          <h3>Notification Preferences</h3>
          <p className="settings-description">
            Manage how you receive notifications about market updates, trade confirmations, and account activities.
          </p>
          
          <div className="notification-option">
            <label className="toggle-label">
              <input type="checkbox" className="toggle-input" checked />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Trade Confirmations</span>
            </label>
          </div>
          
          <div className="notification-option">
            <label className="toggle-label">
              <input type="checkbox" className="toggle-input" checked />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Price Alerts</span>
            </label>
          </div>
          
          <div className="notification-option">
            <label className="toggle-label">
              <input type="checkbox" className="toggle-input" checked />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Market News</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
