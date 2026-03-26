// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";

import Sidebar from "./partials-dashboard/Sidebar.jsx";
import Navbar from "./partials-dashboard/Navbar.jsx";

import { Toaster } from "react-hot-toast";

import "../assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
const DashboardLayout = () => {
    const location = useLocation();
    const path = location.pathname;

    const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(
        location.pathname,
    );
    let sidebarType = "organizer";
    if (path.includes("/admin")) {
        sidebarType = "admin";
    } else if (isInsideEvent) {
        sidebarType = "event_detail";
    }

    return (
        <div
            className="d-flex flex-column"
            style={{ height: "100vh", overflow: "hidden" }}
        >
            <Navbar />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    overflow: "hidden",
                }}
            >
                {!path.includes("buat-acara") &&
                    !path.includes("organizer/dashboard") && (
                        <Sidebar type={sidebarType} />
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
