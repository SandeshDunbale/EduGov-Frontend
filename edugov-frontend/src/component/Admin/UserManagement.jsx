import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import API from '../../api/axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/all');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id) => {
        await API.put(`/admin/${id}/approve`);
        fetchUsers();
    };

    const handleReject = async (id) => {
        await API.put(`/admin/${id}/reject`);
        fetchUsers();
    };

    return (
        <div className="user-page-wrapper">

            {/* LEFT SIDEBAR */}
            <div className="user-sidebar">
                <div className="user-logo">🎓 EduGov</div>
                <h1>User Management</h1>
                <p>Verify and approve user registrations.</p>
            </div>

            {/* MAIN CONTENT */}
            <div className="user-main">
                <h2 className="user-title">Registered Users</h2>

                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th> {/* ✅ BEFORE STATUS */}
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>

                                {/* ✅ ACTION BUTTONS */}
                                <td className="action-buttons">
                                    <button
                                        className="badge correct"
                                        onClick={() => handleApprove(user.userId)}
                                    >
                                        ✓
                                    </button>

                                    <button
                                        className="badge wrong"
                                        onClick={() => handleReject(user.userId)}
                                    >
                                        ✕
                                    </button>
                                </td>

                                {/* ✅ STATUS DISPLAY */}
                                <td>
                                    <span className={`status-text ${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default UserManagement;

