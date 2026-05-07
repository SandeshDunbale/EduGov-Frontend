import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Path to your AuthContext
import { useNavigate } from 'react-router-dom';
import './admin-modal.css';

const AdminModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. Local states for form inputs and status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 2. Integration with the Backend Service
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setIsLoading(false);
      onClose(); // Close the modal on success
      navigate('/admin/dashboard'); // Redirect to admin panel
    } else {
      setIsLoading(false);
      setError(result.message); // Show "Invalid Credentials" or "Account Inactive"
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}>✕</button>

        <div className="admin-modal-header">
          <ShieldCheck className="admin-modal-icon" />
          <h3>System Administration</h3>
          <p>Secure gateway for university staff.</p>
          
          {/* Display dynamic error messages from Spring Boot */}
          {error && <div className="modal-error-banner">{error}</div>}
        </div>

        <form onSubmit={handleLogin} className="admin-modal-form">
          <div className="modal-input-group">
            <label>Administrator Email / ID</label>
            <div className="modal-input-wrapper">
              <Mail className="input-icon" />
              <input 
                type="email" 
                placeholder="admin@edugov.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="modal-input-group">
            <label>Secure Password</label>
            <div className="modal-input-wrapper">
              <Lock className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <a href="#forgot" className="recovery-link">Forgot Credentials?</a>
          </div>

          <button 
            type="submit" 
            className={`admin-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>Authenticating... <Loader2 className="spinner-icon" /></>
            ) : (
              <>Authenticate <ArrowRight className="submit-icon" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;