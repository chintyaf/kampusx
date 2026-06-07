import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Container, Button, Navbar, Nav, Offcanvas } from "react-bootstrap";
import {
    Search,
    MapPin,
    Crosshair,
    MonitorPlay,
    Clock,
	Home,
	Compass,
	Heart,
	Ticket,
	Info,
	LogIn,
	UserPlus,
	Menu,
	User,
	Settings,
	LayoutDashboard,
	Award,
	ShieldCheck,
	LogOut,
	Gift,
	Coins,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../../components/NotificationDropdown";
import "../../assets/css/dashboard.css";
import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";
import LogoTab from '../../assets/images/logo/Logo_Tab.png';
import userImg from "../../assets/images/user-placeholder.avif";
import ProfileDropdown from "./Navbar/ProfileDropdown";

const NavbarPublic = () => {
    // === AUTH STATE ===
    const { user, logout } = useAuth();
    const navigate = useNavigate();

	// === MOBILE MENU STATE ===
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const handleClose = () => setShowMobileMenu(false);
    const handleShow = () => setShowMobileMenu(true);

	const handleLogout = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    // === DROPDOWN STATE ===
    const [showLocDropdown, setShowLocDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fungsi tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowLocDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fungsi Lokasi
    const handleGetCurrentLocation = () => {
        setShowLocDropdown(false);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    alert(
                        `Lokasi didapatkan! Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`,
                    );
                },
                (error) => alert("Gagal mendapatkan lokasi."),
            );
        } else {
            alert("Browser tidak mendukung Geolocation.");
        }
    };

	// === STYLING ===
    const linkStyle = ({ isActive }) => ({
        fontSize: '14px',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? 'var(--color-primary, #00699E)' : 'var(--color-text, #0f172a)',
        borderBottom: isActive ? '2px solid var(--color-primary, #00699E)' : '2px solid transparent',
        padding: '6px 4px',
        transition: 'all 0.2s ease',
        textDecoration: 'none'
    });

    const mobileLinkStyle = ({ isActive }) => ({
        fontSize: '15px',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? 'var(--color-primary, #00699E)' : 'var(--color-text, #0f172a)',
        background: isActive ? 'var(--bahama-blue-50, #e6f2ff)' : 'transparent',
        borderRadius: '8px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        textDecoration: 'none'
    });

	return (
        <Navbar expand="lg" className="bg-white border-bottom shadow-sm sticky-top py-2">
            <Container className="px-4 d-flex align-items-center justify-content-between">
                {/* Brand Logo */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-0">
                    <img src={LogoKampusX} alt="KampusX" style={{ width: '130px' }} />
                </Navbar.Brand>

				{/* Desktop Navigation Links */}
				<Nav className="d-none d-lg-flex mx-auto gap-4 align-items-center">
					<NavLink to="/" style={linkStyle} end>
						Home
					</NavLink>
					<NavLink to="/explore-events" style={linkStyle}>
						Eksplor Event
					</NavLink>
					{user && (
						<>
							<NavLink to="/bookmarks" style={linkStyle}>
								Bookmark
							</NavLink>
							<NavLink to="/my-tickets" style={linkStyle}>
								Tiket Saya
							</NavLink>
							<NavLink to="/rewards" style={linkStyle}>
								Reward Global
							</NavLink>
							<NavLink to="/points" style={linkStyle}>
								Riwayat Poin
							</NavLink>
						</>
					)}
					<NavLink to="/about" style={linkStyle}>
						Tentang Kami
					</NavLink>
				</Nav>

				{/* Desktop Actions */}
				<div className="d-none d-lg-flex align-items-center gap-3">
					{!user ? (
						<>
							<Button as={Link} to="/register" variant="light" style={{
								fontSize: '13px', fontWeight: 600, background: '#fff', color: 'var(--color-text)',
								border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 20px'
							}}>
								Daftar
							</Button>
							<Button as={Link} to="/login" variant="dark" style={{
								fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-text)',
								border: 'none', borderRadius: 8, padding: '8px 20px'
							}}>
								Masuk
							</Button>
						</>
					) : (
						<>
							<NotificationDropdown />
							<ProfileDropdown />
						</>
					)}
				</div>

				{/* Mobile Controls (Only Bell Lonceng and Hamburger Menu) */}
				<div className="d-flex d-lg-none align-items-center gap-2">
					{user && <NotificationDropdown />}
					<Button 
						variant="light" 
						onClick={handleShow} 
						className="border-0 p-1" 
						style={{ background: 'transparent' }}
					>
						<Menu size={24} className="text-dark" />
					</Button>
				</div>

				{/* === CONDITIONAL RENDERING AUTH (Desktop) ===
				<div className="d-none d-lg-block">
					{user ? (
						<ProfileDropdown />
					) : (
						// JIKA USER GUEST: Tampilkan Tombol Masuk
						<Link to="/login">
							<Button
								className="px-4 fw-semibold border-0"
								style={{
									backgroundColor: "var(--color-primary)",
									fontSize: "var(--font-sm)",
									borderRadius: "6px",
								}}
							>
								Masuk
							</Button>
						</Link>
					)}
				</div> */}
            </Container>

            {/* Mobile Offcanvas Drawer (Sidebar Menu) */}
            <Offcanvas show={showMobileMenu} onHide={handleClose} placement="end" style={{ width: '280px' }}>
                <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title>
                        <img src={LogoTab} alt="KampusX" style={{ width: '50px' }} />
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column justify-content-between p-3" style={{ overflowY: 'auto' }}>
                    <div className="w-100">
                        {/* Navigation Links */}
                        <Nav className="flex-column gap-2">
                            <NavLink to="/" style={mobileLinkStyle} onClick={handleClose} end>
                                <Home size={18} />
                                <span>Home</span>
                            </NavLink>
                            <NavLink to="/explore-events" style={mobileLinkStyle} onClick={handleClose}>
                                <Compass size={18} />
                                <span>Eksplor Event</span>
                            </NavLink>
                            {user && (
                                <>
                                    <NavLink to="/bookmarks" style={mobileLinkStyle} onClick={handleClose}>
                                        <Heart size={18} />
                                        <span>Bookmark</span>
                                    </NavLink>
                                    <NavLink to="/my-tickets" style={mobileLinkStyle} onClick={handleClose}>
                                        <Ticket size={18} />
                                        <span>Tiket Saya</span>
                                    </NavLink>
                                    <NavLink to="/rewards" style={mobileLinkStyle} onClick={handleClose}>
                                        <Gift size={18} />
                                        <span>Reward Global</span>
                                    </NavLink>
                                    <NavLink to="/points" style={mobileLinkStyle} onClick={handleClose}>
                                        <Coins size={18} />
                                        <span>Riwayat Poin</span>
                                    </NavLink>
                                </>
                            )}
                            <NavLink to="/about" style={mobileLinkStyle} onClick={handleClose}>
                                <Info size={18} />
                                <span>Tentang Kami</span>
                            </NavLink>
                        </Nav>

                        {/* Unified User Profile & Account Menu in Mobile Sidebar */}
                        {user && (
                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex align-items-center gap-3 px-3 mb-3">
                                    <img
                                        src={userImg}
                                        alt={user.name}
                                        className="rounded-circle border"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <div className="fw-bold text-truncate" style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                                            {user.name || 'Member'}
                                        </div>
                                        <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                                            {user.email || ''}
                                        </div>
                                    </div>
                                </div>

                                <Nav className="flex-column gap-1">
                                    <NavLink to={`/profile/${user.id}`} style={mobileLinkStyle} onClick={handleClose}>
                                        <User size={18} />
                                        <span>Profil Saya</span>
                                    </NavLink>
                                    <NavLink to="/settings" style={mobileLinkStyle} onClick={handleClose}>
                                        <Settings size={18} />
                                        <span>Pengaturan Akun</span>
                                    </NavLink>

                                    {(user.role === 'admin' || user.role === 'organizer') ? (
                                        <NavLink to="/organizer/dashboard" style={mobileLinkStyle} onClick={handleClose}>
                                            <LayoutDashboard size={18} className="text-primary" />
                                            <span>Masuk Organizer</span>
                                        </NavLink>
                                    ) : (
                                        <NavLink to="/apply-organizer" style={mobileLinkStyle} onClick={handleClose}>
                                            <Award size={18} className="text-success" />
                                            <span>Daftar Organizer</span>
                                        </NavLink>
                                    )}

                                    {user.role === 'admin' && (
                                        <NavLink to="/admin/dashboard" style={mobileLinkStyle} onClick={handleClose}>
                                            <ShieldCheck size={18} className="text-warning" />
                                            <span>Masuk Admin</span>
                                        </NavLink>
                                    )}

                                    <hr className="my-2 opacity-10" />

                                    <Button 
                                        variant="link"
                                        onClick={handleLogout}
                                        className="d-flex align-items-center gap-3 px-3 py-2 text-danger text-decoration-none border-0 w-100 text-start bg-transparent"
                                        style={{ fontSize: '15px', fontWeight: 600 }}
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </Button>
                                </Nav>
                            </div>
                        )}
                    </div>

                    {/* Guest Mobile Buttons at Bottom */}
                    {!user && (
                        <div className="d-flex flex-column gap-2 mt-4 w-100">
                            <Button 
                                as={Link} 
                                to="/login" 
                                variant="light" 
                                onClick={handleClose}
                                style={{
                                    fontSize: '14px', fontWeight: 600, background: '#fff', color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                <LogIn size={16} />
                                <span>Masuk</span>
                            </Button>
                            <Button 
                                as={Link} 
                                to="/register" 
                                variant="dark" 
                                onClick={handleClose}
                                style={{
                                    fontSize: '14px', fontWeight: 600, backgroundColor: 'var(--color-text)',
                                    border: 'none', borderRadius: 8, padding: '10px 0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                <UserPlus size={16} />
                                <span>Daftar</span>
                            </Button>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </Navbar>
    );
};

export default NavbarPublic;