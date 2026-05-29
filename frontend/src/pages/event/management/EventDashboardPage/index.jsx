import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { notify } from '@/utils/notify';
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
import StatCards from './StatCards';
import EventInfoCard from './EventInfoCard';
import EventTimeline from './EventTimeline';
import MissingInformation from './MissingInformation';
import EventChecklist from './EventChecklist';
import SessionTable from './SessionTable';
import DemographicsCard from './DemographicsCard';
import TicketDistribution from './TicketDistribution';
import DashboardSkeleton from './DashboardSkeleton';

// Config
import { DASHBOARD_CONFIG } from './config/dashboardStates';
import StatusConfirmationModal from '../../../../components/event/EventStatusDropdown/StatusConfirmationModal';

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
		const severity = 'HIGH';
		let category = 'System';
		const lowerMsg = msg.toLowerCase();

		if (lowerMsg.match(/pembicara|sesi|jadwal/)) category = 'Sesi / Acara';
		else if (lowerMsg.match(/lokasi|platform|meeting|tempat|alamat/)) category = 'Lokasi';
		else if (lowerMsg.match(/kategori|tipe/)) category = 'Kategori';
		else if (lowerMsg.match(/poster|gambar/)) {
			category = 'Media';
		} else if (lowerMsg.match(/deskripsi/)) {
			category = 'Deskripsi';
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
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showDraftModal, setShowDraftModal] = useState(false);
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showOngoingModal, setShowOngoingModal] = useState(false);
	const [showPostEventModal, setShowPostEventModal] = useState(false);
	const [showCompletedModal, setShowCompletedModal] = useState(false);

	// Fetch Data
	useEffect(() => {
		if (!eventId) return;

		const fetchOverview = async () => {
			try {
				setLoading(true);
				const [overviewRes, statusRes, speakersRes, sessionRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/events/${eventId}/check-status`),
					api
						.get(`/event-dashboard/${eventId}/info-utama/speaker`)
						.catch(() => ({ data: { success: false, data: [] } })),
					api
						.get(`/event-dashboard/${eventId}/info-utama/session`)
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

				// Flatten and format sessions
				let fetchedSessions = [];
				if (sessionRes.data?.status === 'success' && sessionRes.data?.data) {
					const groupedDaysArray = Object.values(sessionRes.data.data);
					groupedDaysArray.forEach((day, index) => {
						const dayNumber = day.day_number || index + 1;
						if (day.sessions && Array.isArray(day.sessions)) {
							day.sessions.forEach((s) => {
								const speakerNames =
									s.speakers && s.speakers.length > 0
										? s.speakers.map((spk) => spk.name).join(', ')
										: null;

								const prerequisiteTitles = [];
								if (
									s.prerequisite_session_ids &&
									Array.isArray(s.prerequisite_session_ids)
								) {
									s.prerequisite_session_ids.forEach((prereqId) => {
										let found = null;
										groupedDaysArray.forEach((d) => {
											if (d.sessions) {
												const f = d.sessions.find(
													(x) => String(x.id) === String(prereqId),
												);
												if (f) found = f.title || f.name;
											}
										});
										if (found) prerequisiteTitles.push(found);
									});
								}

								fetchedSessions.push({
									id: s.id,
									title: s.title || s.name,
									day: dayNumber,
									time:
										s.start_time && s.end_time
											? `${s.start_time} - ${s.end_time}`
											: s.startTime && s.endTime
												? `${s.startTime} - ${s.endTime}`
												: '',
									speaker: speakerNames,
									materialStatus:
										s.material_status || s.materialStatus || 'not_required',
									prerequisite:
										prerequisiteTitles.length > 0
											? prerequisiteTitles.join(', ')
											: null,
								});
							});
						}
					});
				}
				setSessions(fetchedSessions);
			} catch (error) {
				console.error('Gagal mengambil event overview', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOverview();
	}, [eventId]);

	const handleSendCertificates = () => {
		notify(
			'success',
			'Berhasil',
			"Sertifikat berhasil didistribusikan! Peserta dapat mengakses dan mengklaim sertifikat pada tab 'Pusat Sertifikat' di akun mereka.",
		);
	};

	const handleShare = () => {
		const shareUrl = `${window.location.origin}/events/${eventData.slug}`;
		navigator.clipboard
			.writeText(shareUrl)
			.then(() =>
				notify('success', 'Tautan Disalin', 'Link event telah disalin ke clipboard!'),
			)
			.catch(() => notify('error', 'Gagal', 'Gagal menyalin link event.'));
	};

	// Loading State
	if (loading || !eventData) {
		return <DashboardSkeleton />;
	}

	// Derived States
	const currentConfig = DASHBOARD_CONFIG[eventStatus] || DASHBOARD_CONFIG.draft;
	const highlightIssues = eventStatus === 'draft' && issues.length > 0;
	const isDraft = eventStatus === 'draft';

	const statsData = (eventData.stats || []).map((s) => ({
		...s,
		lucideIcon: iconMap[s.label] || Ticket,
		showProgress: s.label === 'Tickets Sold' && ['published', 'ongoing'].includes(eventStatus),
		totalCapacity: eventData.quota || 0,
	}));

	// ==========================================
	// Context Banner — status-aware guide
	// ==========================================

	const CONTEXT_BANNERS = {
		draft:
			issues.length > 0
				? {
						bg: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)',
						border: '#fde68a',
						icon: '📋',
						title: `${issues.length} item perlu dilengkapi sebelum publish`,
						desc: 'Selesaikan semua item penting di bawah agar peserta dapat mendaftar ke event Anda.',
						showPublishBtn: false,
					}
				: {
						bg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
						border: '#86efac',
						icon: '✅',
						title: 'Semua data sudah lengkap!',
						desc: 'Event siap dipublikasikan. Klik tombol di samping untuk mulai menerima peserta.',
						showPublishBtn: true,
					},
		published: {
			bg: 'linear-gradient(135deg, #eff8ff 0%, #dbeafe 100%)',
			border: '#93c5fd',
			icon: '🚀',
			title: 'Event sedang aktif & terlihat publik',
			desc: 'Bagikan link event untuk menjangkau lebih banyak peserta. Pantau penjualan tiket di bawah.',
			showPublishBtn: false,
		},
		ongoing: {
			bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
			border: '#6ee7b7',
			icon: '⚡',
			title: 'Event sedang berlangsung!',
			desc: 'Gunakan scanner absensi untuk check-in peserta. Pantau data kehadiran secara real-time.',
			showPublishBtn: false,
		},
		post_event: {
			bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
			border: '#ddd6fe',
			icon: '📝',
			title: 'Event masuk tahap setelah acara',
			desc: 'Kelola hal-hal pasca-event seperti materi tambahan atau sertifikat.',
			showPublishBtn: false,
		},
		completed: {
			bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
			border: '#cbd5e1',
			icon: '🎉',
			title: 'Event telah selesai',
			desc: 'Terima kasih! Kirim sertifikat, buat survei kepuasan, atau download laporan lengkap event.',
			showPublishBtn: false,
		},
	};

	const banner = CONTEXT_BANNERS[eventStatus];

	// ==========================================
	// Action Bar
	// ==========================================

	const renderActionBar = () => {
		const btnBase = {
			display: 'inline-flex',
			alignItems: 'center',
			gap: 7,
			fontSize: 13,
			fontWeight: 600,
			padding: '9px 18px',
			borderRadius: 9,
			cursor: 'pointer',
			border: '1.5px solid',
			transition: 'all 0.15s',
			fontFamily: 'var(--font)',
		};
		const primaryBtn = {
			...btnBase,
			background: 'var(--primary)',
			color: 'white',
			borderColor: 'var(--primary)',
		};
		const outlineBtn = {
			...btnBase,
			background: 'white',
			color: 'var(--primary)',
			borderColor: 'var(--primary)',
		};
		const neutralBtn = {
			...btnBase,
			background: 'white',
			color: '#475569',
			borderColor: '#cbd5e1',
		};

		const devActionBar = (
			<div
				style={{
					marginTop: 15,
					padding: '10px 15px',
					background: '#f8fafc',
					border: '1px dashed #cbd5e1',
					borderRadius: 8,
					marginBottom: 20,
				}}
			>
				<div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
					DEV TOOLS: Ubah Status Event (Bypass)
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<button
						style={{ ...outlineBtn, padding: '6px 12px', fontSize: 12 }}
						onClick={() => setShowDraftModal(true)}
					>
						Set Draft
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#0f766e',
							borderColor: '#0f766e',
						}}
						onClick={() => setShowPublishModal(true)}
					>
						Set Publish
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#0284c7',
							borderColor: '#0ea5e9',
						}}
						onClick={() => setShowOngoingModal(true)}
					>
						Set On Going
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#7c3aed',
							borderColor: '#c4b5fd',
						}}
						onClick={() => setShowPostEventModal(true)}
					>
						Set Setelah Acara
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#16a34a',
							borderColor: '#86efac',
						}}
						onClick={() => setShowCompletedModal(true)}
					>
						Set Selesai
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#dc2626',
							borderColor: '#fca5a5',
						}}
						onClick={() => setShowCancelModal(true)}
					>
						Set Cancelled
					</button>
				</div>
			</div>
		);

		return <>{devActionBar}</>;
	};

	// ==========================================
	// Main Render
	// ==========================================

	return (
		<div>
			{/* Action Bar */}
			{renderActionBar()}

			<PageHeader
				title={eventData.name || 'Event Dashboard'}
				status={eventStatus}
				startDate={eventData.startDate}
				endDate={eventData.endDate}
				location={eventData.location}
				categories={eventData.categories || []}
				isPublishDisabled={isDraft && issues.length > 0}
				onPreview={() =>
					window.open(`/organizer/${eventId}/event-dashboard/preview`, '_blank')
				}
				onPublish={() => setShowPublishModal(true)}
				onShare={handleShare}
				onEdit={() => navigate(`/organizer/${eventId}/event-dashboard/detail/info`)}
				onKelolaTiket={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
				onScanner={() => navigate(`/organizer/${eventId}/event-dashboard/scanner`)}
				onFormulir={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
			/>

			{/* Stat Cards */}
			{currentConfig.showStats && <StatCards stats={statsData} />}

			{/* Event Info (Hidden in Draft Phase) */}
			{/* {!isDraft && (
				<EventInfoCard
					event={eventData}
					isOngoing={eventStatus === 'ongoing'}
					onEdit={() => navigate(`/organizer/${eventId}/event-dashboard/detail/info`)}
					onFormulir={() =>
						navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)
					}
					onExport={() =>
						navigate(`/organizer/${eventId}/event-dashboard/daftar-peserta`)
					}
					onTiket={() => navigate(`/organizer/${eventId}/event-dashboard/detail/tiket`)}
				/>
			)} */}

			{/* Timeline (Hidden in Draft Phase) */}
			{!isDraft && <EventTimeline steps={eventData.timeline || []} />}

			{/* Event Checklist Widget for Draft / Missing Info for non-Draft */}
			{isDraft && (
				<MissingInformation
					issues={issues}
					onFix={(issue) => handleIssueNavigation(issue, eventId, navigate)}
					highlight={highlightIssues}
				/>
			)}

			{/* Sesi & Pembicara */}
			<Row className="g-3 mb-4">
				<Col xs={12} lg={12}>
					<SessionTable
						sessions={sessions}
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
			{/* {currentConfig.showStats && (
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
			)} */}

			{/* Draft Modal */}
			<StatusConfirmationModal
				eventId={eventId}
				show={showDraftModal}
				onHide={() => setShowDraftModal(false)}
				pendingStatus="draft"
				onConfirm={() => {
					setEventStatus('draft');
					setShowDraftModal(false);
				}}
			/>

			{/* Publish Modal */}
			<StatusConfirmationModal
				eventId={eventId}
				show={showPublishModal}
				onHide={() => setShowPublishModal(false)}
				pendingStatus="published"
				onConfirm={() => {
					setEventStatus('published');
					setShowPublishModal(false);
				}}
			/>

			{/* Cancel Modal */}
			<StatusConfirmationModal
				eventId={eventId}
				show={showCancelModal}
				onHide={() => setShowCancelModal(false)}
				pendingStatus="cancelled"
				onConfirm={() => {
					setEventStatus('cancelled');
					setShowCancelModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showOngoingModal}
				onHide={() => setShowOngoingModal(false)}
				pendingStatus="ongoing"
				onConfirm={() => {
					setEventStatus('ongoing');
					setShowOngoingModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showPostEventModal}
				onHide={() => setShowPostEventModal(false)}
				pendingStatus="post_event"
				onConfirm={() => {
					setEventStatus('post_event');
					setShowPostEventModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showCompletedModal}
				onHide={() => setShowCompletedModal(false)}
				pendingStatus="completed"
				onConfirm={() => {
					setEventStatus('completed');
					setShowCompletedModal(false);
				}}
			/>
		</div>
	);
}
