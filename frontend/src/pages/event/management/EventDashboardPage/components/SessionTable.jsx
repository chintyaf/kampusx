import React, { useState } from 'react';
import { List } from 'lucide-react';

/**
 * SessionTable
 * Props:
 *   sessions {Array<{
 *     title, day, time, speaker, materialStatus:'uploaded'|'pending'|'not_required', prerequisite
 *   }>}
 */

const defaultSessions = [
	{
		title: 'Logic 101',
		day: 1,
		time: '09:00',
		speaker: 'Budi Santoso',
		materialStatus: 'uploaded',
		prerequisite: null,
	},
	{
		title: 'Introduction to Web Dev',
		day: 1,
		time: '11:00',
		speaker: 'Dewi Lestari',
		materialStatus: 'uploaded',
		prerequisite: 'Logic 101',
	},
	{
		title: 'Advanced OOP',
		day: 1,
		time: '13:00',
		speaker: 'Siti Aminah',
		materialStatus: 'pending',
		prerequisite: 'Logic 101',
	},
	{
		title: 'Database Design',
		day: 2,
		time: '15:00',
		speaker: 'Ahmad Rizki',
		materialStatus: 'uploaded',
		prerequisite: null,
	},
	{
		title: 'Q&A Session',
		day: 2,
		time: '17:00',
		speaker: null,
		materialStatus: 'not_required',
		prerequisite: null,
	},
];

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

export default function SessionTable({ sessions = defaultSessions, eventStatus, onAddSession }) {
	const [activeDay, setActiveDay] = useState('all');

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
			}}
		>
			{/* Header */}
			<div
			className='d-flex justify-content-between'
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
						Struktur Sesi &amp; Prerequisite
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
					style={{
						padding: '40px 20px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#fafafa',
						textAlign: 'center',
						borderTop: 'none',
					}}
				>
					<List size={32} style={{ color: '#94a3b8', marginBottom: 12, opacity: 0.6 }} />
					<span
						style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 4 }}
					>
						Belum ada sesi yang terdaftar
					</span>
					<span style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
						Silakan tambah sesi baru untuk event ini.
					</span>
					{onAddSession && (
						<button
							onClick={onAddSession}
							style={{
								fontSize: 12,
								fontWeight: 600,
								padding: '8px 16px',
								background: 'white',
								border: '1.5px solid #00699e',
								color: '#00699e',
								borderRadius: '6px',
								cursor: 'pointer',
								transition: 'background 0.15s, color 0.15s',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = '#00699e';
								e.currentTarget.style.color = 'white';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'white';
								e.currentTarget.style.color = '#00699e';
							}}
						>
							Tambah Sesi
						</button>
					)}
				</div>
			) : (
				/* Table */
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
						<thead>
							<tr>
								{[
									'Sesi',
									'Day',
									'Waktu',
									'Speaker',
									'Status Materi',
									'Prerequisite',
								].map((h) => (
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
										colSpan={6}
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
											className='fs-5 text-muted'
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
													<span style={{ color: 'var(--text-muted)' }} className='fst-italic'>Tidak ada speaker</span>
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
											<td
												style={{
													padding: '10px 16px',
													borderBottom: '0.5px solid var(--border)',
												}}
											>
												{s.prerequisite ? (
													<span className="tag tag-primary">
														{s.prerequisite}
													</span>
												) : (
													<span style={{ color: 'var(--text-muted)' }}>
														-
													</span>
												)}
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
