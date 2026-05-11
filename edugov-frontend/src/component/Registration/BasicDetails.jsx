import React, { useState } from 'react';
import DocumentSubmission from './DocumentSubmission';
// import StudentDashboard from '../Dashboard/StudentDashboard';
import './BasicDetails.css';
import API from '../../api/axios';

const BasicDetails = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('STUDENT');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [userId, setUserId] = useState(null); // ✅ important

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

        // ✅ EMAIL VALIDATION
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

        // ✅ PHONE VALIDATION
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

        // ✅ OTHER INPUTS
        setFormData({ ...formData, [name]: value });

        // ✅ PASSWORD VALIDATION
        if (name === 'password') {
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
            setPasswordError(!passRegex.test(value) ? "Weak: Need Caps, Number & Symbol." : "");
        }
    };

    // ✅ REGISTER API
    const handleNextTrigger = async (e) => {
        e.preventDefault();

        if (phoneError || passwordError || emailError) {
            alert("Please fix errors before proceeding.");
            return;
        }

        try {
            const route = role === 'STUDENT' ? '/students/register' : '/faculty/register';

            const response = await API.post(route, { ...formData, role });

            console.log("FULL RESPONSE:", response.data);

            const id = response.data.userId || response.data.id;

            if (!id) {
                alert("User ID not received from server!");
                return;
            }

            setUserId(id);
            setStep(2);

        } catch (error) {
    console.error(error);

    const message = error.response?.data?.message;

    if (message === "Email already registered") {
        alert("This email is already registered. Please use a different email.");
    } else {
        alert(message || "Registration failed. Try again later.");
    }
}
            };

    // ✅ DOCUMENT STEP
    if (step === 2)
        return (
            <DocumentSubmission
                role={role}
                userId={userId}
                prevStep={() => setStep(1)}
                onComplete={() => setStep(3)}
            />
        );

    // ✅ FINAL STEP
    if (step === 3)
        return <div>✅ Registration Completed</div>;

    return (
        <div className="reg-page-wrapper">
            <div className="reg-left-sidebar">
                <div className="logo">EDUGOV</div>
                <h1>Official Portal Registration</h1>
                <p>Secure digital identity registration.</p>
            </div>

            <div className="reg-right-content">
                <div className="form-inner-box">
                    <h2 className="form-title">Account Credentials</h2>
                    <p className="form-subtitle">Please provide your official details to proceed.</p>

                    <div className="role-toggle-container">
                        <button
                            type="button"
                            className={`role-toggle-btn ${role === 'STUDENT' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('STUDENT')}
                        >
                            Student
                        </button>

                        <button
                            type="button"
                            className={`role-toggle-btn ${role === 'FACULTY' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('FACULTY')}
                        >
                            Faculty
                        </button>
                    </div>

                    {/* ✅ IMPORTANT: Keep all classNames */}
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



                        {/* ✅ Department field ONLY for Faculty */}
{role === 'FACULTY' && (
  <div className="field-group span-full">
    <label>Department</label>
    <input
      name="department"
      value={formData.department}
      onChange={handleChange}
      placeholder="Enter Department"
      required
    />
  </div>
)}

                        <div className="field-group span-full">
                            <label>Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} required />
                        </div>

                        <div className="field-group">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        <div className="field-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>

                        <div className="span-full">
                            <button type="submit" className="btn-next">Next</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BasicDetails;
``