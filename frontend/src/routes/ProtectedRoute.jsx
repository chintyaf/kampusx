import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole = [] }) => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    // 1. Cek ketat: tendang ke signin kalau tidak ada token, atau userJson kosong/bernilai string "null"/"undefined"
    if (!token || !userJson || userJson === "null" || userJson === "undefined") {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userJson);

        // 2. Cek ekstra: Pastikan hasil parse benar-benar object (bukan null)
        if (!user) {
            return <Navigate to="/login" replace />;
        }

        const userRole = user.role;

        // 3. Pengecekan Role (Hanya jalan jika allowedRole diberikan)
        if (allowedRole && allowedRole.length > 0) {
            const isAllowed = allowedRole.includes(userRole);

            if (!isAllowed) {
                // Punya token tapi role tidak sesuai, tendang ke beranda
                return <Navigate to="/" replace />;
            }
        }

        // 4. Semua aman, render halaman
        return <Outlet />;
    } catch (error) {
        console.error("Error parsing user data:", error);

        // Bersihkan localStorage yang korup agar tidak nyangkut terus
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/signin" replace />;
    }
};

export default ProtectedRoute;