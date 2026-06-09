import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { CheckCircle2 } from 'lucide-react';

const StatusApproved = ({ onBack, onManageEvents }) => {
	return (
		<div className="text-center py-4">
			{/* Bagian Icon */}
			<div className="mb-3">
				<span
					className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
					style={{ width: 64, height: 64 }}
				>
					<CheckCircle2 size={32} />
				</span>
			</div>

			{/* Judul & Deskripsi */}
			<h3 className="fw-bold mb-2" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
				Permohonan Disetujui
			</h3>
			<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 400, fontSize: 13.5 }}>
				Selamat! Akun Anda telah berhasil diverifikasi sebagai Penyelenggara Acara
				(Organizer).
			</p>

			{/* Tombol Aksi menggunakan Stack & Button React Bootstrap */}
			<Stack direction="horizontal" gap={2} className="justify-content-center">
				<Button
					variant="outline-secondary"
					className="px-3 py-2"
					style={{ borderRadius: 8, fontSize: 13 }}
					onClick={onBack}
				>
					Kembali
				</Button>
				<Button
					variant="primary"
					className="px-4 py-2 fw-semibold"
					style={{ borderRadius: 8, fontSize: 13 }}
					onClick={onManageEvents}
				>
					Mulai Kelola Acara
				</Button>
			</Stack>
		</div>
	);
};

export default StatusApproved;
