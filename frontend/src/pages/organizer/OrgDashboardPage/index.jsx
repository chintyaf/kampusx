import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api/axios';
import {
	Search, Plus, Users, Activity, Mic2, ShieldAlert,
	Calendar, Layers, BookOpen, Clock, Award, Settings,
	ArrowLeft, ArrowRight, LayoutGrid, List, FileText,
	Wallet, Sparkles, TrendingUp, CheckCircle2, ChevronRight,
	Globe, MapPin, Video, ClipboardList
} from 'lucide-react';
import { Table, Badge } from 'react-bootstrap';
import { getEventImageUrl } from '@/utils/eventUtils';
import { formatDate } from './components/utils';
import StatusBadge from './components/StatusBadge';

// Import split sub-components
import KpiMetrics from './components/KpiMetrics';
import QuickActions from './components/QuickActions';
import ActivityLog from './components/ActivityLog';
import FormHeading from '@/components/dashboard/FormHeading';

import './org-dashboard.css';


export default function OrgDashboardPage() {
	const navigate = useNavigate();
	const [dashboardMode, setDashboardMode] = useState('command_center'); // 'command_center', 'all_events'
	const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table'
	const [activeTab, setActiveTab] = useState('all'); // for events list status filter
	const [searchQuery, setSearchQuery] = useState(''); // for events search

	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	// Calculations for Events
	const activeEventsCount = events.filter(
		(e) => e.status === 'published' || e.status === 'ongoing',
	).length;
	const draftEventsCount = events.filter((e) => e.status === 'draft').length;
	const totalAttendeesCount = events.reduce((sum, e) => sum + (parseInt(e.attendees) || 0), 0);
	const totalCheckIns = events.reduce((sum, e) => sum + (parseInt(e.check_ins) || 0), 0);
	const checkInRate =
		totalAttendeesCount > 0 ? Math.round((totalCheckIns / totalAttendeesCount) * 100) : 0;

	const totalCapacity = events.reduce((sum, e) => sum + (parseInt(e.capacity) || 200), 0);

	// Estimasi Pendapatan
	const totalRevenue = events.reduce((sum, e) => sum + (parseInt(e.revenue) || 0), 0);

	// format price/revenue helper
	const formatRevenue = (val) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(val);
	};

	// Event Type helper
	const renderFormatPill = (type) => {
		if (type === 'online') {
			return (
				<span className="org-format-pill format-online">
					<Globe size={11} className="me-1" /> Online
				</span>
			);
		}
		if (type === 'offline') {
			return (
				<span className="org-format-pill format-offline">
					<MapPin size={11} className="me-1" /> Offline
				</span>
			);
		}
		if (type === 'hybrid') {
			return (
				<span className="org-format-pill format-hybrid">
					<Layers size={11} className="me-1" /> Hybrid
				</span>
			);
		}
		return null;
	};

	const getEventLocationText = (event) => {
		const loc = event.location_detail || event.locationDetail;
		if (!loc) return '';
		if (loc.type === 'online') return loc.platform || 'Online';
		if (loc.type === 'offline') return loc.location_name || loc.city || 'Offline';
		if (loc.type === 'hybrid') return `${loc.platform || 'Online'} & ${loc.location_name || 'Offline'}`;
		return '';
	};

	// Filtering Lists
	const filteredEventsByTab = events.filter((e) => {
		if (activeTab === 'all') return true;
		if (activeTab === 'upcoming') return e.status === 'published';
		return e.status === activeTab;
	});

	const filteredEvents = filteredEventsByTab.filter((e) =>
		e.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Recent activity data log items (no emojis)
	const recentActivities = [
		{ id: 1, text: 'Sertifikat digital smart contract terbit untuk 20 peserta event Indonesia AI Summit 2025', time: '10 menit yang lalu' },
		{ id: 2, text: 'Pendaftar baru terdeteksi pada event Webinar Nasional: Startup Funding', time: '1 jam yang lalu' },
		{ id: 3, text: 'Feedback kuesioner event Tech Talk Series 2026 telah masuk dari 15 peserta', time: '2 jam yang lalu' },
		{ id: 4, text: 'Update lokasi event "Workshop React 19" diubah menjadi Hybrid oleh koordinator', time: '1 hari yang lalu' },
		{ id: 5, text: 'Event baru "Webinar UI/UX Trends" telah diajukan ke admin untuk verifikasi', time: '2 hari yang lalu' }
	];

	return (
		<div className="org-dashboard-container py-2">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<FormHeading
					title={
						dashboardMode === 'command_center' ? 'Organizer Command Center' : 'Manajemen Event & Webinar'
					}
					description={
						dashboardMode === 'command_center' ? 'Pusat operasi terpadu event KampusX.' : 'Kelola daftar acara, webinar, pemantauan kehadiran, dan registrasi.'
					}
				/>

				{/* Top-Right Action CTA Depending on Mode */}
				<div>
					{dashboardMode === 'command_center' && (
						<div className="d-flex gap-2">
							<button
								onClick={() => navigate('/organizer/buat-acara')}
								className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 fw-medium fs-4 rounded-2"
							>
								<Plus size={16} />
								Buat Event
							</button>
						</div>
					)}
					{dashboardMode === 'all_events' && (
						<div className="d-flex gap-2">
							<button
								onClick={() => setDashboardMode('command_center')}
								className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 fw-medium fs-4 rounded-2"
							>
								<ArrowLeft size={16} />
								Kembali
							</button>
							<button
								onClick={() => navigate('/organizer/buat-acara')}
								className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 fw-medium fs-4 rounded-2"
							>
								<Plus size={16} />
								Buat Event Baru
							</button>
						</div>
					)}
				</div>
			</div>

			{/* ========================================================================= */}
			{/* 1. TOP KPI METRIC CARDS                                                   */}
			{/* ========================================================================= */}
			{dashboardMode === 'command_center' && (
				<KpiMetrics
					totalAttendeesCount={totalAttendeesCount}
					activeEventsCount={activeEventsCount}
					checkInRate={checkInRate}
					totalRevenue={totalRevenue}
				/>
			)}

			{/* ========================================================================= */}
			{/* 2. GRID - VIEW PORT (COMMAND CENTER MODE)                                 */}
			{/* ========================================================================= */}
			{dashboardMode === 'command_center' && (
				<div className="mb-4">
					<div className="org-command-column-card p-4 border bg-white rounded-3 shadow-sm d-flex flex-column">
						<h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
							<Calendar size={18} className="text-secondary" />
							Event & Webinar
						</h5>
						{/* Events items stack */}
						<div className="d-flex flex-column gap-3">
							{loading ? (
								<div className="text-muted py-5 text-center fs-5">Memuat data event...</div>
							) : events.length === 0 ? (
								<div className="text-muted py-5 text-center fs-5">Belum ada event terdaftar</div>
							) : (
								events.slice(0, 3).map((event) => {
									const capacity = event.capacity || 200;
									const attendees = event.attendees || 0;
									const fillPercentage = Math.min((attendees / capacity) * 100, 100);
									const eventLoc = event.location_detail || event.locationDetail;

									return (
										<div key={event.id} className="org-list-item-row p-3 border rounded-3 bg-light d-flex gap-3 align-items-center justify-content-between">
											<div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
												{/* Event Banner */}
												<div className="org-event-banner flex-shrink-0 border overflow-hidden rounded-2" style={{ width: '100px', height: '56px' }}>
													{event.image_path ? (
														<img
															src={getEventImageUrl(event)}
															alt={event.title}
															className="w-100 h-100 object-fit-cover"
														/>
													) : (
														<div className="w-100 h-100 d-flex align-items-center justify-content-center bg-white">
															<Calendar size={18} className="text-secondary opacity-60" />
														</div>
													)}
												</div>

												<div className="min-w-0 flex-grow-1">
													<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
														<span className="fw-bold text-dark text-truncate d-block" style={{ maxWidth: '380px' }}>
															{event.title}
														</span>
														<StatusBadge status={event.status} />
														{renderFormatPill(eventLoc?.type)}
													</div>

													<div className="d-flex align-items-center gap-3 text-muted text-xs mb-2">
														<span className="d-flex align-items-center gap-1">
															<Clock size={12} /> {formatDate(event.start_date)}
														</span>
														{eventLoc && (
															<span className="d-flex align-items-center gap-1 text-truncate" style={{ maxWidth: '250px' }}>
																{eventLoc.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
																{getEventLocationText(event)}
															</span>
														)}
													</div>

													{/* Visual progress bar */}
													<div className="d-flex align-items-center gap-2">
														<div className="progress rounded-pill flex-grow-1" style={{ height: '4px', backgroundColor: 'var(--color-border)', maxWidth: '220px' }}>
															<div
																className="progress-bar rounded-pill bg-dark"
																style={{ width: `${fillPercentage}%` }}
															/>
														</div>
														<span className="text-xs text-muted fw-medium">
															{attendees} / {capacity} Terdaftar
														</span>
													</div>
												</div>
											</div>
											<div className="flex-shrink-0">
												<button
													onClick={() => navigate(`/organizer/${event.id}/event-dashboard`)}
													className="btn btn-outline-dark btn-sm py-1 px-3 rounded-2 fs-5"
												>
													Kelola
												</button>
											</div>
										</div>
									);
								})
							)}
						</div>

						<div className="mt-3 pt-2 border-top text-center">
							<button
								onClick={() => setDashboardMode('all_events')}
								className="btn btn-link text-decoration-none text-muted p-0 fw-semibold d-inline-flex align-items-center gap-1"
							>
								Lihat Semua Event <ArrowRight size={14} />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ========================================================================= */}
			{/* 4. DETAIL DRILL-DOWN SUB-VIEW: ALL EVENTS                                  */}
			{/* ========================================================================= */}
			{dashboardMode === 'all_events' && (
				<div>
					{/* Search & Layout switch header */}
					<div className="org-content-container p-4 border bg-white rounded-3 shadow-sm mb-4">
						<div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
							{/* Filter Tabs */}
							<div className="d-flex gap-2">
								{['all', 'upcoming', 'ongoing', 'completed', 'draft', 'cancelled'].map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`btn fw-semibold px-3 py-1 fs-5 rounded-pill ${activeTab === tab ? 'btn-dark' : 'btn-light text-muted border-0'
											}`}
									>
										{tab === 'all' ? 'Semua' : tab === 'upcoming' ? 'Mendatang' : tab === 'ongoing' ? 'Sedang Berjalan' : tab === 'completed' ? 'Selesai' : tab}
									</button>
								))}
							</div>

							{/* Search input & layout togglers */}
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

								<div className="btn-group border rounded-2 p-1 bg-light">
									<button
										onClick={() => setViewMode('grid')}
										className={`btn btn-sm border-0 p-1 px-2 ${viewMode === 'grid' ? 'btn-white shadow-sm' : 'text-muted bg-transparent'}`}
									>
										<LayoutGrid size={16} />
									</button>
									<button
										onClick={() => setViewMode('table')}
										className={`btn btn-sm border-0 p-1 px-2 ${viewMode === 'table' ? 'btn-white shadow-sm' : 'text-muted bg-transparent'}`}
									>
										<List size={16} />
									</button>
								</div>
							</div>
						</div>

						{/* Conditional list rendering */}
						{loading ? (
							<div className="text-muted py-5 text-center fs-3">Memuat data event...</div>
						) : error ? (
							<div className="text-danger py-5 text-center fs-3">{error}</div>
						) : filteredEvents.length === 0 ? (
							<div className="text-muted py-5 text-center fs-3">Tidak ada event ditemukan.</div>
						) : viewMode === 'grid' ? (
							// 3-Column Grid Layout
							<div className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3">
								{filteredEvents.map((event) => {
									const capacity = event.capacity || 200;
									const attendees = event.attendees || 0;
									const fillPercentage = Math.min((attendees / capacity) * 100, 100);
									const eventLoc = event.location_detail || event.locationDetail;

									return (
										<div className="col" key={event.id}>
											<div className="card h-100 border rounded-3 overflow-hidden shadow-xs hover-card-wrapper bg-white">
												{/* Banner area */}
												<div className="banner-placeholder bg-light border-bottom d-flex align-items-center justify-content-center position-relative" style={{ height: '140px' }}>
													{event.image_path ? (
														<img
															src={getEventImageUrl(event)}
															alt={event.title}
															className="w-100 h-100 object-fit-cover"
														/>
													) : (
														<Calendar size={32} className="text-secondary opacity-50" />
													)}
													<div className="position-absolute top-2 left-2 d-flex flex-column gap-1">
														<StatusBadge status={event.status} />
													</div>
												</div>
												<div className="card-body p-3 d-flex flex-column justify-content-between">
													<div>
														<h6 className="fw-bold text-dark line-clamp-2 mb-2" style={{ minHeight: '38px' }}>
															{event.title}
														</h6>
														<div className="d-flex align-items-center gap-2 text-muted text-xs mb-3">
															<span className="d-flex align-items-center gap-1">
																<Clock size={11} /> {formatDate(event.start_date)}
															</span>
															{eventLoc && (
																<span className="d-flex align-items-center gap-1 text-truncate" style={{ maxWidth: '120px' }}>
																	{eventLoc.type === 'online' ? <Globe size={11} /> : <MapPin size={11} />}
																	{getEventLocationText(event)}
																</span>
															)}
														</div>

														{/* Progress quota */}
														<div className="mb-3">
															<div className="progress rounded-pill mb-1" style={{ height: '4px', backgroundColor: 'var(--color-border)' }}>
																<div
																	className="progress-bar rounded-pill bg-dark"
																	style={{ width: `${fillPercentage}%` }}
																/>
															</div>
															<span className="text-xxs text-muted d-block fw-semibold">
																{attendees.toLocaleString('id-ID')} / {capacity.toLocaleString('id-ID')} Terdaftar ({fillPercentage.toFixed(0)}%)
															</span>
														</div>
													</div>

													<button
														onClick={() => navigate(`/organizer/${event.id}/event-dashboard`)}
														className="btn btn-dark w-100 py-2 fw-medium fs-5 rounded-2 mt-2"
													>
														Kelola Event
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							// Data Table Layout
							<div className="table-responsive">
								<Table hover className="align-middle border-light">
									<thead>
										<tr className="table-light">
											<th>Nama Event</th>
											<th>Tipe / Lokasi</th>
											<th>Status</th>
											<th style={{ width: '220px' }}>Pendaftaran</th>
											<th>Tanggal</th>
											<th className="text-end">Aksi</th>
										</tr>
									</thead>
									<tbody>
										{filteredEvents.map((event) => {
											const capacity = event.capacity || 200;
											const attendees = event.attendees || 0;
											const fillPercentage = Math.min((attendees / capacity) * 100, 100);
											const eventLoc = event.location_detail || event.locationDetail;

											return (
												<tr key={event.id}>
													<td>
														<span className="fw-bold text-dark">{event.title}</span>
													</td>
													<td>
														<div className="d-flex flex-column gap-1">
															{renderFormatPill(eventLoc?.type)}
															<span className="text-muted text-xxs">{getEventLocationText(event)}</span>
														</div>
													</td>
													<td>
														<StatusBadge status={event.status} />
													</td>
													<td>
														<div className="d-flex flex-column gap-1">
															<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: 'var(--color-border)' }}>
																<div
																	className="progress-bar rounded-pill bg-dark"
																	style={{ width: `${fillPercentage}%` }}
																/>
															</div>
															<span className="text-xxs text-muted">
																{attendees} / {capacity} ({fillPercentage.toFixed(0)}%)
															</span>
														</div>
													</td>
													<td>
														<span className="text-xs">{formatDate(event.start_date)}</span>
													</td>
													<td className="text-end">
														<button
															onClick={() => navigate(`/organizer/${event.id}/event-dashboard`)}
															className="btn btn-outline-dark btn-sm py-1 px-3 rounded-2 fs-5"
														>
															Kelola
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</Table>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
