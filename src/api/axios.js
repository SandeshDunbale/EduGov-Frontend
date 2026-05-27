import axios from 'axios';

const API = axios.create({
//custom api client
  baseURL: 'http://localhost:8002',
});

//  THE INTERCEPTOR: Automatically attach the JWT token to every request
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