// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react'; // Tambahkan useState
import { useLoading } from '../context/LoadingContext';
import { useParams } from 'react-router-dom';

import Sidebar from './partials-dashboard/Sidebar.jsx';
import Navbar from './partials-dashboard/Navbar';

import { Toaster } from 'react-hot-toast';

import '../assets/css/dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DashboardLayout = () => {
	var { eventId } = useParams();
	const location = useLocation();
	var pathname = location.pathname;

	const { isPageLoading, setIsPageLoading } = useLoading();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	// 1. Definisikan kondisi (Sama dengan di Navbar)
	const isAdmin = pathname.startsWith('/admin');
	const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(pathname);
	const isOrganizer = pathname.startsWith('/organizer') && !isInsideEvent;

	// 2. Tentukan sidebarType secara aman
	let sidebarType = null; // Default null jika di luar area dashboard

	if (isAdmin) {
		sidebarType = 'admin';
	} else if (isInsideEvent) {
		sidebarType = 'event_detail';
	} else if (isOrganizer) {
		sidebarType = 'organizer';
	}
	// Kondisi kapan sidebar benar-benar dirender
	const showSidebar =
		pathname !== '/' &&
		!pathname.includes('buat-acara') &&
		!pathname.includes('organizer/dashboard');



	return (
		<div
			className="d-flex flex-column"
			style={{
				height: '100vh',
				overflow: 'hidden',
				backgroundColor: 'red',
			}}
		>
			{/* Kirim state dan toggle ke Navbar */}
			<Navbar
				eventId={eventId}
				toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
				showToggleBtn={showSidebar}
			/>

			<div
				className="d-flex flex-row"
				style={{
					overflow: 'hidden',
					height: '100vh',
				}}
			>
				{showSidebar && (
					<Sidebar
						type={sidebarType}
						isSidebarCollapsed={isSidebarCollapsed}
						setIsSidebarCollapsed={setIsSidebarCollapsed} // ✅ Tambahkan baris ini
					/>
				)}

				{/* GLOBAL LOADING BAR HAS BEEN MOVED TO LoadingContext */}

				<main
					style={{
						padding: '30px 60px',
						backgroundColor: 'var(--color-bg)',
						// backgroundColor: 'white',
						flex: 1,
						overflowY: 'auto',
						position: 'relative',
						minHeight: '0',
					}}
				>
					<Toaster position="top-right" containerStyle={{ top: 100, right: 40 }} />

					{/* GLOBAL LOADING OVERLAY HAS BEEN MOVED TO LoadingContext */}

					<Outlet
						context={{
							sidebarType,
							setIsPageLoading,
							isPageLoading,
						}}
					/>
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
