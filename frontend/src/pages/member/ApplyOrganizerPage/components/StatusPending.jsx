import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { Clock } from 'lucide-react';

const StatusPending = ({ request, onBack }) => {
	return (
		<div className="text-center py-4">
			{/* Bagian Icon */}
			<div className="mb-3">
				<span
					className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning"
					style={{ width: 64, height: 64 }}
				>
					<Clock size={32} className="spin-slow" />
				</span>
			</div>

			{/* Judul & Deskripsi */}
			<h3 className="fw-bold mb-2" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
				Permohonan Sedang Ditinjau
			</h3>
			<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 400, fontSize: 13.5 }}>
				Tim kami sedang memverifikasi data Anda. Peninjauan biasanya membutuhkan waktu 1-2
				hari kerja.
			</p>

			{/* Detail Informasi menggunakan Stack dari React Bootstrap */}
			<div className="p-3 bg-light rounded-3 mx-auto mb-4" style={{ maxWidth: 360 }}>
				<Stack
					direction="horizontal"
					className="justify-content-between align-items-center mb-3"
					style={{ fontSize: 12.5 }}
				>
					<span className="text-secondary">Tanggal Pengajuan</span>
					<span className="fw-semibold text-dark">
						{request?.created_at ? request.created_at.split('T')[0] : '—'}
					</span>
				</Stack>

				<Stack
					direction="horizontal"
					className="justify-content-between align-items-center"
					style={{ fontSize: 12.5 }}
				>
					<span className="text-secondary">Status Verifikasi</span>
					<span className="fw-semibold text-warning">Pending Review</span>
				</Stack>
			</div>

			{/* Tombol menggunakan Button dari React Bootstrap */}
			<Button
				variant="outline-secondary"
				className="px-4 py-2"
				style={{ borderRadius: 8, fontSize: 13 }}
				onClick={onBack}
			>
				Kembali ke Dashboard
			</Button>
		</div>
	);
};

export default StatusPending;
