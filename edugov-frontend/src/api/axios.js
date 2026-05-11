import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8002', // Directing requests to your Gateway
    headers: {
        'Content-Type': 'application/json',
    }
});

// This interceptor ensures the JWT token is sent with every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;