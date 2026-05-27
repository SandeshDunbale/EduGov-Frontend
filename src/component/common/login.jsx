import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, UserPlus, X, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './admin-modal.css';
 
const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
   
    // Manage verification states: 'PENDING', 'REJECTED', or null
    const [verificationStatus, setVerificationStatus] = useState(null);
 
    const { login } = useAuth();
    const navigate = useNavigate();
 
    const handleClose = () => {
        navigate('/');
    };
 
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setVerificationStatus(null); // Clear previous states on fresh login attempt
        setIsLoading(true);
 
        const result = await login(email, password);
 
        // 🛑 SAFETY LOGIC FOR PENDING STATUS BACKEND ERRORS (e.g., if result.success is false)
        if (!result.success && (
            result.message === 'PENDING_VERIFICATION' ||
            result.status === 'PENDING' ||
            result.message?.toLowerCase().includes('pending') ||
            result.message?.toLowerCase().includes('verification')
        )) {
            setIsLoading(false);
            setVerificationStatus('PENDING');
            return;
        }
 
        // 🛑 SAFETY LOGIC FOR REJECTED STATUS BACKEND ERRORS (e.g., if result.success is false)
        if (!result.success && (
            result.message === 'ACCOUNT_REJECTED' ||
            result.status === 'REJECTED' ||
            result.message?.toLowerCase().includes('reject')
        )) {
            setIsLoading(false);
            setVerificationStatus('REJECTED');
            return;
        }
 
        if (result.success) {
            // Get the user's status returned by your AuthContext payload
            // This assumes your backend user object has a field named 'status' or 'verificationStatus'
            const userStatus = result.user?.status || result.user?.verificationStatus;
            const userRole = result.user?.role;
 
            // 🔥 CRITICAL INTERCEPTOR: Even if login is successful, if status is PENDING, block redirection!
            if (userStatus === 'PENDING' || userStatus?.toLowerCase() === 'pending') {
                setIsLoading(false);
                setVerificationStatus('PENDING');
                return; // 🛑 ABSOLUTE HARD BLOCK. Stops navigation right here.
            }
 
            // 🔥 CRITICAL INTERCEPTOR: Even if login is successful, if status is REJECTED, block redirection!
            if (userStatus === 'REJECTED' || userStatus === 'DECLINED' || userStatus?.toLowerCase() === 'rejected') {
                setIsLoading(false);
                setVerificationStatus('REJECTED');
                return; // 🛑 ABSOLUTE HARD BLOCK. Stops navigation right here.
            }
 
            setIsLoading(false);
 
            // Only routes if the profile status is clear (APPROVED)
            switch (userRole) {
                case 'STUDENT':
                case 'ROLE_STUDENT':
                    navigate('/dashboard/student');
                    break;
                case 'FACULTY':
                case 'ROLE_FACULTY':
                    navigate('/dashboard/faculty');
                    break;
                case 'UNIV_ADMIN':
                case 'ROLE_UNIV_ADMIN':
                    navigate('/dashboard/admin');
                    break;
                case 'PROG_MANAGER':
                case 'ROLE_PROG_MANAGER':
                    navigate('/manager/dashboard');
                    break;
                case 'COMPLIANCE_OFFICER':
                case 'ROLE_COMPLIANCE_OFFICER':
                    navigate('/dashboard/compliance');
                    break;
                default:
                    navigate('/dashboard/default');
                    break;
            }
        } else {
            setIsLoading(false);
            setError(result.message || "Authentication failed.");
        }
    };
 
    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{ position: 'relative' }}>
                {/* 📍 CLOSE BUTTON */}
                <button
                    className="admin-modal-close"
                    onClick={handleClose}
                    style={{ cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>
 
                <div className="admin-modal-header">
                    <ShieldCheck className="admin-modal-icon" />
                    <h3>EduGov Portal Login</h3>
                    <p>Enter your credentials to access your dashboard.</p>
                   
                    {/* ❌ DISPLAY: STANDARD WRONG PASSWORD / EMAIL */}
                    {error && !verificationStatus && <div className="modal-error-banner">{error}</div>}
 
                    {/* 🟠 DISPLAY: ACCOUNT IS PENDING (STAYS ON LOGIN PAGE) */}
                    {verificationStatus === 'PENDING' && (
                        <div className="modal-error-banner" style={{ backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', padding: '12px' }}>
                            <Clock size={20} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', color: '#92400e' }}>Verification Pending</strong>
                                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Your account is under verification. Please try again later.</span>
                            </div>
                        </div>
                    )}
 
                    {/* 🔴 DISPLAY: ACCOUNT IS REJECTED (STAYS ON LOGIN PAGE) */}
                    {verificationStatus === 'REJECTED' && (
                        <div className="modal-error-banner" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', padding: '12px' }}>
                            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', color: '#991b1b' }}>Access Denied</strong>
                                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Your registration application has been rejected by administration. Please reach out to support.</span>
                            </div>
                        </div>
                    )}
                </div>
 
                <form onSubmit={handleLogin} className="admin-modal-form">
                    <div className="modal-input-group">
                        <label>Email Address</label>
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
 
                    <button
                        type="submit"
                        className={`admin-submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>Authenticating... <Loader2 className="spinner-icon" /></>
                        ) : (
                            <>Login  <ArrowRight className="submit-icon" /></>
                        )}
                    </button>
 
                    <div className="register-redirect" style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>New to the platform?</p>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '0 auto' }}
                        >
                            <UserPlus size={16} style={{ marginRight: '5px' }} /> Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
 
export default LoginPage;