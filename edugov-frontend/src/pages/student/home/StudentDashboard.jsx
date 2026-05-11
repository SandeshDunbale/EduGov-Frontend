

import React from 'react';

const StudentDashboard = ({ user }) => {
    return (
        <div className="container-fluid min-vh-100 p-0" style={{ backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <nav className="navbar navbar-dark px-4 py-3 shadow-sm" style={{ backgroundColor: '#0D1B2A' }}>
                <span className="navbar-brand fw-bold fs-4">🎓 EduGov Portal</span>
                <div className="text-white small d-flex align-items-center">
                    <span className="me-3">{user?.fullName || "Student"}</span>
                    <button className="btn btn-outline-light btn-sm" onClick={() => window.location.reload()}>Logout</button>
                </div>
            </nav>

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        {/* Welcome Card */}
                        <div className="card border-0 shadow-sm p-5 text-center mb-4">
                            <h2 className="fw-bold mb-3">Welcome to EduGov, {user?.fullName}!</h2>
                            <p className="text-muted">Your registration has been received and is currently under review.</p>
                            
                            <div className="d-inline-block bg-warning text-dark px-4 py-2 rounded-pill fw-bold mt-2">
                                Status: Pending Verification
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="card border-0 shadow-sm p-4">
                            <h5 className="fw-bold mb-4">Registration Summary</h5>
                            <div className="row">
                                <div className="col-sm-6 mb-3">
                                    <label className="small text-muted d-block text-uppercase">Email</label>
                                    <span className="fw-bold">{user?.email}</span>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="small text-muted d-block text-uppercase">Phone</label>
                                    <span className="fw-bold">{user?.phoneNumber}</span>
                                </div>
                                <div className="col-sm-6">
                                    <label className="small text-muted d-block text-uppercase">Registration Date</label>
                                    <span className="fw-bold">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;