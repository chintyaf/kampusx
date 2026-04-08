import React, { useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import userImg from '../../assets/images/user-placeholder.avif';
import Button from '../../components/Button';
import EventStatusDropdown from '../../components/event/EventStatusDropdown';
import NotificationDropdown from '../../components/NotificationDropdown';
import LogoKampusX from '../../assets/images/logo/Logo_KampusX.svg';

import { Menu, ShieldCheck, Building2, CalendarDays, LogOut } from 'lucide-react';

// const Navbar = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();

//     const handleLogout = async () => {
//         await logout();
//         navigate('/');
//         console.log("Logging out...");

//     };

//     const location = useLocation();

//     const [isOpen, setIsOpen] = useState(false);
//     const toggleDropdown = () => setIsOpen(!isOpen);

const ProfileDropdown = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate('/');
		console.log('Logging out...');
	};

	return (
		<>
			<div className="dropdown">
				<div
					className="d-flex align-items-center"
					style={{ cursor: 'pointer' }}
					data-bs-toggle="dropdown"
					aria-expanded="false">
					<div>
						<img
							className="rounded-circle object-fit-cover"
							src={userImg}
							alt="User"
							width="30px"
							height="30px"
						/>
					</div>
				</div>

				{/* 2. Menu Dropdown: Langsung tambahkan class pop-down */}
				<ul
					className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 pop-down"
					style={{ minWidth: '150px' }}>
					{(user.role === 'admin' || user.role === 'organizer') && (
						<>
							<li>
								<NavLink
									to=""
									className="dropdown-item d-flex align-items-center gap-2 py-2">
									<LogOut size={16} />
									<span>Halaman Utama</span>
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/organizer/dashboard"
									className="dropdown-item d-flex align-items-center gap-2 py-2">
									<LogOut size={16} />
									<span>Masuk Organizer</span>
								</NavLink>
							</li>
						</>
					)}
					{user.role === 'admin' && (
						<li>
							<NavLink
								to="/admin/dashboard"
								className="dropdown-item d-flex align-items-center gap-2 py-2">
								<LogOut size={16} />
								<span>Masuk Admin</span>
							</NavLink>
						</li>
					)}
					<li>
						<button
							className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
							onClick={handleLogout}>
							<LogOut size={16} />
							<span>Logout</span>
						</button>
					</li>
				</ul>
			</div>
		</>
	);
};

/* ─── Context chip config ─────────────────────────────── */
const CONTEXT_CONFIG = {
	admin: {
		label: 'Admin',
		icon: ShieldCheck,
		color: '#92400e',
		bg: '#fef3c7',
		border: '#fde68a',
		dot: '#d97706',
	},
	organizer: {
		label: 'Organizer',
		icon: Building2,
		color: 'var(--bahama-blue-700, #00699e)',
		bg: 'var(--bahama-blue-50, #f0f9ff)',
		border: 'var(--bahama-blue-200, #b9e7fe)',
		dot: 'var(--bahama-blue-500, #0aabed)',
	},
	event: {
		label: 'Event Dashboard',
		icon: CalendarDays,
		color: '#5b21b6',
		bg: '#f5f3ff',
		border: '#ddd6fe',
		dot: '#7c3aed',
	},
};

const ContextChip = ({ configKey }) => {
	const cfg = CONTEXT_CONFIG[configKey];
	if (!cfg) return null;
	const Icon = cfg.icon;
	return (
		<div
			className="ctx-chip"
			style={{
				'--chip-bg': cfg.bg,
				'--chip-border': cfg.border,
				'--chip-color': cfg.color,
				'--chip-dot': cfg.dot,
			}}>
			<span className="ctx-chip-dot" />
			<span className="ctx-chip-icon-wrap">
				<Icon size={11} strokeWidth={2.5} color={cfg.color} />
			</span>
			{cfg.label}
		</div>
	);
};

// Terima props dari DashboardLayout

const Navbar = ({ eventId, toggleSidebar, showToggleBtn }) => {
	const location = useLocation();

	const isAdmin = location.pathname.startsWith('/admin');
	const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(location.pathname);
	const isOrganizer = location.pathname.startsWith('/organizer') && !isInsideEvent;

	const navLink = isAdmin ? 'admin/dashboard' : 'organizer/dashboard';

	const contextKey = isAdmin
		? 'admin'
		: isInsideEvent
			? 'event'
			: isOrganizer
				? 'organizer'
				: null;

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

					{eventId && (
						<EventStatusDropdown eventId={eventId} isInsideEvent={isInsideEvent} />
					)}

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
