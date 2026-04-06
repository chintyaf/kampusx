// components/NavbarMember.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import NotificationDropdown from "../../components/NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown"; 
import LogoKampusX from "../../assets/images/logo/Logo_KampusX.svg";

const NavbarMember = () => {
    return (
        <nav className="navbar border-bottom shadow-sm">
            <div className="nav-content w-100 d-flex justify-content-between align-items-center" style={{ padding: "10px 60px 10px 40px" }}>
                
                {/* Logo arahkan ke explore / home */}
                <NavLink to="/" className="link-dark text-decoration-none">
                    <img src={LogoKampusX} alt="KampusX" style={{ width: "130px" }} />
                </NavLink>

                <div className="d-flex align-items-center gap-3">
                    <NotificationDropdown />
                    <ProfileDropdown />
                </div>
            </div>
        </nav>
    );
};

export default NavbarMember; 