import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import './admin-modal.css'; // Keeping your existing styling

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setIsLoading(false);
      // Logic to check role and navigate to the correct dashboard
      if (result.role === 'STUDENT') {
        navigate('/student/home/dashboard');
      } else {
        navigate('/faculty/home/cddashboard');
      }
    } else {
      setIsLoading(false);
      setError(result.message);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card">
        {/* Header - Kept the same design */}
        <div className="admin-modal-header">
          <ShieldCheck className="admin-modal-icon" />
          <h3>EduGov Login</h3>
          <p>Common portal for Student & Faculty access.</p>
          
          {error && <div className="modal-error-banner">{error}</div>}
        </div>

        <form onSubmit={handleLogin} className="admin-modal-form">
          <div className="modal-input-group">
            <label>Official Email ID</label>
            <div className="modal-input-wrapper">
              <Mail className="input-icon" />
              <input 
                type="email" 
                placeholder="name@edugov.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="modal-input-group">
            <label>Password</label>
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
            <a href="#forgot" className="recovery-link">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            className={`admin-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>Logging in... <Loader2 className="spinner-icon" /></>
            ) : (
              <>Sign In <ArrowRight className="submit-icon" /></>
            )}
          </button>

          {/* THE NEW LINK: Create Register */}
          <div className="register-redirect-section" style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            paddingTop: '15px', 
            borderTop: '1px solid #eee' 
          }}>
            <p className="small text-muted mb-2">New to the platform?</p>
            <button 
              type="button" 
              onClick={() => navigate('/register')} // This points to your BasicDetails route
              className="btn btn-link p-0 text-decoration-none fw-bold"
              style={{ color: '#0D1B2A', fontSize: '0.9rem' }}
            >
              <UserPlus size={16} className="me-1" /> Create Account / Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;