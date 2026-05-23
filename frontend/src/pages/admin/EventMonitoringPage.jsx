import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Calendar, CheckCircle2, Clock, Star } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import { STORAGE_URL } from '@/api/storage'
// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';

const EventRow = ({ event, onToggleFeature }) => {
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
			<td>
				<button
					onClick={() => onToggleFeature(event)}
					className="btn btn-sm"
					style={{
						padding: '4px 10px',
						borderRadius: '8px',
						fontSize: 12,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 6,
						backgroundColor: event.is_featured ? '#fef3c7' : 'var(--light)',
						color: event.is_featured ? '#d97706' : 'var(--text-muted)',
						border: `1px solid ${event.is_featured ? '#fde68a' : '#cbd5e1'}`,
						fontWeight: 600,
						transition: 'all 0.2s'
					}}
				>
					<Star size={12} fill={event.is_featured ? '#f59e0b' : 'none'} strokeWidth={2.5} color={event.is_featured ? '#d97706' : 'var(--text-muted)'} />
					{event.is_featured ? 'Featured' : 'Regular'}
				</button>
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
		return events.filter((e) => {
			const matchQ = e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q));
			const matchStatus = !statusFilter || e.status === statusFilter;
			const matchHighlight = !highlightFilter || (highlightFilter === 'featured' ? e.is_featured : !e.is_featured);
			return matchQ && matchStatus && matchHighlight;
		});
	}, [search, highlightFilter, statusFilter, events]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};
	const handleHighlight = (v) => {
		setHighlightFilter(v);
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
			label: 'Featured Events',
			value: events.filter((e) => e.is_featured).length,
			icon: (c) => <Star size={18} color={c} fill={c} />,
			iconBg: '#fef3c7',
			iconColor: '#d97706',
		},
	];

	// Konfigurasi Kolom untuk Reusable Table
	const tableColumns = [
		{ label: 'Event Info', sortable: true },
		{ label: 'Organizer', sortable: true },
		{ label: 'Start Date', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Highlight / Boost', sortable: false },
	];

	return (
		<div className="page-content">
			{/* Header */}
			<FormHeading
				heading="Event Monitoring"
				subheading="Monitor and manage all activities/events across the system"
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
						value={highlightFilter}
						onChange={(e) => handleHighlight(e.target.value)}
					>
						<option value="">All Highlights</option>
						<option value="featured">Featured Only</option>
						<option value="regular">Regular Only</option>
					</select>

					<select
						className="filter-select"
						value={statusFilter}
						onChange={(e) => handleStatus(e.target.value)}
					>
						<option value="">All Status</option>
						<option value="published">Published</option>
						<option value="draft">Draft</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-outline" disabled={loading}>
						<Download size={14} /> Export
					</button>
				</div>

				{/* Menggunakan Reusable Table Component */}
				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? "Loading events data..." : "No events found matching your filters."}
					renderRow={(e) => (
						<EventRow
							key={e.id}
							event={e}
							onToggleFeature={handleToggleFeature}
						/>
					)}
				/>

				{/* Pagination */}
				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					totalCount={filtered.length}
					perPage={perPage}
					onPageChange={setPage}
				/>
			</div>
		</div>
	);
};

export default EventMonitoringPage;

