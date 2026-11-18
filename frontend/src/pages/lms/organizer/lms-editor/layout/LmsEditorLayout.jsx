import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import LmsEditorSidebar from './LmsEditorSidebar';
import Navbar from '@/layouts/partials-dashboard/Navbar';

const LmsEditorLayout = () => {
	const { moduleId, learningId } = useParams();

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
			<Navbar />

			<div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
				<LmsEditorSidebar moduleId={moduleId} learningId={learningId} />

				{/* Area konten: halaman Module / Lesson / Kuis masuk lewat Outlet */}
				<main style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f7f8fa' }}>
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default LmsEditorLayout;
