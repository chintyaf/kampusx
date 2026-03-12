import { Routes, Route } from "react-router-dom";
import VisitorLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import daftar rute
import visitorRoutes from "./PublicRoutes";
import dashboardRoutes from "./dashboardRoutes";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Group Visitor */}
            <Route element={<VisitorLayout />}>
                {visitorRoutes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Route>

            {/* Group Dashboard */}
            <Route element={<DashboardLayout />}>
                {dashboardRoutes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Route>
        </Routes>
    );
};

export default AppRoutes;
