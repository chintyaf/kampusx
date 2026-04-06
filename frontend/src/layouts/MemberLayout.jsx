import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarMember from './partials-dashboard/NavbarMember.jsx';
const MemberLayout = () => {
    return (
        <>
            <NavbarMember />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default MemberLayout;