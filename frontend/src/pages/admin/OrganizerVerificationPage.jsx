import { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle2, XCircle, Users, Clock, ChevronDown, ChevronUp, FileText, ExternalLink, AlertCircle } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';

// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const RequestRow = ({ request, onAction }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const isImageFile = (path) => {
		if (!path) return false;
		const ext = path.split('.').pop().toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
	};

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
		<>
			<tr 
				style={{ 
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					backgroundColor: isExpanded ? 'var(--bg-light-subtle, #f8f9fa)' : 'transparent'
				}}
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<td>
					<div className="user-cell" style={{ gap: 8, alignItems: 'center' }}>
						<button 
							onClick={(e) => {
								e.stopPropagation();
								setIsExpanded(!isExpanded);
							}}
							style={{ 
								background: 'none', 
								border: 'none', 
								cursor: 'pointer', 
								color: 'var(--text-muted, #64748b)',
								padding: '4px',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '50%',
								transition: 'all 0.2s',
								outline: 'none',
							}}
							className="chevron-toggle-btn"
						>
							{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						</button>
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
						<div className="action-wrap gap-2" onClick={(e) => e.stopPropagation()}>
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
			{isExpanded && (
				<tr style={{ backgroundColor: 'var(--bg-light-subtle, #f8f9fa)' }}>
					<td colSpan={5} style={{ padding: '12px 24px 24px 24px' }}>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
							gap: '24px',
							backgroundColor: '#ffffff',
							border: '1px solid var(--border-color, #e2e8f0)',
							borderRadius: '12px',
							padding: '20px',
							boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
						}} onClick={(e) => e.stopPropagation()}>
							{/* Kolom Kiri: Informasi Afiliasi */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								<h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-color, #1e293b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
									<Users size={16} style={{ color: 'var(--primary)' }} />
									Informasi Afiliasi & Organisasi
								</h4>
								
								<div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px 16px', fontSize: '13px' }}>
									<div style={{ color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Nama Organisasi:</div>
									<div style={{ fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>{request.organization_name || '—'}</div>
									
									<div style={{ color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Institusi / Kampus:</div>
									<div>
										{request.institution ? (
											<span style={{ fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>
												{request.institution.name}
											</span>
										) : request.custom_institution_name ? (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
												<span style={{ fontWeight: 600, color: 'var(--primary, #3b82f6)' }}>
													{request.custom_institution_name}
												</span>
												<span style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: '4px',
													fontSize: '11px',
													fontWeight: 600,
													color: 'var(--warning-text, #b45309)',
													backgroundColor: 'var(--warning-bg, #fef3c7)',
													padding: '2px 8px',
													borderRadius: '4px',
													width: 'fit-content'
												}}>
													<AlertCircle size={10} /> Kampus Baru (Akan otomatis didaftarkan jika disetujui)
												</span>
											</div>
										) : (
											<span style={{ color: 'var(--text-muted, #64748b)' }}>—</span>
										)}
									</div>
									
									<div style={{ color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Masa Berlaku Afiliasi:</div>
									<div style={{ color: 'var(--success-text, #15803d)', fontWeight: 600 }}>
										1 Tahun (Otomatis Aktif dari Tanggal Persetujuan)
									</div>

									{request.note && (
										<>
											<div style={{ color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Catatan Tambahan:</div>
											<div style={{ 
												padding: '8px 12px', 
												backgroundColor: 'var(--bg-light, #f8fafc)', 
												border: '1px solid #e2e8f0', 
												borderRadius: '6px', 
												fontSize: '12.5px',
												color: '#334155',
												whiteSpace: 'pre-line',
												wordBreak: 'break-word',
												maxHeight: '120px',
												overflowY: 'auto'
											}}>
												{request.note}
											</div>
										</>
									)}
								</div>
							</div>
							
							{/* Kolom Kanan: Berkas Bukti Keanggotaan */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								<h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-color, #1e293b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
									<FileText size={16} style={{ color: 'var(--primary)' }} />
									Dokumen Bukti Keanggotaan
								</h4>
								
								{request.proof_url ? (
									<div style={{
										border: '1px dashed var(--border-color, #e2e8f0)',
										borderRadius: '8px',
										padding: '16px',
										backgroundColor: 'var(--bg-light, #f8fafc)',
										display: 'flex',
										flexDirection: 'column',
										gap: '16px',
										alignItems: 'center',
										justifyContent: 'center',
										minHeight: '120px'
									}}>
										{isImageFile(request.proof_path) ? (
											<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
												<a href={request.proof_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', maxWidth: '200px', cursor: 'zoom-in' }}>
													<img 
														src={request.proof_url} 
														alt="Bukti Keanggotaan" 
														style={{
															width: '100%',
															maxHeight: '120px',
															objectFit: 'contain',
															borderRadius: '6px',
															border: '1px solid #cbd5e1',
															backgroundColor: '#ffffff'
														}}
													/>
												</a>
												<span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>Klik gambar untuk memperbesar</span>
											</div>
										) : (
											<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
												<FileText size={36} style={{ color: 'var(--text-muted, #64748b)' }} />
												<span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-color, #1e293b)' }}>
													Dokumen PDF / Berkas Bukti
												</span>
											</div>
										)}
										
										<a 
											href={request.proof_url} 
											target="_blank" 
											rel="noopener noreferrer"
											className="btn btn-sm btn-outline"
											style={{ 
												padding: '6px 12px', 
												fontSize: '12px', 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: '6px',
												textDecoration: 'none',
												fontWeight: 600,
												backgroundColor: '#ffffff',
												border: '1px solid #cbd5e1',
												borderRadius: '6px',
												color: 'var(--text-color, #1e293b)'
											}}
										>
											<ExternalLink size={12} /> Buka Dokumen di Tab Baru
										</a>
									</div>
								) : (
									<div style={{
										border: '1px dashed var(--danger-border, #fecaca)',
										borderRadius: '8px',
										padding: '16px',
										backgroundColor: 'var(--danger-bg, #fef2f2)',
										color: 'var(--danger-text, #991b1b)',
										fontSize: '13px',
										textAlign: 'center',
										fontWeight: 500
									}}>
										Tidak ada dokumen bukti yang diunggah.
									</div>
								)}
							</div>
						</div>
					</td>
				</tr>
			)}
		</>
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
