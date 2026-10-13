import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// Helper untuk memastikan path selalu absolut
const getAbsolutePath = (path) => {
	if (!path) return '#';
	if (path.startsWith('http')) return path;
	return path.startsWith('/') ? path : `/${path}`;
};

// Helper untuk menggabungkan path parent & submenu secara aman
const getSubmenuPath = (parentPath, childPath) => {
	if (!childPath) return '#';
	if (childPath.startsWith('http')) return childPath;
	if (childPath.startsWith('/')) return childPath;

	const parentAbs = getAbsolutePath(parentPath);
	return `${parentAbs}/${childPath}`.replace(/\/+/g, '/');
};

const SidebarItem = ({ item, isOpen, toggle, isSidebarCollapsed }) => {
	const location = useLocation();
	const hasSubmenu = !!item.submenu;

	const isChildActive = item.submenu?.some((sub) => {
		const fullPath = getSubmenuPath(item.path, sub.path);
		return location.pathname.startsWith(fullPath);
	});

	const parentNavLinkClass = ({ isActive }) =>
		`nav-link custom-menu-item d-flex align-items-center border-0 ${
			isActive || isChildActive ? 'active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;

	const parentWithSubmenuClass = () =>
		`nav-link custom-menu-item d-flex align-items-center border-0 ${
			isChildActive ? 'expanded-active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;

	const childNavLinkClass = ({ isActive }) =>
		`nav-link custom-menu-item custom-submenu-item d-flex align-items-center border-0 ${
			isActive ? 'active' : ''
		} ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`;

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
					flexShrink: 0,
				}}
			/>
		);
	};

	if (item.isHeader) {
		if (isSidebarCollapsed) {
			return <hr className="my-2 text-muted" />;
		}
		return (
			<div
				className="menu-header text-muted fw-bold ms-2 text-truncate"
				style={{
					fontSize: '0.75rem',
					marginTop: '1.5rem',
					marginBottom: '0.5rem',
					letterSpacing: '0.05em',
				}}
			>
				{item.name}
			</div>
		);
	}

	if (!hasSubmenu) {
		return (
			<NavLink
				to={getAbsolutePath(item.path)}
				className={parentNavLinkClass}
				end
				title={item.name}
			>
				{/* ✅ Tambahkan minWidth: 0 dan text-truncate agar teks tidak meluap */}
				<div
					className="d-flex align-items-center"
					style={{ minWidth: 0, overflow: 'hidden' }}
				>
					<span style={{ flexShrink: 0 }}>{item.icon}</span>
					{!isSidebarCollapsed && (
						<span className="menu-text ms-2 text-truncate" title={item.name}>
							{item.name}
						</span>
					)}
				</div>

				{!isSidebarCollapsed && renderStatusDot(item.isCompleted)}
			</NavLink>
		);
	}

	return (
		<>
			<button
				onClick={() => toggle(item.id)}
				className={`${parentWithSubmenuClass()} w-100`}
				title={item.name}
				style={{
					textAlign: 'left',
					outline: 'none',
					boxShadow: 'none',
					background: 'none',
					padding: '0.5rem 1rem',
				}}
			>
				{/* ✅ Tambahkan minWidth: 0 dan text-truncate */}
				<div
					className="d-flex align-items-center sidebar-parent-menu"
					style={{ minWidth: 0, overflow: 'hidden' }}
				>
					<span style={{ flexShrink: 0 }}>{item.icon}</span>
					{!isSidebarCollapsed && (
						<span className="ms-2 text-truncate" title={item.name}>
							{item.name}
						</span>
					)}
				</div>

				{!isSidebarCollapsed && (
					<ChevronDown
						size={16}
						style={{
							transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
							transition: '0.3s',
							flexShrink: 0,
							marginLeft: '8px',
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
										to={getSubmenuPath(item.path, sub.path)}
										className={childNavLinkClass}
										title={sub.name}
									>
										<span
											className="d-flex align-items-center text-truncate"
											style={{ minWidth: 0 }}
										>
											<span className="text-truncate">{sub.name}</span>
										</span>
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
