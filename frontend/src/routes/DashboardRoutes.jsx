import Dashboard from "../pages/dashboard/Dashboard";
import Test from "../pages/dashboard/Test";
import CreateEvent from "../pages/dashboard/event/Create";

const dashboardRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/test", element: <Test /> },
    { path: "/create-event", element: <CreateEvent /> },
];

export default dashboardRoutes;
