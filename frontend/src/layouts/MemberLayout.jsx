import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarMember from './partials-dashboard/NavbarMember.jsx';
import Footer from './partials-dashboard/Footer';

const MemberLayout = () => {
	return (
		<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<NavbarMember />
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default MemberLayout;
