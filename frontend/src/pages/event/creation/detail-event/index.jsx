import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

const index = () => {
    const { eventId } = useParams();
    const navItems = [
        { name: "Info Utama", path: "info-utama" }, // Index route
        { name: "Jadwal & Lokasi", path: "jadwal-lokasi" },
    ];

    return (
        <div>
            <nav>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        // to={`/organizer/event/${eventId}/${item.path}`}
                        to={`/organizer/event/${item.path}`}
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <Outlet />
        </div>
    );
};

export default index;
