// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import LogoKampusX from "../assets/images/logo/Logo_KampusX.svg";

const AuthLayout = () => {
    return (
        <div className="vh-100 d-flex flex-column" style={{ backgroundColor: "var(--color-bg)" }}>
            {/* Navbar Super Minimalis Khusus Auth */}
            <nav className="p-4 text-center text-md-start">
                <Link to="/" className="text-decoration-none fw-bold fs-4" style={{ color: "var(--color-primary)" }}>
                    <img src={LogoKampusX} alt="Logo KampusX" style={{ height: 40 }} />
                </Link>
            </nav>

            {/* Tempat Halaman Sign In / Sign Up akan dirender */}
            <main className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;