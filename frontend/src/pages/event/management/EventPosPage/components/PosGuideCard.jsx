import React, { useState } from 'react';
import {
	BookOpen,
	ScanLine,
	Link2,
	Smartphone,
	Users,
	QrCode,
	ChevronDown,
	ChevronUp,
	CheckCircle,
	Circle,
} from 'lucide-react';

/**
 * PosGuideCard
 * Panduan step-by-step cara kerja sistem presensi di halaman Check-in / Event POS.
 * Menampilkan dua jalur: Scanner QR (offline) dan Magic Link (online).
 */
const PosGuideCard = () => {
	const [openSection, setOpenSection] = useState(null);

	const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

	const GUIDES = [
		{
			id: 'scanner',
			icon: <ScanLine size={17} color="#0369a1" />,
			iconBg: '#e0f2fe',
			accentColor: '#0369a1',
			accentBg: '#dbeafe',
			title: 'Presensi via Scanner QR',
			subtitle: 'Cocok untuk event tatap muka / offline',
			steps: [
				{
					icon: <QrCode size={14} />,
					text: 'Buat minimal 1 Pos Scanner di bagian bawah.',
				},
				{
					icon: <Smartphone size={14} />,
					text: 'Panitia buka halaman Scanner di HP/browser & masukkan PIN event.',
				},
				{
					icon: <Users size={14} />,
					text: 'Scan QR tiket digital peserta (dari aplikasi/email).',
				},
				{
					icon: <CheckCircle size={14} />,
					text: 'Kehadiran otomatis tercatat di Daftar Peserta.',
				},
			],
		},
		{
			id: 'magic_link',
			icon: <Link2 size={17} color="#7c3aed" />,
			iconBg: '#ede9fe',
			accentColor: '#7c3aed',
			accentBg: '#f5f3ff',
			title: 'Presensi via Magic Link',
			subtitle: 'Cocok untuk event online atau peserta jarak jauh',
			steps: [
				{
					icon: <Link2 size={14} />,
					text: 'Atur batas waktu & buat link Check-in/Check-out online.',
				},
				{
					icon: <Smartphone size={14} />,
					text: 'Bagikan link via WhatsApp, email, atau slide presentasi.',
				},
				{
					icon: <Users size={14} />,
					text: 'Peserta klik link & login untuk merekam kehadiran.',
				},
				{
					icon: <Link2 size={14} />,
					text: 'Bagikan link Check-out di akhir acara untuk mencatat kepulangan.',
				},
				{
					icon: <CheckCircle size={14} />,
					text: 'Pantau status kehadiran real-time di Daftar Peserta.',
				},
			],
		},
	];

	return (
		<div
			style={{
				background: '#fff',
				border: '1px solid #E2E8F0',
				borderRadius: 12,
				overflow: 'hidden',
			}}
		>
			{/* ── Header ─────────────────────────────────────────── */}
			<div
				style={{
					padding: '14px 18px',
					borderBottom: '1px solid #E2E8F0',
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					background: '#FAFBFC',
				}}
			>
				<div
					style={{
						width: 34,
						height: 34,
						borderRadius: 8,
						background: '#FEF3C7',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<BookOpen size={17} color="#D97706" />
				</div>
				<div>
					<div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
						Cara Kerja Sistem Presensi
					</div>
					<div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
						Pilih metode yang sesuai dengan format event Anda
					</div>
				</div>
			</div>

			{/* ── Guide sections ──────────────────────────────────── */}
			<div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
				{GUIDES.map((guide) => {
					const isOpen = openSection === guide.id;
					return (
						<div
							key={guide.id}
							style={{
								border: `1px solid ${isOpen ? guide.accentColor + '40' : '#E2E8F0'}`,
								borderRadius: 10,
								overflow: 'hidden',
								transition: 'border-color 0.2s',
							}}
						>
							{/* Section toggle button */}
							<button
								onClick={() => toggle(guide.id)}
								style={{
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									padding: '11px 14px',
									background: isOpen ? guide.accentBg : '#F8FAFC',
									border: 'none',
									cursor: 'pointer',
									textAlign: 'left',
									transition: 'background 0.15s',
								}}
							>
								<div
									style={{
										width: 32,
										height: 32,
										borderRadius: 8,
										background: guide.iconBg,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
									}}
								>
									{guide.icon}
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											fontSize: 12.5,
											fontWeight: 700,
											color: '#0F172A',
											lineHeight: 1.3,
										}}
									>
										{guide.title}
									</div>
									<div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
										{guide.subtitle}
									</div>
								</div>
								<div style={{ flexShrink: 0, color: '#94A3B8' }}>
									{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
								</div>
							</button>

							{/* Steps list (collapsible) */}
							{isOpen && (
								<div
									style={{
										padding: '12px 14px 14px',
										background: '#fff',
										borderTop: `1px solid ${guide.accentColor}25`,
									}}
								>
									<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
										{guide.steps.map((step, idx) => (
											<div
												key={idx}
												style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
											>
												{/* Step number bubble */}
												<div
													style={{
														width: 22,
														height: 22,
														borderRadius: '50%',
														background: guide.accentColor,
														color: '#fff',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														fontSize: 10,
														fontWeight: 700,
														flexShrink: 0,
														marginTop: 1,
													}}
												>
													{idx + 1}
												</div>
												<div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1 }}>
													<span style={{ color: guide.accentColor, flexShrink: 0, marginTop: 2 }}>
														{step.icon}
													</span>
													<span
														style={{
															fontSize: 12,
															color: '#334155',
															lineHeight: 1.6,
														}}
													>
														{step.text}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* ── Footer note ─────────────────────────────────────── */}
			<div
				style={{
					padding: '10px 18px',
					borderTop: '1px solid #F1F5F9',
					background: '#FAFBFC',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
				}}
			>
				<CheckCircle size={13} color="#22C55E" />
				<span style={{ fontSize: 11, color: '#64748B' }}>
					Data kehadiran dari kedua metode tersinkron di satu tempat —{' '}
					<strong style={{ color: '#334155' }}>halaman Daftar Peserta</strong>.
				</span>
			</div>
		</div>
	);
};

export default PosGuideCard;
