import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// User Service
export const userAPI = {
    register: (data) => api.post('/api/users/register', data),
    login: (data) => api.post('/api/users/login', data),
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
};

// Product Service
export const productAPI = {
    getAll: () => api.get('/api/products'),
    getById: (id) => api.get(`/api/products/${id}`),
    search: (query) => api.get(`/api/products/search?q=${query}`),
    create: (data) => api.post('/api/products', data),
    update: (id, data) => api.put(`/api/products/${id}`, data),
    delete: (id) => api.delete(`/api/products/${id}`),
};

// Category Service
export const categoryAPI = {
    getAll: () => api.get('/api/categories'),
    create: (data) => api.post('/api/categories', data),
};

// Inventory Service
export const inventoryAPI = {
    getStock: (productId) => api.get(`/api/inventory/${productId}`),
    updateStock: (productId, quantity) => api.put(`/api/inventory/${productId}/stock?quantity=${quantity}`),
};

// Cart Service
export const cartAPI = {
    getCart: (userId) => api.get(`/api/cart/${userId}`),
    addToCart: (data) => api.post('/api/cart', data),
    updateQuantity: (userId, itemId, quantity) => api.put(`/api/cart/${userId}/items/${itemId}?quantity=${quantity}`),
    removeItem: (userId, itemId) => api.delete(`/api/cart/${userId}/items/${itemId}`),
    clearCart: (userId) => api.delete(`/api/cart/${userId}`),
};

// Payment Service
export const paymentAPI = {
    processPayment: (data) => api.post('/api/payments', data),
    getUserPayments: (userId) => api.get(`/api/payments/user/${userId}`),
};

// Order Service
export const orderAPI = {
    createOrder: (data) => api.post('/api/orders', data),
    getAllOrders: () => api.get('/api/orders'),
    getOrder: (id) => api.get(`/api/orders/${id}`),
    getUserOrders: (userId) => api.get(`/api/orders/user/${userId}`),
    updateStatus: (id, status) => api.put(`/api/orders/${id}/status?status=${status}`),
};

// Notification Service
export const notificationAPI = {
    sendNotification: (data) => api.post('/api/notifications', data),
    getUserNotifications: (userId) => api.get(`/api/notifications/user/${userId}`),
};

export default api;
