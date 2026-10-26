import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
	PlayCircle,
	FileText,
	HelpCircle,
	Code,
	Brain,
	BookOpen,
	CheckCircle2,
	RotateCcw,
	Clock,
	Play,
} from 'lucide-react';

const LessonItem = ({ item, handleNavigateToLesson }) => {
	const isCompleted = item.status === 'completed';
	const isCurrent = item.status === 'current';
	const formatInfo = getFormatBadge(item.format);

	return (
		<div
			className="p-3 border"
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: isCurrent ? 'var(--bahama-blue-50)' : 'var(--card)',
				borderColor: isCurrent ? 'var(--primary-border)' : 'var(--neutral-border)',
				borderRadius: 'var(--radius)',
				boxShadow: isCurrent ? '0 3px 12px rgba(0, 105, 158, 0.08)' : 'none',
				transition: 'all 0.2s ease',
			}}
		>
			<div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
				{/* Left: Number, Status, Info */}
				<div className="d-flex align-items-start gap-2 min-w-0">
					{/* Status Icon Indicator */}
					<div
						className="d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
						style={{
							width: '32px',
							height: '32px',
							borderRadius: 'var(--radius-full)',
							backgroundColor: isCompleted
								? 'var(--success-bg)'
								: isCurrent
									? 'var(--bahama-blue-100)'
									: 'var(--neutral-bg)',
							color: isCompleted
								? 'var(--success-text)'
								: isCurrent
									? 'var(--primary)'
									: 'var(--text-muted)',
							border: `${'var(--border-w-xs)'} solid ${
								isCompleted
									? 'var(--success-border-color)'
									: isCurrent
										? 'var(--bahama-blue-200)'
										: 'var(--neutral-border)'
							}`,
						}}
					>
						{isCompleted ? (
							<CheckCircle2 size={18} style={{ color: 'var(--success-text)' }} />
						) : isCurrent ? (
							<PlayCircle size={18} style={{ color: 'var(--primary)' }} />
						) : (
							<Play size={14} style={{ color: 'var(--text-muted)' }} />
						)}
					</div>

					<div className="min-w-0">
						{/* Meta Badges */}
						<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
							<span
								className="px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1"
								style={{
									backgroundColor: formatInfo.bg,
									color: formatInfo.color,
									fontSize: 'var(--font-xs)',
									borderRadius: 'var(--radius-full)',
								}}
							>
								{formatInfo.icon}
								<span>{formatInfo.label}</span>
							</span>

							{item.duration && (
								<span
									className="d-flex align-items-center gap-1"
									style={{
										fontSize: 'var(--font-xs)',
										color: 'var(--text-muted)',
									}}
								>
									<Clock size={11} />
									<span>{item.duration}</span>
								</span>
							)}

							{item.xp && (
								<span
									style={{
										fontSize: 'var(--font-xs)',
										color: 'var(--text-muted)',
									}}
								>
									+{item.xp} XP
								</span>
							)}

							{/* Skor Kuis (Hanya tampil jika ada nilai kuis, tanpa badge status 'Selesai' yang menumpuk) */}
							{item.score && (
								<span
									className="badge fw-bold px-2 py-1"
									style={{
										fontSize: 'var(--font-xs)',
										backgroundColor: 'var(--success-bg)',
										color: 'var(--success-text)',
										borderRadius: 'var(--radius-full)',
										border: '1px solid var(--success-border-color)',
									}}
								>
									Skor: {item.score}
								</span>
							)}
						</div>

						{/* Title */}
						<h5
							className="fw-bold mb-1"
							style={{
								fontSize: 'var(--font-md)',
								lineHeight: 1.35,
								color: 'var(--text)',
							}}
						>
							Unit {item.number}: {item.title}
						</h5>

						{/* Summary description */}
						<p
							className="mb-0"
							style={{
								fontSize: 'var(--font-sm)',
								lineHeight: 1.4,
								color: 'var(--text-muted)',
							}}
						>
							{item.summary}
						</p>
					</div>
				</div>

				{/* Right: Action Button */}
				<div className="d-flex align-items-center gap-2 mt-2 mt-sm-0 flex-shrink-0 align-self-end align-self-sm-center">
					{isCompleted ? (
						<Button
							variant="outline-secondary"
							size="sm"
							className="px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
							style={{
								fontSize: 'var(--font-sm)',
								borderRadius: 'var(--radius-md)',
								borderColor: 'var(--neutral-border)',
								color: 'var(--neutral-text)',
							}}
							onClick={(e) => {
								e.stopPropagation();
								handleNavigateToLesson && handleNavigateToLesson(item.id);
							}}
						>
							<RotateCcw size={13} />
							<span>Ulangi</span>
						</Button>
					) : isCurrent ? (
						<Button
							as={Link}
							to={`/learner/lessons/${item.id}`}
							size="sm"
							className="px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm text-decoration-none"
							style={{
								backgroundColor: 'var(--primary)',
								borderColor: 'var(--primary)',
								color: 'var(--color-white)',
								fontSize: 'var(--font-sm)',
								borderRadius: 'var(--radius-md)',
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<Play size={13} fill="currentColor" />
							<span>Buka Unit</span>
						</Button>
					) : (
						<Button
							variant="outline-primary"
							size="sm"
							className="px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
							style={{
								borderColor: 'var(--primary)',
								color: 'var(--primary)',
								fontSize: 'var(--font-sm)',
								borderRadius: 'var(--radius-md)',
							}}
							onClick={(e) => {
								e.stopPropagation();
								handleNavigateToLesson && handleNavigateToLesson(item.id);
							}}
						>
							<Play size={12} />
							<span>Buka Unit</span>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

// ============================================================================
// HELPER: Format Badge Customizer (Disesuaikan dengan :root)
// ============================================================================
const getFormatBadge = (format) => {
	switch (format) {
		case 'video':
			return {
				icon: <PlayCircle size={14} style={{ color: 'var(--info-text)' }} />,
				label: 'Video',
				bg: 'var(--bahama-blue-100)',
				color: 'var(--bahama-blue-700)',
			};
		case 'article':
			return {
				icon: <FileText size={14} style={{ color: 'var(--info-text)' }} />,
				label: 'Artikel',
				bg: 'var(--info-bg)',
				color: 'var(--info-text)',
			};
		case 'quiz':
			return {
				icon: <HelpCircle size={14} style={{ color: 'var(--warning-text)' }} />,
				label: 'Kuis',
				bg: 'var(--warning-bg)',
				color: 'var(--warning-text)',
			};
		case 'code':
			return {
				icon: <Code size={14} style={{ color: 'var(--primary)' }} />,
				label: 'Code Lab',
				bg: 'var(--primary-light)',
				color: 'var(--primary)',
			};
		case 'reflection':
			return {
				icon: <Brain size={14} style={{ color: 'var(--purple-text)' }} />,
				label: 'Refleksi SRL',
				bg: 'var(--purple-bg)',
				color: 'var(--purple-text)',
			};
		default:
			return {
				icon: <BookOpen size={14} style={{ color: 'var(--neutral-text)' }} />,
				label: 'Materi',
				bg: 'var(--neutral-bg)',
				color: 'var(--neutral-text)',
			};
	}
};

export default LessonItem;
