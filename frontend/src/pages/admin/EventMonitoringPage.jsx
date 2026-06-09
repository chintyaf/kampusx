import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Calendar, CheckCircle2, Clock, Star, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, ExternalLink, LayoutDashboard } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import { STORAGE_URL } from '@/api/storage'
// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';

const EventRow = ({ event, onToggleFeature }) => {
	const canViewPublic = ['published', 'ongoing', 'post_event', 'completed'].includes(event.status);

	return (
		<tr>
			<td>
				<div className="user-cell">
					{event.image_path ? (
						<img
							src={`${STORAGE_URL}/${event.image_path}`}
							alt={event.title}
							style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
							onError={(e) => {
								e.target.onerror = null;
								e.target.style.display = 'none';
							}}
						/>
					) : (
						<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
							<Calendar size={18} />
						</div>
					)}
					<div>
						<div className="user-name" style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
							{event.title}
						</div>
						<div className="user-email">{event.slug}</div>
					</div>
				</div>
			</td>
			<td>
				<div>
					<div className="fw-semibold text-dark" style={{ fontSize: 13 }}>
						{event.organizer?.name || 'Unknown Organizer'}
					</div>
					<div className="text-secondary" style={{ fontSize: 11 }}>
						{event.organizer?.email || ''}
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>
				{event.start_date ? event.start_date.split('T')[0] : '—'}
			</td>
			<td>
				{event.status === 'published' ? (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--success-text)',
							backgroundColor: 'var(--success-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontWeight: 600,
							fontSize: 12,
						}}>
						Published
					</span>
				) : event.status === 'draft' ? (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--warning-text)',
							backgroundColor: 'var(--warning-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontWeight: 600,
							fontSize: 12,
						}}>
						Draft
					</span>
				) : (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--text-muted)',
							backgroundColor: '#f1f5f9',
							padding: '4px 8px',
							borderRadius: '12px',
							fontWeight: 600,
							fontSize: 12,
						}}>
						{event.status}
					</span>
				)}
			</td>

			{/* Kolom Action */}
			<td>
				<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
					{/* Dashboard organizer */}
					<a
						href={`/organizer/${event.id}/event-dashboard`}
						target="_blank"
						rel="noreferrer"
						title="Buka Dashboard Organizer"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 30,
							height: 30,
							borderRadius: 8,
							border: '1px solid #e2e8f0',
							backgroundColor: '#f8fafc',
							color: 'var(--text-muted)',
							transition: 'all 0.15s',
							textDecoration: 'none',
						}}
						onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
						onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = 'var(--text-muted)'; }}
					>
						<LayoutDashboard size={14} />
					</a>

					{/* Halaman publik — hanya untuk status yang sudah live */}
					{canViewPublic ? (
						<a
							href={`/event/${event.slug}`}
							target="_blank"
							rel="noreferrer"
							title="Lihat Halaman Publik Event"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 30,
								height: 30,
								borderRadius: 8,
								border: '1px solid #bfdbfe',
								backgroundColor: '#eff6ff',
								color: '#3b82f6',
								transition: 'all 0.15s',
								textDecoration: 'none',
							}}
							onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
							onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
						>
							<ExternalLink size={14} />
						</a>
					) : (
						<span
							title="Halaman publik belum tersedia"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 30,
								height: 30,
								borderRadius: 8,
								border: '1px solid #e2e8f0',
								backgroundColor: '#f8fafc',
								color: '#cbd5e1',
								cursor: 'not-allowed',
							}}
						>
							<ExternalLink size={14} />
						</span>
					)}
				</div>
			</td>
		</tr>
	);
};

const EventMonitoringPage = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [highlightFilter, setHighlightFilter] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);
	const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });

	const handleSort = (key) => {
		setSortConfig((prev) =>
			prev.key === key
				? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
				: { key, dir: 'asc' }
		);
		setPage(1);
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/events');
			setEvents(response.data.data || []);
		} catch (error) {
			console.error('Gagal mengambil data acara:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleFeature = async (event) => {
		try {
			const res = await api.post(`/admin/events/${event.id}/feature`);
			setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_featured: res.data.is_featured } : e));
		} catch (error) {
			console.error("Gagal mengubah status featured acara:", error);
			alert("Gagal mengubah status featured acara.");
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		let result = events.filter((e) => {
			const matchQ = e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q));
			const matchStatus = !statusFilter || e.status === statusFilter;
			return matchQ && matchStatus;
		});

		// Sorting
		if (sortConfig.key) {
			result = [...result].sort((a, b) => {
				let aVal, bVal;
				if (sortConfig.key === 'title') { aVal = a.title?.toLowerCase(); bVal = b.title?.toLowerCase(); }
				else if (sortConfig.key === 'organizer') { aVal = a.organizer?.name?.toLowerCase(); bVal = b.organizer?.name?.toLowerCase(); }
				else if (sortConfig.key === 'start_date') { aVal = a.start_date || ''; bVal = b.start_date || ''; }
				else if (sortConfig.key === 'status') { aVal = a.status; bVal = b.status; }
				aVal = aVal ?? '';
				bVal = bVal ?? '';
				const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
				return sortConfig.dir === 'asc' ? cmp : -cmp;
			});
		}

		return result;
	}, [search, statusFilter, events, sortConfig]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};
	const handleStatus = (v) => {
		setStatus(v);
		setPage(1);
	};
	const handlePer = (v) => {
		setPerPage(Number(v));
		setPage(1);
	};

	const stats = [
		{
			label: 'Total Events',
			value: events.length,
			icon: (c) => <Calendar size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Published',
			value: events.filter((e) => e.status === 'published').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Draft',
			value: events.filter((e) => e.status === 'draft').length,
			icon: (c) => <Clock size={18} color={c} />,
			iconBg: 'var(--warning-bg)',
			iconColor: 'var(--warning-text)',
		},
		{
			label: 'Ongoing',
			value: events.filter((e) => e.status === 'ongoing').length,
			icon: (c) => <TrendingUp size={18} color={c} />,
			iconBg: '#ecfdf5',
			iconColor: '#059669',
		},
		/* {
			label: 'Featured Events',
			value: events.filter((e) => e.is_featured).length,
			icon: (c) => <Star size={18} color={c} fill={c} />,
			iconBg: '#fef3c7',
			iconColor: '#d97706',
		}, */
	];

	// Konfigurasi Kolom untuk Reusable Table
	const SORT_KEYS = ['title', 'organizer', 'start_date', 'status', null];
	const tableColumns = [
		{ label: 'Event Info', sortable: true, key: 'title' },
		{ label: 'Organizer', sortable: true, key: 'organizer' },
		{ label: 'Start Date', sortable: true, key: 'start_date' },
		{ label: 'Status', sortable: true, key: 'status' },
		// { label: 'Highlight / Boost', sortable: false, key: null },
		{ label: 'Action', sortable: false, key: null },
	];

	return (
		<div className="page-content">
			{/* Header */}
			<FormHeading
				title="Event Monitoring"
				description ="Monitor and manage all activities/events across the system"
				className="mb-4"
			/>
			{/* Stats */}
			<div className="stats-row">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			{/* Table Card */}
			<div className="table-card">
				{/* Toolbar */}
				<div className="table-toolbar">
					<div className="search-box">
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Search by title..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<span className="show-label">
						Showing
						<select
							className="show-select"
							value={perPage}
							onChange={(e) => handlePer(e.target.value)}>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
						</select>
					</span>

					<select
						className="filter-select"
						value={statusFilter}
						onChange={(e) => handleStatus(e.target.value)}
					>
						<option value="">All Status</option>
						<option value="published">Published</option>
						<option value="ongoing">Ongoing</option>
						<option value="draft">Draft</option>
						<option value="post_event">Post Event</option>
						<option value="completed">Completed</option>
						<option value="cancelled">Cancelled</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-outline" disabled={loading}>
						<Download size={14} /> Export
					</button>
				</div>

				{/* Table with sortable headers */}
				<div className="table-responsive">
					<table className="data-table">
						<thead>
							<tr>
								{tableColumns.map((col) => (
									<th
										key={col.label}
										onClick={col.key ? () => handleSort(col.key) : undefined}
										style={{
											cursor: col.key ? 'pointer' : 'default',
											userSelect: 'none',
											whiteSpace: 'nowrap',
										}}
									>
										<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
											{col.label}
											{col.key && (
												sortConfig.key === col.key
													? sortConfig.dir === 'asc'
														? <ArrowUp size={13} color="var(--primary)" />
														: <ArrowDown size={13} color="var(--primary)" />
													: <ArrowUpDown size={13} color="var(--text-muted)" style={{ opacity: 0.5 }} />
											)}
										</span>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading events data...</td></tr>
							) : pageData.length === 0 ? (
								<tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No events found matching your filters.</td></tr>
							) : (
								pageData.map((e) => (
									<EventRow key={e.id} event={e} onToggleFeature={handleToggleFeature} />
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					totalCount={filtered.length}
					perPage={perPage}
					onPageChange={setPage}
					itemName="events"
				/>
			</div>
		</div>
	);
};

export default EventMonitoringPage;
