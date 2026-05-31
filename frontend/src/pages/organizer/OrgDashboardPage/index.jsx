import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import StatCards from '@/components/dashboard/StatCards';
import {
	Search,
	Plus,
	Calendar,
	Users,
	LayoutDashboard,
	Image as ImageIcon,
	Activity,
	Clock,
	Lock,
	TrendingUp,
	Wallet,
	Award,
	Mic2,
	ShieldAlert,
	Settings,
	FileText,
	ChevronRight,
	Bell,
	Zap,
} from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import { getEventImageUrl } from '@/utils/eventUtils';

import './org-dashboard.css';

const colors = {
	green: 'var(--success-text)',
	greenLight: 'var(--success-bg)',
	accent: 'var(--color-primary)',
	amber: 'var(--warning-text)',
	amberLight: 'var(--warning-bg)',
	red: 'var(--danger-text)',
	redLight: 'var(--danger-bg)',
	purple: 'var(--purple-text)',
	purpleLight: 'var(--purple-bg)',
	ongoing: 'var(--bahama-blue-600)',
	ongoingBg: 'var(--bahama-blue-50)',
	draft: 'var(--warning-text)',
	draftBg: 'var(--warning-bg)',
	completed: 'var(--color-text)',
	completedBg: 'var(--color-bg)',
};

const statusConfig = {
	draft: { bg: colors.draftBg, text: colors.draft, label: 'Draft' },
	published: { bg: colors.greenLight, text: colors.green, label: 'Published' },
	ongoing: { bg: colors.ongoingBg, text: colors.ongoing, label: 'Ongoing' },
	completed: { bg: colors.completedBg, text: colors.completed, label: 'Selesai' },
};

const formatDate = (dateString) => {
	if (!dateString) return '-';
	const date = new Date(dateString);
	return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
	<button
		onClick={onClick}
		className={`org-nav-item d-flex align-items-center gap-2 w-100 border-0 text-start py-2 px-3 fs-4 ${active ? 'active' : ''
			}`}
	>
		<Icon size={16} strokeWidth={1.75} />
		{label}
	</button>
);

const StatusBadge = ({ status }) => {
	const label = statusConfig[status]?.label || 'Draft';
	return (
		<span className={`org-status-badge py-1 px-2 fw-semibold text-nowrap status-${status}`}>
			{label.toUpperCase()}
		</span>
	);
};

export default function OrgDashboardPage() {
	const navigate = useNavigate();
	const [activeNav, setActiveNav] = useState('overview');
	const [activeTab, setActiveTab] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const { isPageLoading, setIsPageLoading } = useLoading();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setLoading(true);
				const response = await api.get('/organizer/events-list');
				if (response.data && response.data.status === 'success') {
					setEvents(response.data.data);
				} else {
					setEvents([]);
				}
			} catch (err) {
				console.error('Error fetching organizer events:', err);
				setError('Gagal memuat data event. Silakan coba beberapa saat lagi.');
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	const formatRupiah = (number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(number);
	};

	const activeEventsCount = events.filter(
		(e) => e.status === 'published' || e.status === 'ongoing',
	).length;
	const draftEventsCount = events.filter((e) => e.status === 'draft').length;
	const totalAttendeesCount = events.reduce((sum, e) => sum + (parseInt(e.attendees) || 0), 0);
	const totalCheckIns = events.reduce((sum, e) => sum + (parseInt(e.check_ins) || 0), 0);
	const checkInRate = totalAttendeesCount > 0 ? Math.round((totalCheckIns / totalAttendeesCount) * 100) : 0;

	const totalCapacity = events.reduce((sum, e) => sum + (parseInt(e.capacity) || 200), 0);
	const remainingCapacity = totalCapacity - totalAttendeesCount;

	const needsActionCount = events.filter((e) => e.status === 'draft' || e.needsAttention).length;

	const filteredByTab = events.filter(e => {
		if (activeTab === 'all') return true;
		if (activeTab === 'upcoming') return e.status === 'published';
		return e.status === activeTab;
	});

	const filtered = filteredByTab.filter((e) =>
		e.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const heroEvent = events.find(e => e.status === 'ongoing') || events.find(e => e.status === 'published') || (events.length > 0 ? events[0] : null);

	const statsData = [
		{
			label: 'Event Aktif',
			value: `${activeEventsCount}`,
			sub: 'Sedang berjalan & mendatang',
			lucideIcon: Activity,
			iconBg: '#dcfce7',
			iconColor: '#166534',
		},
		{
			label: 'Total Peserta',
			value: totalAttendeesCount.toLocaleString('id-ID'),
			sub: `Sisa ${remainingCapacity > 0 ? remainingCapacity.toLocaleString('id-ID') : 0} kapasitas`,
			lucideIcon: Users,
			iconBg: '#dff3ff',
			iconColor: '#00699e',
		},
		{
			label: 'Tingkat Kehadiran',
			value: `${checkInRate}%`,
			sub: `Rata-rata check-in`,
			lucideIcon: Mic2,
			iconBg: '#fef3c7',
			iconColor: '#92400e',
		},
		{
			label: 'Perlu Tindakan',
			value: `${needsActionCount}`,
			sub: `${draftEventsCount} Draft menunggu rilis`,
			lucideIcon: ShieldAlert,
			iconBg: '#fee2e2',
			iconColor: '#991b1b',
		},
	];

	return (
		<>
			{/* Main */}
			<div className="flex-grow-1 d-flex flex-column min-w-0">
				<div>
					{/* Metrics */}
					<StatCards stats={statsData} />

					{/* Hero Card Highlight */}
					{heroEvent && (
						<div className="org-hero-card mb-4 border rounded-3 p-4 d-flex gap-4 align-items-center bg-white shadow-sm">
							<div className="hero-banner flex-shrink-0 rounded-3 overflow-hidden border" style={{ width: '35%', aspectRatio: '16/9' }}>
								{heroEvent.image_path ? (
									<img
										src={getEventImageUrl(heroEvent)}
										alt={heroEvent.title}
										className="w-100 h-100 object-fit-cover"
									/>
								) : (
									<div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--color-bg)' }}>
										<ImageIcon size={32} color="var(--color-secondary)" />
									</div>
								)}
							</div>
							<div className="hero-content flex-grow-1">
								<div className="d-flex align-items-center gap-2 mb-2">
									<StatusBadge status={heroEvent.status} />
									<span className="text-muted fw-medium fs-5">
										{heroEvent.status === 'ongoing' ? '📍 Sedang Berlangsung' : 
										 heroEvent.status === 'published' ? '⏳ Mendatang Terdekat' : 
										 '✨ Highlight Acara'}
									</span>
								</div>
								<h2 className="fs-1 fw-bold mb-3">{heroEvent.title}</h2>
								<div className="d-flex align-items-center gap-4 mb-4 fs-4 text-muted">
									<span className="d-flex align-items-center gap-2">
										<Calendar size={18} /> {formatDate(heroEvent.start_date)}
									</span>
									<span className="d-flex align-items-center gap-2">
										<Users size={18} /> {(heroEvent.attendees || 0).toLocaleString('id-ID')} Terdaftar
									</span>
								</div>
								<div className="d-flex gap-3">
									<button
										onClick={() => navigate(`/organizer/${heroEvent.id}/event-dashboard`)}
										className="btn btn-dark px-4 py-2 fw-medium fs-4 rounded-2"
									>
										Kelola Event
									</button>
									<button
										onClick={() => navigate(`/organizer/${heroEvent.id}/event-pos`)}
										className="btn btn-outline-dark px-4 py-2 fw-medium fs-4 rounded-2"
									>
										Buka Scanner
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Body */}
					<div className="d-flex gap-4 align-items-start">
						{/* Events */}
						<div className="org-content-container flex-grow-1 border p-4 min-w-0">
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h2 className="org-section-title fs-2 fw-bold m-0">
									Manajemen Event
								</h2>
								<div className="d-flex align-items-center gap-3">
									<div className="position-relative d-flex align-items-center">
										<Search
											size={13}
											color="var(--color-secondary)"
											className="position-absolute org-search-icon"
										/>
										<input
											placeholder="Cari event..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="org-search-input border rounded-2 py-2 pe-2 fs-4"
										/>
									</div>
									<button
										onClick={() => navigate('/organizer/create-event')}
										className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 fw-medium fs-4 rounded-2 text-nowrap"
									>
										<Plus size={16} /> Buat Event
									</button>
								</div>
							</div>

							{/* Tabs */}
							<div className="d-flex gap-2 mb-4 border-bottom pb-3">
								{['all', 'upcoming', 'ongoing', 'completed', 'draft'].map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`btn fw-medium px-4 py-2 fs-5 rounded-pill ${activeTab === tab ? 'btn-dark' : 'btn-light text-muted border-0'}`}
									>
										{tab === 'all' && 'Semua'}
										{tab === 'upcoming' && 'Mendatang'}
										{tab === 'ongoing' && 'Sedang Berjalan'}
										{tab === 'completed' && 'Selesai'}
										{tab === 'draft' && 'Draft'}
									</button>
								))}
							</div>

							<div className="d-flex flex-column gap-3">
								{loading ? (
									<div className="org-state-text-muted py-5 text-center fs-3">
										Memuat data event...
									</div>
								) : error ? (
									<div className="org-state-text-danger py-5 text-center fs-3">
										{error}
									</div>
								) : filtered.length === 0 ? (
									<div className="org-state-text-muted py-5 text-center fs-3">
										Tidak ada event ditemukan.
									</div>
								) : (
									filtered.map((event) => {
										const capacity = event.capacity || 200; // Default capacity fallback if not provided
										const attendees = event.attendees || 0;
										const fillPercentage = Math.min((attendees / capacity) * 100, 100);

										return (
											<div
												key={event.id}
												onClick={() =>
													navigate(`/organizer/${event.id}/event-dashboard`)
												}
												className="org-event-card d-flex gap-4 p-3 border"
											>
												{/* Banner Area (~22%) */}
												<div className="org-event-banner flex-shrink-0 border overflow-hidden rounded-2">
													{event.image_path ? (
														<img
															src={getEventImageUrl(event)}
															alt={event.title}
															className="w-100 h-100 object-fit-cover"
														/>
													) : (
														<div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--color-bg)' }}>
															<ImageIcon
																size={24}
																color="var(--color-secondary)"
																strokeWidth={1.5}
															/>
														</div>
													)}
												</div>

												{/* Right Content Area */}
												<div className="flex-grow-1 min-w-0 d-flex flex-column justify-content-between py-1">
													<div>
														<div className="d-flex align-items-start justify-content-between gap-3 mb-2">
															<div className="d-flex flex-column gap-1 min-w-0">
																<div className="d-flex align-items-center gap-2 flex-wrap mb-1">
																	<span className="org-event-title fs-3 fw-bold text-truncate" style={{ maxWidth: '600px' }}>
																		{event.title}
																	</span>
																	<StatusBadge status={event.status} />
																</div>
																<div className="org-event-meta d-flex align-items-center gap-3 fs-5">
																	<span className="d-flex align-items-center gap-2 text-dark">
																		<Calendar size={14} /> {formatDate(event.start_date)}
																	</span>
																	<span className="text-muted">|</span>
																	<span className="d-flex align-items-center gap-2 text-dark">
																		<Users size={14} /> {attendees.toLocaleString('id-ID')} / {capacity.toLocaleString('id-ID')} Terdaftar
																	</span>
																</div>
															</div>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	navigate(`/organizer/${event.id}/event-dashboard`);
																}}
																className="org-event-btn d-flex align-items-center gap-2 py-2 px-3 fw-medium flex-shrink-0 border fs-5 rounded"
															>
																Kelola <ChevronRight size={14} />
															</button>
														</div>
														{/* Progress Bar for Capacity */}
														<div className="mt-3" style={{ maxWidth: '300px' }}>
															<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: 'var(--color-border)' }}>
																<div
																	className="progress-bar rounded-pill"
																	role="progressbar"
																	style={{ width: `${fillPercentage}%`, backgroundColor: 'var(--color-text)' }}
																	aria-valuenow={fillPercentage}
																	aria-valuemin="0"
																	aria-valuemax="100"
																></div>
															</div>
														</div>

														{/* Attention Badges */}
														<div className="d-flex gap-2 mt-3">
															{event.needsAttention && event.status === 'draft' && (
																<div className="org-attention-badge attention-draft d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
																	<Zap size={10} />{' '}
																	{event.attentionMessage || 'Butuh struktur alur sesi'}
																</div>
															)}
															{event.needsAttention && event.status === 'completed' && (
																<div className="org-attention-badge attention-completed d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
																	<FileText size={10} />{' '}
																	{event.attentionMessage || 'Sertifikat siap didistribusikan'}
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
