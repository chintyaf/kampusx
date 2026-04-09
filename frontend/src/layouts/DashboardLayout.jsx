// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react'; // Tambahkan useState
import { useParams } from 'react-router-dom';

import Sidebar from './partials-dashboard/Sidebar.jsx';
// import Navbar from './partials-dashboard/Navbarl';
import Navbar from './partials-dashboard/NavbarTest/index.jsx';

import { Toaster } from 'react-hot-toast';

import '../assets/css/dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DashboardLayout = () => {
	const { eventId } = useParams();
	const location = useLocation();
	const path = location.pathname;

	// State untuk collapse sidebar
	const [isPageLoading, setIsPageLoading] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(location.pathname);

	let sidebarType = 'organizer';

	if (path.includes('/admin')) {
		sidebarType = 'admin';
	} else if (isInsideEvent) {
		sidebarType = 'event_detail';
	}

	// Kondisi kapan sidebar benar-benar dirender
	const showSidebar =
		path !== '/' && !path.includes('buat-acara') && !path.includes('organizer/dashboard');

	return (
		<div
			className="d-flex flex-column"
			style={{
				height: '100vh',
				overflow: 'hidden',
				backgroundColor: 'red',
			}}>
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
				}}>
				{showSidebar && (
					<Sidebar
						type={sidebarType}
						isSidebarCollapsed={isSidebarCollapsed}
						setIsSidebarCollapsed={setIsSidebarCollapsed} // ✅ Tambahkan baris ini
					/>
				)}

				{isPageLoading && (
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: '3px',
							background: 'var(--color-primary)',
							zIndex: 10000,
							animation: 'loading-bar 2s infinite ease-in-out',
						}}
					/>
				)}

				<main
					style={{
						padding: '30px 60px',
						backgroundColor: '#F7F8F9',
						flex: 1,
						overflowY: 'auto',
						position: 'relative',
						minHeight: '0',
					}}>
					<Toaster position="top-right" containerStyle={{ top: 100, right: 40 }} />

					{/* GLOBAL LOADING OVERLAY */}
					{isPageLoading && (
						<div
							style={{
								position: 'absolute', // Menempel pada <main> yang 'relative'
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: 'rgba(247, 248, 249, 0.7)',
								zIndex: 9999,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								backdropFilter: 'blur(2px)',
							}}>
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					)}

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
