import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import RouteProgressBar from "../components/RouteProgressBar";

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
import EventScheduleLocation from "../pages/event/detail-event/sections/EventLocation";
import EventAgenda from "../pages/event/detail-event/sections/EventAgenda";
import EventSpeakerList from "../pages/event/detail-event/sections/EventSpeakerList";
import EventRegistrationForm from "../pages/event/detail-event/sections/EventRegistrationForm";
import EventStaffManagement from "../pages/event/EventStaffManagement";

import EventParticipantList from "../pages/event/EventParticipantListPage";
import EventMaterialDistributionPage from "../pages/event/EventMaterialDistributionPage";
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
        <Suspense fallback={<RouteProgressBar />}>
            <Routes>
                {/* Group Visitor */}
                <Route element={<VisitorLayout />}>
                    {visitorRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
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
                    {/* Admin */}
                    <Route element={<ProtectedRoute allowedRole={["admin"]} />}>
                        <Route path="admin">
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="verifikasi-organizer" element={<Test />} />
                            <Route path="kelola-pengguna" element={<Test />} />
                            <Route path="pantau-acara" element={<Test />} />
                            <Route path="kontrol-promosi" element={<Test />} />
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRole={["admin", "organizer"]} />}>
                        <Route path="organizer">
                            <Route path="dashboard" element={<OrgDashboardPage />} />
                            <Route path="daftar-acara" element={<CreateEvent />} />
                            <Route path="buat-acara" element={<CreateEvent />} />

                            {/* Event Routes untuk Detail Event */}
                            <Route path="event-dashboard/:eventId">
                                <Route path="" element={<EventDashboardPage />} />
                                <Route path="detail">
                                    <Route path="info" element={<EventGeneralInfo />} />
                                    <Route path="tempat" element={<EventScheduleLocation />} />
                                    <Route path="agenda" element={<EventAgenda />} />
                                    <Route path="pembicara" element={<EventSpeakerList />} />
                                    <Route path="formulir" element={<EventRegistrationForm />} />
                                </Route>
                                <Route path="kelola-staff" element={<EventStaffManagement />} />

                                <Route path="daftar-peserta" element={<EventParticipantList />} />
                                <Route path="distribusi-materi" element={<EventMaterialDistributionPage />} />
                                <Route path="upload-sertifikat" element={<EventStaffManagement />} />

                                <Route path="statistik" element={<EventStatistics />} />
                                <Route path="promosi" element={<EventPromotion />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                /> */}
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
