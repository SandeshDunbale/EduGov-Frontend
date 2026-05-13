import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import './navbar.css';
import AdminModal from '../../common/AdminModal';
import ForgotCredentialsModal from '../../common/ForgotCredentialsModal';
 
const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
 
  // State for the logged-in profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
  };
 
  // Safe fallback for Avatar
  const getAvatarInitials = () => {
    const displayName = user?.name || user?.firstName || user?.username || user?.email;
    if (displayName) return displayName.charAt(0).toUpperCase();
    return <User size={16} />;
  };
 
  // Safe fallback for display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName) return user.firstName;
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return "System User";
  };
 
  // Safe fallback for role
  const getRoleDisplay = () => {
    if (!user?.role) return "USER";
    return user.role.replace('ROLE_', '').replace('_', ' ');
  };
 
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
       
        <nav className="navbar-links-alt">
          <Link to="/" className="nav-item-alt">Home</Link>
          <Link to="/about" className="nav-item-alt">About</Link>
          <Link to="/academic-programs" className="nav-item-alt">Committees</Link>
          <Link to="/contact" className="nav-item-alt">Contact Us</Link>
        </nav>
 
        <div className="navbar-actions-alt">
         
          {user ? (
            // --- LOGGED IN: Profile Dropdown ---
            <div
              className="auth-dropdown-container"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <div className="navbar-user-profile clickable-profile">
                <div className="nav-avatar">
                  {getAvatarInitials()}
                </div>
                <span className="nav-user-name">
                  {getDisplayName()} <span className="dropdown-arrow">▾</span>
                </span>
              </div>
             
              {isProfileDropdownOpen && (
                <div className="auth-dropdown-menu profile-dropdown-menu">
                 
                  <div className="dropdown-item user-info-header">
                     <span className="user-role-badge">{getRoleDisplay()}</span>
                  </div>
 
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-dropdown-btn"
                  >
                    <LogOut size={16} className="dropdown-icon" /> Logout
                  </button>
 
                </div>
              )}
            </div>
          ) : (
            // --- LOGGED OUT: Login Portal Dropdown ---
            <div
              className="auth-dropdown-container"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="auth-button-alt">
                Login<span className="dropdown-arrow">▾</span>
              </button>
             
              {isDropdownOpen && (
                <div className="auth-dropdown-menu">
                  <Link to="/login" className="dropdown-item">
                    <span className="dropdown-icon">🎓</span> Academic Portal
                  </Link>
                  <button
                    className="dropdown-item admin-item"
                    onClick={() => {
                      setIsAdminModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className="dropdown-icon">🛡️</span> Administration Login
                  </button>
                </div>
              )}
            </div>
          )}
 
        </div>
      </div>
 
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        // 📍 Pass a prop to switch to the forgot modal
        onForgotClick={() => {
          setIsAdminModalOpen(false);
          setIsForgotModalOpen(true);
        }}
      />
 
      <ForgotCredentialsModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        // 📍 Pass a prop to switch back to login
        onBackToLogin={() => {
          setIsForgotModalOpen(false);
          setIsAdminModalOpen(true);
        }}
      />
    </header>
  );
};
 
export default Navbar;
 