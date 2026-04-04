// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react"; // Tambahkan useState

import Sidebar from "./partials-dashboard/Sidebar.jsx";
import Navbar from "./partials-dashboard/Navbar.jsx";

import { Toaster } from "react-hot-toast";

import "../assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const DashboardLayout = () => {
    const location = useLocation();
    const path = location.pathname;

    // State untuk collapse sidebar
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(
        location.pathname,
    );

    let sidebarType = "organizer";

    if (path.includes("/admin")) {
        sidebarType = "admin";
    } else if (isInsideEvent) {
        sidebarType = "event_detail";
    }

    // Kondisi kapan sidebar benar-benar dirender
    const showSidebar =
        path !== "/" &&
        !path.includes("buat-acara") &&
        !path.includes("organizer/dashboard");

    return (
        <div
            className="d-flex flex-column"
            style={{ height: "100vh", overflow: "hidden" }}
        >
            {/* Kirim state dan toggle ke Navbar */}
            <Navbar
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                showToggleBtn={showSidebar}
            />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    overflow: "hidden",
                }}
            >
                {showSidebar && (
                    <Sidebar
                        type={sidebarType}
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed} // ✅ Tambahkan baris ini
                    />
                )}

                <main
                    style={{
                        padding: "30px 60px",
                        backgroundColor: "#F7F8F9",
                        flex: 1,
                        overflowY: "auto",
                    }}
                >
                    <Toaster
                        position="top-right"
                        containerStyle={{ top: 100, right: 40 }}
                    />
                    <Outlet context={{ sidebarType }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
