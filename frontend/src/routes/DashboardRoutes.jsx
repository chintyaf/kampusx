import Dashboard from "../pages/dashboard/Dashboard";
import Test from "../pages/dashboard/Test";
import CreateEvent from "../pages/event/CreateEvent";

const dashboardRoutes = [
    // ADMIN ROUTES
    { path: "admin/dashboard", element: <Dashboard /> },
    { path: "admin/verifikasi-organizer", element: <Test /> },
    { path: "admin/kelola-pengguna", element: <CreateEvent /> },
    { path: "admin/pantau-acara", element: <CreateEvent /> },
    { path: "admin/kontrol-promosi", element: <CreateEvent /> },
];

export default dashboardRoutes;
