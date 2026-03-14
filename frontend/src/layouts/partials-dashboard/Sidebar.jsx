import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserCheck, ChevronDown } from "lucide-react";

// --- Configuration Data ---
const MENU_ITEMS = [
    {
        id: "dashboard",
        name: "Dashboard",
        icon: <LayoutDashboard size={20} className="me-2" />,
        path: "/dashboard",
    },
    {
        id: "test",
        name: "Dashboard",
        icon: <LayoutDashboard size={20} className="me-2" />,
        path: "/dashboard",
        submenu: [{ name: "Create Event", path: "/create-event" }],
    },
];

const ACCOUNT_ITEMS = {
    id: "account",
    name: "Account",
    icon: (
        <div
            className="bg-secondary rounded-circle me-2"
            style={{ width: 20, height: 20 }}
        />
    ),
    submenu: [
        { name: "Profile", path: "#" },
        { name: "Settings", path: "#" },
        { name: "Sign out", path: "#" },
    ],
};

// --- Sub-component for individual items ---
const SidebarItem = ({ item, isOpen, toggle }) => {
    const hasSubmenu = !!item.submenu;

    // Shared NavLink style logic
    const navLinkClass = ({ isActive }) =>
        `nav-link px-3 py-2 custom-menu-item d-flex align-items-center border-0 ${isActive ? "active" : ""}`;

    if (!hasSubmenu) {
        return (
            <NavLink to={item.path} className={navLinkClass}>
                {item.icon} <span className="menu-text">{item.name}</span>
            </NavLink>
        );
    }

    return (
        <>
            <button
                onClick={() => toggle(item.id)}
                className={`px-3 btn btn-toggle d-flex align-items-center justify-content-between w-100 rounded border-0 ${isOpen ? "parent-menu" : "collapsed"}`}
            >
                <div className="d-flex align-items-center sidebar-parent-menu">
                    {item.icon} {item.name}
                </div>
                <ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? "rotate(0deg)" : "rotate(90deg)",
                        transition: "0.3s",
                    }}
                />
            </button>

            <div className={`collapse ${isOpen ? "show" : ""}`}>
                <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-4 ms-2 mt-1 border-start">
                    {item.submenu.map((sub, idx) => (
                        <li key={idx}>
                            <NavLink to={sub.path} className={navLinkClass}>
                                {sub.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

// --- Main Sidebar Component ---
const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState("dashboard");

    const handleToggle = (id) => setOpenMenu(openMenu === id ? null : id);

    return (
        <div
            className="sidebar-container flex-shrink-0 p-3 bg-white border-end"
            style={{ width: 280, minHeight: "100vh" }}
        >
            {/* Logo Section */}
            <NavLink
                to="/"
                className="d-flex justify-content-center align-items-center pb-3 mb-3 link-dark text-decoration-none"
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

            <ul className="list-unstyled ps-0">
                {MENU_ITEMS.map((item) => (
                    <li className="mb-1" key={item.id}>
                        <SidebarItem
                            item={item}
                            isOpen={openMenu === item.id}
                            toggle={handleToggle}
                        />
                    </li>
                ))}

                <li className="border-top my-3"></li>

                <li className="mb-1">
                    <SidebarItem
                        item={ACCOUNT_ITEMS}
                        isOpen={openMenu === "account"}
                        toggle={handleToggle}
                    />
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
