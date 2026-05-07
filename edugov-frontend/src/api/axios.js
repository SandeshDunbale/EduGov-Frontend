// src/api/axios.js
import axios from 'axios';

const API = axios.create({
    // baseURL: 'http://localhost:8080/api/auth', // ❌ WRONG (Direct to service)
    baseURL: 'http://localhost:8002',    // ✅ RIGHT (Through the Gateway)
});

export default API;