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

const styles = `
  .profile-wrap {
    position: relative;
    display: inline-block;
  }

  /* Trigger */
  .profile-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 4px;
    border-radius: 999px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    background: #fff;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    user-select: none;
  }
  .profile-trigger:hover {
    border-color: var(--bahama-blue-400, #34c2fc);
    box-shadow: 0 0 0 3px rgba(0,105,158,0.10), 0 2px 6px rgba(0,0,0,0.08);
  }
  .profile-trigger.open {
    border-color: var(--bahama-blue-600, #0089cb);
    background: var(--bahama-blue-50, #f0f9ff);
    box-shadow: 0 0 0 3px rgba(0,105,158,0.13);
  }

  .profile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    display: block;
  }
  .profile-avatar-fallback {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bahama-blue-100, #dff3ff);
    border: 1.5px solid var(--bahama-blue-300, #7bd6fe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bahama-blue-700, #00699e);
    flex-shrink: 0;
  }

  .profile-trigger-name {
    font-size: var(--font-xs, 12px);
    font-weight: 600;
    color: var(--color-text, #0f172a);
    max-width: 90px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-trigger-chevron {
    color: var(--color-text-muted, #94a3b8);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
  .profile-trigger.open .profile-trigger-chevron {
    transform: rotate(180deg);
  }

  /* Panel */
  .profile-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 240px;
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    box-shadow:
      0 0 0 1px rgba(0,105,158,0.06),
      0 20px 40px -8px rgba(7,48,74,0.18),
      0 4px 10px -2px rgba(0,0,0,0.08);
    overflow: hidden;
    z-index: 1050;
    animation: profileDropIn 0.16s ease;
  }
  @keyframes profileDropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* User card */
  .profile-user-card {
    padding: 14px 16px;
    background: var(--color-bg, #f8fafc);
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.18));
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .profile-user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bahama-blue-200, #b9e7fe);
    flex-shrink: 0;
  }
  .profile-user-avatar-fallback {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bahama-blue-100, #dff3ff);
    border: 2px solid var(--bahama-blue-200, #b9e7fe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bahama-blue-700, #00699e);
    flex-shrink: 0;
  }
  .profile-user-name {
    font-size: var(--font-sm, 14px);
    font-weight: 700;
    color: var(--color-text, #0f172a);
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-user-email {
    font-size: 11px;
    color: var(--color-text-muted, #94a3b8);
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 999px;
    margin-top: 4px;
    text-transform: capitalize;
    letter-spacing: 0.2px;
  }
  .profile-role-badge.admin {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }
  .profile-role-badge.organizer {
    background: var(--bahama-blue-50, #f0f9ff);
    color: var(--bahama-blue-700, #00699e);
    border: 1px solid var(--bahama-blue-200, #b9e7fe);
  }
  .profile-role-badge.user {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
  }

  /* Menu items */
  .profile-menu { padding: 6px; }
  .profile-menu-section {
    padding-top: 6px;
    margin-top: 6px;
    border-top: 1px solid var(--color-border, rgba(88,101,122,0.13));
  }
  .profile-menu-section:first-child {
    padding-top: 0;
    margin-top: 0;
    border-top: none;
  }

  .profile-menu-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.12s ease;
    color: var(--color-text, #0f172a);
    width: 100%;
    border: none;
    background: transparent;
    font-size: var(--font-sm, 14px);
    font-weight: 500;
    text-align: left;
  }
  .profile-menu-item:hover {
    background: var(--color-bg, #f8fafc);
    color: var(--color-text, #0f172a);
    text-decoration: none;
  }
  .profile-menu-item.danger { color: #dc2626; }
  .profile-menu-item.danger:hover { background: #fff5f5; color: #b91c1c; }

  .profile-menu-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1.5px solid var(--item-border, #c7cdd8);
    background: var(--item-bg, #f8fafc);
  }
  .profile-menu-label { flex: 1; }
  .profile-menu-arrow {
    color: var(--color-text-muted, #cbd5e1);
    flex-shrink: 0;
    transition: transform 0.12s ease;
  }
  .profile-menu-item:hover .profile-menu-arrow {
    transform: translateX(2px);
    color: var(--color-secondary, #94a3b8);
  }
`;

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
            <style>{styles}</style>
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
