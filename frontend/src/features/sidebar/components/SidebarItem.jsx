import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Lock } from 'lucide-react';
import { notify } from '@/utils/notify';

const SidebarItem = ({ 
	item, 
	isOpen, 
	toggle, 
	isSidebarCollapsed,
	isStep1Completed = true,
	isStep2Completed = true,
	isStep3Completed = true,
	isStep4Completed = true
}) => {
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
							{item.submenu.map((sub, idx) => {
								const subFullPath = `${item.path}/${sub.path}`.replace(/\/+/g, '/');
								const isSubActive = location.pathname.startsWith(subFullPath);

								const isRestricted =
									!isSubActive &&
									item.id === 'detil-event' && (
										(sub.path === 'tempat' && !isStep1Completed) ||
										(sub.path === 'sesi' && (!isStep1Completed || !isStep2Completed)) ||
										(sub.path === 'tiket' && (!isStep1Completed || !isStep2Completed || !isStep3Completed))
									);

								return (
									<li key={idx}>
										<NavLink
											to={isRestricted ? '#' : `${item.path}/${sub.path}`}
											onClick={(e) => {
												if (isRestricted) {
													e.preventDefault();
													let missingStep = '';
													if (sub.path === 'tempat') missingStep = 'Informasi Umum';
													else if (sub.path === 'sesi') missingStep = 'Tempat Pelaksanaan';
													else if (sub.path === 'tiket') missingStep = 'Jadwal';
													
													notify('warning', 'Akses Dibatasi', `Mohon lengkapi bagian '${missingStep}' terlebih dahulu.`);
												}
											}}
											className={(navParams) => `${navLinkClass(isRestricted ? { isActive: false } : navParams)} ${isRestricted ? 'text-muted' : ''}`}
											style={{
												cursor: isRestricted ? 'not-allowed' : 'pointer',
												color: isRestricted ? '#94a3b8' : undefined,
												backgroundColor: isRestricted ? 'transparent' : undefined,
												opacity: isRestricted ? 0.65 : 1
											}}
										>
											<span className="d-flex align-items-center">
												{sub.name}
												{isRestricted && <Lock size={12} className="text-muted ms-1.5" />}
											</span>
											{/* Cek status untuk sub-menu secara dinamis */}
											{!isRestricted && renderStatusDot(
												sub.path === 'info' ? isStep1Completed :
												sub.path === 'tempat' ? isStep2Completed :
												sub.path === 'sesi' ? isStep3Completed :
												sub.path === 'tiket' ? isStep4Completed :
												sub.isCompleted
											)}
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
