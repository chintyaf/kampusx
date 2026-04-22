import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy, useState } from 'react';
import RouteProgressBar from '../components/RouteProgressBar';

import VisitorLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import MemberLayout from '../layouts/MemberLayout';

// Import daftar rute
import visitorRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import dashboardRoutes from './DashboardRoutes';
import Dashboard from '../pages/dashboard/Dashboard';
import MemberDashboard from '../pages/member/MemberDashboard';
import Test from '../pages/dashboard/Test';

// Organizer dan Event Routes diimpor secara terpisah
import { OrganizerRoutes } from './OrganizerRoutes';

import NotFound from '../pages/NotFoundPage';

// Session Changelog Pages
import AdminMasterDataPage from '../pages/admin/AdminMasterDataPage';
import PostEventMaterialsPage from '../pages/member/PostEventMaterialsPage';

// NEW: CERTIFICATES & AFTER EVENT MOCKUP
import CertificateVaultPage from '../pages/test-chin/CertificateVaultPage';
import CertificateDetailPage from '../pages/test-chin/CertificateDetailPage';

// Import Pages
// import LandingPage from "../pages/public/LandingPage";
// import ExploreEvents from "../pages/ExploreEvents";
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPassword from '../pages/auth/ForgotPassword';

import LandingPage from '../pages/public/LandingPage';
import Checkout from '../pages/event/public/Checkout/index';
import TicketDetail from '../pages/TicketDetail';
import EventSpace from '../pages/member/EventSpace';
import { useAuth } from '../context/AuthContext';
import MyTickets from '../pages/member/MyTickets';

import NearestEventTest from '../pages/public/NearestEventTest';

const AppRoutes = () => {
	// const [isAuthenticated, setIsAuthenticated] = useState(true);
	const { isAuthenticated, loading } = useAuth();
	if (loading) {
		return <RouteProgressBar />; // Atau komponen loading indikator apa pun milikmu
	}
	return (
		<Suspense fallback={<RouteProgressBar />}>
			<Routes>
				<Route path="/nearest-event" element={<NearestEventTest />} />
				{/* 1. Jika BELUM login: Jadikan '/' sebagai Landing Page dengan VisitorLayout */}
				<Route element={<MemberLayout />}>
					<Route path="/test-location" />
				</Route>

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
						if (route.path === '/') return null;

						return <Route key={index} path={route.path} element={route.element} />;
					})}
					{/* // {visitorRoutes.map((route, index) => (
                    //     <Route key={index} path={route.path} element={route.element} />
                    // ))} */}
				</Route>

				{/* TEST CHIN UI ROUTES (Tampilan Peserta - Tidak perlu login utuk testing) */}
				<Route element={<VisitorLayout />}>
					<Route path="/test-chin/sertifikat" element={<CertificateVaultPage />} />
					<Route path="/test-chin/sertifikat/:id" element={<CertificateDetailPage />} />
				</Route>

				{/* AUTH */}
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
				</Route>

				{/* MEMBER */}
				<Route element={<ProtectedRoute />}>
					<Route path="/checkout/:id" element={<Checkout />} />
					{/* Nanti bisa tambah rute profil peserta di sini: */}
					{/* <Route path="/my-tickets" element={<MyTickets />} /> */}
					<Route path="/ticket/:ticketCode" element={<TicketDetail />} />
					<Route path="/event-space/:id" element={<EventSpace />} />
					<Route path="/event-space/:id/materials" element={<PostEventMaterialsPage />} />
				</Route>
				<Route element={<MemberLayout />}>
					<Route path="/my-tickets" element={<MyTickets />} />
					{/* <Route path="/member/dashboard" element={<MemberDashboard />} /> */}
					{/* Tambahkan halaman member lainnya di sini nanti */}
				</Route>

				{/* Group Dashboard */}
				<Route element={<DashboardLayout />}>
					{/* Admin */}
					<Route element={<ProtectedRoute allowedRole={['admin']} />}>
						<Route path="admin">
							<Route path="dashboard" element={<Dashboard />} />
							<Route path="kelola-data-master" element={<AdminMasterDataPage />} />
							<Route path="verifikasi-organizer" element={<Test />} />
							<Route path="kelola-pengguna" element={<Test />} />
							<Route path="pantau-acara" element={<Test />} />
							<Route path="kontrol-promosi" element={<Test />} />
						</Route>
					</Route>

					<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>
						{OrganizerRoutes}
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
