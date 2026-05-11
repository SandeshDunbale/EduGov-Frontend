import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8002/', 
    timeout: 30000,
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            // Optional: Log to console to verify token is being attached
            console.log("Attaching Token to Request...");
        } else {
            console.warn("No token found in localStorage!");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;