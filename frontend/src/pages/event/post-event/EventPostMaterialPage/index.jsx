import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Plus, Users, BarChart2, Download, Video } from 'lucide-react';
import SessionContentCard from './SessionContentCard';
import FormHeading from '@/components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';

// --- Halaman Utama ---
const EventPostMaterialPage = () => {
	const [sessions, setSessions] = useState([
		{
			id: '1',
			title: 'Sesi 1 - UI/UX Basic',
			date: '15 Maret 2026, 09:00 - 12:00',
			speaker: 'Budi Santoso',
			videoType: 'url',
			videoUrl: 'https://youtube.com/watch?v=example',
			materials: [
				{ id: 'm1', name: 'Slide Presentasi.pdf', type: 'PDF', size: '2.5 MB' },
				{ id: 'm2', name: 'Cheat Sheet.pdf', type: 'PDF', size: '1.2 MB' },
			],
			published: true,
			stats: {
				totalAccess: 156,
				completionRate: 68,
				downloadCount: 142,
			},
		},
		{
			id: '2',
			title: 'Sesi 2 - Advanced Prototyping',
			date: '15 Maret 2026, 13:00 - 16:00',
			speaker: 'Sarah Wijaya',
			videoType: 'none',
			materials: [],
			published: false,
			stats: {
				totalAccess: 0,
				completionRate: 0,
				downloadCount: 0,
			},
		},
	]);

	const addSession = () => {
		const newSession = {
			id: Date.now().toString(),
			title: `Sesi ${sessions.length + 1} - Judul Baru`,
			date: 'Belum dijadwalkan',
			speaker: '',
			videoType: 'none',
			materials: [],
			published: false,
			stats: {
				totalAccess: 0,
				completionRate: 0,
				downloadCount: 0,
			},
		};
		setSessions([...sessions, newSession]);
	};

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
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard Icon={Users} label="Total Akses" value={totalAccess} type="green" />
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={BarChart2}
						label="Rata-rata Selesai"
						value={`${avgCompletion}%`}
						type="yellow"
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Download}
						label="Total Unduhan"
						value={totalDownloads}
						type="red"
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
						hasPreviousSession={index > 0}
					/>
				))}
			</div>
		</div>
	);
};

export default EventPostMaterialPage;
