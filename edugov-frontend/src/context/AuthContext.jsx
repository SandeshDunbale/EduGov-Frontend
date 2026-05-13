import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // ✅ Load user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user data");
            }
        }
    }, []);

    // ✅ Login
    const login = async (email, password) => {
        try {
            const response = await API.post('/api/auth/login', { email, password });

            const { token, user } = response.data;

            setToken(token);
            setUser(user);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, user };

        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login Failed"
            };
        }
    };

    // ✅ Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Hook
export const useAuth = () => useContext(AuthContext);
