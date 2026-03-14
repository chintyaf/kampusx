// src/layouts/DashboardLayout.jsx
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./partials-dashboard/Sidebar.jsx";
import Navbar from "./partials-dashboard/Navbar.jsx";

import "../assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const DashboardLayout = () => {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* 1. Sidebar yang nempel terus di kiri */}
            <Sidebar />

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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
