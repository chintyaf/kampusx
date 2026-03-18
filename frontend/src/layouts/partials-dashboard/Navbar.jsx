import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import userImg from "../../assets/images/user-placeholder.avif";
import Button from "../../components/Button";

import {
    Bell,
    BellDotIcon,
    SquarePen,
    ChevronDown,
    LogOut,
} from "lucide-react";

const Navbar = () => {
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        console.log("Logging out...");
    };

    const isAdmin = location.pathname.startsWith("/admin");
    const isOrganizer = location.pathname.startsWith("/organizer");
    const isInsideEvent = location.pathname.startsWith("/organizer/event");

    return (
        <nav className="navbar">
            {/* Logo Section */}

            <div
                className="nav-content w-100 d-flex justify-content-between align-items-center gap-3"
                style={{ padding: "16px 60px" }}
            >
                <div>
                    <NavLink
                        to="/"
                        className="d-flex justify-content-center align-items-center link-dark text-decoration-none"
                    >
                        <span className="logo-text fw-bold">KAMPUS</span>
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="#1a3a63"
                            className="ms-2"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </NavLink>
                </div>
                <div className="d-flex align-items-center gap-3">
                    {/* Notifikasi */}

                    <div style={{ cursor: "pointer" }}>
                        <BellDotIcon size={20} />
                    </div>

                    {/* Status Event */}
                    {isInsideEvent && (
                        <div
                            className="event-status d-flex gap-2 align-items-center px-2 py-2 rounded-3"
                            style={{ cursor: "pointer" }}
                        >
                            <SquarePen size={20} color="#A6784D" />
                            <p className="fw-semibold mx-0">Draft</p>
                            <ChevronDown
                                className="dropdown"
                                size={20}
                                style={{ marginTop: "3px" }}
                            />
                        </div>
                    )}

                    {/* Buat Event */}
                    {isOrganizer && !isInsideEvent && (
                        <NavLink
                            to="/organizer/buat-acara"
                            className="text-decoration-none"
                        >
                            <Button variant="primary">Buat Event +</Button>
                        </NavLink>
                    )}
                    {/* Profile */}
                    <div
                        className="position-relative"
                        style={{ cursor: "pointer" }}
                    >
                        <div
                            className="user-icon cursor-pointer"
                            onClick={toggleDropdown}
                        >
                            <img
                                className="rounded-circle object-fit-cover"
                                src={userImg}
                                alt="User"
                                width="40px"
                                height="40px"
                            />
                        </div>

                        {/* The Overlay (Can stay conditional) */}
                        {isOpen && (
                            <div
                                className="position-fixed top-0 start-0 w-100 h-100"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    zIndex: 998,
                                    background: "transparent",
                                }}
                            />
                        )}

                        {/* The Menu (DO NOT wrap in {isOpen && ...}) */}
                        <ul
                            className={`dropdown-menu position-absolute end-0 mt-2 profile-dropdown ${isOpen ? "show" : ""}`}
                            style={{ zIndex: 999, minWidth: "150px" }}
                        >
                            <li>
                                <button
                                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
