// src/api/axios.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8002',    // ✅ Through the Gateway
});

// 🛡️ THE INTERCEPTOR: Automatically attach the JWT token to every request

// 📍 The Interceptor: Attaches the JWT token to every request automatically
API.interceptors.request.use(
    (config) => {
        // 1. Grab the token from local storage
        const token = localStorage.getItem('token');

        // 2. If we have a token, attach it to the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 3. Let the request continue on its way
        return config;
    },
    (error) => {
        // If something goes wrong before the request is sent, reject it

        return Promise.reject(error);
    }
);

export default API;