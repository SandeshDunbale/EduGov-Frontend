import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react'; // 📍 Added X icon
import './navbar.css';
 
const Navbar = ({ onMenuClick }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
 
  // 📍 NEW STATE: Controls the mobile dropdown for public links
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 📍 Tells us what URL we are currently on
 
  // 📍 Check if we are on a public page
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname);
 
  // 📍 Auto-close the mobile menu whenever the page changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);
 
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
  };
 
  const getAvatarInitials = () => {
    const displayName = user?.name || user?.firstName || user?.username || user?.email;
    if (displayName) return displayName.charAt(0).toUpperCase();
    return <User size={16} />;
  };
 
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName) return user.firstName;
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return "System User";
  };
 
  const getRoleDisplay = () => {
    if (!user?.role) return "USER";
    return user.role.replace('ROLE_', '').replace('_', ' ');
  };
 
  // 📍 SMART HAMBURGER LOGIC
  const handleHamburgerClick = () => {
    if (isPublicPage) {
      // If on Home/About/Contact, toggle the Navbar links
      setIsMobileNavOpen(!isMobileNavOpen);
    } else {
      // If on Dashboard, toggle the Sidebar
      if (onMenuClick) onMenuClick();
    }
  };
 
  return (
    <header className="edugov-navbar-alt">
      <div className="navbar-container-alt">
       
        <div className="navbar-brand-alt">
          <button
            className="mobile-menu-btn"
            onClick={handleHamburgerClick} // 📍 Attached smart logic
            aria-label="Open Menu"
          >
            {/* 📍 Swap between Hamburger and X icon if public menu is open */}
            {(isPublicPage && isMobileNavOpen) ? <X size={26} color="#F8FAFC" /> : <Menu size={26} color="#F8FAFC" />}
          </button>
 
          <Link to="/" className="logo-link">
            <img
              src="/Gemini_Generated_Image_q6sa9zq6sa9zq6sa-removebg.png"
              alt="EduGov Shield Logo"
              className="edugov-img-icon"
            />
            <div className="brand-text-container">
              <span className="brand-edu">Edu</span>
              <span className="brand-gov">Gov</span>
            </div>
          </Link>
        </div>
       
        {/* 📍 Apply 'mobile-active' class when state is true */}
        <nav className={`navbar-links-alt ${isMobileNavOpen ? 'mobile-active' : ''}`}>
          <Link to="/" className="nav-item-alt">Home</Link>
          <Link to="/about" className="nav-item-alt">About</Link>
          <Link to="/academic-programs" className="nav-item-alt">Committees</Link>
          <Link to="/contact" className="nav-item-alt">Contact Us</Link>
        </nav>
 
        <div className="navbar-actions-alt">
          {user ? (
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
            <>
              <button
                className="auth-button-alt"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="auth-button-alt register-button-alt"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
 
export default Navbar;