// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "./partials-dashboard/Sidebar.jsx";
import Navbar from "./partials-dashboard/Navbar.jsx";

import "../assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const DashboardLayout = () => {
    const location = useLocation();
    const path = location.pathname;

    // Logic to determine the sidebar type/state
    let sidebarType = "organizer"; // Default
    if (path.includes("/admin")) {
        sidebarType = "admin";
    } else if (path.includes("/organizer/event")) {
        sidebarType = "event_detail";
    }

    return (                                   
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* 1. Sidebar yang nempel terus di kiri */}
            <Sidebar type={sidebarType} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* 2. Navbar yang nempel di atas */}
                <Navbar />

                {/* 3. Area Konten Utama */}
                <main
                    style={{
                        padding: "30px 60px",
                        backgroundColor: "#F7F8F9",
                        flex: 1,
                    }}
                >
                    {/* Outlet inilah yang akan berubah jadi isi dari halaman 
              seperti Overview, Settings, atau Profile */}
                    {/* Pass the state to child page components via Outlet context */}
                    <Outlet context={{ sidebarType }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
