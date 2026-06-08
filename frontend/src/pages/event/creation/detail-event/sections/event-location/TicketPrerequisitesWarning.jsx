import React from 'react';
import { Alert } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import EventLayout from '@/layouts/EventLayout';

export default function TicketPrerequisitesWarning({ error, eventStatus, hasParticipants }) {
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
			<Alert
				className="d-flex align-items-center py-3 px-4 border"
				style={{
					backgroundColor: '#ffffffff', // Background kuning lembut agar menyatu
					borderColor: '#fde68a',     // Border kuning yang senada
					borderRadius: '12px'
				}}
			>
				<div
					className="d-flex align-items-center justify-content-center flex-shrink-0 me-3"
					style={{
						backgroundColor: '#fef3c7', // Background icon sedikit lebih gelap dari kotak utama
						borderRadius: '8px',
						width: '38px',
						height: '38px',
					}}
				>
					<AlertTriangle size={18} color="#b45309" />
				</div>

				<span
					className="mb-0 fw-medium"
					style={{
						color: '#854d0e', // Warna teks cokelat gelap agar terbaca jelas (accessibility)
						fontSize: '0.95rem'
					}}
				>
					Informasi sebelumnya belum diisi. Anda wajib melengkapi detail event, lokasi, dan jadwal sesi terlebih dahulu.
				</span>
			</Alert>
		</EventLayout>
	);
}