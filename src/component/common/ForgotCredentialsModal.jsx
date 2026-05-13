import React, { useState } from 'react';
import { KeyRound, MailQuestion, Phone, Mail, Calendar, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import API from '../../api/axios'; // 📍 1. Import your configured Axios instance
import './forgot-credentials.css';

const ForgotCredentialsModal = ({ isOpen, onClose, onBackToLogin }) => {
  // UI State
  const [activeTab, setActiveTab] = useState('password'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setPhone('');
    setEmail('');
    setDob('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // 📍 2. Wired up to GET /api/users/recoverEmail
  const handleRecoverEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Passes the phone number as a query parameter just like your Spring Boot @RequestParam expects
      const response = await API.get(`/api/users/recoverEmail?phone=${encodeURIComponent(phone)}`);
      
      // If successful, Spring Boot returns the email string
      setSuccess(`Account found! Your registered Email is: ${response.data}`);
      setPhone(''); // Clear input on success
      
    } catch (err) {
      // Safely extract the error string whether Spring sends plain text or a JSON object
      const errorMessage = err.response?.data?.message 
                        || (typeof err.response?.data === 'string' ? err.response.data : null) 
                        || "No account found with that phone number.";
      setError(errorMessage);
    } finally{
      setIsLoading(false);
    }
  };

  // 📍 3. Wired up to POST /api/auth/resetPassword
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation first
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // The payload must match your PasswordResetRequest record perfectly!
      // Note: HTML <input type="date"> automatically formats dates as "YYYY-MM-DD", 
      // which is exactly what java.time.LocalDate expects!
      const payload = {
        email: email,
        phone: phone,
        dob: dob,
        newPassword: newPassword
      };

      const response = await API.post('/api/auth/resetPassword', payload);
      
      // Show the success message returned from Spring Boot
      setSuccess(response.data || "Password successfully updated! You can now log in.");
      
      // Clear sensitive fields after success
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
       // Safely extract the error string whether Spring sends plain text or a JSON object
       const errorMessage = err.response?.data?.message 
                         || (typeof err.response?.data === 'string' ? err.response.data : null) 
                         || "Failed to reset password. Please check your details.";
       setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card forgot-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Back Button */}
        <button className="back-to-login-btn" onClick={onBackToLogin}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="admin-modal-header">
          {activeTab === 'password' ? <KeyRound className="admin-modal-icon" /> : <MailQuestion className="admin-modal-icon" />}
          <h3>Account Recovery</h3>
          <p>Securely recover your access credentials.</p>
        </div>

        {/* Tab Navigation */}
        <div className="recovery-tabs">
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('password')}
          >
            Reset Password
          </button>
          <button 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('email')}
          >
            Recover Email
          </button>
        </div>

        {/* Status Banners */}
        {error && <div className="modal-error-banner">{error}</div>}
        {success && (
          <div className="modal-success-banner">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        {/* --- TAB 1: RECOVER EMAIL --- */}
        {activeTab === 'email' && (
          <form onSubmit={handleRecoverEmail} className="admin-modal-form">
            <div className="modal-input-group">
              <label>Registered Phone Number</label>
              <div className="modal-input-wrapper">
                <Phone className="input-icon" />
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className={`admin-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <><Loader2 className="spinner-icon" /> Verifying...</> : "Retrieve Email ID"}
            </button>
          </form>
        )}

        {/* --- TAB 2: RESET PASSWORD --- */}
        {activeTab === 'password' && (
          <form onSubmit={handleResetPassword} className="admin-modal-form password-reset-form">
            <div className="modal-input-group">
              <label>Registered Email</label>
              <div className="modal-input-wrapper">
                <Mail className="input-icon" />
                <input 
                  type="email" 
                  placeholder="user@edugov.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="modal-input-group half-width">
                <label>Phone Number</label>
                <div className="modal-input-wrapper">
                  <Phone className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="modal-input-group half-width">
                <label>Date of Birth</label>
                <div className="modal-input-wrapper">
                  <Calendar className="input-icon" />
                  <input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="modal-input-group">
              <label>New Password</label>
              <div className="modal-input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  minLength="8"
                />
              </div>
            </div>

            <div className="modal-input-group">
              <label>Confirm Password</label>
              <div className="modal-input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  minLength="8"
                />
              </div>
            </div>

            <button type="submit" className={`admin-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <><Loader2 className="spinner-icon" /> Updating...</> : "Securely Reset Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotCredentialsModal;