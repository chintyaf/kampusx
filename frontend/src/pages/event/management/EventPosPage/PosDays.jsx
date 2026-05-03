import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Layers, Calendar, ToggleRight, ToggleLeft } from 'lucide-react';

const PosDays = () => {
	// State default berdasarkan gambar
	const [daysData, setDaysData] = useState([
		{
			id: 1,
			code: 'D1',
			name: 'Hari 1',
			date: 'Senin, 18 Agu 2025',
			activePosCount: 2,
			isActive: true,
		},
		{
			id: 2,
			code: 'D2',
			name: 'Hari 2',
			date: 'Selasa, 19 Agu 2025',
			activePosCount: 3,
			isActive: true,
		},
		{
			id: 3,
			code: 'D3',
			name: 'Hari 3',
			date: 'Rabu, 20 Agu 2025',
			activePosCount: 2,
			isActive: false,
		},
	]);

	// Fungsi untuk mengubah status aktif/nonaktif
	const toggleDayStatus = (id) => {
		setDaysData((prev) =>
			prev.map((day) => (day.id === id ? { ...day, isActive: !day.isActive } : day)),
		);
	};

	const activeDaysCount = daysData.filter((d) => d.isActive).length;

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			{/* ── Info Banner ────────────────────────────────────────────── */}
			<div
				style={{
					backgroundColor: '#f0f9ff',
					border: '1px solid #bae6fd',
					borderRadius: '8px',
					padding: '16px 20px',
					display: 'flex',
					gap: '12px',
					color: '#0369a1',
					fontSize: '0.9rem',
					lineHeight: '1.5',
				}}>
				<Layers size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
				<div>
					Hari yang <strong>aktif</strong> akan muncul sebagai pilihan di aplikasi scanner
					panitia. Sistem secara default mendeteksi hari berdasarkan tanggal hari ini —
					kamu bisa override manual untuk keperluan <em>testing</em> atau jika acara
					mengalami perubahan jadwal.
				</div>
			</div>

			{/* ── List Hari ──────────────────────────────────────────────── */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				{daysData.map((day) => (
					<div
						key={day.id}
						style={{
							border: day.isActive ? '1.5px solid #bae6fd' : '1.5px solid #e2e8f0',
							borderRadius: '12px',
							padding: '20px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							backgroundColor: '#ffffff',
							transition: 'all 0.2s ease',
						}}>
						{/* Kiri: Info Hari */}
						<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
							{/* Kotak Kode (D1, D2, dst) */}
							<div
								style={{
									width: '52px',
									height: '52px',
									backgroundColor: day.isActive ? '#e0f2fe' : '#f8fafc',
									border: day.isActive
										? '1px solid #bae6fd'
										: '1px solid #e2e8f0',
									color: day.isActive ? '#0284c7' : '#64748b',
									borderRadius: '10px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 700,
									fontSize: '1.1rem',
								}}>
								{day.code}
							</div>

							{/* Teks Detail */}
							<div>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '10px',
										marginBottom: '6px',
									}}>
									<h6
										style={{
											margin: 0,
											fontWeight: 600,
											color: '#0f172a',
											fontSize: '1.05rem',
										}}>
										{day.name}
									</h6>
									{day.isActive && (
										<span
											style={{
												backgroundColor: '#e0f2fe',
												color: '#0284c7',
												fontSize: '0.7rem',
												padding: '3px 8px',
												borderRadius: '6px',
												fontWeight: 700,
												letterSpacing: '0.05em',
											}}>
											AKTIF
										</span>
									)}
								</div>
								<div
									style={{
										color: '#64748b',
										fontSize: '0.85rem',
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
										marginBottom: '4px',
									}}>
									<Calendar size={14} /> {day.date}
								</div>
								<div style={{ color: '#64748b', fontSize: '0.85rem' }}>
									{day.activePosCount} pos aktif pada hari ini
								</div>
							</div>
						</div>

						{/* Kanan: Tombol Aksi */}
						<div>
							<Button
								variant="light"
								onClick={() => toggleDayStatus(day.id)}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									borderRadius: '8px',
									fontSize: '0.9rem',
									fontWeight: 500,
									padding: '8px 16px',
									boxShadow: 'none',
									transition: 'all 0.2s',
									backgroundColor: day.isActive ? '#f0f9ff' : '#ffffff',
									color: day.isActive ? '#0284c7' : '#64748b',
									border: day.isActive
										? '1px solid #bae6fd'
										: '1px solid #cbd5e1',
								}}>
								{day.isActive ? (
									<ToggleRight size={18} />
								) : (
									<ToggleLeft size={18} />
								)}
								{day.isActive ? 'Nonaktifkan' : 'Aktifkan'}
							</Button>
						</div>
					</div>
				))}
			</div>

			{/* ── Footer Summary ─────────────────────────────────────────── */}
			<div
				style={{
					border: '1px solid #e2e8f0',
					borderRadius: '12px',
					padding: '16px 20px',
					backgroundColor: '#ffffff',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					color: '#64748b',
					fontSize: '0.9rem',
				}}>
				<div>
					<strong style={{ color: '#0f172a' }}>
						{activeDaysCount} dari {daysData.length} hari
					</strong>{' '}
					aktif · Panitia dapat memilih {activeDaysCount} opsi hari di aplikasi scanner
				</div>

				{/* Indikator Bar */}
				<div style={{ display: 'flex', gap: '6px' }}>
					{daysData.map((d) => (
						<div
							key={`indicator-${d.id}`}
							style={{
								width: '28px',
								height: '6px',
								borderRadius: '3px',
								backgroundColor: d.isActive ? '#334155' : '#e2e8f0',
								transition: 'background-color 0.3s ease',
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default PosDays;
