import { useEffect, useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';

import { SidebarItem, EventCard } from '@/features/sidebar';
import { MENU_ITEMS } from '@/features/sidebar/data/route';

const Sidebar = ({ type, isSidebarCollapsed, setIsSidebarCollapsed }) => {
	// State menampung array berisi ID menu yang sedang terbuka
	const [openMenus, setOpenMenus] = useState([]);
	const location = useLocation();

	// Mendapatkan eventId dari URL
	const eventIdMatch = location.pathname.match(/\/organizer\/([^/]+)\/event-dashboard/);
	const currentEventId = eventIdMatch ? eventIdMatch[1] : '';

	const baseMenu = MENU_ITEMS[type] || [];

	// Menggunakan useMemo agar referensi currentMenu tidak berubah setiap kali render
	const currentMenu = useMemo(() => {
		return baseMenu.map((item) => ({
			...item,
			path: item.path ? item.path.replace(/:eventId|:slug/g, currentEventId) : item.path,
		}));
	}, [baseMenu, currentEventId]);

	const handleToggle = (id) => {
		if (isSidebarCollapsed) {
			// Lebarkan sidebar dan pastikan menu ini masuk ke daftar terbuka
			setIsSidebarCollapsed(false);
			setOpenMenus((prev) => (prev.includes(id) ? prev : [...prev, id]));
		} else {
			// Tambah atau hapus ID menu dari array openMenus
			setOpenMenus((prev) =>
				prev.includes(id) ? prev.filter((menuId) => menuId !== id) : [...prev, id],
			);
		}
	};

	useEffect(() => {
		const currentPath = location.pathname;

		currentMenu.forEach((item) => {
			if (item.submenu) {
				const isActive = item.submenu.some((sub) => {
					const fullPath = `${item.path}/${sub.path}`.replace(/\/+/g, '/');
					return currentPath.startsWith(fullPath);
				});

				// Jika path aktif, pastikan ID menu masuk ke daftar terbuka
				if (isActive) {
					setOpenMenus((prev) => {
						if (!prev.includes(item.id)) {
							return [...prev, item.id];
						}
						return prev;
					});
				}
			}
		});
	}, [location.pathname, currentMenu]);

	return (
		<>
			<div
				className={`sidebar-container flex-shrink-0 bg-white border-end d-flex flex-column justify-content-between ${isSidebarCollapsed ? 'collapsed' : ''}`}
				style={{
					width: isSidebarCollapsed ? '80px' : '240px',
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
									isOpen={openMenus.includes(item.id)}
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
