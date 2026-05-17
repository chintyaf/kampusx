import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, CheckCircle2, XCircle, LayoutList, Pencil, Trash2 } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';

const EventTypeRow = ({ eventType, onEdit, onDelete }) => {
	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
						<LayoutList size={18} />
					</div>
					<div>
						<div className="user-name">{eventType.name}</div>
						<div className="user-email" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
							{eventType.description || '-'}
						</div>
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{eventType.eventsCount} Acara</td>
			<td>
				{eventType.status === 'active' ? (
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
						<CheckCircle2 size={13} /> Aktif
					</span>
				) : (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--danger-text)',
							backgroundColor: 'var(--danger-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontSize: 12,
						}}>
						<XCircle size={13} /> Nonaktif
					</span>
				)}
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{eventType.createdAt || '-'}</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(eventType)} title="Edit">
						<Pencil size={13} />
					</button>
					<button className="act-btn delete" onClick={() => onDelete(eventType)} title="Delete">
						<Trash2 size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
};

const TipeEvent = () => {
	const [eventTypes, setEventTypes] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	useEffect(() => {
		fetchEventTypes();
	}, []);

	const fetchEventTypes = async () => {
		try {
			setLoading(true);
			const response = await api.get('/event-types');
			
			// Mapping data dari backend karena endpoint saat ini hanya me-return id dan name
			const mappedData = response.data.data.map(item => ({
				id: item.id,
				name: item.name,
				description: 'Deskripsi untuk ' + item.name,
				eventsCount: 0,
				status: 'active',
				createdAt: new Date().toISOString().split('T')[0]
			}));
			
			setEventTypes(mappedData);
		} catch (error) {
			console.error("Gagal mengambil data tipe event:", error);
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return eventTypes.filter((t) => {
			const matchQ = t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
			const matchStatus = !statusFilter || t.status === statusFilter;
			return matchQ && matchStatus;
		});
	}, [search, statusFilter, eventTypes]);

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
			label: 'Total Tipe Event',
			value: eventTypes.length,
			icon: (c) => <LayoutList size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Tipe Aktif',
			value: eventTypes.filter((t) => t.status === 'active').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Tipe Nonaktif',
			value: eventTypes.filter((t) => t.status === 'inactive').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--danger-bg)',
			iconColor: 'var(--danger-text)',
		},
	];

	const tableColumns = [
		{ label: 'Tipe Event', sortable: true },
		{ label: 'Jumlah Acara', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Dibuat Pada', sortable: true },
		{ label: 'Aksi', sortable: false },
	];

	return (
		<div className="page-content">
			<FormHeading
				heading="Kelola Tipe Event"
				subheading="Kelola format atau tipe acara yang dapat diselenggarakan"
			/>

			<div className="stats-row">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			<div className="table-card">
				<div className="table-toolbar">
					<div className="search-box">
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Cari tipe event..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<span className="show-label">
						Tampilkan
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
						onChange={(e) => handleStatus(e.target.value)}>
						<option value="">Semua Status</option>
						<option value="active">Aktif</option>
						<option value="inactive">Nonaktif</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-outline" disabled={loading}>
						<Download size={14} /> Export
					</button>
					<button className="btn btn-primary" disabled={loading}>
						<Plus size={14} /> Tambah Tipe Event
					</button>
				</div>

				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? "Memuat data tipe event..." : "Tidak ada tipe event yang ditemukan."}
					renderRow={(t) => (
						<EventTypeRow
							key={t.id}
							eventType={t}
							onEdit={(t) => alert(`Edit tipe event: ${t.name}`)}
							onDelete={(t) => alert(`Hapus tipe event: ${t.name}`)}
						/>
					)}
				/>

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

export default TipeEvent;
