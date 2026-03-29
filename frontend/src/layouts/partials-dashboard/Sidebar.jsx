import { useEffect, useState } from "react";
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
    UserRoundPen,
} from "lucide-react";

// --- Configuration Data ---
const MENU_ITEMS = {
    admin: [
        {
            id: "1",
            name: "Admin Dashboard",
            icon: <LayoutDashboard size={16} className="me-2" />,
            path: "admin/dashboard",
        },
        {
            id: "2",
            name: "Verifikasi Organizer",
            icon: <UserCheck size={16} className="me-2" />,
            path: "admin/verifikasi-organizer",
        },
        {
            id: "3",
            name: "Kelola Pengguna",
            icon: <UserCheck size={16} className="me-2" />,
            path: "admin/kelola-pengguna",
        },
        {
            id: "4",
            name: "Pantau Acara",
            icon: <UserCheck size={16} className="me-2" />,
            path: "admin/pantau-acara",
        },
        {
            id: "5",
            name: "Kontrol Promosi",
            icon: <UserCheck size={16} className="me-2" />,
            path: "admin/kontrol-promosi",
        },
    ],
    organizer: [
        {
            id: "1",
            name: "Dashboard",
            icon: <LayoutDashboard size={16} className="me-2" />,
            path: "organizer/dashboard",
        },
        {
            id: "2",
            name: "Daftar Acara",
            icon: <LayoutDashboard size={16} className="me-2" />,
            path: "organizer/daftar-acara",
        },
    ],
    event_detail: [
        {
            id: "1",
            name: "Dashboard",
            icon: <LayoutDashboard size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/",
        },
        {
            id: "2",
            name: "Detil Event",
            icon: <Form size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/detail",
            submenu: [
                { name: "Info Utama", path: "info" },
                { name: "Tempat Acara", path: "tempat" },
                { name: "Susunan Acara", path: "sesi" },
                { name: "Daftar Pembicara", path: "pembicara" },
                { name: "Formulir Registrasi", path: "formulir" },
            ],
        },
        {
            id: "7",
            name: "Staff Administrasi",
            icon: <UserRoundPen size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/kelola-staff",
        },
        {
            id: "3",
            name: "Daftar Peserta",
            icon: <UsersRound size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/daftar-peserta",
        },
        {
            id: "8",
            name: "Sertifikat",
            icon: <UserRoundPen size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/upload-sertifikat",
        },
        {
            id: "4",
            name: "Distribusi Materi",
            icon: <FolderOpen size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/distribusi-materi",
        },
        {
            id: "5",
            name: "Statistik",
            icon: <ChartColumn size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/statistik",
        },
        {
            id: "6",
            name: "Promosi",
            icon: <Star size={16} className="me-2" />,
            path: "/organizer/:eventId/event-dashboard/promosi",
        },
    ],
};

const ACCOUNT_ITEMS = [
    {
        id: "admin-account",
        name: "Admin",
        path: "admin/dashboard",
        icon: <UserCheck size={16} className="me-2" />,
    },
    {
        id: "organizer-account",
        name: "Organizer",
        path: "organizer/dashboard",
        icon: <UserCheck size={16} className="me-2" />,
    },
    {
        id: "event-account",
        name: "Event",
        path: "organizer/event/dashboard",
        icon: <UserCheck size={16} className="me-2" />,
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
            <NavLink
                to={item.path} // Cukup ke item.path saja, tidak perlu ${sub.path}
                className={navLinkClass}
                end
            >
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
                        transform: isOpen ? "rotate(-90deg)" : "rotate(0deg)",
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
    const location = useLocation();

    // 1. Tangkap eventId dari URL
    // Pattern: /organizer/{eventId}/event-dashboard
    const eventIdMatch = location.pathname.match(
        /\/organizer\/([^/]+)\/event-dashboard/,
    );
    const currentEventId = eventIdMatch ? eventIdMatch[1] : "";

    // 2. Ambil menu dasar, lalu ganti placeholder :eventId dengan ID asli
    const baseMenu = MENU_ITEMS[props.type] || [];
    const currentMenu = baseMenu.map((item) => ({
        ...item,
        // Kita ganti :eventId (atau tetap dukung :slug jika belum diubah di config)
        path: item.path
            ? item.path.replace(/:eventId|:slug/g, currentEventId)
            : item.path,
    }));

    const handleToggle = (id) => setOpenMenu(openMenu === id ? null : id);

    useEffect(() => {
        const currentPath = location.pathname;

        currentMenu.forEach((item) => {
            if (item.submenu) {
                const isActive = item.submenu.some((sub) => {
                    // Gabungkan path parent dan child secara aman
                    const fullPath = `${item.path}/${sub.path}`.replace(
                        /\/+/g,
                        "/",
                    );
                    return currentPath.startsWith(fullPath);
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
            style={{ width: "250px", height: "100%", overflowY: "auto" }}
        >
            <ul className="list-unstyled ps-0">
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
        </div>
    );
};

export default Sidebar;
