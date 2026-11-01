import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarMember from '../partials-dashboard/NavbarMember.jsx';
import Footer from '../partials-dashboard/Footer';
import SRLModal from '@/components/lms/SRLModal';
import SRLTriggerButton from '@/components/lms/SRLTriggerButton';
import { SRLProvider, useSRL } from '@/context/SRLContext';

const LMSContent = () => {
	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
			}}
		>
			<NavbarMember />
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
			<Footer />

			<SRLTriggerButton />
			{/* Modal SRL */}
			<SRLModal />
		</div>
	);
};

const LmsLayout = () => {
	return (
		<SRLProvider>
			<LMSContent />
		</SRLProvider>
	);
};

export default LmsLayout;
