import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Tambahkan useNavigate
import { Container, Button } from "react-bootstrap";
import { Search, MapPin, Crosshair, MonitorPlay, Clock, LogOut } from "lucide-react"; // Tambahkan LogOut
import { useAuth } from '../../context/AuthContext'; // Import AuthContext

// Pastikan path gambar ini benar sesuai struktur folder kamu
import userImg from "../../assets/images/user-placeholder.avif"; 

const NavbarPublic = () => {
    // === AUTH STATE ===
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // === DROPDOWN STATE ===
    const [showLocDropdown, setShowLocDropdown] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false); // State untuk dropdown profil
    
    const dropdownRef = useRef(null);
    const profileRef = useRef(null); // Ref untuk klik di luar profil

    // Fungsi tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowLocDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fungsi Logout
    const handleLogout = async () => {
        await logout();
        setShowProfileMenu(false);
        navigate('/'); 
    };

    // Fungsi Lokasi (Tetap sama seperti aslinya)
    const handleGetCurrentLocation = () => {
        setShowLocDropdown(false); 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    alert(`Lokasi didapatkan! Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
                },
                (error) => alert("Gagal mendapatkan lokasi.")
            );
        } else {
            alert("Browser tidak mendukung Geolocation.");
        }
    };

    return (
        <nav className="navbar py-3 sticky-top bg-white border-bottom shadow-sm">
            <Container fluid className="px-4 d-flex align-items-center justify-content-between">
                
                {/* 1. BAGIAN KIRI: Logo */}
                <Link to="/" className="navbar-brand fw-bold fs-4 m-0" style={{ color: "var(--color-primary)" }}>
                    KampusX
                </Link>

                {/* 2. BAGIAN TENGAH: Search Bar Kapsul (Kode persis sama seperti punya kamu, saya skip penulisan ulangnya biar ringkas di layar ini) */}
                <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
                     {/* ... (Isi search bar kamu taruh sini lagi, tidak ada yang berubah) ... */}
                </div>

                {/* 3. BAGIAN KANAN: Menu Tautan & Logika Auth */}
                <div className="d-flex align-items-center gap-4">
                    <div className="d-none d-md-flex gap-4 fw-medium" style={{ fontSize: "var(--font-sm)" }}>
                        <Link to="/explore-events" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Eksplor Event</Link>
                        <Link to="/organizer/buat-acara" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Buat Event</Link>
                        <Link to="/about" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Tentang Kami</Link>
                    </div>
                    
                    {/* === CONDITIONAL RENDERING AUTH === */}
                    {user ? (
                        // JIKA USER SUDAH LOGIN: Tampilkan Profil
                        <div className="position-relative" ref={profileRef} style={{ cursor: "pointer" }}>
                            <div onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                <img
                                    className="rounded-circle object-fit-cover shadow-sm border"
                                    src={userImg}
                                    alt="User"
                                    width="40px"
                                    height="40px"
                                />
                            </div>

                            {/* Dropdown Menu Profil */}
                            {showProfileMenu && (
                                <div 
                                    className="position-absolute bg-white rounded shadow border mt-2 end-0" 
                                    style={{ width: "180px", zIndex: 1000 }}
                                >
                                    <div className="px-3 py-2 border-bottom">
                                        <p className="m-0 fw-semibold text-truncate" style={{ fontSize: "var(--font-sm)" }}>
                                            Halo, {user.name || "Peserta"}
                                        </p>
                                    </div>
                                    <button 
                                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 border-0 bg-transparent w-100 text-start text-danger hover-bg-light"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span style={{ fontSize: "var(--font-sm)" }}>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // JIKA USER GUEST: Tampilkan Tombol Masuk
                        <Link to="/signin">
                            <Button className="px-4 fw-semibold border-0" style={{ backgroundColor: "var(--color-primary)", fontSize: "var(--font-sm)", borderRadius: "6px" }}>
                                Masuk
                            </Button>
                        </Link>
                    )}
                </div>
            </Container>
        </nav>
    );
};

export default NavbarPublic;