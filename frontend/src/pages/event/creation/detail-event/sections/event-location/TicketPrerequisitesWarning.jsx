import React from 'react';
import EventLayout from '@/layouts/EventLayout';

export default function TicketPrerequisitesWarning({ error, eventStatus, hasParticipants }) {
	const missingSteps = error?.missing_steps || [];
	const isTipeEventMissing = missingSteps.includes('tipe_event');
	const isLokasiMissing = missingSteps.includes('lokasi');
	const isSesiMissing = missingSteps.includes('sesi');

	return (
		<EventLayout
			title="Harga & Tipe Tiket"
			description="Konfigurasikan skema tiket, kapasitas, dan jadwal penjualan."
			prevPath="sesi"
			nextPath=""
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={false}
			isSaveDisabled={true}
		>
			<div className="d-flex align-items-center justify-content-center w-100 mt-2">
				<div
					className="d-flex flex-column p-4 p-md-5 w-100"
					style={{
						backgroundColor: '#fffdf5',
						border: '1.5px solid #fef3c7',
						borderRadius: '16px',
						boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
					}}
				>
					<div
						className="d-flex align-items-center justify-content-center mb-4"
						style={{
							backgroundColor: '#fef3c7',
							borderRadius: '12px',
							width: '64px',
							height: '64px',
							alignSelf: 'center'
						}}
					>
						<span style={{ fontSize: 30 }}>⚠️</span>
					</div>

					<h3 className="fs-3 fw-bold text-center mb-2" style={{ color: '#854d0e' }}>
						Tiket Belum Bisa Diisi
					</h3>
					<p className="text-center mb-4 fs-5" style={{ color: '#a16207', maxWidth: '500px', alignSelf: 'center' }}>
						Untuk dapat mengisi dan mengonfigurasi tiket, Anda wajib menyelesaikan langkah-langkah berikut terlebih dahulu:
					</p>

					<div className="d-flex flex-column gap-3 mx-auto" style={{ maxWidth: '400px', width: '100%' }}>
						{/* Step 1: Tipe Event */}
						<div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: isTipeEventMissing ? '#fef2f2' : '#f0fdf4', border: isTipeEventMissing ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
							<div className="d-flex align-items-center gap-3">
								<span style={{ fontSize: 20 }}>🏷️</span>
								<span className="fw-semibold" style={{ color: isTipeEventMissing ? '#991b1b' : '#166534' }}>Tipe Event</span>
							</div>
							<span className="fw-bold fs-5" style={{ color: isTipeEventMissing ? '#dc2626' : '#16a34a' }}>
								{isTipeEventMissing ? '❌ Belum diisi' : '✅ Selesai'}
							</span>
						</div>

						{/* Step 2: Lokasi */}
						<div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: isLokasiMissing ? '#fef2f2' : '#f0fdf4', border: isLokasiMissing ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
							<div className="d-flex align-items-center gap-3">
								<span style={{ fontSize: 20 }}>📍</span>
								<span className="fw-semibold" style={{ color: isLokasiMissing ? '#991b1b' : '#166534' }}>Lokasi / Tempat</span>
							</div>
							<span className="fw-bold fs-5" style={{ color: isLokasiMissing ? '#dc2626' : '#16a34a' }}>
								{isLokasiMissing ? '❌ Belum diisi' : '✅ Selesai'}
							</span>
						</div>

						{/* Step 3: Sesi */}
						<div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: isSesiMissing ? '#fef2f2' : '#f0fdf4', border: isSesiMissing ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
							<div className="d-flex align-items-center gap-3">
								<span style={{ fontSize: 20 }}>📅</span>
								<span className="fw-semibold" style={{ color: isSesiMissing ? '#991b1b' : '#166534' }}>Jadwal Sesi</span>
							</div>
							<span className="fw-bold fs-5" style={{ color: isSesiMissing ? '#dc2626' : '#16a34a' }}>
								{isSesiMissing ? '❌ Belum diisi' : '✅ Selesai'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</EventLayout>
	);
}
