import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // On page refresh, reload the user from local storage
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

    const login = async (email, password) => {
        try {
            // Path must be used so Gateway routes correctly
            const response = await API.post('/api/auth/login', { email, password });
            
            // Extract token and userDTO (UserResponseDTO)
            const { token, user } = response.data; 

            setToken(token);
            setUser(user);

            // --- FIXED STORAGE LOGIC ---
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // 1. Save global userId for the Document Service
            localStorage.setItem('userId', user.userId); 

            // 2. Determine and save the correct Database ID for Profile Services
            // Based on your DTO, if it's a student login, we use studentId. 
            // If studentId isn't sent, we fallback to userId.
            const profileId = user.studentId || user.userId;
            localStorage.setItem('dbId', profileId);

            return { success: true, user: user }; 

        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Login Failed. Please check your credentials." 
            };
        }
    };

    const logout = () => {
        // Clear all session data safely
        localStorage.clear();
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