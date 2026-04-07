import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// --- Sub-component for individual items ---
const SidebarItem = ({ item, isOpen, toggle, isSidebarCollapsed }) => {
    const location = useLocation();
    const hasSubmenu = !!item.submenu;

    const isChildActive = item.submenu?.some((sub) => {
        const fullPath = `${item.path}${sub.path}`.replace(/\/+/g, "/");
        return location.pathname.startsWith(fullPath);
    });

    const navLinkClass = ({ isActive }) =>
        `nav-link custom-menu-item d-flex align-items-center border-0 ${isActive || isChildActive ? "active" : ""} ${isSidebarCollapsed ? "justify-content-center" : ""}`;

    if (!hasSubmenu) {
        return (
            <NavLink
                to={item.path}
                className={navLinkClass}
                end
                title={isSidebarCollapsed ? item.name : ""}
            >
                {item.icon}
                {!isSidebarCollapsed && (
                    <span className="menu-text ms-2">{item.name}</span>
                )}
            </NavLink>
        );
    }

    return (
        <>
            <button
                onClick={() => toggle(item.id)}
                className={`${navLinkClass({ isActive: isChildActive })} w-100 ${!isSidebarCollapsed ? "justify-content-between" : ""}`}
                title={isSidebarCollapsed ? item.name : ""}
                style={{
                    textAlign: "left",
                    outline: "none",
                    boxShadow: "none",
                }} // Reset style default tombol
            >
                <div className="d-flex align-items-center sidebar-parent-menu">
                    {item.icon}
                    {!isSidebarCollapsed && (
                        <span className="ms-2">{item.name}</span>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <ChevronDown
                        size={16}
                        style={{
                            transform: isOpen
                                ? "rotate(-180deg)"
                                : "rotate(0deg)", // Sedikit penyesuaian rotasi standar
                            transition: "0.3s",
                        }}
                    />
                )}
            </button>

            {!isSidebarCollapsed && (
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
            )}
        </>
    );
};

export default SidebarItem;
