import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
	CheckCircle2,
	BookOpen,
	RotateCcw,
	ChevronDown,
	Video,
	FileText,
	HelpCircle,
	Brain,
	ArrowRight,
	Lock,
	LogIn,
} from 'lucide-react';

// ============================================================================
// 1. LESSON COMPONENTS
// ============================================================================

const LESSON_TYPE_CONFIG = {
	video: { icon: Video, className: 'bg-primary-subtle text-primary' },
	article: { icon: FileText, className: 'bg-info-subtle text-info' },
	quiz: { icon: HelpCircle, className: 'bg-warning-subtle text-warning' },
	reflection: { icon: Brain, style: { backgroundColor: '#F3E8FF', color: '#8B5CF6' } },
	default: { icon: FileText, className: 'bg-light text-secondary' },
};

const LessonIcon = ({ type }) => {
	const config = LESSON_TYPE_CONFIG[type] || LESSON_TYPE_CONFIG.default;
	const IconComponent = config.icon;

	return (
		<div
			className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${config.className || ''}`}
			style={{ width: '28px', height: '28px', ...config.style }}
		>
			<IconComponent size={15} />
		</div>
	);
};

export const LessonCard = ({ lesson, to, locked = false }) => {
	const isCompleted = !!lesson?.is_completed;

	const content = (
		<>
			<div className="d-flex align-items-center gap-3 min-w-0">
				<LessonIcon type={lesson?.type} />
				<span
					className={`fw-medium text-truncate ${
						isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'
					}`}
					style={{ fontSize: '14px' }}
				>
					{lesson?.title}
				</span>
			</div>
			<div className="d-flex align-items-center gap-2 flex-shrink-0">
				{lesson?.is_preview && !isCompleted && (
					<span className="badge bg-light text-muted border">Preview</span>
				)}
				{locked && <Lock size={14} className="text-muted" aria-label="Terkunci" />}
				{isCompleted && (
					<span
						className="d-inline-flex align-items-center gap-1 text-success fw-semibold"
						style={{ fontSize: '0.72rem' }}
					>
						<CheckCircle2 size={15} className="lms-pop-in" />
						Selesai
					</span>
				)}
			</div>
		</>
	);

	const className = `lms-lesson-item p-3 rounded-3 border d-flex align-items-center justify-content-between gap-2 shadow-sm-hover ${
		isCompleted ? '' : 'bg-white'
	}`;

	const completedStyle = isCompleted
		? { backgroundColor: '#F0FDF4', borderColor: '#A7F3D0' }
		: undefined;

	if (locked || !to) {
		return (
			<div className={`${className} opacity-75`} style={completedStyle}>
				{content}
			</div>
		);
	}

	return (
		<Link to={to} className={`${className} text-decoration-none`} style={completedStyle}>
			{content}
		</Link>
	);
};

// ============================================================================
// 2. MODULE COMPONENT
// ============================================================================

const ModuleCard = ({ module, pathId, slug, isAuthenticated = false, isExpanded, onToggle }) => {
	const location = useLocation();

	const lessons = module?.lessons ?? [];
	const totalLessons = module?.total_lessons ?? lessons.length;
	const completedLessons = module?.completed_lessons ?? 0;
	const progressPercent = module?.progress_percent ?? 0;

	const isCompleted = module?.status === 'completed';
	const isInProgress = module?.status === 'in_progress';

	// Mendukung prop `slug` maupun `pathId` sebagai parameter `:slug` di URL
	const pathSlug = slug ?? pathId;
	const moduleBasePath = `/learner/learning-paths/${pathSlug}/modules/${module?.id}`;

	const lessonPath = (lesson) => {
		switch (lesson?.type) {
			case 'forethought':
				return `${moduleBasePath}/forethought`;
			case 'quiz':
				return `${moduleBasePath}/quiz`;
			case 'reflection':
				return `${moduleBasePath}/reflection`;
			default:
				return `${moduleBasePath}/lessons/${lesson.id}`;
		}
	};

	// Lesson berikutnya di modul ini: yang belum selesai, atau yang pertama
	const nextLesson = lessons.find((l) => !l.is_completed) ?? lessons[0] ?? null;

	const actionLabel = isCompleted
		? 'Ulas Modul'
		: isInProgress
			? 'Lanjutkan Modul'
			: 'Mulai Modul';

	const circleStyle = {
		width: '38px',
		height: '38px',
		backgroundColor: isCompleted ? '#ECFDF5' : isInProgress ? '#E0F2FE' : '#F1F5F9',
		color: isCompleted ? '#059669' : isInProgress ? '#028090' : '#64748B',
		border: `1.5px solid ${isCompleted ? '#A7F3D0' : isInProgress ? '#BAE6FD' : '#E2E8F0'}`,
		fontSize: '0.9rem',
	};

	const actionClassName =
		'btn btn-primary btn-sm lms-btn-action fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 border-0 text-decoration-none';

	return (
		<div
			className={`lms-module-card rounded-3 border overflow-hidden ${
				isInProgress ? 'lms-module-active' : ''
			}`}
			style={
				isAuthenticated && isCompleted
					? { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }
					: undefined
			}
		>
			{/* Header Modul */}
			<div
				className="lms-card-header d-flex align-items-center justify-content-between gap-3 p-3 select-none"
				onClick={onToggle}
				role="button"
				aria-expanded={isExpanded}
			>
				<div className="d-flex align-items-center gap-3 min-w-0">
					<div
						className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 lms-icon-bubble"
						style={circleStyle}
					>
						{isCompleted ? (
							<CheckCircle2 size={20} className="text-success" />
						) : isInProgress ? (
							<RotateCcw
								size={18}
								className="lms-spin-slow"
								style={{ color: '#028090' }}
							/>
						) : (
							<BookOpen size={18} className="text-secondary" />
						)}
					</div>

					<div className="min-w-0">
						<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
							<span
								className="text-muted text-uppercase fw-bold"
								style={{ fontSize: '0.72rem' }}
							>
								Modul {module?.order_index}
							</span>
							{module?.difficulty_level && (
								<span
									className="badge bg-light text-muted border text-capitalize"
									style={{ fontSize: '0.65rem' }}
								>
									{module.difficulty_level}
								</span>
							)}
							{isAuthenticated && isCompleted && (
								<span
									className="badge bg-success-subtle text-success border border-success-subtle"
									style={{ fontSize: '0.65rem' }}
								>
									✓ Selesai
								</span>
							)}
							{isAuthenticated && isInProgress && (
								<span
									className="badge bg-info-subtle text-info border border-info-subtle"
									style={{ fontSize: '0.65rem' }}
								>
									Sedang berjalan
								</span>
							)}
						</div>

						<h5
							className="fw-bold mb-1 text-truncate lms-title"
							style={{ fontSize: '1rem' }}
						>
							{module?.title}
						</h5>

						<div className="text-muted small" style={{ fontSize: '0.75rem' }}>
							{isAuthenticated
								? `${completedLessons}/${totalLessons} lesson selesai`
								: `${totalLessons} lesson`}
							{isAuthenticated && progressPercent > 0 && ` • ${progressPercent}%`}
						</div>

						{/* Progress bar mini */}
						{isAuthenticated && totalLessons > 0 && (
							<div
								className="mt-2"
								style={{
									height: 4,
									background: '#E2E8F0',
									borderRadius: 999,
									maxWidth: 220,
								}}
							>
								<div
									style={{
										width: `${progressPercent}%`,
										height: '100%',
										borderRadius: 999,
										background: isCompleted ? '#059669' : '#028090',
										transition: 'width .4s ease',
									}}
								/>
							</div>
						)}
					</div>
				</div>

				<div className="text-muted d-flex align-items-center flex-shrink-0">
					<ChevronDown
						size={20}
						className={`lms-chevron ${isExpanded ? 'lms-chevron-expanded' : ''}`}
					/>
				</div>
			</div>

			{/* Detail Accordion */}
			<div className={`lms-accordion-content ${isExpanded ? 'lms-accordion-open' : ''}`}>
				<div>
					<div className="border-top bg-light p-4">
						{module?.description && (
							<p
								className="text-muted small mb-3 pt-1 lms-fade-in"
								style={{ lineHeight: 1.5 }}
							>
								{module.description}
							</p>
						)}

						{/* Learning outcomes (hanya jika berupa array) */}
						{Array.isArray(module?.learning_outcomes) &&
							module.learning_outcomes.length > 0 && (
								<ul className="small text-muted ps-3 mb-3">
									{module.learning_outcomes.map((outcome, idx) => (
										<li key={idx}>{outcome}</li>
									))}
								</ul>
							)}

						{/* Lesson Items */}
						<div className="d-flex flex-column gap-2 mb-3">
							{lessons.length === 0 && (
								<div className="text-muted small">Belum ada lesson.</div>
							)}
							{lessons.map((lesson) => {
								// Guest hanya bisa membuka lesson preview
								const locked = !isAuthenticated && !lesson.is_preview;
								return (
									<LessonCard
										key={lesson.id}
										lesson={lesson}
										locked={locked}
										to={lessonPath(lesson)}
									/>
								);
							})}
						</div>

						{/* Action */}
						{nextLesson && (
							<div className="d-flex justify-content-end pt-1">
								{isAuthenticated ? (
									<Link to={lessonPath(nextLesson)} className={actionClassName}>
										<span>{actionLabel}</span>
										<ArrowRight size={14} className="lms-btn-icon" />
									</Link>
								) : (
									<Link
										to="/login"
										state={{ from: location }}
										className={actionClassName}
									>
										<LogIn size={14} />
										<span>Login untuk Mulai</span>
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModuleCard;
