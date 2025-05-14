import axios from 'axios';
import { API_URL } from '../config/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const cart = {
    // We'll implement cart API endpoints later
    getCart: async () => {
        // For now, return from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return [];
        
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        return allCarts[user.email] || [];
    },

    updateCart: async (cartItems) => {
        // For now, save to localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        allCarts[user.email] = cartItems;
        localStorage.setItem('userCarts', JSON.stringify(allCarts));
    }
};

export default api; 