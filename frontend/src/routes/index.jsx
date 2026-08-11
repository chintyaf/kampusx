import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Components & Layouts
import RouteProgressBar from '../components/RouteProgressBar';
import VisitorLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import MemberLayout from '@/layouts/MemberLayout';
import PublicLayout from '@/layouts/PublicLayout.jsx';

// Route Wrapper / Lists
import ProtectedRoute from './ProtectedRoute';
import visitorRoutes from './PublicRoutes';
import AdminRoutes from './AdminRoutes';
import { OrganizerRoutes } from './OrganizerRoutes';
import LmsRoutes from './LmsRoutes';

// Pages: Auth & Public
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Personalization from '../pages/auth/Personalization';
import LandingPage from '../pages/public/LandingPage';
import PublicProfile from '../pages/public/PublicProfile/index.jsx';
import NearestEventTest from '../pages/public/NearestEventTest';
import AttendVenuePage from '../pages/public/AttendVenuePage';

// Pages: Member
import MemberDashboard from '@/pages/member/MemberDashboard';
import MyTickets from '@/pages/member/MyTickets';
import BookmarkPage from '@/pages/member/BookmarkPage';
import ProfileSettings from '@/pages/member/ProfileSettings';
import NotificationsPage from '@/pages/member/NotificationsPage';
import ApplyOrganizerPage from '@/pages/member/ApplyOrganizerPage';
import EventSpace from '@/pages/member/EventSpace';
import PostEventMaterialsPage from '@/pages/member/PostEventMaterialsPage';
import MemberCertificatePage from '@/pages/member/MemberCertificatePage';
import GlobalRewardCatalog from '@/pages/member/GlobalRewardCatalog';
import LocalRewardCatalog from '@/pages/member/LocalRewardCatalog';
import PointHistory from '@/pages/member/PointHistory';

// Pages: Event Management & Checkout
import Checkout from '../pages/event/public/Checkout/index';
import TicketDetail from '../pages/TicketDetail';
import SurveyPage from '../pages/event/management/EventSurveyPage/SurveyPage';
import EventPreviewPage from '@/pages/event/management/EventDashboardPage/EventPreviewPage';
import EventVenueQrPage from '@/pages/event/management/EventVenueQrPage/index';
import CertificateVerificationPage from '../pages/certificate/CertificateVerificationPage';
import CertificatePublicView from '@/pages/certificate/CertificatePublicView';

// Pages: Staff & Test/Misc
import StaffLogin from '../pages/staff/StaffLogin';
import SelectPost from '../pages/staff/SelectPost';
import SelectService from '../pages/staff/SelectService';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffScanner from '../pages/staff/StaffScanner';
import StaffScanResult from '../pages/staff/StaffScanResult';
import StaffAttendees from '../pages/staff/StaffAttendees';
import KioskModePage from '../pages/organizer/KioskModePage';

import CertificateVaultPage from '../pages/test-chin/CertificateVaultPage';
import CertificateDetailPage from '../pages/test-chin/CertificateDetailPage';
import NotFound from '../pages/NotFoundPage';

const AppRoutes = () => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	// Membersihkan orphaned Bootstrap modal backdrop saat pindah halaman
	useEffect(() => {
		document.body.classList.remove('modal-open');
		const backdrops = document.querySelectorAll('.modal-backdrop');
		backdrops.forEach((b) => b.remove());
	}, [location.pathname]);

	if (loading) {
		return <RouteProgressBar />;
	}

	return (
		<Suspense fallback={<RouteProgressBar />}>
			<Routes>
				{/* 1. PUBLIC VISITOR PAGES (Tanpa Layout Khusus) */}
				<Route path="/nearest-event" element={<NearestEventTest />} />
				<Route path="/certificate/verify/:ticketCode" element={<CertificateVerificationPage />} />

				{/* 2. VISITOR & TESTING GROUP (Menggunakan VisitorLayout) */}
				<Route element={<VisitorLayout />}>
					<Route path="/certificate/:ticketCode" element={<CertificatePublicView />} />
					{/* Kondisi Halaman Utama ('/') berdasarkan status Auth */}
					{!isAuthenticated ? <Route path="/" element={<LandingPage />} /> : <Route path="/" element={<MemberDashboard />} />}

					{/* Mapping Public Routes (Kecuali Root '/') */}
					{visitorRoutes.map((route, index) => {
						if (route.path === '/') return null;
						return <Route key={index} path={route.path} element={route.element} />;
					})}

					{/* Test & Public Profile Pages */}
					{/* ! HAPUSS */}
					{/* <Route path="/test-chin/sertifikat" element={<CertificateVaultPage />} />
					<Route path="/test-chin/sertifikat/:id" element={<CertificateDetailPage />} /> */}

					<Route path="/profile/:id" element={<PublicProfile />} />

					<Route path="/attend-venue" element={<AttendVenuePage />} />
					<Route path="/a/:code" element={<AttendVenuePage />} />

					{/* PROTECTED MEMBER PAGES (Di dalam VisitorLayout/Navbar) */}
					<Route element={<ProtectedRoute />}>
						<Route path="/bookmarks" element={<BookmarkPage />} />
						<Route path="/settings" element={<ProfileSettings />} />
						<Route path="/checkout/:id" element={<Checkout />} />
						<Route path="/ticket/:ticketCode" element={<TicketDetail />} />
						<Route path="/event-space/:id" element={<EventSpace />} />
						<Route path="/event-space/:id/materials" element={<PostEventMaterialsPage />} />
						<Route path="/event-space/:id/survey" element={<SurveyPage />} />
						<Route path="/notifications" element={<NotificationsPage />} />
						<Route path="/rewards" element={<GlobalRewardCatalog />} />
						<Route path="/event-space/:id/rewards" element={<LocalRewardCatalog />} />
						<Route path="/member/points/history" element={<PointHistory />} />
					</Route>
				</Route>

				{/* 3. MEMBER LAYOUT GROUP (Halaman Khusus Bertipe Member Dashboard) */}
				<Route element={<ProtectedRoute />}>
					<Route element={<MemberLayout />}>
						<Route path="/my-tickets" element={<MyTickets />} />
						<Route path="/certificates" element={<MemberCertificatePage />} />
						<Route path="/apply-organizer" element={<ApplyOrganizerPage />} />
					</Route>
				</Route>

				{/* 4. AUTH PAGES GROUP */}
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/personalization" element={<Personalization />} />
				</Route>

				{/* 5. DASHBOARD LAYOUT GROUP (Admin & Organizer) */}
				<Route element={<DashboardLayout />}>
					<Route element={<ProtectedRoute allowedRole={['admin']} />}>{AdminRoutes}</Route>
					<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>{OrganizerRoutes}</Route>
				</Route>

				{/* 6. STANDALONE ORGANIZER PREVIEW (Protected but outside DashboardLayout) */}
				<Route element={<ProtectedRoute allowedRole={['admin', 'organizer']} />}>
					<Route path="/organizer/:eventId/event-dashboard/preview" element={<EventPreviewPage />} />
					<Route path="/organizer/:eventId/event-dashboard/venue-qr" element={<EventVenueQrPage />} />
				</Route>

				{/* 7. STAFF ROUTES */}
				<Route path="/staff/login" element={<StaffLogin />} />
				<Route path="/staff/select-post" element={<SelectPost />} />
				<Route path="/staff/select-service" element={<SelectService />} />
				<Route path="/staff/dashboard" element={<StaffDashboard />} />
				<Route path="/staff/scanner" element={<StaffScanner />} />
				<Route path="/staff/scan-result" element={<StaffScanResult />} />
				<Route path="/staff/attendees" element={<StaffAttendees />} />
				<Route path="/staff/kiosk" element={<KioskModePage isStaff={true} />} />

				{/* 8. LMS & SRL WIREFRAME ROUTES */}
				{LmsRoutes}

				{/* 9. 404 NOT FOUND */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Suspense>
	);
};

export default AppRoutes;
