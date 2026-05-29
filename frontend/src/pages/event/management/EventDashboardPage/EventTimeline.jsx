import React from 'react';
import { Card } from 'react-bootstrap';
import { Activity, Check } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const defaultSteps = [
	{ label: 'Draft', date: '29 May 2026', status: 'done' },
	{ label: 'Published', date: 'Menunggu', status: 'pending' },
	{ label: 'Registrasi', date: 'Terkunci', status: 'pending' },
	{ label: 'Hari Acara', date: '28 Jun 2026', status: 'pending' },
	{ label: 'Selesai', date: '29 Jun 2026', status: 'pending' },
];

const DOT_SIZE = 24;

// Komponen untuk Dot / Ikon Status
function StepIcon({ status }) {
	if (status === 'done') {
		return (
			<div
				className="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle position-relative"
				style={{
					width: DOT_SIZE,
					height: DOT_SIZE,
					zIndex: 1,
					boxShadow: '0 0 0 3px rgba(13, 110, 253, 0.15)',
				}}
			>
				<Check size={14} strokeWidth={3} />
			</div>
		);
	}

	if (status === 'active') {
		return (
			<>
				<style>{`
          @keyframes tlPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>
				<div className="position-relative" style={{ zIndex: 1 }}>
					<div
						className="bg-primary position-absolute rounded-circle"
						style={{
							inset: -4,
							opacity: 0.3,
							animation: 'tlPulse 2s ease-in-out infinite',
						}}
					/>
					<div
						className="bg-white border border-primary d-flex align-items-center justify-content-center rounded-circle position-relative"
						style={{ width: DOT_SIZE, height: DOT_SIZE, borderWidth: '2px !important' }}
					>
						<div
							className="bg-primary rounded-circle"
							style={{ width: 8, height: 8 }}
						/>
					</div>
				</div>
			</>
		);
	}

	// Status Pending
	return (
		<div
			className="bg-light border d-flex align-items-center justify-content-center rounded-circle position-relative"
			style={{ width: DOT_SIZE, height: DOT_SIZE, zIndex: 1, borderColor: '#dee2e6' }}
		>
			<div
				className="rounded-circle"
				style={{ width: 8, height: 8, backgroundColor: '#adb5bd' }}
			/>
		</div>
	);
}

export default function EventTimeline({ steps = defaultSteps }) {
	return (
		<Card className="p-0 mb-4 border">
			{/* Header Card dengan React Bootstrap */}
			<Card.Header className="bg-transparent px-4 py-3 d-flex align-items-center gap-2">
				<Activity size={16} className="text-primary" />
				<span className="fw-bold" style={{ fontSize: '0.9rem', color: '#333' }}>
					Timeline Event
				</span>
			</Card.Header>

			{/* Body Card untuk Stepper */}
			<Card.Body className="overflow-auto my-2">
				<div
					className="d-flex align-items-start w-100"
					style={{ minWidth: `${steps.length * 100}px` }}
				>
					{steps.map((step, i) => {
						const isLast = i === steps.length - 1;
						const isDone = step.status === 'done';
						const isActive = step.status === 'active';

						return (
							<div
								key={i}
								className="flex-fill d-flex flex-column align-items-center position-relative"
							>
								{/* Garis Penghubung (Kecuali step terakhir) */}
								{!isLast && (
									<div
										className="position-absolute"
										style={{
											top: DOT_SIZE / 2,
											left: '50%',
											right: '-50%',
											height: 2,
											zIndex: 0,
											backgroundColor: isDone ? '#0d6efd' : '#e9ecef', // Menggunakan warna primary default Bootstrap
										}}
									/>
								)}

								{/* Ikon Langkah */}
								<StepIcon status={step.status} />

								{/* Teks Label & Tanggal */}
								<div className="mt-2 text-center">
									<div
										className={`fw-semibold ${isActive || isDone ? 'text-dark' : 'text-muted'}`}
										style={{ fontSize: '0.85rem' }}
									>
										{step.label}
									</div>
									<div
										className={`mt-1 ${isActive ? 'text-primary fw-medium' : 'text-muted'}`}
										style={{ fontSize: '0.75rem' }}
									>
										{step.date}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</Card.Body>
		</Card>
	);
}
