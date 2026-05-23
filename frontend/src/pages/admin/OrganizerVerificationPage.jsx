import { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle2, XCircle, Users, Clock } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';

// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const RequestRow = ({ request, onAction }) => {
	const getStatusBadge = (status) => {
		switch (status) {
			case 'approved':
				return (
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
						<CheckCircle2 size={13} /> Approved
					</span>
				);
			case 'rejected':
				return (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--danger-text)',
							backgroundColor: 'var(--danger-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontWeight: 600,
							fontSize: 12,
						}}>
						<XCircle size={13} /> Rejected
					</span>
				);
			default:
				return (
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
						<Clock size={13} /> Pending
					</span>
				);
		}
	};

	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
						{request.user?.name ? request.user.name.charAt(0).toUpperCase() : '?'}
					</div>
					<div>
						<div className="user-name">{request.user?.name || 'Unknown User'}</div>
						<div className="user-email">{request.user?.email || '—'}</div>
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{request.user?.phone || '—'}</td>
			<td>
				{getStatusBadge(request.status)}
			</td>
			<td style={{ color: 'var(--text-muted)' }}>
				{request.created_at ? request.created_at.split('T')[0] : '—'}
			</td>
			<td>
				{request.status === 'pending' ? (
					<div className="action-wrap gap-2">
						<button 
							className="btn btn-sm" 
							style={{ 
								padding: '4px 10px', 
								fontSize: 11, 
								borderRadius: 6, 
								display: 'inline-flex', 
								alignItems: 'center', 
								gap: 4, 
								backgroundColor: 'var(--success-bg)', 
								color: 'var(--success-text)', 
								border: '1px solid var(--success-border)', 
								fontWeight: 600 
							}}
							onClick={() => onAction(request, 'approved')}
							title="Setujui"
						>
							<CheckCircle2 size={12} /> Setujui
						</button>
						<button 
							className="btn btn-sm" 
							style={{ 
								padding: '4px 10px', 
								fontSize: 11, 
								borderRadius: 6, 
								display: 'inline-flex', 
								alignItems: 'center', 
								gap: 4, 
								backgroundColor: 'var(--danger-bg)', 
								color: 'var(--danger-text)', 
								border: '1px solid var(--danger-border)', 
								fontWeight: 600 
							}}
							onClick={() => onAction(request, 'rejected')}
							title="Tolak"
						>
							<XCircle size={12} /> Tolak
						</button>
					</div>
				) : (
					<span className="text-secondary" style={{ fontSize: 12 }}>Selesai Diproses</span>
				)}
			</td>
		</tr>
	);
};

const OrganizerVerificationPage = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentRequest, setCurrentRequest] = useState(null);
	const [targetStatus, setTargetStatus] = useState(''); // 'approved' | 'rejected'
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/organizer-requests');
			setRequests(response.data.data || []);
		} catch (error) {
			console.error('Gagal mengambil permohonan organizer:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleActionClick = (req, status) => {
		setCurrentRequest(req);
		setTargetStatus(status);
		setShowConfirmModal(true);
	};

	const handleConfirmAction = async () => {
		try {
			setSubmitting(true);
			await api.post(`/admin/organizer-requests/${currentRequest.id}/approve`, {
				status: targetStatus
			});
			setShowConfirmModal(false);
			fetchRequests();
		} catch (error) {
			console.error('Gagal memproses permohonan organizer:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat memproses permohonan.');
		} finally {
			setSubmitting(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return requests.filter((r) => {
			const matchQ = (r.user?.name && r.user.name.toLowerCase().includes(q)) || 
				(r.user?.email && r.user.email.toLowerCase().includes(q));
			const matchStatus = !statusFilter || r.status === statusFilter;
			return matchQ && matchStatus;
		});
	}, [search, statusFilter, requests]);

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
			label: 'Total Pengajuan',
			value: requests.length,
			icon: (c) => <Users size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Menunggu Persetujuan',
			value: requests.filter((r) => r.status === 'pending').length,
			icon: (c) => <Clock size={18} color={c} />,
			iconBg: 'var(--warning-bg)',
			iconColor: 'var(--warning-text)',
		},
		{
			label: 'Disetujui',
			value: requests.filter((r) => r.status === 'approved').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Ditolak',
			value: requests.filter((r) => r.status === 'rejected').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--danger-bg)',
			iconColor: 'var(--danger-text)',
		},
	];

	// Konfigurasi Kolom untuk Reusable Table
	const tableColumns = [
		{ label: 'User Info', sortable: true },
		{ label: 'Phone', sortable: false },
		{ label: 'Status', sortable: true },
		{ label: 'Submitted Date', sortable: true },
		{ label: 'Action', sortable: false },
	];

	return (
		<div className="page-content">
			{/* Header */}
			<FormHeading
				heading="Verifikasi Penyelenggara (Organizer)"
				subheading="Tinjau dan verifikasi semua permohonan pengguna untuk menjadi Organizer acara"
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
							placeholder="Cari nama atau email..."
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
						onChange={(e) => handleStatus(e.target.value)}
					>
						<option value="">Semua Status</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
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
					emptyMessage={loading ? "Memuat permohonan..." : "Tidak ada permohonan organizer yang ditemukan."}
					renderRow={(r) => (
						<RequestRow
							key={r.id}
							request={r}
							onAction={handleActionClick}
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

			{/* Modal Konfirmasi Tindakan */}
			<ConfirmationModal
				show={showConfirmModal}
				onHide={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmAction}
				loading={submitting}
				config={{
					title: targetStatus === 'approved' ? 'Setujui Permohonan' : 'Tolak Permohonan',
					desc: targetStatus === 'approved' 
						? `Apakah Anda yakin ingin menyetujui permohonan dari "${currentRequest?.user?.name}" menjadi Organizer? Akun mereka akan otomatis terdaftar sebagai Organizer.`
						: `Apakah Anda yakin ingin menolak permohonan dari "${currentRequest?.user?.name}"?`,
					icon: targetStatus === 'approved' ? CheckCircle2 : XCircle,
					iconColor: targetStatus === 'approved' ? 'var(--success-text)' : 'var(--danger-text)',
					iconBg: targetStatus === 'approved' ? 'var(--success-bg)' : 'var(--danger-bg)',
					iconBorder: targetStatus === 'approved' ? 'var(--success-border)' : 'var(--danger-border)',
					btnVariant: targetStatus === 'approved' ? 'success' : 'danger',
				}}
			/>
		</div>
	);
};

export default OrganizerVerificationPage;
