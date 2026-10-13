import React, { useState } from 'react';
import {
	CheckCircle2,
	Circle,
	PlayCircle,
	ChevronRight,
	Clock,
	FileText,
	Code2,
	HelpCircle,
	BookOpen,
	Video,
} from 'lucide-react';

const LessonSidebarItem = ({ item, isSelected, isDone, onSelect }) => {
	const [isHovered, setIsHovered] = useState(false);

	// Warna seimbang untuk item selesai (Cukup beda dari item aktif, tapi tetap tajam dibaca)
	const DONE_TEXT_COLOR = '#475569'; // Slate 600: Jelas & tajam dibaca, tapi lebih kalem dari teks biasa
	const DONE_META_COLOR = 'var(--text-muted)'; // Standard muted metadata

	// Pemetaan ikon tipe materi
	const renderTypeIcon = (type) => {
		const iconStyle = { color: 'var(--text-muted)' };
		switch (type?.toLowerCase()) {
			case 'video':
				return <Video size={13} style={iconStyle} />;
			case 'lab':
			case 'code':
				return <Code2 size={13} style={iconStyle} />;
			case 'quiz':
			case 'assessment':
				return <HelpCircle size={13} style={iconStyle} />;
			case 'reflection':
			case 'summary':
				return <BookOpen size={13} style={iconStyle} />;
			default:
				return <FileText size={13} style={iconStyle} />;
		}
	};

	// Helper warna teks judul: Active > Done (Slate 600) > Default
	const getTitleColor = () => {
		if (isSelected) return 'var(--primary)';
		if (isDone) return DONE_TEXT_COLOR;
		return 'var(--text)';
	};

	// Helper warna ikon status CheckCircle2: Active > Done (Hijau Success) > Default
	const getCheckIconColor = () => {
		if (isSelected) return 'var(--primary)';
		if (isDone) return 'var(--success-text)';
		return 'var(--text-muted)';
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
				<div className="flex-shrink-0 mt-0.5">
					{isDone ? (
						<CheckCircle2 size={18} style={{ color: getCheckIconColor() }} />
					) : isSelected ? (
						<PlayCircle size={18} style={{ color: 'var(--primary)' }} />
					) : (
						<Circle size={18} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
					)}
				</div>

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

					<div
						className="d-flex align-items-center gap-2 flex-wrap"
						style={{ fontSize: '11px', color: 'var(--text-muted)' }}
					>
						{item.type && (
							<span className="d-inline-flex align-items-center gap-1 text-capitalize">
								{renderTypeIcon(item.type)}
								<span>{item.type}</span>
							</span>
						)}

						{item.duration && (
							<>
								<span>•</span>
								<span className="d-inline-flex align-items-center gap-1">
									<Clock size={11} style={{ color: 'var(--text-muted)' }} />
									<span>{item.duration}</span>
								</span>
							</>
						)}

						{/* Badge Aktif */}
						{isSelected && (
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

export default LessonSidebarItem;
