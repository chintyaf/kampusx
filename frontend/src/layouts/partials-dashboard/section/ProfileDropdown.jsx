import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import userImg from "../../../assets/images/user-placeholder.avif";
import {
    LogOut,
    Home,
    LayoutDashboard,
    ShieldCheck,
    ChevronRight,
    User,
} from "lucide-react";

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate("/");
    };

    if (!user) return null;

    const displayName = user.name || user.email?.split("@")[0] || "User";
    const role = user.role || "user";

    const menuItems = [
        {
            icon: Home,
            label: "Halaman Utama",
            to: "/",
            iconBg: "#f1f5f9",
            iconBorder: "#cbd5e1",
            iconColor: "#64748b",
            show: true,
        },
        {
            icon: LayoutDashboard,
            label: "Masuk Organizer",
            to: "/organizer/dashboard",
            iconBg: "var(--bahama-blue-50, #f0f9ff)",
            iconBorder: "var(--bahama-blue-200, #b9e7fe)",
            iconColor: "var(--bahama-blue-700, #00699e)",
            show: role === "admin" || role === "organizer",
        },
        {
            icon: ShieldCheck,
            label: "Masuk Admin",
            to: "/admin/dashboard",
            iconBg: "#fefce8",
            iconBorder: "#fde68a",
            iconColor: "#d97706",
            show: role === "admin",
        },
    ];

    return (
        <>
            <div className="profile-wrap" ref={ref}>
                {/* Trigger */}
                <div
                    className={`profile-trigger ${open ? "open" : ""}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    {!imgError ? (
                        <img
                            className="profile-avatar"
                            src={userImg}
                            alt="User"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="profile-avatar-fallback">
                            <User size={14} strokeWidth={2} />
                        </div>
                    )}
                    <span className="profile-trigger-name">{displayName}</span>
                    <ChevronRight
                        size={13}
                        strokeWidth={2.5}
                        className="profile-trigger-chevron"
                        style={{
                            transform: open
                                ? "rotate(-90deg)"
                                : "rotate(90deg)",
                        }}
                    />
                </div>

                {/* Panel */}
                {open && (
                    <div className="profile-panel">
                        {/* User card */}
                        <div className="profile-user-card">
                            {!imgError ? (
                                <img
                                    className="profile-user-avatar"
                                    src={userImg}
                                    alt="User"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="profile-user-avatar-fallback">
                                    <User size={18} strokeWidth={2} />
                                </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                                <div className="profile-user-name">
                                    {displayName}
                                </div>
                                {user.email && (
                                    <div className="profile-user-email">
                                        {user.email}
                                    </div>
                                )}
                                <div className={`profile-role-badge ${role}`}>
                                    {role === "admin" && "⭐ "}
                                    {role === "organizer" && "🎯 "}
                                    {role}
                                </div>
                            </div>
                        </div>

                        {/* Menu */}
                        <div className="profile-menu">
                            {/* Nav links */}
                            <div className="profile-menu-section">
                                {menuItems
                                    .filter((m) => m.show)
                                    .map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                className="profile-menu-item"
                                                onClick={() => setOpen(false)}
                                            >
                                                <div
                                                    className="profile-menu-icon"
                                                    style={{
                                                        "--item-bg":
                                                            item.iconBg,
                                                        "--item-border":
                                                            item.iconBorder,
                                                    }}
                                                >
                                                    <Icon
                                                        size={14}
                                                        color={item.iconColor}
                                                        strokeWidth={2}
                                                    />
                                                </div>
                                                <span className="profile-menu-label">
                                                    {item.label}
                                                </span>
                                                <ChevronRight
                                                    size={13}
                                                    className="profile-menu-arrow"
                                                />
                                            </NavLink>
                                        );
                                    })}
                            </div>

                            {/* Logout */}
                            <div className="profile-menu-section">
                                <button
                                    className="profile-menu-item danger"
                                    onClick={handleLogout}
                                >
                                    <div
                                        className="profile-menu-icon"
                                        style={{
                                            "--item-bg": "#fff5f5",
                                            "--item-border": "#fecaca",
                                        }}
                                    >
                                        <LogOut
                                            size={14}
                                            color="#ef4444"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <span className="profile-menu-label">
                                        Logout
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProfileDropdown;
