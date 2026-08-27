import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const SidebarItem = ({ item, isOpen, toggle, isSidebarCollapsed }) => {
	const location = useLocation();
	const hasSubmenu = !!item.submenu;

	const isChildActive = item.submenu?.some((sub) => {
		const fullPath = `${item.path}/${sub.path}`.replace(/\/+/g, '/');
		return location.pathname.startsWith(fullPath);
	});

	const isParentActive = () => {
		const cleanedPath = ('/' + item.path).replace(/\/+/g, '/');
		if (cleanedPath === '/organizer/dashboard') {
			return location.pathname.startsWith('/organizer') && 
				!location.pathname.includes('/event-dashboard') && 
				!location.pathname.includes('/organizer/daftar-acara');
		}
		return location.pathname === cleanedPath;
	};

	// Gunakan justify-content-between agar dot terdorong ke kanan
	const parentNavLinkClass = ({ isActive }) => {
		const active = isActive || isChildActive || isParentActive();
		return `nav-link custom-menu-item d-flex align-items-center border-0 ${active ? 'active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;
	};

	// Kelas khusus untuk parent yang memiliki submenu:
	// - 'expanded-active' jika child aktif (tidak ada border kiri biru, hanya indikator terbuka)
	// - 'active' hanya jika parent itu sendiri yang aktif
	const parentWithSubmenuClass = () =>
		`nav-link custom-menu-item d-flex align-items-center border-0 ${
			isChildActive ? 'expanded-active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;

	const childNavLinkClass = ({ isActive }) =>
		`nav-link custom-menu-item custom-submenu-item d-flex align-items-center border-0 ${isActive ? 'active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;

	// --- Helper Lingkaran Status (Hanya render jika isCompleted didefinisikan) ---
	const renderStatusDot = (status) => {
		if (status === undefined || status === null) return null;

		return (
			<div
				style={{
					width: '8px',
					height: '8px',
					borderRadius: '50%',
					backgroundColor: status ? '#4ade80' : '#d1d5db',
					marginLeft: '10px',
					flexShrink: 0, // Agar lingkaran tidak gepeng jika teks panjang
				}}
			/>
		);
	};

	if (item.isHeader) {
		if (isSidebarCollapsed) {
			return <hr className="my-2 text-muted" />;
		}
		return (
			<div className="menu-header text-muted fw-bold ms-2" style={{ fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
				{item.name}
			</div>
		);
	}

	if (!hasSubmenu) {
		return (
			<NavLink
				to={item.path}
				className={parentNavLinkClass}
				end
				title={isSidebarCollapsed ? item.name : ''}
			>
				<div className="d-flex align-items-center">
					{item.icon}
					{!isSidebarCollapsed && <span className="menu-text ms-2">{item.name}</span>}
				</div>

				{/* Hanya muncul jika isCompleted ada di data item */}
				{!isSidebarCollapsed && renderStatusDot(item.isCompleted)}
			</NavLink>
		);
	}

	return (
		<>
			<button
				onClick={() => toggle(item.id)}
				className={`${parentWithSubmenuClass()} w-100`}
				title={isSidebarCollapsed ? item.name : ''}
				style={{
					textAlign: 'left',
					outline: 'none',
					boxShadow: 'none',
					background: 'none',
					padding: '0.5rem 1rem',
				}}
			>
				<div className="d-flex align-items-center sidebar-parent-menu">
					{item.icon}
					{!isSidebarCollapsed && <span className="ms-2">{item.name}</span>}
				</div>
				{!isSidebarCollapsed && (
					<ChevronDown
						size={16}
						style={{
							transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
							transition: '0.3s',
						}}
					/>
				)}
			</button>

			{!isSidebarCollapsed && (
				<div className={`submenu-collapse ${isOpen ? 'show' : ''}`}>
					<div className="submenu-inner">
						<ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-1 ms-4 mt-1 border-start">
							{item.submenu.map((sub, idx) => {
								return (
									<li key={idx}>
										<NavLink
											to={`${item.path}/${sub.path}`}
											className={childNavLinkClass}
										>
											<span className="d-flex align-items-center">
												{sub.name}
											</span>
											{/* Cek status untuk sub-menu secara dinamis */}
											{renderStatusDot(sub.isCompleted)}
										</NavLink>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			)}
		</>
	);
};

export default SidebarItem;
