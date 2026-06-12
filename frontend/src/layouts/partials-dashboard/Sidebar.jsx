import { useEffect, useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';

import { SidebarItem, EventCard } from '@/features/sidebar';
import { MENU_ITEMS } from '@/features/sidebar/data/route';
import api from '@/api/axios';

const Sidebar = ({ type, isSidebarCollapsed, setIsSidebarCollapsed }) => {
	// State menampung array berisi ID menu yang sedang terbuka
	const [openMenus, setOpenMenus] = useState([]);
	const [missingData, setMissingData] = useState([]);
	const [eventStatus, setEventStatus] = useState('loading');
	const location = useLocation();

	// Mendapatkan eventId dari URL
	const eventIdMatch = location.pathname.match(/\/organizer\/([^/]+)\/event-dashboard/);
	const currentEventId = eventIdMatch ? eventIdMatch[1] : '';

	const baseMenu = MENU_ITEMS[type] || [];

	// Fetch event publish status/errors
	useEffect(() => {
		if (!currentEventId) return;

		const fetchEventStatus = async () => {
			try {
				const response = await api.get(`/events/${currentEventId}/check-status`);
				if (response.data?.success || response.data?.status === 'success') {
					setMissingData(response.data.data.missing_data || []);
				}

				const statusRes = await api.get(`/events/${currentEventId}/status`);
				if (statusRes.data?.status === 'success') {
					setEventStatus(statusRes.data.data.status);
				}
			} catch (err) {
				console.error('Gagal memuat status kelayakan event:', err);
				setEventStatus('draft');
			}
		};

		fetchEventStatus();

		const handleRefetch = () => {
			fetchEventStatus();
		};

		window.addEventListener('event-status-updated', handleRefetch);
		return () => {
			window.removeEventListener('event-status-updated', handleRefetch);
		};
	}, [currentEventId]); // Only re-fetch when event changes or explicitly triggered via event-status-updated

	// Menggunakan useMemo agar referensi currentMenu tidak berubah setiap kali render
	const currentMenu = useMemo(() => {
		return baseMenu
			.filter((item) => !(eventStatus === 'draft' && item.hideWhenDraft))
			.map((item) => ({
				...item,
				path: item.path ? item.path.replace(/:eventId|:slug/g, currentEventId) : item.path,
			}));
	}, [baseMenu, currentEventId, eventStatus]);

	const handleToggle = (id) => {
		if (isSidebarCollapsed) {
			// Lebarkan sidebar dan buka HANYA menu ini (Single-Expand)
			setIsSidebarCollapsed(false);
			setOpenMenus([id]);
		} else {
			// Jika menu sudah terbuka, tutup (kosongkan array). Jika belum, buka HANYA menu ini.
			setOpenMenus((prev) => (prev.includes(id) ? [] : [id]));
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

				// Jika path aktif, jadikan menu ini satu-satunya yang terbuka
				if (isActive) {
					setOpenMenus((prev) => {
						// Cegah state update yang tidak perlu jika menu ini sudah menjadi satu-satunya yang terbuka
						if (prev.length !== 1 || prev[0] !== item.id) {
							return [item.id];
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
				className={`sidebar-container flex-shrink-0 border-end d-flex flex-column justify-content-between ${isSidebarCollapsed ? 'collapsed' : ''}`}
				style={{
					width: isSidebarCollapsed ? '80px' : '230px',
					transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					height: '100%',
					overflowY: 'auto',
					overflowX: 'hidden',
					overflowAnchor: 'none', // Tambahkan baris ini
				}}
			>
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
				{/* <EventCard isCollapsed={isSidebarCollapsed} eventId={currentEventId} /> */}
			</div>
		</>
	);
};

export default Sidebar;
