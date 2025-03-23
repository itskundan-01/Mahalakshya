import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import SearchBar from './components/SearchBar'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation() // Added to track current route

  // Function to check if a link is active
  const isActive = (path) => {
    // Check if current path starts with the provided path
    // This handles both exact matches and nested routes
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">Mahalakshya</Link>
      </div>
      
      {user ? (
        <>
          <div className="navbar-menu">
            <div className="nav-group">
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>Portfolio</Link>
              <Link to="/stock-price" className={isActive('/stock-price') ? 'active' : ''}>Stock Price</Link>
              <Link to="/trade" className={isActive('/trade') ? 'active' : ''}>Trade</Link>
            </div>
            <div className="nav-group">
              <Link to="/tutorials" className={isActive('/tutorials') ? 'active' : ''}>Tutorials</Link>
              <Link to="/market-news" className={isActive('/market-news') ? 'active' : ''}>News</Link>
              <Link to="/competitions" className={isActive('/competitions') ? 'active' : ''}>Competitions</Link>
              <Link to="/forum" className={isActive('/forum') ? 'active' : ''}>Forum</Link>
            </div>
            <div className="nav-group auth-group">
              {/* Replace 2FA with Search button */}
              <button 
                className="search-button" 
                onClick={toggleSearch}
                title="Search stocks"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="search-text">Search</span>
              </button>
              
              {user.isAdmin && <Link to="/admin" className={`admin-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>}
              
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
                      <span className="user-name">{user.name || 'User'}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="dropdown-items">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        My Profile
                      </Link>
                      <Link to="/wallet" onClick={() => setDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                          <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        Wallet
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                      </Link>
                      {/* Move 2FA link here */}
                      <Link to="/2fa-setup" onClick={() => setDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        2FA Setup
                      </Link>
                      <button onClick={handleLogout} className="logout-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Search Container */}
          {searchOpen && (
            <div className="search-container" ref={searchRef}>
              <SearchBar 
                onClose={() => setSearchOpen(false)}
                onSelectStock={(stock) => {
                  navigate(`/stock/${stock.symbol}`);
                  setSearchOpen(false);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="navbar-menu">
          <div className="nav-group auth-group">
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
            <Link to="/signup" className={`signup-btn ${isActive('/signup') ? 'active' : ''}`}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar