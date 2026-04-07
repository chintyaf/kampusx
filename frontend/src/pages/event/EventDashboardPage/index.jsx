import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus } from 'lucide-react';
import '../../../assets/css/dashboard.css';

import PageHeader from './PageHeader';
import StatCards from './StatCards';
import EventInfoCard from './EventInfoCard';
import EventTimeline from './EventTimeline';
import ReadinessStatus from './ReadinessStatus';
import MissingInformation from './MissingInformation';
import SessionTable from './SessionTable';
import DemographicsCard from './DemographicsCard';
import TicketDistribution from './TicketDistribution';

/* ─── Sample data (replace with API calls / props) ─────────────────────────── */

const EVENT = {
	name: 'Webinar Tech Summit 2025',
	startDate: '20 Juli 2025, 09:00',
	endDate: '21 Juli 2025, 17:00',
	location: 'Online (Zoom)',
	organizer: 'Himpunan Informatika ITB',
	categories: ['Technology', 'Education'],
	institution: 'Institut Teknologi Bandung',
};

const STATS = [
	{
		label: 'Tickets Sold',
		value: '450 / 500',
		sub: '90% kapasitas terisi',
		progress: 90,
		iconBg: '#dff3ff',
		iconColor: '#00699e',
		lucideIcon: Ticket,
		progressColor: 'var(--primary)',
	},
	{
		label: 'Revenue',
		value: 'Rp 22,5jt',
		sub: '@ Rp 50.000 / tiket',
		iconBg: '#dcfce7',
		iconColor: '#166534',
		lucideIcon: DollarSign,
	},
	{
		label: 'Checked-In',
		value: '0',
		sub: 'Belum dimulai',
		iconBg: '#f3e8ff',
		iconColor: '#7c3aed',
		lucideIcon: UserCheck,
	},
	{
		label: 'Absent',
		value: '0',
		sub: '0% dari pendaftar',
		iconBg: '#fef3c7',
		iconColor: '#92400e',
		lucideIcon: UserMinus,
	},
];

const TIMELINE = [
	{ label: 'Draft', date: 'Dibuat', status: 'done' },
	{ label: 'Published', date: '1 Jun 2025', status: 'done' },
	{ label: 'Registrasi', date: 'Berlangsung', status: 'active' },
	{ label: 'Hari-H', date: '20 Jul 2025', status: 'pending' },
	{ label: 'Selesai', date: '21 Jul 2025', status: 'pending' },
];

const SESSIONS = [
	{
		title: 'Logic 101',
		day: 1,
		time: '09:00',
		speaker: 'Budi Santoso',
		materialStatus: 'uploaded',
		prerequisite: null,
	},
	{
		title: 'Introduction to Web Dev',
		day: 1,
		time: '11:00',
		speaker: 'Dewi Lestari',
		materialStatus: 'uploaded',
		prerequisite: 'Logic 101',
	},
	{
		title: 'Advanced OOP',
		day: 1,
		time: '13:00',
		speaker: 'Siti Aminah',
		materialStatus: 'pending',
		prerequisite: 'Logic 101',
	},
	{
		title: 'Database Design',
		day: 2,
		time: '15:00',
		speaker: 'Ahmad Rizki',
		materialStatus: 'uploaded',
		prerequisite: null,
	},
	{
		title: 'Q&A Session',
		day: 2,
		time: '17:00',
		speaker: null,
		materialStatus: 'not_required',
		prerequisite: null,
	},
];

const ISSUES = [
	{ severity: 'HIGH', category: 'Media', message: 'Poster belum di-upload' },
	{
		severity: 'HIGH',
		category: 'Sessions',
		message: "Sesi Day 2 – 'Q&A' belum memiliki pembicara",
	},
	{
		severity: 'HIGH',
		category: 'Technical',
		message: 'Link Zoom/Streaming untuk Day 1 belum di-generate',
	},
	{
		severity: 'HIGH',
		category: 'Registration',
		message: "Custom Checkout: Pertanyaan 'NIM' belum diatur",
	},
	{ severity: 'MEDIUM', category: 'Content', message: 'Speaker Bio untuk Pak Jaka masih kosong' },
];

const DEMOGRAPHICS = [
	{ label: 'Informatika', pct: 60, color: '#00699e' },
	{ label: 'Sistem Informasi', pct: 20, color: '#3c84a8' },
	{ label: 'Teknik Komputer', pct: 10, color: '#7bd6fe' },
	{ label: 'Data Science', pct: 7, color: '#b9e7fe' },
	{ label: 'Teknik Elektro', pct: 3, color: '#cde8f5' },
];

const TICKETS = [
	{ label: 'Early Bird', count: 149, color: '#3c84a8' },
	{ label: 'Regular', count: 225, color: '#22c55e' },
	{ label: 'VIP', count: 76, color: '#f59e0b' },
];

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function EventDashboardPage() {
	const handleUpload = () => alert('Upload poster');
	const handleFix = issue => alert(`Perbaiki: ${issue.message}`);
	const [eventStatus, setEventStatus] = useState('draft'); // 'draft', 'published', 'ongoing', 'completed'
	return (
		<div className="">
			{/* 1. Header */}
			<PageHeader
				title="Event Dashboard"
				subtitle="Pusat kendali untuk monitoring dan manajemen event"
				status={eventStatus}
				onBuat={() => alert('Buat Event')}
			/>

			{/* 2. Stat Cards */}
			{eventStatus !== 'draft' && <StatCards stats={STATS} />}

			{/* 3. Event Info */}
			<EventInfoCard
				event={EVENT}
				onEdit={() => alert('Edit')}
				onFormulir={() => alert('Formulir')}
				onExport={() => alert('Export')}
				onTiket={() => alert('Tiket')}
			/>

			{/* 4. Timeline */}
			<EventTimeline steps={TIMELINE} />

			{/* 5. Readiness + Missing Info */}
			<MissingInformation issues={ISSUES} onFix={handleFix} />

			{/* 6. Session Table */}
			<SessionTable sessions={SESSIONS} />

			{/* 7. Demographics + Ticket Distribution */}
			<Row className="g-3">
				<Col xs={12} md={6}>
					<DemographicsCard
						data={DEMOGRAPHICS}
						totals={[
							{ label: 'Total Peserta', value: 450 },
							{ label: 'Jurusan Unik', value: 5 },
						]}
					/>
				</Col>
				<Col xs={12} md={6}>
					<TicketDistribution tickets={TICKETS} />
				</Col>
			</Row>
		</div>
	);
}
