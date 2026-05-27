import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus, Users } from 'lucide-react';
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
	const [speakers, setSpeakers] = useState([]);
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
				const [overviewRes, statusRes, speakersRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/events/${eventId}/check-status`),
					api.get(`/event-dashboard/${eventId}/info-utama/speaker`).catch(err => {
						console.error('Gagal mengambil data pembicara', err);
						return { data: { success: false, data: [] } };
					}),
				]);

				if (overviewRes.data?.status === 'success') {
					setEventData(overviewRes.data.data);
					setEventStatus(overviewRes.data.data.status || 'draft');
				}

				if (speakersRes.data?.success && speakersRes.data?.data) {
					setSpeakers(speakersRes.data.data);
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
				onPreview={() => navigate(`/organizer/${eventId}/event-dashboard/preview`)}
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

			{/* 6. Sesi & Pembicara */}
			<Row className="g-3 mb-4">
				<Col xs={12} lg={8}>
					<SessionTable
						sessions={eventData.sessions || []}
						eventStatus={eventStatus}
						onAddSession={() => navigate(`/organizer/${eventId}/event-dashboard/detail/sesi`)}
					/>
				</Col>
				<Col xs={12} lg={4}>
					<div className="card h-100" style={{ display: 'flex', flexDirection: 'column' }}>
						<div className="card-title" style={{ borderBottom: '0.5px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
							<Users size={15} color="var(--text-muted)" />
							<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Pembicara & Narasumber</span>
						</div>
						{eventStatus === 'draft' || speakers.length === 0 ? (
							<div style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								flex: 1,
								padding: '24px 16px',
								background: '#fafafa',
								borderRadius: '6px',
								border: '1.5px dashed #cbd5e1',
								textAlign: 'center',
								minHeight: '220px'
							}}>
								<Users size={32} style={{ color: '#94a3b8', marginBottom: 12, opacity: 0.6 }} />
								<span style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
									Belum ada pembicara
								</span>
								<span style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
									Silakan tambah pembicara baru untuk event ini.
								</span>
								<button
									onClick={() => navigate(`/organizer/${eventId}/event-dashboard/detail/pembicara`)}
									style={{
										fontSize: 12,
										fontWeight: 600,
										padding: '8px 16px',
										background: 'white',
										border: '1.5px solid #00699e',
										color: '#00699e',
										borderRadius: '6px',
										cursor: 'pointer',
										transition: 'background 0.15s, color 0.15s',
										fontFamily: 'var(--font)'
									}}
									onMouseEnter={e => {
										e.currentTarget.style.background = '#00699e';
										e.currentTarget.style.color = 'white';
									}}
									onMouseLeave={e => {
										e.currentTarget.style.background = 'white';
										e.currentTarget.style.color = '#00699e';
									}}
								>
									Tambah Pembicara
								</button>
							</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto', maxHeight: '320px', paddingRight: 4 }}>
								{speakers.map((s, idx) => (
									<div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
										{s.image_url ? (
											<img src={s.image_url} alt={s.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
										) : (
											<div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dff3ff', color: '#00699e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
												{s.name ? s.name.charAt(0).toUpperCase() : 'S'}
											</div>
										)}
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{s.name}
											</div>
											<div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{s.role || 'Pembicara'}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</Col>
			</Row>

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
						eventStatus={eventStatus}
					/>
				</Col>
				<Col xs={12} md={6}>
					<TicketDistribution tickets={eventData.tickets || []} />
				</Col>
			</Row>
		</div>
	);
}
