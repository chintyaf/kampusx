import React, { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import userImg from "../../assets/images/user-placeholder.avif";
// import LogOut from "../../assets/icons/LogOut.svg";
import { Bell, BellDotIcon, SquarePen, ChevronDown, LogOut } from "lucide-react";

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
        console.log("Logging out...");
    };

    return (
        <>
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

                {/* 2. Menu Dropdown: Langsung tambahkan class pop-down */}
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
                {(user.role === "admin") && (
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
        </>
    );
};

export default ProfileDropdown;