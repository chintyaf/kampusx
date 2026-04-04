import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy, useState } from "react";
import RouteProgressBar from "../components/RouteProgressBar";

import VisitorLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import daftar rute
import visitorRoutes from "./PublicRoutes";
import ProtectedRoute from "./ProtectedRoute";
import dashboardRoutes from "./DashboardRoutes";
import Dashboard from "../pages/dashboard/Dashboard";
import MemberDashboard from "../pages/member/MemberDashboard";
import Test from "../pages/dashboard/Test";

// CREATE EVENT PAGES
import CreateEvent from "../pages/event/CreateEvent";
import EventDashboardPage from "../pages/event/EventDashboardPage";
import EventGeneralInfo from "../pages/event/detail-event/EventGeneralInfo";
import EventScheduleLocation from "../pages/event/detail-event/EventLocation";
import EventSession from "../pages/event/detail-event/EventSession";
import EventSpeaker from "../pages/event/detail-event/EventSpeaker";
import EventRegistrationForm from "../pages/event/detail-event/EventRegistrationForm";
import EventStaffManagement from "../pages/event/EventStaffManagement";

import EventParticipantList from "../pages/event/EventParticipantListPage";
import EventMaterialDistributionPage from "../pages/event/EventMaterialDistributionPage";
import EventStatistics from "../pages/event/EventStatisticsPage";
import EventPromotion from "../pages/event/EventPromotionPage";
// END CREATE EVENT PAGES

import EventLocationTest from "../pages/event/EventLocationTest";

import NotFound from "../pages/NotFoundPage";

// Import Pages
// import LandingPage from "../pages/public/LandingPage";
// import ExploreEvents from "../pages/ExploreEvents";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import ForgotPassword from "../pages/auth/ForgotPassword";

import OrgDashboardPage from "../pages/organizer/OrgDashboardPage";
import LandingPage from "../pages/public/LandingPage";
import Checkout from "../pages/event/Checkout";
import TicketDetail from "../pages/TicketDetail";
import EventSpace from "../pages/member/EventSpace";
import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
    // const [isAuthenticated, setIsAuthenticated] = useState(true);
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <RouteProgressBar />; // Atau komponen loading indikator apa pun milikmu
    }
    return (
        <Suspense fallback={<RouteProgressBar />}>
            <Routes>
                {/* 1. Jika BELUM login: Jadikan '/' sebagai Landing Page dengan VisitorLayout */}
                {!isAuthenticated && (
                    <Route element={<VisitorLayout />}>
                        <Route path="/" element={<LandingPage />} />
                    </Route>
                )}

                {/* 2. Jika SUDAH login: Jadikan '/' sebagai Member Dashboard dengan DashboardLayout */}
                {isAuthenticated && (
                    <Route element={<DashboardLayout />}>
                        {/* Ganti <Dashboard /> di bawah dengan halaman khusus Member jika ada */}
                        <Route path="/" element={<MemberDashboard />} />
                    </Route>
                )}

                {/* ========================================== */}

                {/* Group Visitor (Explore, Detail Event, dsb) */}
                <Route element={<VisitorLayout />}>
                    {visitorRoutes.map((route, index) => {
                        // Abaikan route "/" dari daftar PublicRoutes agar tidak bentrok (double) dengan pengecekan di atas
                        if (route.path === "/") return null;

                        return <Route key={index} path={route.path} element={route.element} />;
                    })}
                    {/* // {visitorRoutes.map((route, index) => (
                    //     <Route key={index} path={route.path} element={route.element} />
                    // ))} */}
                </Route>

                {/* AUTH */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* MEMBER */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/checkout/:id" element={<Checkout />} />
                    {/* Nanti bisa tambah rute profil peserta di sini: */}
                    {/* <Route path="/my-tickets" element={<MyTickets />} /> */}
                    <Route path="/ticket/:ticketCode" element={<TicketDetail />} />
                    <Route path="/event-space/:id" element={<EventSpace />} />
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
                            <Route path=":eventId/event-dashboard">
                                <Route path="" element={<EventDashboardPage />} />
                                <Route path="detail">
                                    <Route path="info" element={<EventGeneralInfo />} />
                                    <Route path="tempat" element={<EventScheduleLocation />} />
                                    <Route path="sesi" element={<EventSession />} />
                                    <Route path="pembicara" element={<EventSpeaker />} />
                                    <Route path="formulir" element={<EventRegistrationForm />} />
                                </Route>
                                <Route path="kelola-staff" element={<EventStaffManagement />} />

                                <Route path="daftar-peserta" element={<EventParticipantList />} />
                                <Route path="distribusi-materi" element={<EventMaterialDistributionPage />} />
                                <Route path="upload-sertifikat" element={<EventStaffManagement />} />

                                <Route path="statistik" element={<EventStatistics />} />
                                <Route path="promosi" element={<EventPromotion />} />
                                <Route path="event-location-test" element={<EventLocationTest />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                /> */}
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
