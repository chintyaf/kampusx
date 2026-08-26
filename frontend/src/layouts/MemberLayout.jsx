import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavbarMember from './partials-dashboard/NavbarMember.jsx';
import Footer from './partials-dashboard/Footer';
import FooterLms from './partials-dashboard/FooterLms';

const MemberLayout = () => {
	const location = useLocation();
	const isLms = location.pathname.startsWith('/learner');

	return (
		<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<NavbarMember />
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
			{isLms ? <FooterLms /> : <Footer />}
		</div>
	);
};

export default MemberLayout;
