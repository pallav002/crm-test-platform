import axios from 'axios';
// Trigger fresh build for Vercel

const api = axios.create({
    baseURL: 'https://crm-test-platform.onrender.com/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
