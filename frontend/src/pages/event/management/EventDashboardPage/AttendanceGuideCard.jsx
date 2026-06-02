import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	QrCode,
	Link2,
	ScanLine,
	ChevronDown,
	ChevronUp,
	ArrowRight,
	Wifi,
	MapPin,
	Blend,
} from 'lucide-react';

/**
 * AttendanceGuideCard
 * Menampilkan panduan cara mengkonfirmasi kehadiran peserta,
 * disesuaikan berdasarkan tipe event (offline / online / hybrid).
 *
 * Props:
 *  - eventId   {string|number}  ID event untuk navigasi
 *  - eventType {string}         'offline' | 'online' | 'hybrid' (default: 'offline')
 */
export default function AttendanceGuideCard({ eventId, eventType = 'offline' }) {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);

	const isOnline   = eventType === 'online';
	const isOffline  = eventType === 'offline';
	const isHybrid   = eventType === 'hybrid';

	// ─── Konfigurasi per tipe event ────────────────────────────────────────────
	const EVENT_TYPE_META = {
		offline: {
			icon: <MapPin size={15} />,
			label: 'Event Tatap Muka',
			color: '#0369a1',
			bg: '#e0f2fe',
		},
		online: {
			icon: <Wifi size={15} />,
			label: 'Event Online',
			color: '#7c3aed',
			bg: '#ede9fe',
		},
		hybrid: {
			icon: <Blend size={15} />,
			label: 'Event Hybrid',
			color: '#065f46',
			bg: '#d1fae5',
		},
	};
	const meta = EVENT_TYPE_META[eventType] ?? EVENT_TYPE_META.offline;

	// ─── Metode kehadiran berdasarkan tipe ─────────────────────────────────────
	const METHODS = {
		qr_scanner: {
			id: 'qr',
			icon: <ScanLine size={20} color="#0369a1" />,
			iconBg: '#e0f2fe',
			title: 'Scanner QR (Offline)',
			desc: 'Panitia men-scan QR tiket peserta menggunakan halaman Scanner. Peserta perlu menunjukkan tiket digital mereka.',
			cta: 'Buka Pos Scanner',
			ctaPath: `/organizer/${eventId}/event-dashboard/check-in`,
			steps: [
				'Buka halaman Event POS → atur Stasiun Scanner.',
				'Panitia login ke halaman Scanner menggunakan PIN event.',
				'Peserta menunjukkan QR tiket → panitia scan → kehadiran tercatat otomatis.',
			],
		},
		magic_link: {
			id: 'link',
			icon: <Link2 size={20} color="#7c3aed" />,
			iconBg: '#ede9fe',
			title: 'Magic Link (Online)',
			desc: 'Bagikan link check-in/out kepada peserta. Peserta mengklik link untuk mengkonfirmasi kehadiran mereka sendiri.',
			cta: 'Buat Link Presensi',
			ctaPath: `/organizer/${eventId}/event-dashboard/check-in`,
			steps: [
				'Buka Event POS → bagian "Link Presensi Online".',
				'Atur batas waktu kedaluwarsa, lalu klik "Buat Link" untuk Check-in & Check-out.',
				'Bagikan kedua link tersebut via WhatsApp, email, atau tampilkan di slide presentasi.',
				'Peserta klik link → login → kehadiran tercatat otomatis.',
			],
		},
	};

	// Tentukan metode mana yang ditampilkan
	const activeMethods = [];
	if (!isOnline) activeMethods.push(METHODS.qr_scanner);
	if (!isOffline) activeMethods.push(METHODS.magic_link);
	// Untuk pure offline, hanya QR. Untuk online: hanya link. Untuk hybrid: keduanya.
	if (isOffline && activeMethods.length === 0) activeMethods.push(METHODS.qr_scanner);

	return (
		<div
			style={{
				borderRadius: 12,
				border: '1px solid #E2E8F0',
				background: '#fff',
				overflow: 'hidden',
				marginBottom: 24,
			}}
		>
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<div
				style={{
					padding: '14px 20px',
					borderBottom: '1px solid #E2E8F0',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 16,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
					<div
						style={{
							width: 35,
							height: 35,
							borderRadius: 8,
							background: '#f0f9ff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<QrCode size={18} color="#0284c7" />
					</div>
					<div>
						<div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font)' }}>
							Cara Mengkonfirmasi Kehadiran Peserta
						</div>
						<div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontFamily: 'var(--font)' }}>
							Panduan metode presensi yang tersedia untuk event ini
						</div>
					</div>
				</div>

				{/* Event type badge */}
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 5,
							padding: '4px 10px',
							borderRadius: 99,
							background: meta.bg,
							color: meta.color,
							fontSize: 11,
							fontWeight: 600,
						}}
					>
						{meta.icon}
						{meta.label}
					</span>
					<button
						onClick={() => setExpanded((v) => !v)}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 28,
							height: 28,
							borderRadius: 7,
							border: '1px solid #E2E8F0',
							background: 'transparent',
							cursor: 'pointer',
							color: '#64748B',
						}}
						title={expanded ? 'Sembunyikan panduan' : 'Lihat panduan'}
					>
						{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
					</button>
				</div>
			</div>

			{/* ── Method Cards ──────────────────────────────────────────────── */}
			<div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
				{activeMethods.map((method) => (
					<div
						key={method.id}
						style={{
							border: '1px solid #E2E8F0',
							borderRadius: 10,
							overflow: 'hidden',
						}}
					>
						{/* Method header */}
						<div
							style={{
								padding: '12px 16px',
								display: 'flex',
								alignItems: 'flex-start',
								gap: 12,
								background: '#F8FAFC',
								borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
							}}
						>
							<div
								style={{
									width: 38,
									height: 38,
									borderRadius: 9,
									background: method.iconBg,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{method.icon}
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font)', marginBottom: 3 }}>
									{method.title}
								</div>
								<div style={{ fontSize: 12, color: '#64748B', fontFamily: 'var(--font)', lineHeight: 1.5 }}>
									{method.desc}
								</div>
							</div>
							<button
								onClick={() => navigate(method.ctaPath)}
								style={{
									flexShrink: 0,
									display: 'inline-flex',
									alignItems: 'center',
									gap: 6,
									fontSize: 12,
									fontWeight: 700,
									color: '#0369a1',
									background: '#e0f2fe',
									border: 'none',
									padding: '7px 13px',
									borderRadius: 8,
									cursor: 'pointer',
									whiteSpace: 'nowrap',
									transition: 'background 0.15s',
								}}
								onMouseEnter={(e) => (e.currentTarget.style.background = '#bae6fd')}
								onMouseLeave={(e) => (e.currentTarget.style.background = '#e0f2fe')}
							>
								{method.cta} <ArrowRight size={13} strokeWidth={2.5} />
							</button>
						</div>

						{/* Step-by-step (only when expanded) */}
						{expanded && (
							<ol
								style={{
									margin: 0,
									padding: '12px 16px 12px 36px',
									display: 'flex',
									flexDirection: 'column',
									gap: 8,
								}}
							>
								{method.steps.map((step, i) => (
									<li
										key={i}
										style={{
											fontSize: 12,
											color: '#334155',
											fontFamily: 'var(--font)',
											lineHeight: 1.6,
										}}
									>
										{step}
									</li>
								))}
							</ol>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
