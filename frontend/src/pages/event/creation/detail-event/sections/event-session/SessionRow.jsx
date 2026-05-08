import React from 'react';
import { Dot, UserCircle } from 'lucide-react'; // Tambah icon UserCircle untuk fallback pembicara
import { Badge } from 'react-bootstrap';
import { calculateTotalDuration } from '@/utils/dateUtils';

const SessionRow = ({ session, selectedRow, onClick }) => {
	// 1. Cek jika data session tidak ada sama sekali
	if (!session) {
		return (
			<div className="session-card-row d-flex align-items-center py-2 px-3 rounded-2 border border-dashed text-muted justify-content-center">
				<small>Tidak ada data sesi tersedia</small>
			</div>
		);
	}

	// Variabel pengecekan waktu agar lebih rapi
	const hasTime = session.startTime && session.endTime;

	return (
		<div
			className={`session-card-row d-flex align-items-center py-2 px-3 rounded-2 ${selectedRow ? 'select' : ''} ${session.isHidden ? 'opacity-50' : ''}`}
			onClick={onClick}
		>
			{/* BAGIAN KIRI: Waktu dan Label */}
			<div className="d-flex align-items-center">
				<div className="d-flex align-items-center">
					{/* Ubah warna titik jika waktu kosong */}
					<Dot color={hasTime ? '#b07436' : '#adb5bd'} size={20} strokeWidth={5} />
					<span
						className={`text-secondary fs-5 text-nowrap ${!hasTime ? 'fst-italic opacity-75' : ''}`}
					>
						{hasTime
							? `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`
							: '--:-- - --:--'}
					</span>
				</div>
			</div>

			{/* BAGIAN TENGAH: Judul Sesi */}
			<div className="flex-grow-1 px-3 fs-4 text-truncate">
				{session.title ? (
					session.title
				) : (
					<span className="fst-italic text-muted opacity-75">Judul belum diisi</span>
				)}
			</div>

			{/* BAGIAN KANAN: Durasi dan Pembicara */}
			<div className="d-flex align-items-center gap-4">
				{/* Durasi */}
				<span className={`text-secondary fs-5 text-nowrap ${!hasTime ? 'opacity-50' : ''}`}>
					{/* Hindari kalkulasi error jika waktu tidak ada */}
					{hasTime ? calculateTotalDuration([session]) : '-'}
				</span>

				{/* Pembicara */}
				<div className="d-flex align-items-center gap-1">
					{session.speakers && session.speakers.length > 0 ? (
						// Jika ada data pembicara, petakan (map) gambarnya
						session.speakers.map((speaker, index) => (
								<img
								key={index}
								src={speaker.avatarUrl || speaker.avatar || `https://i.pravatar.cc/150?u=${speaker.id || index}`}
								alt={speaker.name || 'Speaker'}
								className="rounded-circle object-fit-cover bg-light"
								width="25"
								height="25"
								title={speaker.name}
							/>
						))
					) : (
						// Tampilan jika pembicara kosong
						<div
							className="d-flex align-items-center gap-1 text-muted opacity-75 fst-italic"
							style={{ fontSize: '0.85em' }}
						>
							<UserCircle size={18} strokeWidth={1.5} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SessionRow;
