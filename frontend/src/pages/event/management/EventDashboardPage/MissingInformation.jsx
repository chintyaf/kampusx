import React, { useState } from 'react';
import {
	Info,
	AlertTriangle,
	AlertCircle,
	ArrowRight,
	ChevronDown,
	ChevronUp,
	CheckCircle2,
} from 'lucide-react';

/**
 * MissingInformation — grouped by category, collapsed by default, showing HIGH items first.
 * Props:
 *   issues    {Array<{severity, category, message}>}
 *   onFix     {Function(issue)}
 *   highlight {boolean}
 */

const SEV_CFG = {
	HIGH: {
		Icon: AlertTriangle,
		color: '#dc2626',
		bg: '#fff5f5',
		border: '#fca5a5',
		label: 'Penting',
		sortOrder: 0,
	},
	MEDIUM: {
		Icon: AlertCircle,
		color: '#d97706',
		bg: '#fffbeb',
		border: '#fde68a',
		label: 'Perlu diisi',
		sortOrder: 1,
	},
	LOW: {
		Icon: Info,
		color: '#2563eb',
		bg: '#eff6ff',
		border: '#bfdbfe',
		label: 'Opsional',
		sortOrder: 2,
	},
};

function IssueRow({ issue, onFix }) {
	const cfg = SEV_CFG[issue.severity] || SEV_CFG.LOW;
	const { Icon } = cfg;
	return (
		<div
			style={{
				display: 'flex',
				gap: 12,
				alignItems: 'center',
				padding: '9px 14px',
				borderLeft: `3px solid ${cfg.color}`,
				background: cfg.bg,
				borderRadius: 7,
				border: `1px solid ${cfg.border}`,
			}}
		>
			<Icon size={14} color={cfg.color} strokeWidth={2} style={{ flexShrink: 0 }} />
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontSize: 12.5,
						fontWeight: 500,
						color: '#1e293b',
						lineHeight: 1.4,
						marginBottom: 3,
					}}
				>
					{issue.message}
				</div>
				<div style={{ display: 'flex', gap: 4 }}>
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							color: cfg.color,
							background: 'white',
							border: `1px solid ${cfg.border}`,
							padding: '1px 7px',
							borderRadius: 999,
						}}
					>
						{cfg.label}
					</span>
					<span
						style={{
							fontSize: 10,
							fontWeight: 600,
							color: '#64748b',
							background: 'white',
							border: '1px solid #e2e8f0',
							padding: '1px 7px',
							borderRadius: 999,
						}}
					>
						{issue.category}
					</span>
				</div>
			</div>
			{onFix && (
				<button
					onClick={() => onFix(issue)}
					style={{
						flexShrink: 0,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 4,
						fontSize: 11,
						fontWeight: 700,
						color: cfg.color,
						background: 'white',
						border: `1.5px solid ${cfg.border}`,
						padding: '5px 10px',
						borderRadius: 7,
						cursor: 'pointer',
						transition: 'background 0.15s',
						whiteSpace: 'nowrap',
					}}
					onMouseEnter={(e) => (e.currentTarget.style.background = cfg.bg)}
					onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
				>
					Perbaiki <ArrowRight size={11} strokeWidth={2.5} />
				</button>
			)}
		</div>
	);
}

export default function MissingInformation({ issues = [], onFix, highlight = false }) {
	const [showAll, setShowAll] = useState(false);

	if (!issues || issues.length === 0) return null;

	// Sort: HIGH first, then MEDIUM, LOW
	const sorted = [...issues].sort((a, b) => {
		const ao = SEV_CFG[a.severity]?.sortOrder ?? 99;
		const bo = SEV_CFG[b.severity]?.sortOrder ?? 99;
		return ao - bo;
	});

	const highCount = sorted.filter((i) => i.severity === 'HIGH').length;
	const medCount = sorted.filter((i) => i.severity === 'MEDIUM').length;

	// Only show first 4 items unless "show all" is toggled
	const PREVIEW_COUNT = 2;
	const visible = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);
	const hasMore = sorted.length > PREVIEW_COUNT;
	const hiddenCount = sorted.length - PREVIEW_COUNT;

	// Completion estimate
	const totalKnown = 11; // rough estimate of total required fields
	const completedEst = Math.max(0, totalKnown - issues.length);
	const completionPct = Math.round((completedEst / totalKnown) * 100);

	return (
		<>
			<div
				className="border bg-white rounded"
				style={{
					overflow: 'hidden',
					marginBottom: 24,
				}}
			>
				{/* Header */}
				<div
					className="d-flex align-items-center justify-content-between border-bottom"
					style={{
						padding: '14px 20px',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<div
							style={{
								width: 30,
								height: 30,
								borderRadius: 8,
								flexShrink: 0,
								background: '#fef3c7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Info size={15} color={highlight ? '#d97706' : '#64748b'} />
						</div>
						<div>
							<div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
								Data Belum Lengkap
							</div>
							<div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
								{issues.length} item perlu dilengkapi sebelum event dipublikasikan
							</div>
						</div>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						{highCount > 0 && (
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 4,
									fontSize: 11,
									fontWeight: 700,
									color: '#dc2626',
									background: '#fff5f5',
									border: '1.5px solid #fca5a5',
									padding: '3px 9px',
									borderRadius: 999,
								}}
							>
								<AlertTriangle size={10} strokeWidth={2.5} />
								{highCount} Penting
							</span>
						)}
						{medCount > 0 && (
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 4,
									fontSize: 11,
									fontWeight: 700,
									color: '#d97706',
									background: '#fffbeb',
									border: '1.5px solid #fde68a',
									padding: '3px 9px',
									borderRadius: 999,
								}}
							>
								{medCount} Perlu diisi
							</span>
						)}
					</div>
				</div>

				{/* Progress bar */}
				<div className="px-4 py-3">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<span className="fs-5 text-muted">Kelengkapan data event</span>
						<span className="fw-semibold fs-5">{completionPct}%</span>
					</div>
					<div style={{ background: '#e2e8f0', borderRadius: 99, height: 5 }}>
						<div
							style={{
								width: `${completionPct}%`,
								height: 5,
								borderRadius: 99,
								background: completionPct >= 60 ? '#22c55e' : '#f59e0b',
								transition: 'width 0.6s ease',
							}}
						/>
					</div>
				</div>

				{/* Issue list */}
				<div className="d-flex flex-column gap-3 px-4 pb-3">
					{visible.map((issue, i) => (
						<IssueRow key={i} issue={issue} onFix={onFix} />
					))}
				</div>

				{/* Show more / collapse */}
				{hasMore && (
					<div style={{ padding: '0 20px 14px' }}>
						<button
							onClick={() => setShowAll(!showAll)}
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
							{showAll ? (
								<>
									<ChevronUp size={14} /> Sembunyikan sebagian
								</>
							) : (
								<>
									<ChevronDown size={14} /> Lihat {hiddenCount} item lainnya
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</>
	);
}
