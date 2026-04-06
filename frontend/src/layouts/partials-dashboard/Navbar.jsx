import React, { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import userImg from "../../assets/images/user-placeholder.avif";
import Button from "../../components/Button";
import EventStatusDropdown from "../../components/event/EventStatusDropdown";
import NotificationDropdown from "../../components/NotificationDropdown";
import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";
import ProfileDropdown from "./ProfileDropdown";

import {
    Bell,
    BellDotIcon,
    SquarePen,
    ChevronDown,
    LogOut,
} from "lucide-react";

// const Navbar = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();

//     const handleLogout = async () => {
//         await logout();
//         navigate('/');
//         console.log("Logging out...");

//     };

//     const location = useLocation();

//     const [isOpen, setIsOpen] = useState(false);
//     const toggleDropdown = () => setIsOpen(!isOpen);

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (user?.role !== "admin" && user?.role !== "organizer") {
        return (
            <nav className="navbar">
                <div className="nav-content w-100 d-flex justify-content-between align-items-center" style={{ padding: "10px 60px 10px 40px" }}>
                    
                    {/* Logo arahkan ke home / dashboard member */}
                    <NavLink to="/" className="link-dark text-decoration-none">
                        <img src={LogoKampusX} alt="KampusX" style={{ width: "130px" }} />
                    </NavLink>

                    <div className="d-flex align-items-center gap-3">
                        {/* Menu Khusus Member */}
                        <NavLink to="/explore-events" className="text-decoration-none text-dark fw-semibold me-3">
                            Eksplor Event
                        </NavLink>
                        <NavLink to="/my-tickets" className="text-decoration-none text-dark fw-semibold me-3">
                            Tiket Saya
                        </NavLink>
                        
                        <NotificationDropdown />
                        <ProfileDropdown />
                    </div>
                </div>
            </nav>
        );
    }

    const isAdmin = location.pathname.startsWith("/admin");
    const isOrganizer = location.pathname.startsWith("/organizer");
    const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(
        location.pathname,
    );

    const navLink = isAdmin ? "admin/dashboard" : "organizer/dashboard";
    return (
        <nav className="navbar">
            {/* Logo Section */}
            <div
                className="nav-content w-100 d-flex justify-content-between align-items-center"
                style={{ padding: "10px 60px 10px 40px" }}
            >
                <div className="col-2">
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
                    {/* Notifikasi */}

                    <NotificationDropdown />

                    {/* Status Event */}
                    <EventStatusDropdown isInsideEvent={isInsideEvent} />

                    {/* Buat Event */}
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

                    {/* Profile */}
                    <ProfileDropdown />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
