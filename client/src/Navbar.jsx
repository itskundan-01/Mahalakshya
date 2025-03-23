import { Link } from 'react-router-dom'
import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'
import { useWallet } from './context/WalletContext'
import './Navbar.css'

function Navbar() {
  const { user, setUser } = useContext(AuthContext)
  const { wallet, formatCurrency, loading } = useWallet()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">MahaLakshya</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <div className="nav-group">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/stock-price">Stock Price</Link>
              <Link to="/trade">Trade</Link>
            </div>
            <div className="nav-group">
              <Link to="/tutorials">Tutorials</Link>
              <Link to="/market-news">News</Link>
              <Link to="/competitions">Competitions</Link>
              <Link to="/forum">Forum</Link>
            </div>
            <div className="nav-group auth-group">
              <Link to="/2fa-setup" className="fa-setup">2FA</Link>
              {user.isAdmin && <Link to="/admin" className="admin-link">Admin</Link>}
              
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button 
                  className="profile-button" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="profile-name">{user.name?.split(' ')[0] || 'User'}</span>
                  <span className="profile-icon">👤</span>
                </button>
                
                {dropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="user-name">{user.name || 'User'}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    
                    <div className="wallet-preview">
                      <p className="wallet-label">Wallet Balance</p>
                      <p className="wallet-balance">
                        {loading ? 'Loading...' : formatCurrency(wallet?.balance || 0)}
                      </p>
                      <Link to="/wallet" className="add-funds-btn">Add Funds</Link>
                    </div>
                    
                    <div className="dropdown-links">
                      <Link to="/profile" className="dropdown-item">
                        <span className="item-icon">👤</span>
                        My Profile
                      </Link>
                      <Link to="/wallet" className="dropdown-item">
                        <span className="item-icon">💰</span>
                        My Wallet
                      </Link>
                      <Link to="/settings" className="dropdown-item">
                        <span className="item-icon">⚙️</span>
                        Settings
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item logout-item">
                        <span className="item-icon">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="nav-group auth-group">
            <Link to="/login" className="auth-btn login">Login</Link>
            <Link to="/register" className="auth-btn register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar