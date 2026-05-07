import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const SidebarItem = ({ item, isOpen, toggle, isSidebarCollapsed }) => {
	const location = useLocation();
	const hasSubmenu = !!item.submenu;

	const isChildActive = item.submenu?.some((sub) => {
		const fullPath = `${item.path}${sub.path}`.replace(/\/+/g, '/');
		return location.pathname.startsWith(fullPath);
	});

	// Gunakan justify-content-between agar dot terdorong ke kanan
	const navLinkClass = ({ isActive }) =>
		`nav-link custom-menu-item d-flex align-items-center border-0 ${
			isActive || isChildActive ? 'active' : ''
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

	if (!hasSubmenu) {
		return (
			<NavLink
				to={item.path}
				className={navLinkClass}
				end
				title={isSidebarCollapsed ? item.name : ''}>
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
				className={`${navLinkClass({ isActive: isChildActive })} w-100`}
				title={isSidebarCollapsed ? item.name : ''}
				style={{
					textAlign: 'left',
					outline: 'none',
					boxShadow: 'none',
					background: 'none',
					padding: '0.5rem 1rem',
				}}>
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
							{item.submenu.map((sub, idx) => (
								<li key={idx}>
									<NavLink
										to={`${item.path}/${sub.path}`}
										className={navLinkClass}>
										<span>{sub.name}</span>
										{/* Cek status untuk sub-menu */}
										{renderStatusDot(sub.isCompleted)}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</>
	);
};

export default SidebarItem;
