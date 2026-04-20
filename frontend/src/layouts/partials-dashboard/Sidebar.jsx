import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
	LayoutDashboard,
	UserCheck,
	ChevronDown,
	Plus,
	UsersRound,
	FolderOpen,
	ChartColumn,
	Star,
	Form,
	UserRoundPen,
} from 'lucide-react';

import SidebarItem from './section/SidebarItem';

// --- Configuration Data ---
const MENU_ITEMS = {
	admin: [
		{
			id: '1',
			name: 'Admin Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'admin/dashboard',
		},
		{
			id: '2',
			name: 'Verifikasi Organizer',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/verifikasi-organizer',
		},
		{
			id: '3',
			name: 'Kelola Pengguna',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/kelola-pengguna',
		},
		{
			id: '4',
			name: 'Pantau Acara',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/pantau-acara',
		},
		{
			id: '5',
			name: 'Kontrol Promosi',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/kontrol-promosi',
		},
	],
	organizer: [
		{
			id: '1',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'organizer/dashboard',
		},
		{
			id: '2',
			name: 'Daftar Acara',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'organizer/daftar-acara',
		},
	],
	event_detail: [
		{
			id: '1',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
		},
		{
			id: '2',
			name: 'Detil Event',
			icon: <Form size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/detail',
			submenu: [
				{ name: 'Info Utama', path: 'info' },
				{ name: 'Tempat Acara', path: 'tempat' },
				{ name: 'Susunan Acara', path: 'sesi' },
				{ name: 'Daftar Pembicara', path: 'pembicara' },
				{ name: 'Formulir Registrasi', path: 'formulir' },
				{ name: 'Tiket', path: 'tiket' },
			],
		},
		{
			id: '7',
			name: 'Staff Administrasi',
			icon: <UserRoundPen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/kelola-staff',
		},
		{
			id: '3',
			name: 'Daftar Peserta',
			icon: <UsersRound size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/daftar-peserta',
		},
		{
			id: '8',
			name: 'Sertifikat',
			icon: <UserRoundPen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/upload-sertifikat',
		},
		{
			id: '4',
			name: 'Distribusi Materi',
			icon: <FolderOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/distribusi-materi',
		},
		{
			id: '5',
			name: 'Statistik',
			icon: <ChartColumn size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/statistik',
		},
		{
			id: '6',
			name: 'Promosi',
			icon: <Star size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/promosi',
		},
	],
};


const Sidebar = ({ type, isSidebarCollapsed, setIsSidebarCollapsed }) => {
	const [openMenu, setOpenMenu] = useState(null);
	const location = useLocation();

	const eventIdMatch = location.pathname.match(/\/organizer\/([^/]+)\/event-dashboard/);
	const currentEventId = eventIdMatch ? eventIdMatch[1] : '';

	const baseMenu = MENU_ITEMS[type] || [];
	const currentMenu = baseMenu.map(item => ({
		...item,
		path: item.path ? item.path.replace(/:eventId|:slug/g, currentEventId) : item.path,
	}));

	const handleToggle = id => {
		if (isSidebarCollapsed) {
			// Jika sidebar sedang mengecil, otomatis lebarkan dan buka submenunya
			setIsSidebarCollapsed(false);
			setOpenMenu(id);
		} else {
			// Perilaku normal saat sidebar sudah lebar
			setOpenMenu(openMenu === id ? null : id);
		}
	};

	useEffect(() => {
		const currentPath = location.pathname;
		let activeMenuId = null;

		currentMenu.forEach(item => {
			if (item.submenu) {
				const isActive = item.submenu.some(sub => {
					const fullPath = `${item.path}/${sub.path}`.replace(/\/+/g, '/');
					return currentPath.startsWith(fullPath);
				});
				if (isActive) setOpenMenu(item.id);
			}

			// 2. Logika Tambahan: Jika path persis sama dengan item.path, tandai sebagai aktif
			// Ini memastikan jika user di '/admin/dashboard', maka item dashboard terbuka/aktif

			if (currentPath === `/${item.path}` || currentPath === item.path) {
				activeMenuId = item.id;
			}
		});
	}, [location.pathname, currentMenu]);

	return (
		<div
			className={`sidebar-container flex-shrink-0 p-3 bg-white border-end ${isSidebarCollapsed ? 'collapsed' : ''}`}
			style={{
				width: isSidebarCollapsed ? '80px' : '280px', // Animasi Lebar disini
				transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				height: '100%',
				overflowY: 'auto',
				overflowX: 'hidden',
			}}>
			<ul className="list-unstyled ps-0">
				{currentMenu.map(item => (
					<li className="mb-2" key={item.id}>
						<SidebarItem
							item={item}
							isOpen={openMenu === item.id}
							toggle={handleToggle}
							isSidebarCollapsed={isSidebarCollapsed}
						/>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;
