import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import './admin-modal.css';

const AdminModal = ({ isOpen, onClose, onForgotClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setIsLoading(false);
      onClose(); // Close the modal

      // 📍 ROUTING LOGIC BASED ON ROLE
      // Make sure your backend role names match these exactly!
      const userRole = result.user?.role; 

      switch (userRole) {
        case 'UNIV_ADMIN':
        case 'ROLE_UNIV_ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'PROG_MANAGER':
        case 'ROLE_PROG_MANAGER':
          navigate('/dashboard/manager');
          break;
        case 'COMPLIANCE_OFFICER':
        case 'ROLE_COMPLIANCE_OFFICER':
          navigate('/dashboard/compliance');
          break;
        case 'GOVT_AUDITOR':
        case 'ROLE_GOVT_AUDITOR':
          navigate('/dashboard/auditor');
          break;
        case 'FACULTY':
        case 'ROLE_FACULTY':
          navigate('/dashboard/faculty');
          break;
        case 'STUDENT':
        case 'ROLE_STUDENT':
          navigate('/dashboard/student');
          break;
        default:
          // Fallback if role is missing or unrecognized
          navigate('/dashboard/default'); 
          break;
      }

    } else {
      setIsLoading(false);
      setError(result.message);
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
              <button type="button" onClick={onForgotClick} className="recovery-link" style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>
                  Forgot Credentials?
              </button>
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