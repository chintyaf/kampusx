import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	ChevronDown,
	ChevronUp,
	ClipboardList,
} from 'lucide-react';

export default function EventChecklist({ checklist = [], eventId }) {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);

	// Filter item yang wajib
	const activeItems = checklist.filter((item) => item.required !== false);

	if (activeItems.length === 0) return null;

	const completedCount = activeItems.filter((item) => item.completed).length;
	const pendingCount = activeItems.length - completedCount;
	const readyPercentage =
		activeItems.length > 0 ? Math.round((completedCount / activeItems.length) * 100) : 100;

	// Urutkan item: yang belum selesai di atas, yang sudah selesai di bawah
	const sortedItems = [...activeItems].sort((a, b) => {
		if (a.completed === b.completed) return 0;
		return a.completed ? 1 : -1;
	});

	// Logika untuk tampilan compact
	const INITIAL_LIMIT = 3;
	const visibleItems = isExpanded ? sortedItems : sortedItems.slice(0, INITIAL_LIMIT);
	const hasMore = sortedItems.length > INITIAL_LIMIT;
	const hiddenCount = sortedItems.length - INITIAL_LIMIT;

	return (
		<div
			className="bg-white"
			style={{
				borderRadius: '12px',
				border: '1px solid #E2E8F0',
				overflow: 'hidden',
				marginBottom: '24px',
			}}
		>
			{/* Header Style (Identik dengan MissingInformation) */}
			<div
				className="d-flex align-items-center justify-content-between"
				style={{
					padding: '16px 20px',
					borderBottom: '1px solid #E2E8F0',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
					<div
						style={{
							width: 35,
							height: 35,
							borderRadius: 8,
							flexShrink: 0,
							background: '#fef3c7',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<ClipboardList size={18} color="#D97706" />
					</div>
					<div>
						<div
							style={{
								fontSize: '14px',
								fontWeight: 700,
								color: '#0F172A',
								fontFamily: 'var(--font)',
							}}
						>
							Persiapan Sebelum Event
						</div>
						<div
							style={{
								fontSize: '12px',
								color: '#64748B',
								marginTop: '2px',
								fontFamily: 'var(--font)',
							}}
						>
							{pendingCount > 0
								? `${pendingCount} item perlu dilengkapi`
								: 'Semua persiapan telah selesai'}
						</div>
					</div>
				</div>
			</div>

			{/* Progress Bar Section */}
			<div style={{ padding: '16px 20px' }}>
				<div className="d-flex justify-content-between align-items-center mb-2">
					<span style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 500 }}>
						Progres persiapan event
					</span>
					<span className="fs-5 text-muted fw-semibold">{readyPercentage}%</span>
				</div>
				<div style={{ background: '#E2E8F0', borderRadius: '99px', height: '6px' }}>
					<div
						style={{
							width: `${readyPercentage}%`,
							height: '5px',
							borderRadius: '99px',
							background: readyPercentage === 100 ? '#22C55E' : '#F59E0B',
							transition: 'width 0.6s ease',
						}}
					/>
				</div>
			</div>

			{/* Checklist Items */}
			<div className="d-flex flex-column gap-3" style={{ padding: '0 20px 20px' }}>
				{visibleItems.map((item) => (
					<div
						key={item.id}
						style={{
							display: 'flex',
							gap: '12px',
							alignItems: 'flex-start',
							borderLeft: item.completed ? '3px solid #22C55E' : '3px solid #D97706', // Aksen garis kiri
							background: item.completed ? '#F8FAFC' : '#FFFBEB',
							borderRadius: 7,
							border: item.completed ? '1px solid #E2E8F0' : '1px solid #e8c66b',
							padding: '10px 14px',
						}}
					>
						{item.completed ? (
							<CheckCircle2
								size={18}
								color="#22C55E"
								strokeWidth={2.5}
								style={{ flexShrink: 0, marginTop: 2 }}
							/>
						) : (
							<AlertCircle
								size={18}
								color="#D97706"
								strokeWidth={2.5}
								style={{ flexShrink: 0, marginTop: 2 }}
							/>
						)}

						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									fontSize: '12px',
									fontWeight: 600,
									color: item.completed ? '#64748B' : '#1E293B',
									fontFamily: 'var(--font)',
									lineHeight: 1.4,
									marginBottom: item.hint ? 3 : 0,
									textDecoration: item.completed ? 'line-through' : 'none',
								}}
							>
								{item.label}
							</div>
							{item.hint && (
								<div
									style={{
										fontSize: '11px',
										color: '#94A3B8',
										fontFamily: 'var(--font)',
										lineHeight: 1.4,
									}}
								>
									{item.hint}
								</div>
							)}
						</div>

						{/* Action link if not completed */}
						{!item.completed ? (
							<button
								onClick={() => navigate(item.link)}
								style={{
									flexShrink: 0,
									display: 'inline-flex',
									alignItems: 'center',
									gap: '6px',
									fontSize: '12px',
									fontWeight: 700,
									color: '#D97706',
									background: 'white',
									border: '1.5px solid #e8c66b',
									padding: '6px 12px',
									borderRadius: '8px',
									cursor: 'pointer',
									transition: 'background 0.15s',
									whiteSpace: 'nowrap',
									marginTop: 1,
								}}
								onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFBEB')}
								onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
							>
								Lengkapi <ArrowRight size={13} strokeWidth={2.5} />
							</button>
						) : (
							<span
								style={{
									fontSize: '11px',
									fontWeight: 700,
									color: '#166534',
									background: 'white',
									border: '1px solid #BBF7D0',
									padding: '4px 10px',
									borderRadius: '999px',
									whiteSpace: 'nowrap',
									flexShrink: 0,
									marginTop: 1,
								}}
							>
								✓ Selesai
							</span>
						)}
					</div>
				))}
			</div>

			{/* Tombol Tampilkan/Sembunyikan (Identik dengan MissingInformation black button) */}
			{hasMore && (
				<div style={{ padding: '0 20px 20px' }}>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 5,
							width: '100%',
							padding: '8px',
							borderRadius: 8,
							background: '#f8fafc',
							border: '1px dashed #cbd5e1',
							fontSize: 12,
							fontWeight: 600,
							color: '#475569',
							cursor: 'pointer',
							transition: 'all 0.15s',
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
						onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
					>
						{isExpanded ? (
							<>
								<ChevronUp size={16} strokeWidth={2} /> Sembunyikan sebagian
							</>
						) : (
							<>
								<ChevronDown size={16} strokeWidth={2} /> Lihat {hiddenCount} item
								lainnya
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}
