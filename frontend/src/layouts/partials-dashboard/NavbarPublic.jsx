import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { Search, MapPin, Crosshair, MonitorPlay, Clock } from "lucide-react";

const NavbarPublic = () => {
    // State untuk membuka/menutup dropdown lokasi
    const [showLocDropdown, setShowLocDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fungsi untuk menutup dropdown kalau user klik di luar kotak
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowLocDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fungsi untuk memanggil Pop-Up Permission Lokasi (HTML5 Geolocation)
    const handleGetCurrentLocation = () => {
        setShowLocDropdown(false); // Tutup dropdown
        
        if (navigator.geolocation) {
            // Ini yang akan memicu pop-up "Allow location" di browser
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Latitude:", position.coords.latitude);
                    console.log("Longitude:", position.coords.longitude);
                    alert(`Lokasi didapatkan! Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    alert("Gagal mendapatkan lokasi atau izin ditolak.");
                }
            );
        } else {
            alert("Browser Anda tidak mendukung fitur Geolocation.");
        }
    };

    return (
        <nav className="navbar py-3 sticky-top bg-white border-bottom shadow-sm">
            <Container fluid className="px-4 d-flex align-items-center justify-content-between">
                
                {/* 1. BAGIAN KIRI: Logo */}
                <Link to="/" className="navbar-brand fw-bold fs-4 m-0" style={{ color: "var(--color-primary)" }}>
                    KampusX
                </Link>

                {/* 2. BAGIAN TENGAH: Search Bar Kapsul */}
                <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
                    <div 
                        className="d-flex align-items-center rounded-pill bg-white px-2 py-1" 
                        style={{ border: "1px solid var(--color-border)" }}
                    >
                        {/* Input Cari Event */}
                        <div className="d-flex align-items-center px-2">
                            <Search size={18} style={{ color: "var(--color-secondary)" }} />
                            {/* Catatan: class form-control dihapus, diganti custom style agar tidak ada border focus */}
                            <input 
                                type="text" 
                                placeholder="Cari Event" 
                                className="bg-transparent border-0 ms-2" 
                                style={{ fontSize: "var(--font-sm)", width: "160px", outline: "none", boxShadow: "none" }} 
                            />
                        </div>

                        {/* Garis Pemisah Vertikal */}
                        <div style={{ height: "24px", width: "1px", backgroundColor: "var(--color-border)" }}></div>

                        {/* Input Lokasi dengan Dropdown */}
                        <div className="d-flex align-items-center px-2 position-relative" ref={dropdownRef}>
                            <MapPin size={18} style={{ color: "var(--color-secondary)" }} />
                            <input 
                                type="text" 
                                placeholder="Lokasi" 
                                className="bg-transparent border-0 ms-2" 
                                style={{ fontSize: "var(--font-sm)", width: "160px", outline: "none", boxShadow: "none" }} 
                                onClick={() => setShowLocDropdown(true)}
                                // readOnly // Dibuat readonly dulu agar fokus ke dropdown (opsional)
                            />

                            {/* DROPDOWN LOKASI */}
                            {showLocDropdown && (
                                <div 
                                    className="position-absolute bg-white rounded shadow border py-2" 
                                    style={{ top: "45px", left: "0", width: "250px", zIndex: 1000 }}
                                >
                                    <button 
                                        className="dropdown-item d-flex align-items-center gap-3 py-2 px-3 border-0 bg-transparent w-100 text-start hover-bg-light"
                                        onClick={handleGetCurrentLocation}
                                    >
                                        <Crosshair size={18} color="var(--bahama-blue-500)" />
                                        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text)" }}>Use my current location</span>
                                    </button>
                                    
                                    <button className="dropdown-item d-flex align-items-center gap-3 py-2 px-3 border-0 bg-transparent w-100 text-start hover-bg-light">
                                        <MonitorPlay size={18} color="var(--bahama-blue-500)" />
                                        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text)" }}>Browse online events</span>
                                    </button>

                                    <hr className="my-2" style={{ borderColor: "var(--color-border)" }} />

                                    <button className="dropdown-item d-flex align-items-center gap-3 py-2 px-3 border-0 bg-transparent w-100 text-start hover-bg-light">
                                        <Clock size={18} color="var(--bahama-blue-500)" />
                                        <div className="d-flex flex-column">
                                            <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text)" }}>Bandung</span>
                                            <span style={{ fontSize: "var(--font-xs)", color: "var(--color-secondary)" }}>Jawa Barat</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tombol Search Bulat */}
                        <Button 
                            className="rounded-circle d-flex justify-content-center align-items-center p-0 border-0 ms-1" 
                            style={{ backgroundColor: "var(--bahama-blue-500)", width: "36px", height: "36px" }}
                        >
                            <Search size={16} color="white" />
                        </Button>
                    </div>
                </div>

                {/* 3. BAGIAN KANAN: Menu Tautan & Tombol Masuk */}
                <div className="d-flex align-items-center gap-4">
                    <div className="d-none d-md-flex gap-4 fw-medium" style={{ fontSize: "var(--font-sm)" }}>
                        <Link to="/explore-events" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Eksplor Event</Link>
                        <Link to="/organizer/buat-acara" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Buat Event</Link>
                        <Link to="/about" className="text-decoration-none" style={{ color: "var(--color-text)" }}>Tentang Kami</Link>
                    </div>
                    
                    <Link to="/signin">
                        <Button className="px-4 fw-semibold border-0" style={{ backgroundColor: "var(--color-primary)", fontSize: "var(--font-sm)", borderRadius: "6px" }}>
                            Masuk
                        </Button>
                    </Link>
                </div>
            </Container>
        </nav>
    );
};

export default NavbarPublic;