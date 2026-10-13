import React, { useState } from 'react';
import {
	CheckCircle2,
	Circle,
	PlayCircle,
	ChevronRight,
	Clock,
	HelpCircle,
	Award,
	XCircle,
} from 'lucide-react';

const QuizSidebarItem = ({
	item,
	isSelected = false,
	isDone = false,
	isPassed = true,
	score = null,
	onSelect,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	// Konfigurasi warna teks & status
	const DONE_TEXT_COLOR = '#475569';

	const getTitleColor = () => {
		if (isSelected) return 'var(--primary)';
		if (isDone) return DONE_TEXT_COLOR;
		return 'var(--text)';
	};

	const getStatusIcon = () => {
		if (isDone) {
			return isPassed ? (
				<CheckCircle2 size={18} style={{ color: 'var(--success-text)' }} />
			) : (
				<XCircle size={18} className="text-danger" />
			);
		}
		if (isSelected) {
			return <PlayCircle size={18} style={{ color: 'var(--primary)' }} />;
		}
		return <Circle size={18} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />;
	};

	return (
		<div
			onClick={onSelect}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="d-flex align-items-center justify-content-between px-2 py-3 position-relative"
			style={{
				cursor: 'pointer',
				fontFamily: 'var(--font)',
				backgroundColor: isSelected
					? 'var(--primary-light)'
					: isHovered
						? 'var(--bg-2)'
						: 'var(--white)',
				transition: 'all 0.15s ease',
				borderLeft: isSelected
					? 'var(--border-w-lg) solid var(--primary)'
					: 'var(--border-w-lg) solid transparent',
				borderBottom: 'var(--border-w-xs) solid var(--neutral-border)',
			}}
		>
			<div className="d-flex align-items-start gap-2 min-w-0 flex-grow-1 me-2">
				{/* Status Icon */}
				<div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

				{/* Content Details */}
				<div className="min-w-0 flex-grow-1">
					<div
						className={`mb-1 ${isSelected ? 'fw-bold' : isDone ? 'fw-normal' : 'fw-medium'}`}
						style={{
							color: getTitleColor(),
							fontSize: 'var(--font-xs)',
							lineHeight: '1.35',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{item.title}
					</div>

					{/* Metadata & Badges */}
					<div
						className="d-flex align-items-center gap-2 flex-wrap"
						style={{ fontSize: '11px', color: 'var(--text-muted)' }}
					>
						{/* Quiz Tag */}
						<span className="d-inline-flex align-items-center gap-1 text-capitalize">
							<HelpCircle size={13} style={{ color: 'var(--text-muted)' }} />
							<span>Kuis</span>
						</span>

						{/* Jumlah Soal */}
						{item.totalQuestions && (
							<>
								<span>•</span>
								<span>{item.totalQuestions} Soal</span>
							</>
						)}

						{/* Durasi */}
						{item.duration && (
							<>
								<span>•</span>
								<span className="d-inline-flex align-items-center gap-1">
									<Clock size={11} style={{ color: 'var(--text-muted)' }} />
									<span>{item.duration}</span>
								</span>
							</>
						)}

						{/* Badge Nilai/Skor jika sudah selesai */}
						{isDone && (score !== null || item.score !== undefined) && (
							<span
								className={`badge fw-semibold ms-1 ${
									isPassed
										? 'bg-success-subtle text-success'
										: 'bg-danger-subtle text-danger'
								}`}
								style={{
									fontSize: '9.5px',
									padding: '2px 6px',
									borderRadius: 'var(--radius-xs)',
								}}
							>
								Skor: {score ?? item.score}
							</span>
						)}

						{/* Badge Aktif */}
						{isSelected && !isDone && (
							<span
								className="badge fw-semibold ms-1"
								style={{
									backgroundColor: 'var(--primary-border)',
									color: 'var(--primary)',
									fontSize: '9.5px',
									padding: '2px 6px',
									borderRadius: 'var(--radius-xs)',
								}}
							>
								Aktif
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Chevron Icon */}
			<div className="flex-shrink-0" style={{ opacity: isSelected || isHovered ? 1 : 0.3 }}>
				<ChevronRight
					size={15}
					style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}
				/>
			</div>
		</div>
	);
};

export default QuizSidebarItem;
