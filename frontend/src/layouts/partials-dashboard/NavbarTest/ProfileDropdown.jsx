import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import userImg from '../../../assets/images/user-placeholder.avif';
import { LogOut, Home, LayoutDashboard, ShieldCheck, ChevronRight, User } from 'lucide-react';

// Komponen kustom untuk Trigger/Tombol Dropdown
const CustomToggle = React.forwardRef(({ children, onClick, isOpen }, ref) => (
	<div
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		className={`d-flex align-items-center profile-toggle ${isOpen ? 'open' : ''}`}>
		{children}
	</div>
));

const ProfileDropdown = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [imgError, setImgError] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	// Fungsi custom untuk mengatur jeda penutupan
	const handleToggle = (nextOpen) => {
		if (nextOpen) {
			// Jika mau dibuka, langsung buka
			setOpen(true);
			setIsClosing(false);
		} else {
			// Jika mau ditutup, mulai animasi pop-out dulu
			setIsClosing(true);
			setTimeout(() => {
				setOpen(false);
				setIsClosing(false);
			}, 150); // 150ms = sesuai durasi animasi di CSS
		}
	};

	const handleLogout = async () => {
		handleToggle(false); // Gunakan fungsi toggle untuk efek animasi
		setTimeout(async () => {
			await logout();
			navigate('/');
		}, 150); // Tunggu animasi selesai baru redirect
	};

	if (!user) return null;

	const displayName = user.name || user.email?.split('@')[0] || 'User';
	const role = user.role || 'user';

	const menuItems = [
		{
			icon: Home,
			label: 'Halaman Utama',
			to: '/',
			iconBg: '#f1f5f9',
			iconBorder: '#cbd5e1',
			iconColor: '#64748b',
			show: true,
		},
		{
			icon: LayoutDashboard,
			label: 'Masuk Organizer',
			to: '/organizer/dashboard',
			iconBg: '#f0f9ff',
			iconBorder: '#b9e7fe',
			iconColor: '#00699e',
			show: role === 'admin' || role === 'organizer',
		},
		{
			icon: ShieldCheck,
			label: 'Masuk Admin',
			to: '/admin/dashboard',
			iconBg: '#fefce8',
			iconBorder: '#fde68a',
			iconColor: '#d97706',
			show: role === 'admin',
		},
	];

	return (
		<Dropdown show={open} onToggle={(isOpen) => setOpen(isOpen)} align="end">
			{/* Trigger */}
			<Dropdown.Toggle as={CustomToggle} isOpen={open} id="dropdown-profile">
				{!imgError ? (
					<img
						src={userImg}
						alt="User"
						onError={() => setImgError(true)}
						className="profile-avatar profile-avatar-sm"
					/>
				) : (
					<div className="d-flex align-items-center justify-content-center profile-fallback profile-fallback-sm">
						<User size={14} strokeWidth={2} />
					</div>
				)}
				<span
					className="text-truncate"
					style={{
						fontSize: '12px',
						fontWeight: 600,
						color: '#0f172a',
						maxWidth: '90px',
					}}>
					{displayName}
				</span>
				<ChevronRight
					size={13}
					strokeWidth={2.5}
					style={{
						color: '#94a3b8',
						transition: 'transform 0.2s ease',
						transform: open ? 'rotate(-90deg)' : 'rotate(90deg)',
						flexShrink: 0,
					}}
				/>
			</Dropdown.Toggle>

			{/* Panel Menu */}
			<Dropdown.Menu
				className="p-0 border-0 mt-2"
				style={{ borderRadius: 7, shadowColor: 'none' }}>
				<div
					className={`shadow-sm pop-down ${isClosing ? 'pop-out' : 'pop-down'}`}
					style={{
						borderRadius: 7,
						overflow: 'hidden',
						border: '1.2px solid var(--border-md)',
					}}>
					{/* User Card Header */}
					<div
						className="d-flex align-items-center p-3 border-bottom"
						style={{ gap: '11px' }}>
						{!imgError ? (
							<img
								src={userImg}
								alt="User"
								onError={() => setImgError(true)}
								className="profile-avatar profile-avatar-md"
							/>
						) : (
							<div className="d-flex align-items-center justify-content-center profile-fallback profile-fallback-md">
								<User size={18} strokeWidth={2} />
							</div>
						)}
						<div style={{ minWidth: 0 }}>
							<div
								className="text-truncate"
								style={{
									fontSize: '14px',
									fontWeight: 700,
									color: 'var(--color-text)',
									lineHeight: 1.25,
								}}>
								{displayName}
							</div>
							{user.email && (
								<div
									className="text-truncate mt-1"
									style={{ fontSize: '11px', color: 'var(--bahama-blue-700)' }}>
									{user.email}
								</div>
							)}
						</div>
					</div>

					{/* Menu Items */}
					<div className="p-2">
						{menuItems
							.filter((m) => m.show)
							.map((item) => {
								const Icon = item.icon;
								return (
									<Dropdown.Item
										as={NavLink}
										key={item.to}
										to={item.to}
										onClick={() => handleToggle(false)}
										className="d-flex align-items-center rounded mb-1 profile-menu-item">
										<div
											className="d-flex align-items-center justify-content-center profile-icon-box"
											style={{
												background: item.iconBg,
												border: `1.5px solid ${item.iconBorder}`,
											}}>
											<Icon
												size={14}
												color={item.iconColor}
												strokeWidth={2}
											/>
										</div>
										<span style={{ flex: 1 }}>{item.label}</span>
										<ChevronRight size={13} color="#cbd5e1" />
									</Dropdown.Item>
								);
							})}

						<Dropdown.Divider style={{ margin: '6px 0', opacity: 0.1 }} />

						{/* Logout Button */}
						<Dropdown.Item
							onClick={handleLogout}
							className="d-flex align-items-center rounded mt-1 profile-menu-item danger">
							<div
								className="d-flex align-items-center justify-content-center profile-icon-box"
								style={{
									background: '#fff5f5',
									border: '1.5px solid #fecaca',
								}}>
								<LogOut size={14} color="#ef4444" strokeWidth={2} />
							</div>
							<span style={{ flex: 1 }}>Logout</span>
						</Dropdown.Item>
					</div>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default ProfileDropdown;
