import React, { useState } from 'react';
import DocumentSubmission from './DocumentSubmission';
import './BasicDetails.css';
import API from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const BasicDetails = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('STUDENT');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [userId, setUserId] = useState(null); // Logic keeps this, UI hides it in Step 2

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', gender: '',
        dob: '1990-01-01', address: '', password: '',
        confirmPassword: '', department: ''
    });

    const handleRoleChange = (selectedRole) => {
        if (selectedRole !== role) {
            setRole(selectedRole);
            setFormData({
                name: '', email: '', phone: '', gender: '',
                dob: '1990-01-01', address: '', password: '',
                confirmPassword: '', department: ''
            });
            setPhoneError('');
            setPasswordError('');
            setEmailError('');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setFormData({ ...formData, [name]: value });
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            if (value.length > 0) {
                if (value !== value.toLowerCase()) {
                    setEmailError("Email must be lowercase.");
                } else if (!emailRegex.test(value)) {
                    setEmailError("Invalid format (e.g., name@domain.com).");
                } else {
                    setEmailError("");
                }
            } else {
                setEmailError("");
            }
            
            return;
        }

        if (name === 'phone') {
            const val = value.replace(/\D/g, '');
            if (val.length > 10) return;
            setFormData({ ...formData, [name]: val });
            const phoneRegex = /^[6-9]\d{9}$/;
            if (val.length > 0 && !phoneRegex.test(val)) {
                setPhoneError("Must start with 6-9 and be 10 digits.");
            } else {
                setPhoneError("");
            }
            return;
        }

        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
            setPasswordError(!passRegex.test(value) ? "Weak: Need Caps, Number & Symbol." : "");
        }
    };

    const handleNextTrigger = async (e) => {
        e.preventDefault();
        if (phoneError || passwordError || emailError) {
            toast.error("Please fix errors before proceeding.");
            return;
        }

        setIsProcessing(true);

        try {
            const route = role === 'STUDENT' ? '/students/register' : '/faculty/register';
            const response = await API.post(route, { ...formData, role });
            
            // Check for ID in common response formats
            const id = response.data.userId || response.data.id || response.data.data?.id;

            if (!id) {
                toast.error("User ID not received from server!");
                setIsProcessing(false);
                return;
            }

            toast.success("Details saved! Proceeding to document submission.");
            setUserId(id);
            setStep(2);
        } catch (error) {
    console.error(error);
    const message = error.response?.data?.message || error.message;

    // Check for the exact fallback string your backend sends
    if (message && message.includes("The Identity Service is currently down")) {
        toast.error("Registration failed: This email might already be registered, OR the system is temporarily down.");
    } 
    // Keep your original check just in case the backend ever gets fixed!
    else if (message === "Email already registered") {
        toast.error("This email is already registered.");
    } 
    else {
        toast.error(message || "Registration failed.");
    }
    
    setIsProcessing(false);
}
    };

    if (step === 2)
        return (
            <DocumentSubmission
                role={role}
                userId={userId}
                prevStep={() => setStep(1)}
                onComplete={() => setStep(3)}
            />
        );

    if (step === 3) return <div className="registration-success">✅ Registration Completed</div>;

    const EyeIcon = ({ visible }) => (
        visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        )
    );

    return (
        <div className="reg-page-wrapper">
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'custom-toast',
                    duration: 4000,
                }}
            />
            <div className="reg-left-sidebar">
                <div className="logo">EDUGOV</div>
                <h1>Official Portal Registration</h1>
                <p>Secure digital registration.</p>
            </div>

            <div className="reg-right-content">
                <div className="form-inner-box">
                    <h2 className="form-title">Account Credentials</h2>
                    <p className="form-subtitle">Please provide your official details to proceed.</p>

                    <div className="role-toggle-container">
                        <button type="button" className={`role-toggle-btn ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => handleRoleChange('STUDENT')}>Student</button>
                        <button type="button" className={`role-toggle-btn ${role === 'FACULTY' ? 'active' : ''}`} onClick={() => handleRoleChange('FACULTY')}>Faculty</button>
                    </div>

                    <form onSubmit={handleNextTrigger} className="basic-details-grid">
                        <div className="field-group">
                            <label>Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="field-group">
                            <label>Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} required />
                            {emailError && <div className="error-message">{emailError}</div>}
                        </div>

                        <div className="field-group">
                            <label>Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} required />
                            {phoneError && <div className="error-message">{phoneError}</div>}
                        </div>

                        <div className="field-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                        </div>

                        <div className="field-group span-full">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {role === 'FACULTY' && (
                            <div className="field-group span-full">
                                <label>Department</label>
                                <input name="department" value={formData.department} onChange={handleChange} placeholder="Enter Department" required />
                            </div>
                        )}

                        <div className="field-group span-full">
                            <label>Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} required />
                        </div>

                        <div className="field-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <button type="button" className="eye-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                                    <EyeIcon visible={showPassword} />
                                </button>
                            </div>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        <div className="field-group">
                            <label>Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <button type="button" className="eye-icon-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <EyeIcon visible={showConfirmPassword} />
                                </button>
                            </div>
                        </div>

                        <div className="span-full">
                            <button type="submit" className="btn-next" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BasicDetails;