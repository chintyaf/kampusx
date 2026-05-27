import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import {
    Search,
    MapPin,
    Crosshair,
    MonitorPlay,
    Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";
import userImg from "../../assets/images/user-placeholder.avif";
import ProfileDropdown from "./Navbar/ProfileDropdown";
import "../../assets/css/dashboard.css";

const NavbarPublic = () => {
    // === AUTH STATE ===
    const { user } = useAuth();
    const navigate = useNavigate();

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

    // Fungsi Lokasi (Tetap sama seperti aslinya)
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

    return (
        <nav className="navbar py-3 sticky-top bg-white border-bottom shadow-sm">
            <Container
                fluid
                className="px-4 d-flex align-items-center justify-content-between"
            >
                {/* 1. BAGIAN KIRI: Logo */}
                <div className="col-2">
                    <NavLink to="/" className="link-dark text-decoration-none">
                        <img
                            src={LogoKampusX}
                            alt="KampusX"
                            style={{ width: "130px" }}
                        />
                    </NavLink>
                </div>

                {/* 2. BAGIAN TENGAH: Search Bar Kapsul (Kode persis sama seperti punya kamu, saya skip penulisan ulangnya biar ringkas di layar ini) */}
                <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
                    {/* ... (Isi search bar kamu taruh sini lagi, tidak ada yang berubah) ... */}
                </div>

                {/* 3. BAGIAN KANAN: Menu Tautan & Logika Auth */}
                <div className="d-flex align-items-center gap-4">
                    <div
                        className="d-none d-md-flex gap-4 fw-medium"
                        style={{ fontSize: "var(--font-sm)" }}
                    >
                        <Link
                            to="/explore-events"
                            className="text-decoration-none"
                            style={{ color: "var(--color-text)" }}
                        >
                            Eksplor Event
                        </Link>
                        {user && (user.role === 'admin' || user.role === 'organizer') ? (
                            <Link
                                to="/organizer/buat-acara"
                                className="text-decoration-none"
                                style={{ color: "var(--color-text)" }}
                            >
                                Buat Event
                            </Link>
                        ) : (
                            <Link
                                to="/apply-organizer"
                                className="text-decoration-none"
                                style={{ color: "var(--color-text)" }}
                            >
                                Daftar Organizer
                            </Link>
                        )}
                        <Link
                            to="/about"
                            className="text-decoration-none"
                            style={{ color: "var(--color-text)" }}
                        >
                            Tentang Kami
                        </Link>
                    </div>

                    {/* === CONDITIONAL RENDERING AUTH === */}
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
                </div>
            </Container>
        </nav>
    );
};

export default NavbarPublic;
