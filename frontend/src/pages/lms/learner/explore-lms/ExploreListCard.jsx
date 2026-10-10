import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Clock, Star, Bookmark, BookOpen, Layers3, Sparkles } from 'lucide-react';

const ExploreListCard = ({ item, isBookmarked, onToggleBookmark, onNavigate }) => {
	const [imgError, setImgError] = useState(false);

	const isLearningPath = item?.type === 'learning_path';
	const isModule = item?.type === 'module';

	const typeLabel = isLearningPath ? 'Learning Path' : isModule ? 'Module' : 'Microlearning';

	// Bootstrap badge color mapping based on type
	const typeBadgeClass = isLearningPath
		? 'bg-primary text-white'
		: isModule
			? 'bg-dark text-white'
			: 'bg-secondary text-white';

	const actionLabel = isLearningPath
		? 'Mulai Path'
		: isModule
			? item?.isEnrolled
				? 'Lanjutkan'
				: 'Buka Modul'
			: 'Pelajari';

	const handleBookmark = (e) => {
		e.stopPropagation();
		if (onToggleBookmark) onToggleBookmark(e, item.id);
	};

	const handleNavigate = (e) => {
		e.stopPropagation();
		if (onNavigate) onNavigate(item);
	};

	return (
		<Card
			className="explore-card border border-secondary-subtle rounded-4 overflow-hidden shadow-sm hover-shadow cursor-pointer transition-all mb-3"
			onClick={handleNavigate}
		>
			<Row className="g-0 align-items-stretch h-100">
				{/* 1. THUMBNAIL AREA */}
				<Col xs={12} md={4} lg={3}>
					<div
						className="position-relative w-100 h-100 overflow-hidden bg-light"
						style={{ minHeight: '160px' }}
					>
						{item?.thumbnail && !imgError ? (
							<img
								src={item.thumbnail}
								alt={item.title}
								className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover card-img-hover"
								loading="lazy"
								onError={() => setImgError(true)}
							/>
						) : (
							<div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-primary-subtle text-primary opacity-75">
								{isLearningPath ? (
									<Layers3 size={32} />
								) : isModule ? (
									<BookOpen size={32} />
								) : (
									<Clock size={32} />
								)}
							</div>
						)}
						<span
							className={`position-absolute top-0 start-0 m-3 badge rounded-pill ${typeBadgeClass} shadow-sm px-3 py-2 fw-semibold`}
						>
							{typeLabel}
						</span>
					</div>
				</Col>

				{/* 2. CONTENT AREA */}
				<Col xs={12} md={5} lg={6}>
					<div className="d-flex flex-column justify-content-center h-100 p-3 p-md-4">
						{/* Badges / Category */}
						<div className="d-flex align-items-center flex-wrap gap-2 mb-2">
							{item?.category && (
								<span className="badge rounded-pill bg-body-tertiary text-secondary border px-2.5 py-1 fw-medium">
									{item.category}
								</span>
							)}

							{item?.level && (
								<span className="small text-muted fw-medium d-inline-flex align-items-center">
									<span className="me-1 opacity-50">•</span>
									{item.level}
								</span>
							)}

							{item?.aiRecommended && (
								<span className="badge rounded-pill bg-primary-subtle text-primary d-inline-flex align-items-center gap-1 px-2.5 py-1 fw-semibold">
									<Sparkles size={12} />
									AI Recommended
								</span>
							)}
						</div>

						{/* Title */}
						<h5 className="card-title fw-bold text-dark mb-2 text-clamp-2 card-title-hover">
							{item?.title}
						</h5>

						{/* Description */}
						{item?.description && (
							<p className="card-text text-secondary small mb-3 text-clamp-2">
								{item.description}
							</p>
						)}

						{/* Metadata */}
						<div className="d-flex align-items-center flex-wrap gap-3 small text-muted">
							{item?.rating != null && (
								<span className="d-inline-flex align-items-center gap-1 fw-semibold text-dark">
									<Star size={13} className="text-warning fill-warning" />
									{item.rating}
								</span>
							)}

							{item?.durationLabel && (
								<span className="d-inline-flex align-items-center gap-1">
									<Clock size={13} />
									{item.durationLabel}
								</span>
							)}

							{isLearningPath && item?.moduleCount != null && (
								<span className="d-inline-flex align-items-center gap-1">
									<Layers3 size={13} />
									{item.moduleCount} Modul
								</span>
							)}

							{isModule && item?.lessonCount != null && (
								<span className="d-inline-flex align-items-center gap-1">
									<BookOpen size={13} />
									{item.lessonCount} Lesson
								</span>
							)}
						</div>
					</div>
				</Col>

				{/* 3. ACTIONS AREA */}
				<Col xs={12} md={3} lg={3}>
					<div className="d-flex flex-row-reverse flex-md-column align-items-center align-items-md-end justify-content-between h-100 p-3 p-md-4 pt-0 pt-md-4">
						<button
							type="button"
							className={`btn btn-sm ${
								isBookmarked
									? 'btn-primary-subtle text-primary border-primary-subtle'
									: 'btn-outline-secondary border-secondary-subtle'
							} rounded-3 p-0 d-inline-flex align-items-center justify-content-center`}
							onClick={handleBookmark}
							aria-label={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
							title={isBookmarked ? 'Tersimpan' : 'Simpan'}
							style={{ width: '36px', height: '36px' }}
						>
							<Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
						</button>

						<Button
							type="button"
							className="btn btn-primary w-100 w-md-auto rounded-3 py-2 px-3 fw-semibold fs-7"
							onClick={handleNavigate}
						>
							{actionLabel}
						</Button>
					</div>
				</Col>
			</Row>
		</Card>
	);
};

export default ExploreListCard;
