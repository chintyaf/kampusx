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
			} catch (err) {
				console.error('Gagal memuat status kelayakan event:', err);
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
	}, [currentEventId, location.pathname]); // Re-fetch on currentEventId change and page navigation!

	// Menggunakan useMemo agar referensi currentMenu tidak berubah setiap kali render
	const currentMenu = useMemo(() => {
		return baseMenu.map((item) => ({
			...item,
			path: item.path ? item.path.replace(/:eventId|:slug/g, currentEventId) : item.path,
		}));
	}, [baseMenu, currentEventId]);

	// Calculate completion states (we default to true if missingData is not loaded yet to prevent flash locking)
	const isStep1Completed = useMemo(() => {
		if (!missingData || missingData.length === 0) return true;
		const step1Keywords = ['judul', 'deskripsi', 'poster', 'zona waktu', 'kategori', 'tipe event'];
		return !missingData.some(err => 
			step1Keywords.some(kw => err.toLowerCase().includes(kw))
		);
	}, [missingData]);

	const isStep2Completed = useMemo(() => {
		if (!missingData || missingData.length === 0) return true;
		const step2Keywords = ['lokasi', 'platform', 'meeting', 'kuota', 'tempat/gedung', 'provinsi', 'alamat lengkap', 'google maps', 'titik koordinat'];
		return !missingData.some(err => 
			step2Keywords.some(kw => err.toLowerCase().includes(kw))
		);
	}, [missingData]);

	const isStep3Completed = useMemo(() => {
		if (!missingData || missingData.length === 0) return true;
		const step3Keywords = ['tanggal mulai', 'jadwal atau sesi', 'waktu pelaksanaan', 'pembicara'];
		return !missingData.some(err => 
			step3Keywords.some(kw => err.toLowerCase().includes(kw))
		);
	}, [missingData]);

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
				className={`sidebar-container flex-shrink-0 border-end d-flex flex-column justify-content-between ${isSidebarCollapsed ? 'collapsed' : ''}`}
				style={{
					width: isSidebarCollapsed ? '80px' : '240px',
					transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					height: '100%',
					overflowY: 'auto',
					overflowX: 'hidden',
					overflowAnchor: 'none', // Tambahkan baris ini
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
									isStep1Completed={isStep1Completed}
									isStep2Completed={isStep2Completed}
									isStep3Completed={isStep3Completed}
								/>
							</li>
						))}
					</ul>
				</div>
				<EventCard isCollapsed={isSidebarCollapsed} eventId={currentEventId} />
			</div>
		</>
	);
};

export default Sidebar;
