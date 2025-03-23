import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SearchBar from './SearchBar';
import '../Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">Mahalakshya</Link>
      </div>
      
      <div className="navbar-menu">
        <div className="nav-group">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/trade">Trade</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/competitions">Competitions</Link>
          <Link to="/learning">Learning</Link>
        </div>
        
        <div className="nav-group">
          <button className="search-button" onClick={toggleSearch}>
            <i className="fas fa-search"></i>
            <span className="search-text">Search</span>
          </button>
          
          {user ? (
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <button className="profile-button" onClick={toggleDropdown}>
                <i className="fas fa-user-circle profile-icon"></i>
                <span>{user.name}</span>
              </button>
              
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="dropdown-items">
                    <Link to="/profile">
                      <i className="fas fa-user"></i>
                      Your Profile
                    </Link>
                    <Link to="/settings">
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="admin-link">
                        <i className="fas fa-shield-alt"></i>
                        Admin Panel
                      </Link>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      
      {searchOpen && <SearchBar onClose={toggleSearch} />}
    </nav>
  );
};

export default Navbar;
