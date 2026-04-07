import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import EventStatusDropdown from '../../components/event/EventStatusDropdown';
import NotificationDropdown from '../../components/NotificationDropdown';
import LogoKampusX from '../../assets/images/logo/Logo_KampusX.svg';
import ProfileDropdown from '../../layouts/partials-dashboard/section/ProfileDropdown';
import { Menu, ShieldCheck, Building2, CalendarDays } from 'lucide-react';

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

const Navbar = ({ toggleSidebar, showToggleBtn }) => {
	const location = useLocation();

	const isAdmin = location.pathname.startsWith('/admin');
	const isInsideEvent = /^\/organizer\/[^/]+\/event-dashboard/.test(location.pathname);
	const isOrganizer = location.pathname.startsWith('/organizer') && !isInsideEvent;

	const navLink = isAdmin ? 'admin/dashboard' : 'organizer/dashboard';

	const contextKey = isAdmin ? 'admin' : isInsideEvent ? 'event' : 'organizer';

	return (
		<>
			<nav className="navbar-dashboard">
				<div
					className="w-100 d-flex justify-content-between align-items-center"
					style={{ padding: '10px 20px' }}>
					{/* Left: toggle + logo + divider + chip */}
					<div className="d-flex align-items-center gap-2">
						{showToggleBtn && (
							<button className="navbar-toggle-btn" onClick={toggleSidebar}>
								<Menu size={16} strokeWidth={2} />
							</button>
						)}

						<NavLink
							to={navLink}
							className="text-decoration-none d-flex align-items-center">
							<img
								src={LogoKampusX}
								alt="KampusX"
								style={{
									width: '110px',
									height: 'auto',
									display: 'block',
								}}
							/>
						</NavLink>

						<div className="navbar-divider" />

						<ContextChip configKey={contextKey} />
					</div>

					{/* Right: actions */}
					<div className="d-flex align-items-center gap-3">
						<NotificationDropdown />
						<EventStatusDropdown isInsideEvent={isInsideEvent} />

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
		</>
	);
};

export default Navbar;
