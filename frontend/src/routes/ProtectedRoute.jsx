import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    // Jika belum login, tendang ke signin
    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    try {
        const user = JSON.parse(userJson);
        const userRole = user.role;

        // 3. Check if the user's role exists in the allowedRole array
        // Example: ["admin"].includes("organizer") -> false
        const isAllowed = allowedRole.includes(userRole);

        if (!isAllowed) {
            // If they are logged in but don't have the right role,
            // send them to a "Unauthorized" page or back to their own dashboard.
            return <Navigate to="/" replace />;
        }

        // 4. If everything is fine, show the page
        return <Outlet />;
    } catch (error) {
        // If JSON parsing fails, the data is corrupt
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;
