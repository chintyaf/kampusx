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

    return (
        <nav className="navbar">
            <div
                className="nav-content w-100 d-flex justify-content-end align-items-center gap-3"
                style={{ padding: "16px 60px" }}
            >
                {/* Notifikasi */}
                <BellDotIcon size={20} />

                {/* Status Event */}
                {location.pathname === "/dashboard" && (
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
                <Button variant="primary">Buat Event +</Button>

                {/* Profile */}
                <div className="position-relative">
                    <div
                        className="user-icon cursor-pointer"
                        onClick={toggleDropdown}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            className=" rounded-circle object-fit-cover"
                            src={userImg}
                            alt="User"
                            width="40px"
                            height="40px"
                        />
                    </div>
                    {isOpen && (
                        <>
                            {/* Overlay untuk menutup dropdown saat klik di luar */}
                            <div
                                className="position-fixed top-0 start-0 w-100 h-100"
                                onClick={() => setIsOpen(false)}
                                style={{ zIndex: 998 }}
                            />

                            <ul
                                className="dropdown-menu show position-absolute end-0 mt-2"
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
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
