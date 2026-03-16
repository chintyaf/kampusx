import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    UserCheck,
    ChevronDown,
    Plus,
    UsersRound,
    FolderOpen,
    ChartColumn,
    Star,
    Form,
} from "lucide-react";

// --- Configuration Data ---
const MENU_ITEMS = {
    admin: [
        {
            id: "1",
            name: "Admin Dashboard",
            icon: <LayoutDashboard size={20} className="me-2" />,
            path: "admin/dashboard",
        },
        {
            id: "2",
            name: "Verifikasi Organizer",
            icon: <UserCheck size={20} className="me-2" />,
            path: "admin/verifikasi-organizer",
        },
        {
            id: "3",
            name: "Kelola Pengguna",
            icon: <UserCheck size={20} className="me-2" />,
            path: "admin/kelola-pengguna",
        },
        {
            id: "4",
            name: "Pantau Acara",
            icon: <UserCheck size={20} className="me-2" />,
            path: "admin/pantau-acara",
        },
        {
            id: "5",
            name: "Kontrol Promosi",
            icon: <UserCheck size={20} className="me-2" />,
            path: "admin/kontrol-promosi",
        },
    ],
    organizer: [
        {
            id: "1",
            name: "Dashboard",
            icon: <LayoutDashboard size={20} className="me-2" />,
            path: "organizer/dashboard",
        },
        {
            id: "2",
            name: "Daftar Acara",
            icon: <LayoutDashboard size={20} className="me-2" />,
            path: "organizer/daftar-acara",
        },
    ],
    event_detail: [
        {
            id: "1",
            name: "Dashboard",
            icon: <LayoutDashboard size={20} className="me-2" />,
            path: "organizer/event/dashboard",
        },
        {
            id: "2",
            name: "Detil Event",
            icon: <Form size={20} className="me-2" />,
            path: "organizer/event/detil-event",
            submenu: [
                { name: "Info Utama", path: "info-utama" },
                { name: "Waktu & Lokasi", path: "lokasi-n-waktu" },
                { name: "Daftar Pembicara", path: "daftar-pembicara" },
                { name: "Jenis Tiket", path: "kelola-tiket" },
                { name: "Formulir Registrasi", path: "formulir" },
                { name: "Kelola Staff", path: "kelola-staff" },
            ],
        },
        {
            id: "3",
            name: "Daftar Peserta",
            icon: <UsersRound size={20} className="me-2" />,
            path: "organizer/event/daftar-peserta",
        },
        {
            id: "4",
            name: "Distribusi Materi",
            icon: <FolderOpen size={20} className="me-2" />,
            path: "organizer/event/distribusi-materi",
        },
        {
            id: "5",
            name: "Statistik",
            icon: <ChartColumn size={20} className="me-2" />,
            path: "organizer/event/statistik",
        },
        {
            id: "6",
            name: "Promosi",
            icon: <Star size={20} className="me-2" />,
            path: "organizer/event/promosi",
        },
    ],
};

const ACCOUNT_ITEMS = [
    {
        id: "admin-account",
        name: "Admin",
        path: "admin/dashboard",
        icon: <UserCheck size={20} className="me-2" />,
    },
    {
        id: "organizer-account",
        name: "Organizer",
        path: "organizer/dashboard",
        icon: <UserCheck size={20} className="me-2" />,
    },
    {
        id: "event-account",
        name: "Event",
        path: "organizer/event/dashboard",
        icon: <UserCheck size={20} className="me-2" />,
    },
];

// --- Sub-component for individual items ---
const SidebarItem = ({ item, isOpen, toggle }) => {
    const location = useLocation();
    const hasSubmenu = !!item.submenu;

    const isChildActive = item.submenu?.some((sub) => {
        const fullPath = `${item.path}${sub.path}`.replace(/\/+/g, "/");
        return location.pathname.startsWith(fullPath);
    });

    // Shared NavLink style logic
    const navLinkClass = ({ isActive }) =>
        `nav-link custom-menu-item d-flex align-items-center border-0 ${isActive || isChildActive ? "active" : ""}`;

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
                className={`${navLinkClass({ isActive: false })} btn btn-toggle d-flex align-items-center justify-content-between w-100 rounded border-0 ${isOpen ? "" : "collapsed"}`}
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

            <div className={`submenu-collapse ${isOpen ? "show" : ""}`}>
                <div className="submenu-inner">
                    <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-1 ms-4 mt-1 border-start">
                        {item.submenu.map((sub, idx) => (
                            <li key={idx}>
                                <NavLink
                                    to={`${item.path}/${sub.path}`}
                                    className={navLinkClass}
                                >
                                    {sub.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

// --- Main Sidebar Component ---
const Sidebar = (props) => {
    const [openMenu, setOpenMenu] = useState("dashboard");
    const currentMenu = MENU_ITEMS[props.type] || [];

    const handleToggle = (id) => setOpenMenu(openMenu === id ? null : id);

    const location = useLocation();
    useEffect(() => {
        const currentPath = location.pathname;

        currentMenu.forEach((item) => {
            if (item.submenu) {
                const isActive = item.submenu.some((sub) => {
                    const fullPath = `/${item.path}/${sub.path}`;
                    return currentPath === fullPath;
                });

                if (isActive) {
                    setOpenMenu(item.id);
                }
            }
        });
    }, [location.pathname, currentMenu]);

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

            <ul className="list-unstyled ps-0 ">
                {currentMenu.map((item) => (
                    <li className="mb-3" key={item.id}>
                        <SidebarItem
                            item={item}
                            isOpen={openMenu === item.id}
                            toggle={handleToggle}
                        />
                    </li>
                ))}
            </ul>

            <div className="d-flex flex-column gap-2">
                <NavLink
                    to="/admin/dashboard"
                    className="btn btn-outline-primary d-flex align-items-center link-dark text-decoration-none mt-auto"
                >
                    Admin
                </NavLink>

                <NavLink
                    to="/organizer/dashboard"
                    className="btn btn-outline-primary d-flex align-items-center link-dark text-decoration-none mt-auto"
                >
                    Organizer
                </NavLink>

                <NavLink
                    to="/organizer/event/dashboard"
                    className="btn btn-outline-primary d-flex align-items-center link-dark text-decoration-none mt-auto"
                >
                    Event Organizer
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
