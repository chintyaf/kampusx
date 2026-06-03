import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { CheckCircle } from 'lucide-react';

const PublishReadyCard = () => {
	return (
		<div
			style={{
				background: 'white',
				border: '1px solid var(--success-border-color)',
				borderLeft: '4px solid #1D9E75',
				borderRadius: 12,
				padding: '1.25rem 1.5rem',
				display: 'flex',
				gap: 16,
				alignItems: 'flex-start',
			}}
			className="mb-4 fade-in"
		>
			<div
				style={{
					flexShrink: 0,
					width: 40,
					height: 40,
					borderRadius: '50%',
					background: '#5DCAA5',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CheckCircle size={20} color="#04342C" />
			</div>
			<div>
				<h5 className="publish-ready-title">Event Siap Dipublikasikan!</h5>
				<p className="publish-ready-desc">
					Semua sesi dan kelengkapan materi sudah diatur. Silakan <strong>Publish</strong>{' '}
					event ini agar peserta dapat melihatnya di halaman utama KampusX dan mulai
					mendaftar.
				</p>
			</div>
		</div>
	);
};

export default PublishReadyCard;
