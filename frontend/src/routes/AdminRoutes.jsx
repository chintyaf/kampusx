import React from 'react';
import { Route } from 'react-router-dom';

import Dashboard from '@/pages/dashboard/Dashboard';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import CreateEvent from '@/pages/event/creation/CreateEvent/index';
import ManageUserPage from '@/pages/admin/ManageUserPage';
import AdminPaymentPage from '@/pages/admin/AdminPaymentPage';

// Import komponen baru yang ditambahkan
import OrganizerVerificationPage from '@/pages/admin/OrganizerVerificationPage';
import EventMonitoringPage from '@/pages/admin/EventMonitoringPage';
import PromotionControlPage from '@/pages/admin/PromotionControlPage';

import Kategori from '@/pages/admin/master-data/Kategori';
import TipeEvent from '@/pages/admin/master-data/TipeEvent';
import Institusi from '@/pages/admin/master-data/Institusi';

import ManageActivities from '@/pages/admin/gamifikasi/ManageActivities';
import ManageGlobalRewards from '@/pages/admin/gamifikasi/ManageGlobalRewards';
import ConversionSettings from '@/pages/admin/gamifikasi/ConversionSettings';

export const AdminRoutes = [
	// ADMIN ROUTES
	<Route path="admin" key="admin-routes">
		<Route path="dashboard" element={<AdminDashboardPage />} />
		<Route path="verifikasi-organizer" element={<OrganizerVerificationPage />} />
		<Route path="kelola-pengguna" element={<ManageUserPage />} />
		<Route path="pantau-acara" element={<EventMonitoringPage />} />
		<Route path="payment" element={<AdminPaymentPage />} />

		<Route path="kontrol-promosi" element={<PromotionControlPage />} />

		<Route path="master-data">
			<Route path="kategori" element={<Kategori />} />
			<Route path="tipe-event" element={<TipeEvent />} />
			<Route path="institusi" element={<Institusi />} />
		</Route>

		<Route path="gamifikasi">
			<Route path="aktivitas" element={<ManageActivities />} />
			<Route path="reward" element={<ManageGlobalRewards />} />
			<Route path="konversi" element={<ConversionSettings />} />
		</Route>
	</Route>,
];

export default AdminRoutes;
