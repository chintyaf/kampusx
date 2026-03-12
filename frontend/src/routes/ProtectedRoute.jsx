// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const isLogin = localStorage.getItem("token"); // Contoh cek login

    return isLogin ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
