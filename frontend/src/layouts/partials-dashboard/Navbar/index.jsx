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
		<nav className="navbar border-bottom bg-white">
			<div
				// Menggunakan Bootstrap padding: px-2 py-2 (HP) & px-md-4 py-md-3 (Desktop)
				className="nav-content w-100 d-flex justify-content-between align-items-center px-3 py-2 px-md-4 py-md-2"
			>
				{/* --- BAGIAN KIRI: Toggle Menu, Logo, Context Chip --- */}
				<div className="d-flex align-items-center gap-2 gap-md-3">
					{showToggleBtn && (
						<button
							className="btn btn-light d-flex align-items-center justify-content-center p-1 p-md-2 border-0 bg-transparent text-muted rounded-circle"
							onClick={toggleSidebar}
						>
							<Menu size={20} />
						</button>
					)}
					<NavLink
						to={navLink}
						className="link-dark text-decoration-none d-flex align-items-center"
					>
						<img
							src={LogoKampusX}
							alt="Logo KampusX"
							// clamp() membuat logo mengecil otomatis di HP (min 100px) dan max 130px di Desktop
							style={{ width: 'clamp(100px, 15vw, 130px)' }}
						/>
					</NavLink>

					{/* Sembunyikan ContextChip di layar HP (d-none) dan tampilkan di layar sedang/besar (d-md-flex) */}
					{contextKey && (
						<div className="d-none d-md-flex align-items-center">
							<div
								className="navbar-divider mx-2"
								style={{ height: '24px', width: '2px', backgroundColor: '#e2e8f0' }}
							/>
							<ContextChip configKey={contextKey} />
						</div>
					)}
				</div>

				{/* --- BAGIAN KANAN: Notifikasi, Tombol Buat, Profile --- */}
				<div className="d-flex align-items-center gap-2 gap-md-3">
					<NotificationDropdown />

					{/* <EventStatusDropdown eventId={eventId} isInsideEvent={isInsideEvent} /> */}

					{/* Sembunyikan text tombol di layar sangat kecil (d-none d-sm-block) agar tidak menabrak profil */}
					{isOrganizer && !isInsideEvent && (
						<NavLink
							to="/organizer/buat-acara"
							className="text-decoration-none d-none d-sm-block"
						>
							<button className="btn btn-primary px-3 py-1">
								Buat Event
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
