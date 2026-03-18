// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import VisitorLayout from '../layouts/MainLayout';

const ProtectedRoute = () => {
    // const isLogin = localStorage.getItem("token"); // Contoh cek login

    // return isLogin ? <Outlet /> : <Navigate to="/login" />;
    const isLoggedIn = true; // Coba ubah ke false untuk melihat efeknya

    if (!isLoggedIn) {
        // Kalau belum login, tendang ke halaman Sign In
        return <Navigate to="/signin" replace />;
    }

    // Kalau sudah login, tampilkan layout Visitor (dengan Navbar Member) beserta halaman Checkout-nya
    return (
        <VisitorLayout>
            <Outlet />
        </VisitorLayout>
    );
};

export default ProtectedRoute;
