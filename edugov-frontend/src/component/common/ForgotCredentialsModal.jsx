import React, { useState } from 'react';
import { KeyRound, MailQuestion, Phone, Mail, Calendar, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import './forgot-credentials.css';

const ForgotCredentialsModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleRecoverEmail = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (phone.trim().length < 8) {
        setError('No account found with that phone number.');
      } else {
        setSuccess('Account found! Your registered Email is: user@edugov.edu');
      }
    }, 800);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!email || !phone || !dob) {
        setError('Please complete all fields before resetting your password.');
      } else {
        setSuccess('Password successfully updated! You can now log in.');
        setNewPassword('');
        setConfirmPassword('');
      }
    }, 900);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card forgot-card" onClick={(e) => e.stopPropagation()}>
        <button className="back-to-login-btn" onClick={onBackToLogin}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="admin-modal-header">
          {activeTab === 'password' ? <KeyRound className="admin-modal-icon" /> : <MailQuestion className="admin-modal-icon" />}
          <h3>Account Recovery</h3>
          <p>Securely recover your access credentials.</p>
        </div>

        <div className="recovery-tabs">
          <button className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => handleTabSwitch('password')}>Reset Password</button>
          <button className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`} onClick={() => handleTabSwitch('email')}>Recover Email</button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}
        {success && <div className="modal-success-banner"><CheckCircle2 size={18} /> {success}</div>}

        {activeTab === 'email' && (
          <form onSubmit={handleRecoverEmail} className="admin-modal-form">
            <div className="modal-input-group">
              <label>Registered Phone Number</label>
              <div className="modal-input-wrapper">
                <Phone className="input-icon" />
                <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className={`admin-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <><Loader2 className="spinner-icon" /> Verifying...</> : 'Retrieve Email ID'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleResetPassword} className="admin-modal-form password-reset-form">
            <div className="modal-input-group">
              <label>Registered Email</label>
              <div className="modal-input-wrapper">
                <Mail className="input-icon" />
                <input type="email" placeholder="user@edugov.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="modal-input-group half-width">
                <label>Phone Number</label>
                <div className="modal-input-wrapper">
                  <Phone className="input-icon" />
                  <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>

              <div className="modal-input-group half-width">
                <label>Date of Birth</label>
                <div className="modal-input-wrapper">
                  <Calendar className="input-icon" />
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="modal-input-group">
              <label>New Password</label>
              <div className="modal-input-wrapper">
                <Lock className="input-icon" />
                <input type="password" placeholder="••••••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
            </div>

            <div className="modal-input-group">
              <label>Confirm Password</label>
              <div className="modal-input-wrapper">
                <Lock className="input-icon" />
                <input type="password" placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className={`admin-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <><Loader2 className="spinner-icon" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotCredentialsModal;
