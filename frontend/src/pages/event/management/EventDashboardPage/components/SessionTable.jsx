import React, { useState } from 'react';
import { useMemo } from 'react';
import { List } from 'lucide-react';

const statusConfig = {
	uploaded: { label: 'Uploaded', cls: 'tag-success' },
	pending: { label: 'Pending', cls: 'tag-warning' },
	not_required: { label: 'Not Required', cls: 'tag-neutral' },
};

const dayColors = {
	1: { bg: 'var(--primary-light)', color: 'var(--primary)' },
	2: { bg: '#fef3c7', color: '#92400e' },
	3: { bg: '#fce7f3', color: '#9d174d' },
};

export default function SessionTable({ sessions: rawSessionsData, eventStatus, onAddSession }) {
	const [activeDay, setActiveDay] = useState('all');

	// Flatten and format rawSessionsData inside component
	const sessions = useMemo(() => {
		if (!rawSessionsData) return [];

		// If it is already a flat list of sessions, return it directly
		if (Array.isArray(rawSessionsData)) {
			if (rawSessionsData.length === 0) return [];
			// Check if the items are day objects (which contain a nested sessions array)
			if (!rawSessionsData[0].hasOwnProperty('sessions')) {
				return rawSessionsData;
			}
		}

		const groupedDaysArray = Array.isArray(rawSessionsData)
			? rawSessionsData
			: Object.values(rawSessionsData);
		const fetchedSessions = [];

		groupedDaysArray.forEach((day, index) => {
			const dayNumber = day.day_number || index + 1;
			if (day.sessions && Array.isArray(day.sessions)) {
				day.sessions.forEach((s) => {
					const speakerNames =
						s.speakers && s.speakers.length > 0
							? s.speakers.map((spk) => spk.name).join(', ')
							: null;

					fetchedSessions.push({
						id: s.id,
						title: s.title || s.name,
						day: dayNumber,
						time:
							s.start_time && s.end_time
								? `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`
								: s.startTime && s.endTime
									? `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`
									: '',
						speaker: speakerNames,
						materialStatus: s.material_status || s.materialStatus || 'not_required',
					});
				});
			}
		});

		return fetchedSessions;
	}, [rawSessionsData]);

	const isEmpty = !sessions || sessions.length === 0;
	const days = isEmpty ? [] : [...new Set(sessions.map((s) => s.day))].sort();
	const filtered = isEmpty
		? []
		: activeDay === 'all'
			? sessions
			: sessions.filter((s) => s.day === activeDay);

	return (
		<div
			style={{
				background: 'var(--card)',
				border: '0.5px solid var(--border)',
				borderRadius: 'var(--radius)',
				marginBottom: 24,
				overflow: 'hidden',
				minHeight: 60,
			}}
		>
			{/* Header */}
			<div
				className="d-flex justify-content-between"
				style={{
					padding: '16px 20px 12px',
					borderBottom: '0.5px solid var(--border)',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 8,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<List size={15} color="var(--text-muted)" />
					<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
						Struktur Sesi Event
					</span>
				</div>
				{!isEmpty && (
					<div style={{ display: 'flex', gap: 6 }}>
						{['all', ...days].map((d) => (
							<button
								key={d}
								onClick={() => setActiveDay(d)}
								style={{
									fontSize: 11,
									padding: '4px 10px',
									borderRadius: 20,
									border: '0.5px solid',
									background:
										activeDay === d ? 'var(--primary-light)' : 'transparent',
									color: activeDay === d ? 'var(--primary)' : 'var(--text-muted)',
									borderColor:
										activeDay === d ? 'var(--primary-border)' : 'var(--border)',
									cursor: 'pointer',
									fontWeight: activeDay === d ? 600 : 400,
									transition: 'all 0.15s',
									fontFamily: 'var(--font)',
								}}
							>
								{d === 'all' ? 'Semua' : `Day ${d}`}
							</button>
						))}
					</div>
				)}
			</div>

			{isEmpty ? (
				<div
					className="d-flex flex-column align-items-center justify-content-center text-center p-5"
					style={{
						background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
						minHeight: '260px',
						fontFamily: 'var(--font)',
					}}
				>
					<div
						className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
						style={{ width: '64px', height: '64px' }}
					>
						<List size={30} className="text-white" />
					</div>
					<h5 className="fw-bold text-dark mb-1" style={{ fontSize: '15px' }}>
						Belum Ada Jadwal Sesi
					</h5>
					<p
						className="text-muted small mb-4"
						style={{ maxWidth: '350px', fontSize: '12px', lineHeight: 1.5 }}
					>
						Buat struktur sesi acara Anda sekarang agar peserta dapat melihat agenda
						kegiatan yang akan berlangsung.
					</p>
					{onAddSession && (
						<button
							onClick={onAddSession}
							style={{
								fontSize: 12,
								fontWeight: 700,
								padding: '8px 20px',
								background: 'var(--primary)',
								color: 'white',
								border: 'none',
								borderRadius: '20px',
								cursor: 'pointer',
								boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
								transition: 'all 0.15s ease',
								fontFamily: 'var(--font)',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.opacity = '0.9';
								e.currentTarget.style.transform = 'translateY(-1px)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.opacity = '1';
								e.currentTarget.style.transform = 'translateY(0)';
							}}
						>
							+ Tambah Sesi Pertama Anda
						</button>
					)}
				</div>
			) : (
				/* Table */
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
						<thead>
							<tr>
								{['Sesi', 'Day', 'Waktu', 'Speaker', 'Status Materi'].map((h) => (
									<th
										key={h}
										style={{
											background: '#f8fafc',
											color: 'var(--text-muted)',
											textAlign: 'left',
											padding: '10px 16px',
											fontWeight: 500,
											borderBottom: '0.5px solid var(--border)',
											whiteSpace: 'nowrap',
										}}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										style={{
											padding: '32px 16px',
											textAlign: 'center',
											color: 'var(--text-muted)',
											fontSize: 13,
											fontWeight: 500,
										}}
									>
										Tidak ada data
									</td>
								</tr>
							) : (
								filtered.map((s, i) => {
									const dc = dayColors[s.day] || dayColors[1];
									const sc =
										statusConfig[s.materialStatus] || statusConfig.not_required;
									return (
										<tr
											key={i}
											style={{ transition: 'background 0.1s' }}
											onMouseEnter={(e) =>
												(e.currentTarget.style.background = '#f8fafc')
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.background = 'transparent')
											}
										>
											<td
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
													fontWeight: 500,
													color: 'var(--text)',
												}}
											>
												{s.title}
											</td>
											<td
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
												}}
											>
												<span
													style={{
														fontSize: 10,
														padding: '2px 8px',
														borderRadius: 20,
														fontWeight: 600,
														background: dc.bg,
														color: dc.color,
													}}
												>
													Day {s.day}
												</span>
											</td>
											<td
												className="fs-5 text-muted"
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
													fontFamily: 'monospace',
												}}
											>
												{s.time}
											</td>
											<td
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
												}}
											>
												{s.speaker ? (
													s.speaker
												) : (
													<span
														style={{ color: 'var(--text-muted)' }}
														className="fst-italic"
													>
														Tidak ada speaker
													</span>
												)}
											</td>
											<td
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
												}}
											>
												<span className={`tag ${sc.cls}`}>{sc.label}</span>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
