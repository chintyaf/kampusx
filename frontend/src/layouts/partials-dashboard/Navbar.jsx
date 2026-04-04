import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import EventStatusDropdown from "../../components/event/EventStatusDropdown";
import NotificationDropdown from "../../components/NotificationDropdown";
import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";
import ProfileDropdown from "../../layouts/partials-dashboard/section/ProfileDropdown";
import { Menu, ShieldCheck, Building2, CalendarDays } from "lucide-react";

/* ─── Context chip config ─────────────────────────────── */
const CONTEXT_CONFIG = {
    admin: {
        label: "Admin",
        icon: ShieldCheck,
        color: "#92400e",
        bg: "#fef3c7",
        border: "#fde68a",
        dot: "#d97706",
    },
    organizer: {
        label: "Organizer",
        icon: Building2,
        color: "var(--bahama-blue-700, #00699e)",
        bg: "var(--bahama-blue-50, #f0f9ff)",
        border: "var(--bahama-blue-200, #b9e7fe)",
        dot: "var(--bahama-blue-500, #0aabed)",
    },
    event: {
        label: "Event Dashboard",
        icon: CalendarDays,
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        dot: "#7c3aed",
    },
};

const styles = `
  .navbar-dashboard {
    background: #fff;
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.18));
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
    z-index: 100;
  }

  .navbar-toggle-btn {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-secondary, #64748b);
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .navbar-toggle-btn:hover {
    border-color: var(--bahama-blue-400, #34c2fc);
    color: var(--bahama-blue-700, #00699e);
    box-shadow: 0 0 0 3px rgba(0,105,158,0.10);
  }

  /* Divider between logo and chip */
  .navbar-divider {
    width: 1px;
    height: 20px;
    background: var(--color-border-mid, #c7cdd8);
    flex-shrink: 0;
  }

  /* Context chip */
  .ctx-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 7px;
    border-radius: 999px;
    border: 1.5px solid var(--chip-border);
    background: var(--chip-bg);
    font-size: 12px;
    font-weight: 700;
    color: var(--chip-color);
    letter-spacing: -0.1px;
    white-space: nowrap;
    animation: chipFadeIn 0.2s ease;
  }
  @keyframes chipFadeIn {
    from { opacity: 0; transform: scale(0.92) translateX(-4px); }
    to   { opacity: 1; transform: scale(1) translateX(0); }
  }

  .ctx-chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--chip-dot);
    animation: dotPulse 2.5s ease infinite;
    flex-shrink: 0;
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  .ctx-chip-icon-wrap {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.05);
    flex-shrink: 0;
  }

  /* Create event button */
  .btn-create-event {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 9px;
    border: none;
    background: linear-gradient(135deg, var(--bahama-blue-600, #0089cb) 0%, var(--bahama-blue-800, #055c87) 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.18s ease;
    box-shadow: 0 2px 6px rgba(0,105,158,0.28);
    letter-spacing: -0.1px;
  }
  .btn-create-event:hover {
    filter: brightness(1.08);
    box-shadow: 0 4px 12px rgba(0,105,158,0.35);
    transform: translateY(-1px);
    color: #fff;
    text-decoration: none;
  }
  .btn-create-event:active {
    transform: translateY(0);
  }
`;

const ContextChip = ({ configKey }) => {
    const cfg = CONTEXT_CONFIG[configKey];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <div
            className="ctx-chip"
            style={{
                "--chip-bg": cfg.bg,
                "--chip-border": cfg.border,
                "--chip-color": cfg.color,
                "--chip-dot": cfg.dot,
            }}
        >
            <span className="ctx-chip-dot" />
            <span className="ctx-chip-icon-wrap">
                <Icon size={11} strokeWidth={2.5} color={cfg.color} />
            </span>
            {cfg.label}
        </div>
    );
};

const Navbar = ({ toggleSidebar, showToggleBtn }) => {
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");
    const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(
        location.pathname,
    );
    const isOrganizer =
        location.pathname.startsWith("/organizer") && !isInsideEvent;

    const navLink = isAdmin ? "admin/dashboard" : "organizer/dashboard";

    const contextKey = isAdmin
        ? "admin"
        : isInsideEvent
          ? "event"
          : "organizer";

    return (
        <>
            <style>{styles}</style>
            <nav className="navbar-dashboard">
                <div
                    className="w-100 d-flex justify-content-between align-items-center"
                    style={{ padding: "10px 20px" }}
                >
                    {/* Left: toggle + logo + divider + chip */}
                    <div className="d-flex align-items-center gap-2">
                        {showToggleBtn && (
                            <button
                                className="navbar-toggle-btn"
                                onClick={toggleSidebar}
                            >
                                <Menu size={16} strokeWidth={2} />
                            </button>
                        )}

                        <NavLink
                            to={navLink}
                            className="text-decoration-none d-flex align-items-center"
                        >
                            <img
                                src={LogoKampusX}
                                alt="KampusX"
                                style={{
                                    width: "110px",
                                    height: "auto",
                                    display: "block",
                                }}
                            />
                        </NavLink>

                        <div className="navbar-divider" />

                        <ContextChip configKey={contextKey} />
                    </div>

                    {/* Right: actions */}
                    <div className="d-flex align-items-center gap-2">
                        <NotificationDropdown />
                        <EventStatusDropdown isInsideEvent={isInsideEvent} />

                        {isOrganizer && (
                            <NavLink
                                to="/organizer/buat-acara"
                                className="btn-create-event"
                            >
                                Buat Event
                                <span style={{ fontSize: 15, lineHeight: 1 }}>
                                    +
                                </span>
                            </NavLink>
                        )}

                        <ProfileDropdown />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
