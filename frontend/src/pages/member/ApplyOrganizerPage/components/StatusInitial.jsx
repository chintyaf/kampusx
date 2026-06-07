import React from 'react';
import { Award } from 'lucide-react';

const StatusInitial = ({ onStart }) => {
	return (
		<div className="text-center py-2 animate__animated animate__fadeIn">
			<div className="mb-3">
				<span
					className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
					style={{ width: 64, height: 64 }}
				>
					<Award size={32} />
				</span>
			</div>

			<h2 className="fw-bold mb-2" style={{ fontSize: 20, letterSpacing: '-0.5px' }}>
				Ajukan Sebagai Organizer
			</h2>
			<p
				className="text-secondary mx-auto mb-4"
				style={{ maxWidth: 440, fontSize: 13.5, lineHeight: 1.5 }}
			>
				Mulai buat event Anda sendiri, validasi kehadiran peserta dengan QR code,
				dan bagikan sertifikat digital otomatis.
			</p>

			<button
				className="btn btn-primary px-5 py-2 fw-semibold"
				style={{ borderRadius: 8, fontSize: 13.5 }}
				onClick={onStart}
			>
				Mulai Pengajuan
			</button>
		</div>
	);
};

export default StatusInitial;
