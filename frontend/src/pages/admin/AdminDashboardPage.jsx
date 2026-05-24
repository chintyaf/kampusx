import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoadingId, setActionLoadingId] = useState(null);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/dashboard-overview');
			setDashboardData(response.data.data);
		} catch (error) {
			console.error('Gagal mengambil data dashboard:', error);
			notify('error', 'Gagal', 'Gagal memuat data dashboard.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const handleOrganizerApprove = async (id) => {
		try {
			setActionLoadingId(id);
			await api.post(`/admin/organizer-requests/${id}/approve`, { status: 'approved' });
			notify('success', 'Berhasil', 'Pengajuan organizer disetujui.');
			fetchDashboardData();
		} catch (error) {
			console.error('Gagal menyetujui organizer:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat memproses.');
		} finally {
			setActionLoadingId(null);
		}
	};

	const handleOrganizerReject = async (id) => {
		try {
			setActionLoadingId(id);
			await api.post(`/admin/organizer-requests/${id}/approve`, { status: 'rejected' });
			notify('success', 'Berhasil', 'Pengajuan organizer ditolak.');
			fetchDashboardData();
		} catch (error) {
			console.error('Gagal menolak organizer:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat memproses.');
		} finally {
			setActionLoadingId(null);
		}
	};

	const getInitials = (name) => {
		if (!name) return 'U';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	};

	const getAvatarClass = (name) => {
		const colors = ['av-blue', 'av-teal', 'av-amber', 'av-purple', 'av-coral'];
		const charCode = name ? name.charCodeAt(0) : 0;
		return colors[charCode % colors.length];
	};

	if (loading && !dashboardData) {
		return (
			<div className="d-flex align-items-center justify-content-center py-5 w-100" style={{ minHeight: '300px' }}>
				<div className="spinner-border text-primary animate__animated animate__fadeIn" role="status">
					<span className="visually-hidden">Memuat...</span>
				</div>
			</div>
		);
	}

	if (!dashboardData) {
		return (
			<div className="text-center py-5">
				<p className="text-muted">Gagal memuat data dashboard. Silakan coba beberapa saat lagi.</p>
				<button className="btn btn-primary" onClick={fetchDashboardData}>Coba Lagi</button>
			</div>
		);
	}

	const { metrics, pending_organizers, events, users, activities } = dashboardData;

	return (
		<div className="content">
			{/* Metrics */}
			<div className="metrics">
				<div className="metric">
					<div className="metric-label">Organizer Pending</div>
					<div className="metric-val">{metrics.organizer_pending}</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> Menunggu tinjauan
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Event Aktif</div>
					<div className="metric-val">{metrics.event_active}</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> Siap dikunjungi
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Akun Suspended</div>
					<div className="metric-val">{metrics.user_suspended}</div>
					<div className="metric-delta dn">
						<i className="ti ti-arrow-down" aria-hidden="true"></i> Akun dibatasi
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Transaksi Wallet</div>
					<div className="metric-val">{metrics.total_transactions}</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> Total transaksi sistem
					</div>
				</div>
			</div>

			{/* Panels */}
			<div className="panels">
				{/* Panel: Persetujuan Organizer */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-user-check" aria-hidden="true"></i> Persetujuan Organizer
						</div>
						<span className="view-all" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/admin/organizer-requests'}>Lihat semua</span>
					</div>
					{/* Items */}
					{pending_organizers.length === 0 ? (
						<div className="text-center py-5 text-muted small">Tidak ada pengajuan organizer tertunda.</div>
					) : (
						pending_organizers.map((req) => (
							<div className="table-row org-row animate__animated animate__fadeIn" key={req.id}>
								<div className={`avatar ${getAvatarClass(req.user?.name)}`}>
									{getInitials(req.user?.name)}
								</div>
								<div className="row-info">
									<div className="row-name">{req.user?.name || 'Unknown'}</div>
									<div className="row-sub">{req.institution_name || 'Institusi'} · {req.organization_name || 'Organisasi'}</div>
								</div>
								<div className="action-btns">
									<button 
										className="btn-sm btn-approve" 
										disabled={actionLoadingId === req.id}
										onClick={() => handleOrganizerApprove(req.id)}
									>
										Setuju
									</button>
									<button 
										className="btn-sm btn-reject" 
										disabled={actionLoadingId === req.id}
										onClick={() => handleOrganizerReject(req.id)}
									>
										Tolak
									</button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Panel: Moderasi Event */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-star" aria-hidden="true"></i> Moderasi Event
						</div>
						<span className="view-all" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/admin/events'}>Lihat semua</span>
					</div>
					{events.length === 0 ? (
						<div className="text-center py-5 text-muted small">Belum ada event terdaftar.</div>
					) : (
						events.map((event) => {
							let badgeClass = 's-active';
							let badgeText = 'Aktif';
							if (event.is_featured) {
								badgeClass = 's-featured';
								badgeText = 'Featured';
							} else if (event.status === 'draft') {
								badgeClass = 's-review';
								badgeText = 'Draft';
							} else if (event.status === 'published') {
								badgeClass = 's-boost';
								badgeText = 'Published';
							} else if (event.status === 'archived' || event.status === 'artchived') {
								badgeClass = 's-review';
								badgeText = 'Archived';
							}

							return (
								<div className="table-row event-row animate__animated animate__fadeIn" key={event.id}>
									<div className="row-info">
										<div className="row-name">{event.title}</div>
										<div className="row-sub">{event.organizer_name} · {event.start_date || '—'}</div>
									</div>
									<span className={`status-pill ${badgeClass}`}>{badgeText}</span>
								</div>
							);
						})
					)}
				</div>

				{/* Panel: Keamanan Pengguna */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-shield" aria-hidden="true"></i> Keamanan Pengguna
						</div>
						<span className="view-all" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/admin/users'}>Kelola</span>
					</div>
					<div className="user-section">
						{users.length === 0 ? (
							<div className="text-center py-5 text-muted small">Belum ada pengguna terdaftar.</div>
						) : (
							users.map((u) => {
								let statusClass = 's-active';
								if (u.status === 'suspended') {
									statusClass = 's-suspended';
								} else if (u.status === 'banned') {
									statusClass = 's-banned';
								}

								return (
									<div className="user-row animate__animated animate__fadeIn" key={u.id}>
										<div className={`avatar ${getAvatarClass(u.name)}`}>
											{getInitials(u.name)}
										</div>
										<div className="row-info">
											<div className="row-name">{u.name}</div>
											<div className="row-sub">
												{u.status === 'active' ? 'Akun normal' : (u.status_reason || u.status)}
											</div>
										</div>
										<span className={`status-pill ${statusClass}`}>{u.status}</span>
										<i
											className="ti ti-dots-vertical"
											style={{ cursor: 'pointer', color: '#9ca3af' }}
											aria-hidden="true"
										></i>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Panel: Audit Log Sistem */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-list-search" aria-hidden="true"></i> Audit Log Sistem
						</div>
						<span className="view-all" style={{ cursor: 'pointer' }}>Ekspor</span>
					</div>
					{activities.length === 0 ? (
						<div className="text-center py-5 text-muted small">Belum ada log aktivitas sistem.</div>
					) : (
						activities.map((act, idx) => (
							<div className="audit-row animate__animated animate__fadeIn" key={idx}>
								<div className={`audit-dot ${act.dot}`}></div>
								<div>
									<div 
										className="audit-text"
										dangerouslySetInnerHTML={{ __html: act.text }}
									/>
									<div className="audit-time">{act.time}</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboardPage;
