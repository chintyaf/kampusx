import React from 'react';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
	return (
		<div className="content">
			{/* Metrics */}
			<div className="metrics">
				<div className="metric">
					<div className="metric-label">Organizer Pending</div>
					<div className="metric-val">12</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> 4 baru hari ini
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Event Aktif</div>
					<div className="metric-val">84</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> +7 minggu ini
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Akun Suspended</div>
					<div className="metric-val">3</div>
					<div className="metric-delta dn">
						<i className="ti ti-arrow-down" aria-hidden="true"></i> 1 baru
					</div>
				</div>
				<div className="metric">
					<div className="metric-label">Transaksi Wallet</div>
					<div className="metric-val">209</div>
					<div className="metric-delta up">
						<i className="ti ti-arrow-up" aria-hidden="true"></i> +18% bulan ini
					</div>
				</div>
			</div>

			{/* Panels */}
			<div className="panels">
				{/* Panel: Persetujuan Organizer */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-user-check" aria-hidden="true"></i> Persetujuan
							Organizer
						</div>
						<span className="view-all">Lihat semua</span>
					</div>
					{/* Items */}
					<div className="table-row org-row">
						<div className="avatar av-blue">RA</div>
						<div className="row-info">
							<div className="row-name">Rizky Aditya</div>
							<div className="row-sub">Univ. Padjadjaran · BEM FT</div>
						</div>
						<div className="action-btns">
							<button className="btn-sm btn-approve">Setuju</button>
							<button className="btn-sm btn-reject">Tolak</button>
						</div>
					</div>
					<div className="table-row org-row">
						<div className="avatar av-teal">SN</div>
						<div className="row-info">
							<div className="row-name">Sinta Nurhaliza</div>
							<div className="row-sub">ITB · Himpunan Desain</div>
						</div>
						<div className="action-btns">
							<button className="btn-sm btn-approve">Setuju</button>
							<button className="btn-sm btn-reject">Tolak</button>
						</div>
					</div>
					<div className="table-row org-row">
						<div className="avatar av-amber">DK</div>
						<div className="row-info">
							<div className="row-name">Dimas Kurniawan</div>
							<div className="row-sub">Telkom Univ · PEMA</div>
						</div>
						<div className="action-btns">
							<button className="btn-sm btn-approve">Setuju</button>
							<button className="btn-sm btn-reject">Tolak</button>
						</div>
					</div>
					<div className="table-row org-row">
						<div className="avatar av-purple">FH</div>
						<div className="row-info">
							<div className="row-name">Farah Husna</div>
							<div className="row-sub">UPI · UKM Seni</div>
						</div>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<span className="status-pill s-pending">Menunggu</span>
						</div>
					</div>
				</div>

				{/* Panel: Moderasi Event */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-star" aria-hidden="true"></i> Moderasi Event
						</div>
						<span className="view-all">Lihat semua</span>
					</div>
					<div className="table-row event-row">
						<div className="row-info">
							<div className="row-name">Workshop UI/UX Design 2025</div>
							<div className="row-sub">ITB · 28 Mei · 120 tiket</div>
						</div>
						<span className="status-pill s-featured">Featured</span>
					</div>
					<div className="table-row event-row">
						<div className="row-info">
							<div className="row-name">Hackathon Nasional KampusX</div>
							<div className="row-sub">Online · 1 Jun · 500 peserta</div>
						</div>
						<span className="status-pill s-boost">Boosted</span>
					</div>
					<div className="table-row event-row">
						<div className="row-info">
							<div className="row-name">Seminar AI untuk Mahasiswa</div>
							<div className="row-sub">Unpad · 3 Jun · 80 tiket</div>
						</div>
						<span className="status-pill s-review">Review</span>
					</div>
					<div className="table-row event-row">
						<div className="row-info">
							<div className="row-name">Lomba Esai Kebangsaan</div>
							<div className="row-sub">UPI · 10 Jun · Gratis</div>
						</div>
						<span className="status-pill s-active">Aktif</span>
					</div>
				</div>

				{/* Panel: Keamanan Pengguna */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-shield" aria-hidden="true"></i> Keamanan Pengguna
						</div>
						<span className="view-all">Kelola</span>
					</div>
					<div className="user-section">
						<div className="user-row">
							<div className="avatar av-coral">BW</div>
							<div className="row-info">
								<div className="row-name">Budi Wijaya</div>
								<div className="row-sub">Penipuan tiket · Laporkan ×3</div>
							</div>
							<span className="status-pill s-suspended">Suspended</span>
							<i
								className="ti ti-dots-vertical"
								style={{ cursor: 'pointer', color: '#9ca3af' }}
								aria-hidden="true"
							></i>
						</div>
						<div className="user-row">
							<div className="avatar av-blue">LM</div>
							<div className="row-info">
								<div className="row-name">Lesti Maharani</div>
								<div className="row-sub">Multi-account fraud</div>
							</div>
							<span className="status-pill s-banned">Banned</span>
							<i
								className="ti ti-dots-vertical"
								style={{ cursor: 'pointer', color: '#9ca3af' }}
								aria-hidden="true"
							></i>
						</div>
						<div className="user-row">
							<div className="avatar av-teal">AG</div>
							<div className="row-info">
								<div className="row-name">Anisa Gunawan</div>
								<div className="row-sub">Akun normal</div>
							</div>
							<span className="status-pill s-active">Aktif</span>
							<i
								className="ti ti-dots-vertical"
								style={{ cursor: 'pointer', color: '#9ca3af' }}
								aria-hidden="true"
							></i>
						</div>
					</div>
				</div>

				{/* Panel: Audit Log Sistem */}
				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">
							<i className="ti ti-list-search" aria-hidden="true"></i> Audit Log
							Sistem
						</div>
						<span className="view-all">Ekspor</span>
					</div>
					<div className="audit-row">
						<div className="audit-dot dot-green"></div>
						<div>
							<div className="audit-text">
								Organizer <strong>Rizky Aditya</strong> disetujui oleh admin@kampusx
							</div>
							<div className="audit-time">Hari ini, 09:42</div>
						</div>
					</div>
					<div className="audit-row">
						<div className="audit-dot dot-blue"></div>
						<div>
							<div className="audit-text">
								Event <strong>Hackathon Nasional</strong> mendapat status Boosted
							</div>
							<div className="audit-time">Hari ini, 09:15</div>
						</div>
					</div>
					<div className="audit-row">
						<div className="audit-dot dot-red"></div>
						<div>
							<div className="audit-text">
								Akun <strong>Lesti Maharani</strong> di-ban · alasan: multi-account
							</div>
							<div className="audit-time">Kemarin, 18:30</div>
						</div>
					</div>
					<div className="audit-row">
						<div className="audit-dot dot-amber"></div>
						<div>
							<div className="audit-text">
								Wallet disbursement <strong>Rp 2.400.000</strong> ke BEM FT Unpad
							</div>
							<div className="audit-time">Kemarin, 14:05</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboardPage;
