import React, { useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

import userImg from '../../../assets/images/user-placeholder.avif';
import EventStatusDropdown from '../../../components/event/EventStatusDropdown';
import NotificationDropdown from '../../../components/NotificationDropdown';
import LogoKampusX from '../../../assets/images/logo/Logo_KampusX.svg';
import { Menu, ShieldCheck, Building2, CalendarDays, LogOut } from 'lucide-react';

import ContextChip from './ContextChip';
import ProfileDropdown from './ProfileDropdown';

// Terima props dari DashboardLayout
const Navbar = ({ eventId, toggleSidebar, showToggleBtn }) => {
	const location = useLocation();
	const { pathname } = location;

	// 1. Tentukan posisi berdasarkan path URL yang sedang dibuka
	const isAdmin = pathname.startsWith('/admin');
	const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(pathname);
	const isOrganizer = pathname.startsWith('/organizer') && !isInsideEvent;

	// 2. Tentukan contextKey (Chip mana yang muncul)
	let contextKey = null;
	if (isAdmin) {
		contextKey = 'admin';
	} else if (isInsideEvent) {
		contextKey = 'event';
	} else if (isOrganizer) {
		contextKey = 'organizer';
	} else if (pathname === '/') {
		contextKey = null;
	}

	// 3. Tentukan arah Logo ditekan
	const navLink = isAdmin
		? '/admin/dashboard'
		: isOrganizer || isInsideEvent
			? '/organizer/dashboard'
			: '/';
	return (
		<nav className="navbar">
			<div
				className="nav-content w-100 d-flex justify-content-between align-items-center"
				style={{ padding: '10px 20px' }}>
				{/* Tambahkan Icon Menu Sebelum Logo */}
				<div className="d-flex align-items-center gap-2">
					{showToggleBtn && (
						<button
							className="btn btn-light d-flex align-items-center justify-content-center p-2 border-0 bg-transparent text-secondary hover-bg-light rounded-circle"
							onClick={toggleSidebar}>
							<Menu size={22} />
						</button>
					)}
					<NavLink to={navLink} className="link-dark text-decoration-none">
						<img
							src={LogoKampusX}
							alt=""
							className="h-100"
							style={{ width: '130px' }}
						/>
					</NavLink>

					{contextKey && (
						<>
							<div className="navbar-divider" />
							<ContextChip configKey={contextKey} />
						</>
					)}
				</div>

				<div className="d-flex align-items-center gap-3">
					<NotificationDropdown />
					<EventStatusDropdown eventId={eventId} isInsideEvent={isInsideEvent} />

					{isOrganizer && !isInsideEvent && (
						<NavLink to="/organizer/buat-acara" className="text-decoration-none">
							<button className="btn btn-primary" style={{ fontSize: '14px' }}>
								Buat Event +
							</button>
						</NavLink>
					)}

					<ProfileDropdown />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
