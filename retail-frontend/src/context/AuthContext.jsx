import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                // Validation: if userId is missing (stale data), force logout
                if (!parsedUser.userId) {
                    console.warn('Found stale user data without userId. Logging out.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                } else {
                    setUser(parsedUser);
                }
            } catch (e) {
                console.error('Error parsing user data', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await userAPI.login({ email, password });
            const { token, userId, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ userId, email, role }));
            setUser({ userId, email, role });
            return { success: true, role };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await userAPI.register(userData);
            const { token, userId, email, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ userId, email, role }));
            setUser({ userId, email, role });
            return { success: true, role };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
