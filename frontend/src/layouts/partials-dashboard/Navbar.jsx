import React, { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import userImg from "../../assets/images/user-placeholder.avif";
import Button from "../../components/Button";
import EventStatusDropdown from "../../components/event/EventStatusDropdown";
import NotificationDropdown from "../../components/NotificationDropdown";
import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";

import {
    Bell,
    BellDotIcon,
    SquarePen,
    ChevronDown,
    LogOut,
    Menu, // Import Menu icon
} from "lucide-react";

// ... (Kode ProfileDropdown tetap sama persis)
const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
        console.log("Logging out...");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="dropdown">
            <div
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <div>
                    <img
                        className="rounded-circle object-fit-cover"
                        src={userImg}
                        alt="User"
                        width="30px"
                        height="30px"
                    />
                </div>
            </div>

            <ul
                className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 pop-down"
                style={{ minWidth: "150px" }}
            >
                {(user.role === "admin" || user.role === "organizer") && (
                    <li>
                        <NavLink
                            to="/organizer/dashboard"
                            className="dropdown-item d-flex align-items-center gap-2 py-2"
                        >
                            <LogOut size={16} />
                            <span>Masuk Organizer</span>
                        </NavLink>
                    </li>
                )}
                {user.role === "admin" && (
                    <li>
                        <NavLink
                            to="/admin/dashboard"
                            className="dropdown-item d-flex align-items-center gap-2 py-2"
                        >
                            <LogOut size={16} />
                            <span>Masuk Admin</span>
                        </NavLink>
                    </li>
                )}
                <li>
                    <button
                        className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        </div>
    );
};

// Terima props dari DashboardLayout
const Navbar = ({ toggleSidebar, showToggleBtn }) => {
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");
    const isOrganizer = location.pathname.startsWith("/organizer");
    const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(
        location.pathname,
    );

    const navLink = isAdmin ? "admin/dashboard" : "organizer/dashboard";

    return (
        <nav className="navbar">
            <div
                className="nav-content w-100 d-flex justify-content-between align-items-center"
                style={{ padding: "10px 20px" }}
            >
                {/* Tambahkan Icon Menu Sebelum Logo */}
                <div className="d-flex align-items-center gap-2">
                    {showToggleBtn && (
                        <button
                            className="btn btn-light d-flex align-items-center justify-content-center p-2 border-0 bg-transparent text-secondary hover-bg-light rounded-circle"
                            onClick={toggleSidebar}
                        >
                            <Menu size={22} />
                        </button>
                    )}
                    <NavLink
                        to={navLink}
                        className="link-dark text-decoration-none"
                    >
                        <img
                            src={LogoKampusX}
                            alt=""
                            className="h-100"
                            style={{ width: "130px" }}
                        />
                    </NavLink>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <NotificationDropdown />
                    <EventStatusDropdown isInsideEvent={isInsideEvent} />

                    {isOrganizer && !isInsideEvent && (
                        <NavLink
                            to="/organizer/buat-acara"
                            className="text-decoration-none"
                        >
                            <button
                                className="btn btn-primary"
                                style={{ fontSize: "14px" }}
                            >
                                Buat Event +
                            </button>
                        </NavLink>
                    )}

                    <ProfileDropdown />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
