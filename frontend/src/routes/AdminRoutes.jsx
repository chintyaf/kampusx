import React from 'react';
import { Route } from 'react-router-dom';

import Dashboard from '../pages/dashboard/Dashboard';
import Test from '../pages/dashboard/Test';
import CreateEvent from '../pages/event/creation/CreateEvent/index';
import ManageUserPage from '../pages/admin/ManageUserPage';

import Kategori from '../pages/admin/master-data/Kategori';
import TipeEvent from '../pages/admin/master-data/TipeEvent';
import Institusi from '../pages/admin/master-data/Institusi';

export const AdminRoutes = [
	// ADMIN ROUTES
	<Route path="admin">
		<Route path="dashboard" element={<Dashboard />} />
		<Route path="verifikasi-organizer" element={<Test />} />
		<Route path="kelola-pengguna" element={<ManageUserPage />} />
		<Route path="pantau-acara" element={<Test />} />

		<Route path="kontrol-promosi" element={<Test />} />

		<Route path="master-data">
			<Route path="kategori" element={<Kategori />} />
			<Route path="tipe-event" element={<TipeEvent />} />
			<Route path="institusi" element={<Institusi />} />
		</Route>
	</Route>,
];

export default AdminRoutes;
