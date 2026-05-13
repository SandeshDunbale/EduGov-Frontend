import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios'; // Make sure this Axios instance has baseURL: 'http://localhost:8002'

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
            // 📍 IMPORTANT: The full path must be used here so the Gateway knows where to route it
            const response = await API.post('/api/auth/login', { email, password });
            
            const { token, user } = response.data; // Spring Boot sends token and userDTO

            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // 📍 Returns the user data back to the Modal so it knows exactly which dashboard to load
            return { success: true, user: user }; 

        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Login Failed. Please check your credentials." 
            };
        }
    };

    // 📍 Updated Logout Function
    const logout = async () => {
        try {
            // 1. Tell Spring Boot to blacklist the token!
            // Because we set up the Axios Interceptor earlier, 
            // the 'Authorization: Bearer <token>' header is automatically attached to this request.
            await API.post('/api/auth/logout'); 
            
        } catch (error) {
            // If the server is down or the token is already expired, we don't really care.
            // We just log it for debugging and move on to clearing the local state.
            console.error("Server logout failed, but clearing local session anyway.", error);
            
        } finally {
            // 2. Clear React state and LocalStorage
            // The 'finally' block ensures this ALWAYS runs, even if the backend API call fails.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);