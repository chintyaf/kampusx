// src/layouts/DashboardLayout.jsx
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./partials-dashboard/Sidebar.jsx"; // Komponen sidebar Anda
import Navbar from "./partials-dashboard/Navbar.jsx"; // Komponen header user

const VisitorLayout = () => {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* 1. Sidebar yang nempel terus di kiri */}
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* 2. Navbar yang nempel di atas */}
                <Navbar />
                tes
                {/* 3. Area Konten Utama */}
                <main
                    style={{
                        padding: "20px",
                        backgroundColor: "#f4f4f4",
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

export default VisitorLayout;
