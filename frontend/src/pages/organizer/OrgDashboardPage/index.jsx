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

	const totalRevenueValue = events.reduce((sum, e) => sum + (parseFloat(e.revenue) || 0), 0);
	const activeEventsCount = events.filter(
		(e) => e.status === 'published' || e.status === 'ongoing',
	).length;
	const draftEventsCount = events.filter((e) => e.status === 'draft').length;
	const totalAttendeesCount = events.reduce((sum, e) => sum + (parseInt(e.attendees) || 0), 0);

	const filtered = events.filter((e) =>
		e.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const statsData = [
		{
			label: 'Total Revenue',
			value: formatRupiah(totalRevenueValue),
			sub: 'Total pendapatan semua event',
			lucideIcon: Wallet,
			iconBg: '#dcfce7',
			iconColor: '#166534',
		},
		{
			label: 'Avg. Conversion',
			value: '14.2%',
			sub: '↑ +2.4% vs bulan lalu',
			lucideIcon: TrendingUp,
			iconBg: '#dff3ff',
			iconColor: '#00699e',
		},
		{
			label: 'Event Berjalan',
			value: `${activeEventsCount} Aktif`,
			sub: `${draftEventsCount} Event dalam draft`,
			lucideIcon: Activity,
			iconBg: '#fef3c7',
			iconColor: '#92400e',
		},
		{
			label: 'Total Peserta',
			value: totalAttendeesCount.toLocaleString('id-ID'),
			sub: 'Tiket terdaftar',
			lucideIcon: Users,
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

					{/* Body */}
					<div className="d-flex gap-4 align-items-start">
						{/* Events */}
						<div className="org-content-container flex-grow-1 border p-4 min-w-0">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h2 className="org-section-title fs-2 fw-bold m-0">
									Manajemen Event
								</h2>
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
							</div>

							<div className="d-flex flex-column gap-2">
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
									filtered.map((event) => (
										<div
											key={event.id}
											onClick={() =>
												navigate(`/organizer/${event.id}/event-dashboard`)
											}
											className="org-event-card d-flex align-items-center gap-3 p-3 border"
										>
											{/* Thumbnail */}
											<div className="org-event-thumbnail d-flex align-items-center justify-content-center flex-shrink-0 border overflow-hidden">
												{event.image_path ? (
													<img
														src={getEventImageUrl(event)}
														alt={event.title}
														className="w-100 h-100 object-fit-cover"
													/>
												) : (
													<ImageIcon
														size={18}
														color="var(--color-secondary)"
														strokeWidth={1.5}
													/>
												)}
											</div>

											{/* Info */}
											<div className="flex-grow-1 min-w-0">
												<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
													<span className="org-event-title fs-3 fw-bold text-truncate">
														{event.title}
													</span>
													<StatusBadge status={event.status} />
												</div>
												<div className="org-event-meta d-flex gap-3 mb-1 fs-5">
													<span className="d-flex align-items-center gap-1">
														<Calendar size={11} />{' '}
														{formatDate(event.start_date)}
													</span>
													<span className="d-flex align-items-center gap-1">
														<Users size={11} />{' '}
														{(event.attendees || 0).toLocaleString(
															'id-ID',
														)}
													</span>
													<span className="d-flex align-items-center gap-1">
														<Wallet size={11} />{' '}
														{formatRupiah(event.revenue || 0)}
													</span>
												</div>
												{event.needsAttention &&
													event.status === 'draft' && (
														<div className="org-attention-badge attention-draft d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
															<Zap size={10} />{' '}
															{event.attentionMessage ||
																'Butuh struktur alur sesi'}
														</div>
													)}
												{event.needsAttention &&
													event.status === 'completed' && (
														<div className="org-attention-badge attention-completed d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
															<FileText size={10} />{' '}
															{event.attentionMessage ||
																'Sertifikat siap didistribusikan'}
														</div>
													)}
											</div>

											<button
												onClick={(e) => {
													e.stopPropagation();

													navigate(
														`/organizer/${event.id}/event-dashboard`,
													);
												}}
												className="org-event-btn d-flex align-items-center gap-1 py-2 px-3 fw-medium text-nowrap flex-shrink-0 border fs-5"
											>
												Buka <ChevronRight size={12} />
											</button>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
