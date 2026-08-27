import React from 'react';
import { Users, Calendar, CheckCircle2, Wallet } from 'lucide-react';

export const KpiMetrics = ({ totalAttendeesCount, activeEventsCount, checkInRate, totalRevenue }) => {
	// format price/revenue helper
	const formatRevenue = (val) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(val);
	};

	return (
		<div className="row g-3 mb-4">
			{/* Card 1: Total Pendaftar */}
			<div className="col-12 col-sm-6 col-lg-3">
				<div className="org-metric-card p-3 border bg-white rounded-3 shadow-xs d-flex flex-column justify-content-between h-100" style={{ borderColor: '#e2e8f0' }}>
					<div className="d-flex justify-content-between align-items-start mb-2">
						<span className="text-muted small fw-bold uppercase-label" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Pendaftar</span>
						<div className="metric-icon-box bg-blue-light text-blue-dark animate-pulse" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Users size={16} />
						</div>
					</div>
					<div>
						<h3 className="fw-bold text-dark mb-1" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>{totalAttendeesCount.toLocaleString('id-ID')}</h3>
						<small className="text-muted text-xs d-block mb-2">Akumulasi Registrasi Event</small>
						<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: '#f1f5f9' }}>
							<div className="progress-bar rounded-pill bg-primary" style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>

			{/* Card 2: Event Aktif */}
			<div className="col-12 col-sm-6 col-lg-3">
				<div className="org-metric-card p-3 border bg-white rounded-3 shadow-xs d-flex flex-column justify-content-between h-100" style={{ borderColor: '#e2e8f0' }}>
					<div className="d-flex justify-content-between align-items-start mb-2">
						<span className="text-muted small fw-bold uppercase-label" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Event Aktif</span>
						<div className="metric-icon-box bg-green-light text-green-dark" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Calendar size={16} />
						</div>
					</div>
					<div>
						<h3 className="fw-bold text-dark mb-1" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>{activeEventsCount}</h3>
						<small className="text-muted text-xs d-block mb-2">Berjalan & Mendatang</small>
						<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: '#f1f5f9' }}>
							<div className="progress-bar rounded-pill bg-success" style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>

			{/* Card 3: Tingkat Check-in */}
			<div className="col-12 col-sm-6 col-lg-3">
				<div className="org-metric-card p-3 border bg-white rounded-3 shadow-xs d-flex flex-column justify-content-between h-100" style={{ borderColor: '#e2e8f0' }}>
					<div className="d-flex justify-content-between align-items-start mb-2">
						<span className="text-muted small fw-bold uppercase-label" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Tingkat Check-in</span>
						<div className="metric-icon-box bg-amber-light text-amber-dark" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<CheckCircle2 size={16} />
						</div>
					</div>
					<div>
						<h3 className="fw-bold text-dark mb-1" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>{checkInRate}%</h3>
						<small className="text-muted text-xs d-block mb-2">Kehadiran Peserta Event</small>
						<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: '#f1f5f9' }}>
							<div className="progress-bar rounded-pill bg-warning" style={{ width: `${checkInRate}%` }} />
						</div>
					</div>
				</div>
			</div>

			{/* Card 4: Total Pendapatan */}
			<div className="col-12 col-sm-6 col-lg-3">
				<div className="org-metric-card p-3 border bg-white rounded-3 shadow-xs d-flex flex-column justify-content-between h-100" style={{ borderColor: '#e2e8f0' }}>
					<div className="d-flex justify-content-between align-items-start mb-2">
						<span className="text-muted small fw-bold uppercase-label" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Pendapatan</span>
						<div className="metric-icon-box bg-purple-light text-purple-dark" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Wallet size={16} />
						</div>
					</div>
					<div>
						<h3 className="fw-bold text-dark mb-1" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>{formatRevenue(totalRevenue)}</h3>
						<small className="text-muted text-xs d-block mb-2">Penjualan Tiket Acara</small>
						<div className="progress rounded-pill" style={{ height: '4px', backgroundColor: '#f1f5f9' }}>
							<div className="progress-bar rounded-pill" style={{ width: '100%', backgroundColor: '#8b5cf6' }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default KpiMetrics;
