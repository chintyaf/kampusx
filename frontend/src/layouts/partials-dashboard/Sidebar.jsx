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

import { SidebarItem, EventCard } from '@/features/sidebar';
import { MENU_ITEMS } from '@/features/sidebar/data/route';

const Sidebar = ({ type, isSidebarCollapsed, setIsSidebarCollapsed }) => {
	const [openMenu, setOpenMenu] = useState(null);
	const location = useLocation();

	const eventIdMatch = location.pathname.match(/\/organizer\/([^/]+)\/event-dashboard/);
	const currentEventId = eventIdMatch ? eventIdMatch[1] : '';

	const baseMenu = MENU_ITEMS[type] || [];
	const currentMenu = baseMenu.map((item) => ({
		...item,
		path: item.path ? item.path.replace(/:eventId|:slug/g, currentEventId) : item.path,
	}));

	const handleToggle = (id) => {
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

		currentMenu.forEach((item) => {
			if (item.submenu) {
				const isActive = item.submenu.some((sub) => {
					const fullPath = `${item.path}/${sub.path}`.replace(/\/+/g, '/');
					return currentPath.startsWith(fullPath);
				});
				if (isActive) setOpenMenu(item.id);
			}

			if (currentPath === `/${item.path}` || currentPath === item.path) {
				activeMenuId = item.id;
			}
		});
	}, [location.pathname, currentMenu]);

	return (
		<>
			<div
				className={`sidebar-container flex-shrink-0 bg-white border-end d-flex flex-column justify-content-between ${isSidebarCollapsed ? 'collapsed' : ''}`}
				style={{
					width: isSidebarCollapsed ? '80px' : '280px', // Animasi Lebar disini
					transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					height: '100%',
					overflowY: 'auto',
					overflowX: 'hidden',
				}}>
				{/* List  */}
				<div>
					<ul className="list-unstyled ps-0 mx-2 mt-2">
						{currentMenu.map((item) => (
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
				<EventCard isCollapsed={isSidebarCollapsed} />
			</div>
		</>
	);
};

export default Sidebar;
