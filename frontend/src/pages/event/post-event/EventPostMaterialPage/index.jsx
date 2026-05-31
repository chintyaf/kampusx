import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { Plus, Users, BarChart2, Download, Video } from 'lucide-react';
import SessionContentCard from './SessionContentCard';
import FormHeading from '@/components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';
import api from '@/api/axios';
import { Skeleton, SkeletonStyles } from '@/components/Skeleton';

// --- Halaman Utama ---
const EventPostMaterialPage = () => {
	const { eventId } = useParams();
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchSessions = async (hideLoading = false) => {
		try {
			if (!hideLoading) setLoading(true);
			const response = await api.get(`event-dashboard/${eventId}/post-event/sessions`);
			if (response.data?.status === 'success') {
				setSessions(response.data.data);
			}
		} catch (error) {
			console.error('Gagal mengambil data sesi:', error);
		} finally {
			if (!hideLoading) setLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) {
			fetchSessions();
		}
	}, [eventId]);

	const updateSession = (id, updates) => {
		setSessions(sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)));
	};

	const deleteSession = (id) => {
		setSessions(sessions.filter((s) => s.id !== id));
	};

	// --- Logika Kalkulasi Statistik ---
	const publishedSessions = sessions.filter((s) => s.published);
	const totalPublished = publishedSessions.length;

	// Total partisipan yang mengakses
	const totalAccess = publishedSessions.reduce(
		(acc, curr) => acc + (curr.stats?.totalAccess || 0),
		0,
	);

	// Total unduhan file materi
	const totalDownloads = publishedSessions.reduce(
		(acc, curr) => acc + (curr.stats?.downloadCount || 0),
		0,
	);

	// Rata-rata tingkat penyelesaian (Completion Rate)
	const avgCompletion =
		totalPublished > 0
			? Math.round(
				publishedSessions.reduce(
					(acc, curr) => acc + (curr.stats?.completionRate || 0),
					0,
				) / totalPublished,
			)
			: 0;

	if (loading) {
		return (
			<div>
				<SkeletonStyles />
				<FormHeading
					title="Manajemen Konten Pasca-Acara"
					description="Atur materi, video replay, dan syarat akses untuk setiap sesi"
					className="mb-4"
				/>

				{/* Stat Cards Skeletons */}
				<div className="row g-3 mb-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="col-md-3 col-sm-6">
							<div
								className="p-3 d-flex align-items-center gap-3 bg-white"
								style={{
									border: '1px solid #e2e8f0',
									borderRadius: '10px',
								}}
							>
								<Skeleton width="40px" height="40px" borderRadius="10px" />
								<div className="flex-grow-1">
									<Skeleton width="60%" height="12px" className="mb-2" />
									<Skeleton width="40%" height="20px" />
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Sessions Skeletons */}
				<div className="d-flex flex-column gap-3">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="p-4 bg-white"
							style={{
								border: '1px solid #e2e8f0',
								borderRadius: '12px',
							}}
						>
							<div className="d-flex justify-content-between align-items-center">
								<div className="d-flex align-items-center gap-3">
									<Skeleton width="32px" height="32px" borderRadius="8px" />
									<div>
										<Skeleton width="200px" height="16px" className="mb-2" />
										<Skeleton width="120px" height="12px" />
									</div>
								</div>
								<Skeleton width="60px" height="24px" borderRadius="12px" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div>
			<FormHeading
				title="Manajemen Konten Pasca-Acara"
				description="Atur materi, video replay, dan syarat akses untuk setiap sesi"
				className="mb-4"
			/>

			{/* --- Bagian Stat Cards --- */}
			<div className="row g-3 mb-4">
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Video}
						label="Sesi Dipublikasikan"
						value={`${totalPublished} / ${sessions.length}`}
						type="blue"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Users}
						label="Total Akses"
						value={totalAccess}
						type="green"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={BarChart2}
						label="Rata-rata Selesai"
						value={`${avgCompletion}%`}
						type="yellow"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Download}
						label="Total Unduhan"
						value={totalDownloads}
						type="red"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
			</div>

			<div className="d-flex flex-column gap-3">
				{sessions.map((session, index) => (
					<SessionContentCard
						key={session.id}
						session={session}
						sessionNumber={index + 1}
						onUpdate={(updates) => updateSession(session.id, updates)}
						onDelete={() => deleteSession(session.id)}
						onRefresh={fetchSessions}
						hasPreviousSession={index > 0}
					/>
				))}
			</div>
		</div>
	);
};

export default EventPostMaterialPage;
