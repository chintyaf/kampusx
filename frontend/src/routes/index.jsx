import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useState, useEffect } from 'react';
import RouteProgressBar from '../components/RouteProgressBar';

import VisitorLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import MemberLayout from '@/layouts/MemberLayout';
import PublicLayout from '@/layouts/PublicLayout.jsx';

// Import daftar rute
import visitorRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import AdminRoutes from './AdminRoutes';
import Dashboard from '../pages/dashboard/Dashboard';
import MemberDashboard from '../pages/member/MemberDashboard/index.jsx';
import Test from '../pages/dashboard/Test';

// Organizer dan Event Routes diimpor secara terpisah
import { OrganizerRoutes } from './OrganizerRoutes';

import NotFound from '../pages/NotFoundPage';

// Session Changelog Pages
import AdminMasterDataPage from '../pages/admin/AdminMasterDataPage';
import PostEventMaterialsPage from '../pages/member/PostEventMaterialsPage';
import ApplyOrganizerPage from '../pages/member/ApplyOrganizerPage';


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
import PublicProfile from '../pages/public/PublicProfile/index.jsx';
import Personalization from '../pages/auth/Personalization';
import ProfileSettings from '../pages/member/ProfileSettings';

import NearestEventTest from '../pages/public/NearestEventTest';
import ExploreEvents from '../pages/ExploreEvents';
import BookmarkPage from '../pages/member/BookmarkPage';

import CommitteePage from '../pages/committee/CommitteePage';

const AppRoutes = () => {
	// const [isAuthenticated, setIsAuthenticated] = useState(true);
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	// FIX: Membersihkan orphaned Bootstrap modal backdrop saat pindah halaman
	useEffect(() => {
		document.body.classList.remove('modal-open');
		const backdrops = document.querySelectorAll('.modal-backdrop');
		backdrops.forEach((b) => b.remove());
	}, [location.pathname]);

	if (loading) {
		return <RouteProgressBar />; // Atau komponen loading indikator apa pun milikmu
	}
	return (
		<Suspense fallback={<RouteProgressBar />}>
			<Routes>
				<Route path="/nearest-event" element={<NearestEventTest />} />

				{/* 1. VISITOR & MEMBER ROUTE GROUP (Shares the same VisitorLayout and NavbarPublic instance) */}
				<Route element={<VisitorLayout />}>
					{/* Home Page conditional loading based on Auth state */}
					{!isAuthenticated ? (
						<Route path="/" element={<LandingPage />} />
					) : (
						<Route path="/" element={<MemberDashboard />} />
					)}

					{/* Public Visitor Pages */}
					{visitorRoutes.map((route, index) => {
						if (route.path === '/') return null;
						return <Route key={index} path={route.path} element={route.element} />;
					})}

					{/* Extra Visitor/Testing Pages */}
					<Route path="/test-chin/sertifikat" element={<CertificateVaultPage />} />
					<Route path="/test-chin/sertifikat/:id" element={<CertificateDetailPage />} />
					<Route path="/profile/:id" element={<PublicProfile />} />

					{/* Protected Member Pages (Shares the same Layout/Navbar) */}
					<Route element={<ProtectedRoute />}>
						<Route path="/my-tickets" element={<MyTickets />} />
						<Route path="/bookmarks" element={<BookmarkPage />} />
						<Route path="/apply-organizer" element={<ApplyOrganizerPage />} />
						<Route path="/settings" element={<ProfileSettings />} />
						<Route path="/checkout/:id" element={<Checkout />} />
						<Route path="/ticket/:ticketCode" element={<TicketDetail />} />
						<Route path="/event-space/:id" element={<EventSpace />} />
						<Route path="/event-space/:id/materials" element={<PostEventMaterialsPage />} />
					</Route>
				</Route>

				{/* AUTH */}
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/personalization" element={<Personalization />} />
				</Route>

				{/* Group Dashboard */}
				<Route element={<DashboardLayout />}>
					{/* Admin */}
					<Route element={<ProtectedRoute allowedRole={['admin']} />}>{AdminRoutes}</Route>
					{/* Organizer / Admin */}
					<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>{OrganizerRoutes}</Route>
				</Route>

				<Route path="/committee" element={<CommitteePage />} />

				<Route path="*" element={<NotFound />} />
			</Routes>
		</Suspense>
	);
};

export default AppRoutes;
