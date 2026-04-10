import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';
import api from '../api/axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Ambil initial state dari localStorage (kalau ada)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser && savedUser !== "null" && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/user');
                    // const response = await axios.get('http://localhost:8000/api/user');
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (error) {
                    logout();
                } finally {
                    setLoading(false);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // INI YANG BIKIN JALAN!
        
        setToken(newToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
            // await axios.post('http://localhost:8000/api/logout');
        } catch (e) {
            console.error("Logout di server gagal, tapi tetap bersihkan data lokal");
        }
        
        // Hapus SEMUA data dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // JANGAN LUPA HAPUS USER
        
        // Bersihkan state
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);