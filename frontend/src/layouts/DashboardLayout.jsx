// src/layouts/DashboardLayout.jsx
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/sidebar/Sidebar.jsx"; // Komponen sidebar Anda
import Navbar from "../components/dashboard/navbar/Navbar.jsx"; // Komponen header user

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
                        padding: "20px",
                        backgroundColor: "#F7F8F9",
                        flex: 1,
                    }}
                >
                    <p>Dashboard</p>
                    {/* Outlet inilah yang akan berubah jadi isi dari halaman 
              seperti Overview, Settings, atau Profile */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
