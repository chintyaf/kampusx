import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import {
	Ticket,
	DollarSign,
	UserCheck,
	UserMinus,
	Users,
	Share2,
	ScanLine,
	FileText,
	Send,
	CheckSquare,
} from 'lucide-react';

// API & CSS
import api from '../../../../api/axios';
import '../../../../assets/css/dashboard.css';

// Components
import PageHeader from './PageHeader';
import StatCards from '@/components/dashboard/StatCards';
import EventInfoCard from './EventInfoCard';
import EventTimeline from './EventTimeline';
import MissingInformation from './MissingInformation';
import SessionTable from './SessionTable';
import DemographicsCard from './DemographicsCard';
import TicketDistribution from './TicketDistribution';
import DashboardSkeleton from './DashboardSkeleton';

// Config
import { DASHBOARD_CONFIG } from './config/dashboardStates';

const iconMap = {
	'Tickets Sold': Ticket,
	Revenue: DollarSign,
	'Checked-In': UserCheck,
	Absent: UserMinus,
};

// ==========================================
// Helper Functions (Dipisah agar komponen utama bersih)
// ==========================================

const mapMissingDataToIssues = (missingData = []) => {
	return missingData.map((msg) => {
		let severity = 'HIGH';
		let category = 'System';
		const lowerMsg = msg.toLowerCase();

		if (lowerMsg.match(/pembicara|sesi|jadwal/)) category = 'Sesi / Acara';
		else if (lowerMsg.match(/lokasi|platform|meeting|tempat|alamat/)) category = 'Lokasi';
		else if (lowerMsg.match(/kategori|tipe/)) category = 'Kategori';
		else if (lowerMsg.match(/poster|gambar/)) {
			category = 'Media';
			severity = 'MEDIUM';
		} else if (lowerMsg.match(/deskripsi/)) {
			category = 'Deskripsi';
			severity = 'MEDIUM';
		}

		return { severity, category, message: msg };
	});
};

const handleIssueNavigation = (issue, eventId, navigate) => {
	const msg = issue.message.toLowerCase();
	if (msg.match(/judul|deskripsi|poster|kategori|tipe/)) {
		navigate(`/organizer/${eventId}/event-dashboard/detail/info`);
	} else if (msg.match(/lokasi|platform|meeting|kuota|tempat|provinsi|alamat|maps/)) {
		navigate(`/organizer/${eventId}/event-dashboard/detail/tempat`);
	} else if (msg.match(/jadwal|waktu|sesi|pembicara/)) {
		navigate(`/organizer/${eventId}/event-dashboard/detail/sesi`);
	} else {
		navigate(`/organizer/${eventId}/event-dashboard/detail/info`);
	}
};

// ==========================================
// Main Component
// ==========================================

export default function EventDashboardPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [eventStatus, setEventStatus] = useState('draft');
	const [eventData, setEventData] = useState(null);
	const [issues, setIssues] = useState([]);
	const [speakers, setSpeakers] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch Data
	useEffect(() => {
		if (!eventId) return;

		const fetchOverview = async () => {
			try {
				setLoading(true);
				const [overviewRes, statusRes, speakersRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/events/${eventId}/check-status`),
					api
						.get(`/event-dashboard/${eventId}/info-utama/speaker`)
						.catch(() => ({ data: { success: false, data: [] } })),
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
					setIssues(mapMissingDataToIssues(missing));
				}
			} catch (error) {
				console.error('Gagal mengambil event overview', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOverview();
	}, [eventId]);

	// Loading State
	if (loading || !eventData) {
		return <DashboardSkeleton />;
	}

	// Derived States
	const currentConfig = DASHBOARD_CONFIG[eventStatus] || DASHBOARD_CONFIG.draft;
	const highlightIssues = eventStatus === 'draft' && issues.length > 0;

	const statsData = (eventData.stats || []).map((s) => ({
		...s,
		lucideIcon: iconMap[s.label] || Ticket,
		showProgress: s.label === 'Tickets Sold' && ['published', 'ongoing'].includes(eventStatus),
		totalCapacity: eventData.quota || 0,
	}));

	// ==========================================
	// Sub-Renderers
	// ==========================================

	const renderActionBar = () => {
		if (eventStatus === 'published') {
			return (
				<Button variant="outline-primary" className="d-flex align-items-center gap-2">
					<Share2 size={16} /> Bagikan Event
				</Button>
			);
		}

		if (eventStatus === 'ongoing') {
			return (
				<Button
					variant="primary"
					size="lg"
					className="d-flex align-items-center gap-2 shadow-sm"
				>
					<ScanLine size={20} /> Buka Scanner Absensi
				</Button>
			);
		}

		if (eventStatus === 'completed') {
			return (
				<>
					<Button variant="primary" className="d-flex align-items-center gap-2">
						<Send size={16} /> Kirim Sertifikat
					</Button>
					<Button variant="outline-primary" className="d-flex align-items-center gap-2">
						<CheckSquare size={16} /> Buat Survei
					</Button>
					<Button
						variant="outline-secondary"
						className="d-flex align-items-center gap-2 ms-auto"
					>
						<FileText size={16} /> Download Laporan (PDF)
					</Button>
				</>
			);
		}

		return null;
	};

	// ==========================================
	// Main Render
	// ==========================================

	return (
		<div>
			<PageHeader
				title="Event Dashboard"
				subtitle="Pusat kendali untuk monitoring dan manajemen event"
				status={eventStatus}
				config={currentConfig}
				onBuat={() => navigate('/organizer/buat-acara')}
				onPreview={() => navigate(`/organizer/${eventId}/event-dashboard/preview`)}
			/>

			{/* Action Bar */}
			<div className="d-flex gap-2 mb-4">{renderActionBar()}</div>

			{/* Stat Cards */}
			{currentConfig.showStats && <StatCards stats={statsData} />}

			{/* Event Info */}
			<EventInfoCard
				event={eventData}
				isOngoing={eventStatus === 'ongoing'}
				onEdit={() => navigate(`/organizer/${eventId}/event-dashboard/detail/info`)}
				onFormulir={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
				onExport={() => navigate(`/organizer/${eventId}/event-dashboard/daftar-peserta`)}
				onTiket={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
			/>

			{/* Timeline */}
			<EventTimeline steps={eventData.timeline || []} />

			{/* Readiness + Missing Info */}
			<MissingInformation
				issues={issues}
				onFix={(issue) => handleIssueNavigation(issue, eventId, navigate)}
				highlight={highlightIssues}
			/>

			{/* Sesi & Pembicara */}
			<Row className="g-3 mb-4">
				<Col xs={12} lg={8}>
					<SessionTable
						sessions={eventData.sessions || []}
						eventStatus={eventStatus}
						onAddSession={() =>
							navigate(`/organizer/${eventId}/event-dashboard/detail/sesi`)
						}
					/>
				</Col>
				<Col xs={12} lg={4}>
					{/* Komponen Pembicara diletakkan di sini */}
				</Col>
			</Row>

			{/* Demographics & Ticket Distribution */}
			{currentConfig.showStats && (
				<Row className="g-3">
					<Col xs={12} md={6}>
						<DemographicsCard
							data={eventData.demographics?.data || []}
							totals={eventData.demographics?.totals || []}
							eventStatus={eventStatus}
						/>
					</Col>
					<Col xs={12} md={6}>
						<TicketDistribution tickets={eventData.tickets || []} />
					</Col>
				</Row>
			)}
		</div>
	);
}
