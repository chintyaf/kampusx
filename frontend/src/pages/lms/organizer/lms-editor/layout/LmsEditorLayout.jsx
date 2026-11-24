import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import LmsEditorSidebar from './LmsEditorSidebar';
import Navbar from '@/layouts/partials-dashboard/Navbar';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import { Spinner } from 'react-bootstrap';

const LmsEditorLayout = () => {
	const { moduleId, learningId } = useParams();
	const [module, setModule] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchModule = useCallback(async () => {
		if (!moduleId) return;
		try {
			const res = await api.get(`/organizer/lms/modules/${moduleId}`);
			if (res.data?.success && res.data?.data) {
				setModule(res.data.data);
			}
		} catch (error) {
			console.error('Error fetching module:', error);
			notify(
				'error',
				'Gagal Memuat Module',
				error.response?.data?.message || 'Tidak dapat mengambil data module.',
			);
		} finally {
			setLoading(false);
		}
	}, [moduleId]);

	useEffect(() => {
		fetchModule();
	}, [fetchModule]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
			<Navbar />

			<div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
				<LmsEditorSidebar
					moduleId={moduleId}
					learningId={learningId}
					module={module}
					refreshModule={fetchModule}
					loading={loading}
				/>

				{/* Area konten: halaman Module / Lesson / Kuis masuk lewat Outlet */}
				<main
					style={{ flex: 1, overflowY: 'auto', background: '#f7f8fa' }}
					className="p-5"
				>
					{loading && !module ? (
						<div
							className="d-flex justify-content-center align-items-center"
							style={{ minHeight: '300px' }}
						>
							<Spinner animation="border" variant="primary" />
						</div>
					) : (
						<Outlet context={{ module, refreshModule: fetchModule, loading }} />
					)}
				</main>
			</div>
		</div>
	);
};

export default LmsEditorLayout;
