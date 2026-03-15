import { Routes, Route } from "react-router-dom";
import VisitorLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import daftar rute
import visitorRoutes from "./PublicRoutes";
import dashboardRoutes from "./DashboardRoutes";
import Dashboard from "../pages/dashboard/Dashboard";
import Test from "../pages/dashboard/Test";
import CreateEvent from "../pages/event/CreateEvent";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Group Visitor */}
            {/* <Route element={<VisitorLayout />}>
                {visitorRoutes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Route> */}

            {/* Group Dashboard */}
            <Route element={<DashboardLayout />}>
                <Route path="admin">
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="verifikasi-organizer" element={<Test />} />
                    <Route path="kelola-pengguna" element={<CreateEvent />} />
                    <Route path="pantau-acara" element={<CreateEvent />} />
                    <Route path="kontrol-promosi" element={<CreateEvent />} />
                </Route>

                <Route path="organizer">
                    <Route path="Dashboard" element={<CreateEvent />} />
                    <Route path="daftar-acara" element={<CreateEvent />} />
                    <Route path="buat-acara" element={<CreateEvent />} />

                    {/* Event Routes untuk Detail Event */}
                    <Route path="event">
                        <Route path="dashboard" element={<CreateEvent />} />
                        <Route path="detil-event" element={<CreateEvent />}>
                            <Route path="info-utama" />
                            <Route path="lokasi-n-waktu" />
                            <Route path="daftar-pembicara" />
                            <Route path="kelola-tiket" />
                            <Route path="formulir" />
                            <Route path="kelola-staff" />
                        </Route>

                        <Route
                            path="daftar-peserta"
                            element={<CreateEvent />}
                        />
                        <Route
                            path="distribusi-materi"
                            element={<CreateEvent />}
                        />
                        <Route path="statistik" element={<CreateEvent />} />
                        <Route path="promosi" element={<CreateEvent />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
