import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus } from 'lucide-react';
import '../../../../assets/css/dashboard.css';

import PageHeader from './PageHeader';
import StatCards from '@/components/dashboard/StatCards';
import EventInfoCard from './EventInfoCard';
import EventTimeline from './EventTimeline';
import MissingInformation from './MissingInformation';
import SessionTable from './SessionTable';
import DemographicsCard from './DemographicsCard';
import TicketDistribution from './TicketDistribution';
import { Skeleton, SkeletonStyles } from '@/components/Skeleton';

/* ─── Page Component ──────────────────────────────────────────────────────── */

const DashboardSkeleton = () => (
	<div className="">
		<SkeletonStyles />
		{/* 1. Header */}
		<Row className="align-items-center mb-4">
			<Col>
				<Skeleton width="220px" height="24px" className="mb-2" />
				<Skeleton width="350px" height="14px" />
			</Col>
		</Row>

		{/* 2. Stat Cards */}
		<Row className="g-3 mb-4">
			{[1, 2, 3, 4].map((i) => (
				<Col key={i} xs={12} sm={6} lg={3}>
					<div className="card" style={{ padding: '16px 18px', minHeight: '110px' }}>
						<div className="d-flex justify-content-between align-items-start mb-3">
							<Skeleton width="90px" height="13px" />
							<Skeleton width="34px" height="34px" borderRadius="8px" />
						</div>
						<Skeleton width="120px" height="24px" className="mb-2" />
						<Skeleton width="70px" height="11px" />
					</div>
				</Col>
			))}
		</Row>

		{/* 3. Event Info Card */}
		<div className="card mb-4" style={{ padding: '20px 24px', minHeight: '180px' }}>
			<Skeleton width="110px" height="16px" className="mb-4" />
			<Row className="g-3 mb-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Col key={i} xs={12} sm={6} lg={4}>
						<Skeleton width="80px" height="10px" className="mb-2" />
						<Skeleton width="150px" height="14px" />
					</Col>
				))}
			</Row>
			<div className="divider" style={{ margin: '16px 0' }} />
			<div className="d-flex gap-2">
				<Skeleton width="100px" height="32px" borderRadius="6px" />
				<Skeleton width="125px" height="32px" borderRadius="6px" />
				<Skeleton width="115px" height="32px" borderRadius="6px" />
				<Skeleton width="105px" height="32px" borderRadius="6px" />
			</div>
		</div>

		{/* 4. Timeline */}
		<div className="card mb-4" style={{ padding: '20px 24px', minHeight: '80px' }}>
			<div className="d-flex justify-content-between">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="d-flex flex-column align-items-center"
						style={{ flex: 1 }}
					>
						<Skeleton width="20px" height="20px" borderRadius="50%" className="mb-2" />
						<Skeleton width="60px" height="12px" className="mb-2" />
						<Skeleton width="40px" height="10px" />
					</div>
				))}
			</div>
		</div>
	</div>
);

const iconMap = {
	'Tickets Sold': Ticket,
	Revenue: DollarSign,
	'Checked-In': UserCheck,
	Absent: UserMinus,
};

export default function EventDashboardPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const [eventStatus, setEventStatus] = useState('draft'); // 'draft', 'published', 'ongoing', 'completed'
	const [eventData, setEventData] = useState(null);
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);

	const handleFix = (issue) => {
		const msg = issue.message.toLowerCase();
		if (
			msg.includes('judul') ||
			msg.includes('deskripsi') ||
			msg.includes('poster') ||
			msg.includes('kategori') ||
			msg.includes('tipe')
		) {
			navigate(`/organizer/${eventId}/event-dashboard/detail/info`);
		} else if (
			msg.includes('lokasi') ||
			msg.includes('platform') ||
			msg.includes('meeting') ||
			msg.includes('kuota') ||
			msg.includes('tempat') ||
			msg.includes('provinsi') ||
			msg.includes('alamat') ||
			msg.includes('maps')
		) {
			navigate(`/organizer/${eventId}/event-dashboard/detail/tempat`);
		} else if (msg.includes('jadwal') || msg.includes('waktu') || msg.includes('sesi')) {
			if (msg.includes('pembicara')) {
				navigate(`/organizer/${eventId}/event-dashboard/detail/pembicara`);
			} else {
				navigate(`/organizer/${eventId}/event-dashboard/detail/sesi`);
			}
		} else {
			navigate(`/organizer/${eventId}/event-dashboard/detail/info`);
		}
	};

	useEffect(() => {
		if (!eventId) return;
		const fetchOverview = async () => {
			try {
				setLoading(true);
				const [overviewRes, statusRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/events/${eventId}/check-status`),
				]);

				if (overviewRes.data?.status === 'success') {
					setEventData(overviewRes.data.data);
					setEventStatus(overviewRes.data.data.status || 'draft');
				}

				if (statusRes.data?.status === 'success') {
					const missing = statusRes.data.data.missing_data || [];
					const mappedIssues = missing.map((msg) => {
						let severity = 'HIGH';
						let category = 'System';

						const lowerMsg = msg.toLowerCase();
						if (
							lowerMsg.includes('pembicara') ||
							lowerMsg.includes('sesi') ||
							lowerMsg.includes('jadwal')
						) {
							category = 'Sesi / Acara';
						} else if (
							lowerMsg.includes('lokasi') ||
							lowerMsg.includes('platform') ||
							lowerMsg.includes('meeting') ||
							lowerMsg.includes('tempat') ||
							lowerMsg.includes('alamat')
						) {
							category = 'Lokasi';
						} else if (lowerMsg.includes('kategori') || lowerMsg.includes('tipe')) {
							category = 'Kategori';
						} else if (lowerMsg.includes('poster') || lowerMsg.includes('gambar')) {
							category = 'Media';
							severity = 'MEDIUM';
						} else if (lowerMsg.includes('deskripsi')) {
							category = 'Deskripsi';
							severity = 'MEDIUM';
						}

						return {
							severity,
							category,
							message: msg,
						};
					});
					setIssues(mappedIssues);
				}
			} catch (error) {
				console.error('Gagal mengambil event overview', error);
			} finally {
				setLoading(false);
			}
		};
		fetchOverview();
	}, [eventId]);

	if (loading || !eventData) {
		return <DashboardSkeleton />;
	}

	const statsData = (eventData.stats || []).map((s) => ({
		...s,
		lucideIcon: iconMap[s.label] || Ticket,
	}));

	return (
		<div className="">
			{/* 1. Header */}
			<PageHeader
				title="Event Dashboard"
				subtitle="Pusat kendali untuk monitoring dan manajemen event"
				status={eventStatus}
				onBuat={() => navigate('/organizer/buat-acara')}
			/>

			{/* 2. Stat Cards */}
			{eventStatus !== 'draft' && <StatCards stats={statsData} />}

			{/* 3. Event Info */}
			<EventInfoCard
				event={eventData}
				onEdit={() => navigate(`/organizer/${eventId}/event-dashboard/detail/info`)}
				onFormulir={() => navigate(`/organizer/${eventId}/event-dashboard/detail/formulir`)}
				onExport={() => navigate(`/organizer/${eventId}/event-dashboard/daftar-peserta`)}
				onTiket={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
			/>

			{/* 4. Timeline */}
			<EventTimeline steps={eventData.timeline || []} />

			{/* 5. Readiness + Missing Info */}
			<MissingInformation issues={issues} onFix={handleFix} />

			{/* 6. Session Table */}
			<SessionTable sessions={eventData.sessions || []} />

			{/* 7. Demographics + Ticket Distribution */}
			<Row className="g-3">
				<Col xs={12} md={6}>
					<DemographicsCard
						data={eventData.demographics?.data || []}
						totals={
							eventData.demographics?.totals || [
								{ label: 'Total Peserta', value: 0 },
								{ label: 'Institusi Asal', value: 0 },
							]
						}
					/>
				</Col>
				<Col xs={12} md={6}>
					<TicketDistribution tickets={eventData.tickets || []} />
				</Col>
			</Row>
		</div>
	);
}
