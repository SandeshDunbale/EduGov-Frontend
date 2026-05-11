import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Frontend-only authentication: no backend calls.

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // If a token exists on refresh, you could potentially fetch user profile here
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // For development/testing: auto-login with mock credentials
            const mockToken = 'dev-token-12345';
            const mockUser = {
                id: 1,
                email: 'compliance@edugov.edu',
                role: 'COMPLIANCE_OFFICER',
                name: 'Compliance Officer'
            };

            setToken(mockToken);
            setUser(mockUser);
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
        }
    }, []);

    const login = async (email, password) => {
        const safeEmail = (email || '').trim();
        if (!safeEmail || !password) {
            return { success: false, message: 'Invalid credentials' };
        }

        const mockToken = 'frontend-only-token';
        const mockUser = {
            id: 1,
            email: safeEmail,
            role: 'COMPLIANCE_OFFICER',
            name: 'Compliance Officer'
        };

        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        return { success: true };
    };


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

export const useAuth = () => useContext(AuthContext);