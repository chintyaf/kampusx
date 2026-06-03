import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { notify } from '@/utils/notify';
import { Ticket, DollarSign, UserCheck, UserMinus, Eye, Clock, FileText } from 'lucide-react';

// API & CSS
import api from '@/api/axios';
import '@/assets/css/dashboard.css';
import './EventDashboardPage.css';

// Components
import {
	PageHeader,
	DevToolsBar,
	StatCard,
	MissingInformation,
	EventChecklist,
	SessionTable,
	DashboardSkeleton,
	PublishReadyCard,
	OngoingDashboardCard,
	AttendanceGuideCard,
} from './components';

import { DASHBOARD_CONFIG } from './config/dashboardStates';
import { useLoading } from '@/context/LoadingContext';

import StatusConfirmationModal from '@/components/event/EventStatusDropdown/StatusConfirmationModal';
import MultiSessionAttendanceTool from '@/pages/event/management/EventPosPage/components/MultiSessionAttendanceTool';

const iconMap = {
	'Tickets Sold': Ticket,
	Revenue: DollarSign,
	'Checked-In': UserCheck,
	Absent: UserMinus,
	'Page Views': Eye,
	'Sisa Waktu Registrasi': Clock,
	'Survey Responses': FileText,
};

export default function EventDashboardPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { setIsPageLoading } = useLoading();

	const [eventStatus, setEventStatus] = useState('draft');
	const [eventData, setEventData] = useState(null);
	const [issues, setIssues] = useState([]);
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);

	// Modal States
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [showDevTools, setShowDevTools] = useState(false);

	// Attendance States
	const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
	const [isTogglingAttendance, setIsTogglingAttendance] = useState(false);

	// Keyboard Shortcut for Dev Tools
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
				e.preventDefault();
				setShowDevTools((prev) => !prev);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	// Fetch Data
	useEffect(() => {
		if (!eventId) return;

		const fetchOverview = async () => {
			try {
				setLoading(true);
				setIsPageLoading(true);
				const [overviewRes, statusRes, sessionRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/events/${eventId}/check-status`),
					api
						.get(`/event-dashboard/${eventId}/info-utama/session`)
						.catch(() => ({ data: { success: false, data: [] } })),
				]);

				if (overviewRes.data?.status === 'success') {
					setEventData(overviewRes.data.data);
					setEventStatus(overviewRes.data.data.status || 'draft');
					setIsAttendanceOpen(!!overviewRes.data.data.is_attendance_open);
				}

				if (statusRes.data?.status === 'success') {
					setIssues(statusRes.data.data.missing_data || []);
				}

				if (sessionRes.data?.status === 'success' && sessionRes.data?.data) {
					setSessions(sessionRes.data.data);
				}
			} catch (error) {
				console.error('Gagal mengambil event overview', error);
			} finally {
				setLoading(false);
				setIsPageLoading(false);
			}
		};

		fetchOverview();
	}, [eventId, setIsPageLoading]);

	const handleShare = () => {
		const shareUrl = `${window.location.origin}/events/${eventData.slug}`;
		navigator.clipboard
			.writeText(shareUrl)
			.then(() =>
				notify('success', 'Tautan Disalin', 'Link event telah disalin ke clipboard!'),
			)
			.catch(() => notify('error', 'Gagal', 'Gagal menyalin link event.'));
	};

	const handleToggleAttendance = async () => {
		try {
			setIsTogglingAttendance(true);
			const res = await api.patch(`/event-dashboard/${eventId}/toggle-attendance`);
			if (res.data?.success) {
				setIsAttendanceOpen(res.data.is_attendance_open);
				notify(
					'success',
					'Status Presensi Diperbarui',
					res.data.is_attendance_open
						? 'Presensi sekarang dibuka untuk peserta.'
						: 'Presensi sekarang ditutup.',
				);
			}
		} catch (error) {
			console.error('Failed to toggle attendance:', error);
			notify('error', 'Gagal', 'Gagal mengubah status presensi.');
		} finally {
			setIsTogglingAttendance(false);
		}
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

	return (
		<div>
			{/* Action Bar (Dev Tools) */}
			{showDevTools && <DevToolsBar eventId={eventId} setEventStatus={setEventStatus} />}

			<PageHeader
				title={eventData.name || 'Event Dashboard'}
				status={eventStatus}
				startDate={eventData.startDate}
				endDate={eventData.endDate}
				location={eventData.location}
				categories={eventData.categories || []}
				isPublishDisabled={isDraft && issues.length > 0}
				posPin={eventData.pos_pin}
				isAttendanceOpen={isAttendanceOpen}
				isTogglingAttendance={isTogglingAttendance}
				onToggleAttendance={handleToggleAttendance}
				onPreview={() =>
					window.open(`/organizer/${eventId}/event-dashboard/preview`, '_blank')
				}
				onPublish={() => setShowPublishModal(true)}
				onShare={handleShare}
				onEdit={() => navigate(`/organizer/${eventId}/event-dashboard/info`)}
				onKelolaTiket={() => navigate(`/organizer/${eventId}/event-dashboard/tiket`)}
				onScanner={() => navigate(`/organizer/${eventId}/event-dashboard/scanner`)}
				onFormulir={() => navigate(`/organizer/${eventId}/event-dashboard/tiket`)}
			/>


			{/* Stat Cards */}
			{currentConfig.showStats && (
				<Row className="g-3 mb-4">
					{statsData.map((stat, idx) => {
						const IconComponent = stat.lucideIcon || Ticket;
						return (
							<Col xs={12} sm={6} lg={statsData.length === 4 ? 3 : 4} key={idx}>
								<StatCard
									label={stat.label}
									value={stat.value}
									sub={stat.sub}
									progress={stat.progress}
									iconBg={stat.iconBg}
									iconColor={stat.iconColor}
									lucideIcon={IconComponent}
									progressColor={stat.progressColor}
								/>
							</Col>
						);
					})}
				</Row>
			)}

			{/* Ongoing Dashboard Card */}
			{eventStatus === 'ongoing' && (
				<OngoingDashboardCard eventData={eventData} sessions={sessions} />
			)}

			{/* Event Checklist Widget */}
			{isDraft ? (
				issues.length > 0 ? (
					<MissingInformation
						issues={issues}
						eventId={eventId}
						highlight={highlightIssues}
					/>
				) : (
					<PublishReadyCard />
				)
			) : (
				eventStatus === 'published' && (
					<EventChecklist
						checklist={eventData.preparation_checklist || []}
						eventId={eventId}
					/>
				)
			)}

			{/* Sisa Tiket per Tipe (Jika lebih dari 1 tipe tiket) */}
			{eventData.tickets && eventData.tickets.length > 1 && (
				<Card className="border shadow-none rounded-4 mb-4">
					<Card.Body className="p-4">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<h5 className="mb-1 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>
									Status Penjualan & Sisa Tiket
								</h5>
								<p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
									Pantau kuota dan sisa tiket aktif berdasarkan tipenya.
								</p>
							</div>
							<Badge bg="light" className="text-dark border px-2.5 py-1 text-xs font-semibold rounded-pill">
								{eventData.tickets.length} Tipe Tiket
							</Badge>
						</div>
						<Row className="g-3">
							{eventData.tickets.map((t, idx) => {
								const cap = parseInt(t.capacity) || 0;
								const sold = parseInt(t.count) || 0;
								const sisa = t.capacity === null ? '∞ (Tak Terbatas)' : Math.max(0, cap - sold);
								const pct = t.capacity === null || cap === 0 ? 0 : Math.round((sold / cap) * 100);

								return (
									<Col xs={12} md={6} key={idx}>
										<div className="p-3 border rounded-3 bg-light">
											<div className="d-flex justify-content-between align-items-center mb-1">
												<span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
													{t.label}
												</span>
												<Badge bg={t.is_free ? "success" : "primary"} className="px-2 py-1 rounded">
													{t.is_free ? 'Gratis' : `Rp ${parseInt(t.price).toLocaleString('id-ID')}`}
												</Badge>
											</div>
											<div className="mt-2">
												<div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.78rem' }}>
													<span>Terjual: {sold} {t.capacity !== null && `/ ${cap}`}</span>
													<span>Sisa: <strong>{sisa}</strong></span>
												</div>
												{t.capacity !== null && (
													<ProgressBar
														now={pct}
														style={{ height: '5px' }}
														variant={idx % 2 === 0 ? 'primary' : 'info'}
													/>
												)}
											</div>
										</div>
									</Col>
								);
							})}
						</Row>
					</Card.Body>
				</Card>
			)}

			{/* Kelola Link Presensi Online */}
			{['published', 'ongoing', 'paused', 'post_event'].includes(eventStatus) &&
				['online', 'hybrid'].includes(eventData.location_type || 'offline') && (
					<div className="mb-4">
						<MultiSessionAttendanceTool />
					</div>
				)}

			{/* Sesi & Pembicara */}
			<Row className="g-3 mb-4">
				<Col xs={12} lg={12}>
					<SessionTable
						sessions={sessions}
						eventStatus={eventStatus}
						onAddSession={() => navigate(`/organizer/${eventId}/event-dashboard/sesi`)}
					/>
				</Col>
			</Row>

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
		</div>
	);
}
