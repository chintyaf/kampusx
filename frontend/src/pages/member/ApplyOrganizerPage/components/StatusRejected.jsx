import React from 'react';
import { Button, Stack, Alert } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';

const StatusRejected = ({ request, onBack, onResubmit }) => {
	return (
		<div className="text-center py-4">
			{/* Bagian Icon */}
			<div className="mb-3">
				<span
					className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger"
					style={{ width: 64, height: 64 }}
				>
					<ShieldAlert size={32} />
				</span>
			</div>

			{/* Judul Utama */}
			<h3 className="fw-bold mb-3" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
				Permohonan Belum Disetujui
			</h3>

			{/* Alasan Penolakan menggunakan Alert Danger */}
			{request?.rejection_reason && (
				<Alert
					variant="danger"
					className="mx-auto mb-4 text-start p-3 border-danger-subtle"
					style={{ maxWidth: 440, borderRadius: 8 }}
				>
					<h6 className="fw-bold mb-1" style={{ fontSize: 13 }}>
						Alasan Penolakan:
					</h6>
					<p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
						"{request.rejection_reason}"
					</p>
				</Alert>
			)}

			{/* Info Penolakan Permanen menggunakan Alert Light */}
			{!request?.can_resubmit && (
				<Alert
					variant="light"
					className="mx-auto mb-4 text-start p-3 border"
					style={{ maxWidth: 440, borderRadius: 8 }}
				>
					<Stack
						direction="horizontal"
						gap={2}
						className="text-danger fw-bold mb-1 align-items-center"
						style={{ fontSize: 13 }}
					>
						<ShieldAlert size={15} />
						<span>Penolakan Permanen</span>
					</Stack>
					<p className="text-secondary m-0" style={{ fontSize: 12, lineHeight: 1.5 }}>
						Silakan hubungi <strong>support@kampusx.com</strong> jika Anda merasa ini
						adalah kekeliruan.
					</p>
				</Alert>
			)}

			{/* Tombol Navigasi / Aksi menggunakan Stack & Button */}
			<Stack direction="horizontal" gap={2} className="justify-content-center">
				<Button
					variant="outline-secondary"
					className="px-3 py-2"
					style={{ borderRadius: 8, fontSize: 13 }}
					onClick={onBack}
				>
					Kembali
				</Button>

				{request?.can_resubmit && (
					<Button
						variant="primary"
						className="px-4 py-2 fw-semibold"
						style={{ borderRadius: 8, fontSize: 13 }}
						onClick={onResubmit}
					>
						Ajukan Ulang
					</Button>
				)}
			</Stack>
		</div>
	);
};

export default StatusRejected;
