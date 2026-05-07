import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import AdminModal from '../../common/AdminModal';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  return (
    <header className="edugov-navbar-alt">
      <div className="navbar-container-alt">
        
        {/* Brand Logo */}
        <div className="navbar-brand-alt">
          <Link to="/" className="logo-link">
            <svg className="edugov-svg-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 30H32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              <path d="M6 8H30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              <path d="M18 2L18 8" stroke="#0284C7" strokeWidth="4" strokeLinecap="round"/>
              <rect x="10" y="11" width="4" height="16" rx="1" fill="#0284C7"/>
              <rect x="16" y="11" width="4" height="16" rx="1" fill="#0284C7"/>
              <rect x="22" y="11" width="4" height="16" rx="1" fill="#0284C7"/>
            </svg>
            <div className="brand-text-container">
              <span className="brand-edu">Edu</span>
              <span className="brand-gov">Gov</span>
            </div>
          </Link>
        </div>
        
        {/* Main Navigation Links */}
        <nav className="navbar-links-alt">
          <Link to="/" className="nav-item-alt">Home</Link>
          <Link to="/about" className="nav-item-alt">About</Link>
          <Link to="/academic-programs" className="nav-item-alt">Committees</Link>
          <Link to="/contact" className="nav-item-alt">Contact Us</Link>
        </nav>

        {/* Search and User Actions */}
        <div className="navbar-actions-alt">
          
          {/* Dropdown Menu Area */}
          <div 
            className="auth-dropdown-container"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="auth-button-alt">
              Login Portal <span className="dropdown-arrow">▾</span>
            </button>
            
            {isDropdownOpen && (
              <div className="auth-dropdown-menu">
                
                <Link to="/login" className="dropdown-item">
                  <span className="dropdown-icon">🎓</span> Academic Portal
                </Link>
                
                {/* 📍 FIX: Changed from a Link to a Button to trigger the Modal */}
                <button 
                  className="dropdown-item admin-item" 
                  onClick={() => {
                    setIsAdminModalOpen(true);
                    setIsDropdownOpen(false); // Closes the dropdown when modal opens
                  }}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span className="dropdown-icon">🛡️</span> Administration Login
                </button>
                
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📍 Render the Modal at the bottom of the Navbar. 
          It will only show up when isAdminModalOpen is true! */}
      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />

    </header>
  );
};

export default Navbar;