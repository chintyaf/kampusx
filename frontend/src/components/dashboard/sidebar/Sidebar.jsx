import React from "react";
import { NavLink } from "react-router-dom"; // Menggunakan NavLink untuk deteksi link aktif otomatis
import {
    LayoutDashboard,
    UserCheck,
    Users,
    Calendar,
    Star,
} from "lucide-react";

import "./Sidebar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
    // Tambahkan property 'path' untuk rute tujuan

    const menuItems = [
        {
            name: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/dashboard",
        },
        {
            name: "Verifikasi Organizer",
            icon: <UserCheck size={20} />,
            path: "/test",
        },
        { name: "Kelola Pengguna", icon: <Users size={20} />, path: "/users" },
        { name: "Pantau Acara", icon: <Calendar size={20} />, path: "/acara" },
        { name: "Kontrol Promosi", icon: <Star size={20} />, path: "/promosi" },
    ];

    return (
        <div className="sidebar-container border-end">
            {/* Logo Section */}
            <div className="sidebar-logo d-flex align-items-center justify-content-center">
                <span className="logo-text">KAMPUS</span>
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="#1a3a63"
                    className="ms-2"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>

            {/* Navigation Menu */}
            <nav className="nav flex-column px-3">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link px-3 py-3 custom-menu-item d-flex align-items-center border-0 ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="menu-icon me-3">{item.icon}</span>
                        <span className="menu-text">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
