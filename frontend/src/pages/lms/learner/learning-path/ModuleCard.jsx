import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
	CheckCircle2,
	Clock,
	BookOpen,
	RotateCcw,
	ChevronDown,
	Video,
	FileText,
	HelpCircle,
	Brain,
	ArrowRight,
} from 'lucide-react';

// ============================================================================
// 1. LESSON COMPONENTS
// ============================================================================

// Configuration lookup for cleaner code & scalable styles
const LESSON_TYPE_CONFIG = {
	video: {
		icon: Video,
		className: 'bg-primary-subtle text-primary',
	},
	article: {
		icon: FileText,
		className: 'bg-info-subtle text-info',
	},
	quiz: {
		icon: HelpCircle,
		className: 'bg-warning-subtle text-warning',
	},
	reflection: {
		icon: Brain,
		style: { backgroundColor: '#F3E8FF', color: '#8B5CF6' },
	},
	default: {
		icon: FileText,
		className: 'bg-light text-secondary',
	},
};

const LessonIcon = ({ type }) => {
	const config = LESSON_TYPE_CONFIG[type] || LESSON_TYPE_CONFIG.default;
	const IconComponent = config.icon;

	return (
		<div
			className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${config.className || ''}`}
			style={{
				width: '28px',
				height: '28px',
				...config.style,
			}}
		>
			<IconComponent size={15} />
		</div>
	);
};

export const LessonCard = ({ lesson }) => {
	return (
		<div className="lms-lesson-item p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-2 shadow-sm-hover">
			<div className="d-flex align-items-center gap-3 min-w-0">
				<LessonIcon type={lesson?.type} />
				<span
					className={`fw-medium text-truncate ${
						lesson?.completed ? 'text-decoration-line-through text-muted' : 'text-dark'
					}`}
                    style={{ fontSize : "14px" }}
				>
					{lesson?.title}
				</span>
			</div>
			<div className="d-flex align-items-center gap-2 flex-shrink-0">
				<span className="text-muted small">{lesson?.duration}</span>
				{lesson?.completed && (
					<CheckCircle2 size={15} className="text-success lms-pop-in" />
				)}
			</div>
		</div>
	);
};

// ============================================================================
// 2. MODULE COMPONENT
// ============================================================================
const ModuleCard = ({ module, isExpanded, onToggle }) => {
	const navigate = useNavigate();

	const isCompleted = module?.status === 'completed';
	const isInProgress = module?.status === 'in_progress';

	const circleStyle = {
		width: '38px',
		height: '38px',
		backgroundColor: isCompleted ? '#ECFDF5' : isInProgress ? '#E0F2FE' : '#F1F5F9',
		color: isCompleted ? '#059669' : isInProgress ? '#028090' : '#64748B',
		border: `1.5px solid ${isCompleted ? '#A7F3D0' : isInProgress ? '#BAE6FD' : '#E2E8F0'}`,
		fontSize: '0.9rem',
	};

	return (
		<div
			className={`lms-module-card rounded-3 border overflow-hidden ${
				isInProgress ? 'lms-module-active' : ''
			}`}
		>
			{/* Header Modul */}
			<div
				className="lms-card-header d-flex align-items-center justify-content-between gap-3 p-3 select-none"
				onClick={onToggle}
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
								Module {module?.number}
							</span>
						</div>

						<h5
							className="fw-bold mb-1 text-truncate lms-title"
							style={{ fontSize: '1rem' }}
						>
							{module?.title}
						</h5>

						<div
							className="d-flex align-items-center gap-3 text-muted small"
							style={{ fontSize: '0.75rem' }}
						>
							<span>{module?.lessonCount} Lessons</span>
							<span>•</span>
							<span className="d-flex align-items-center gap-1">
								<Clock size={12} />
								{module?.duration}
							</span>
						</div>
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
						<p
							className="text-muted small mb-3 pt-1 lms-fade-in"
							style={{ lineHeight: 1.5 }}
						>
							{module?.description}
						</p>

						{/* Lesson Items */}
						<div className="d-flex flex-column gap-2 mb-3">
							{module?.lessons?.map((les, idx) => (
								<LessonCard key={idx} lesson={les} />
							))}
						</div>

						{/* Action Button */}
						<div className="d-flex justify-content-end pt-1">
							<Button
								variant="primary"
								size="sm"
								className="lms-btn-action fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 border-0"
								onClick={() => navigate(`/learner/modules/${module?.id}`)}
							>
								<span>
									{isCompleted
										? 'Review Module'
										: isInProgress
											? 'Continue Module'
											: 'Start Module'}
								</span>
								<ArrowRight size={14} className="lms-btn-icon" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModuleCard;
