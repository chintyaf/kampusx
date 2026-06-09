import { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle2, XCircle, Users, Clock } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';

// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

import RequestRow from './RequestRow';
import AuditModal from './AuditModal';

const OrganizerVerificationPage = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showAuditModal, setShowAuditModal] = useState(false);
	const [currentRequest, setCurrentRequest] = useState(null);
	const [targetStatus, setTargetStatus] = useState(''); // 'approved' | 'rejected'
	const [rejectionReason, setRejectionReason] = useState('');
	const [canResubmit, setCanResubmit] = useState(true);
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
		setRejectionReason(req.rejection_reason || '');
		setCanResubmit(req.can_resubmit ?? true);
		setShowAuditModal(true);
	};

	const handleConfirmAction = async () => {
		try {
			setSubmitting(true);
			await api.post(`/admin/organizer-requests/${currentRequest.id}/approve`, {
				status: targetStatus,
				rejection_reason: targetStatus === 'rejected' ? rejectionReason : null,
				can_resubmit: targetStatus === 'rejected' ? canResubmit : true,
			});
			setShowAuditModal(false);
			setRejectionReason('');
			setCanResubmit(true);
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
			const matchQ =
				(r.user?.name && r.user.name.toLowerCase().includes(q)) ||
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
							onChange={(e) => handlePer(e.target.value)}
						>
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
					emptyMessage={
						loading
							? 'Memuat permohonan...'
							: 'Tidak ada permohonan organizer yang ditemukan.'
					}
					renderRow={(r) => (
						<RequestRow key={r.id} request={r} onAction={handleActionClick} />
					)}
				/>

				{/* Pagination */}
				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					totalCount={filtered.length}
					perPage={perPage}
					onPageChange={setPage}
					itemName="permohonan"
				/>
			</div>

			{/* Modal Konfirmasi Audit Khusus dengan Proteksi & Form Alasan Penolakan */}
			<AuditModal
				show={showAuditModal}
				onHide={() => setShowAuditModal(false)}
				targetStatus={targetStatus}
				currentRequest={currentRequest}
				rejectionReason={rejectionReason}
				setRejectionReason={setRejectionReason}
				canResubmit={canResubmit}
				setCanResubmit={setCanResubmit}
				submitting={submitting}
				onConfirm={handleConfirmAction}
			/>
		</div>
	);
};

export default OrganizerVerificationPage;
