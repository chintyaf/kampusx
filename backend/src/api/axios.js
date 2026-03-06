import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true, // Required for Sanctum cookies
    withXSRFToken: true,   // Laravel 12 looks for this header
});

export default api;
