import { Routes, Route, Navigate } from "react-router-dom";
import VisitorLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import daftar rute
import visitorRoutes from "./PublicRoutes";
import ProtectedRoute from "./ProtectedRoute";
import dashboardRoutes from "./DashboardRoutes";
import Dashboard from "../pages/dashboard/Dashboard";
import Test from "../pages/dashboard/Test";

// CREATE EVENT PAGES
import CreateEvent from "../pages/event/CreateEvent";
import EventDashboardPage from "../pages/event/EventDashboardPage";
import EventGeneralInfo from "../pages/event/detail-event/sections/EventGeneralInfo";
import EventScheduleLocation from "../pages/event/detail-event/sections/EventScheduleLocation";
import EventSpeakerList from "../pages/event/detail-event/sections/EventSpeakerList";
import EventRegistrationForm from "../pages/event/detail-event/sections/EventRegistrationForm";
import EventStaffManagement from "../pages/event/detail-event/sections/EventStaffManagement";

import EventParticipantList from "../pages/event/EventParticipantListPage";
import EventMaterialDistribution from "../pages/event/EventMaterialDistributionPage";
import EventStatistics from "../pages/event/EventStatisticsPage";
import EventPromotion from "../pages/event/EventPromotionPage";
// END CREATE EVENT PAGES

// Import Pages
// import LandingPage from "../pages/public/LandingPage";
// import ExploreEvents from "../pages/ExploreEvents";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import ForgotPassword from "../pages/auth/ForgotPassword";

import OrgDashboardPage from "../pages/organizer/OrgDashboardPage";

import Checkout from "../pages/event/Checkout";

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

            {/* AUTH */}
            <Route element={<AuthLayout />}>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* MEMBER */}
            <Route element={<ProtectedRoute />}>
                <Route path="/checkout/:id" element={<Checkout />} />
                {/* Nanti bisa tambah rute profil peserta di sini: */}
                {/* <Route path="/my-tickets" element={<MyTickets />} /> */}
            </Route>

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
                    <Route path="Dashboard" element={<OrgDashboardPage />} />
                    <Route path="daftar-acara" element={<CreateEvent />} />
                    <Route path="buat-acara" element={<CreateEvent />} />

                    {/* Event Routes untuk Detail Event */}
                    <Route path="event">
                        <Route
                            path="dashboard"
                            element={<EventDashboardPage />}
                        />
                        <Route path="detil-event">
                            <Route
                                path="info-utama"
                                element={<EventGeneralInfo />}
                            />
                            <Route
                                path="lokasi-n-waktu"
                                element={<EventScheduleLocation />}
                            />
                            <Route
                                path="daftar-pembicara"
                                element={<EventSpeakerList />}
                            />
                            <Route
                                path="formulir"
                                element={<EventRegistrationForm />}
                            />
                            <Route
                                path="kelola-staff"
                                element={<EventStaffManagement />}
                            />
                        </Route>

                        <Route
                            path="daftar-peserta"
                            element={<EventParticipantList />}
                        />
                        <Route
                            path="distribusi-materi"
                            element={<EventMaterialDistribution />}
                        />
                        <Route path="statistik" element={<EventStatistics />} />
                        <Route path="promosi" element={<EventPromotion />} />
                    </Route>
                </Route>

                {/* <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                /> */}
            </Route>
        </Routes>
    );
};

export default AppRoutes;
