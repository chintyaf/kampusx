import React from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { Compass, Layers, Zap, Bookmark, Clock, ArrowRight } from 'lucide-react';

const ExploreGridCard = ({ item, isBookmarked, onToggleBookmark, onNavigate }) => {
	const isLearningPath = item.type === 'learning_path';
	const isModule = item.type === 'module';
	const isLesson = item.type === 'lesson';

	const handleBookmark = (e) => {
		e.stopPropagation();
		onToggleBookmark(e, item.id);
	};

	const handleNavigate = (e) => {
		e.stopPropagation();
		onNavigate(item);
	};

	return (
		<Card
			className={`explore-grid-card h-100 border rounded-3 overflow-hidden p-0 ${
				isLearningPath ? 'is-learning-path' : ''
			}`}
			onClick={() => onNavigate(item)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' && e.target === e.currentTarget) {
					onNavigate(item);
				}
			}}
		>
			{/* Thumbnail */}
			<div className="position-relative overflow-hidden bg-light explore-card-thumb">
				<img
					src={item.thumbnail}
					alt={item.title}
					className="w-100 h-100 object-fit-cover d-block"
					loading="lazy"
				/>

				{/* Content type badge */}
				<div className="position-absolute top-0 start-0 p-2">
					{isLearningPath && (
						<span
							className="btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all"
							style={{
								backgroundColor: 'var(--bahama-blue-50)',
								borderColor: 'var(--bahama-blue-200)',
								color: 'var(--bahama-blue-700)',
							}}
						>
							<Compass size={13} />
							Learning Path
						</span>
					)}

					{isModule && (
						<span
							className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition`}
							style={{
								backgroundColor: 'var(--purple-bg)',
								borderColor: 'var(--purple-border-color)',
								color: 'var(--purple-text)',
							}}
						>
							<Layers size={13} />
							Modul
						</span>
					)}

					{isLesson && (
						<span
							className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all`}
							style={{
								backgroundColor: 'var(--warning-bg)',
								borderColor: 'var(--warning-border)',
								color: 'var(--warning-text)',
							}}
						>
							<Zap size={13} />
							Microlearning
						</span>
					)}
				</div>

				{/* Bookmark */}
				<button
					type="button"
					className={`position-absolute top-0 end-0 m-2 btn btn-light rounded-circle border p-0 d-inline-flex align-items-center justify-content-center explore-bookmark-btn ${
						isBookmarked
							? 'bg-primary-subtle text-primary border-primary-subtle'
							: 'text-secondary'
					}`}
					onClick={handleBookmark}
					title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan bookmark'}
					aria-label={isBookmarked ? 'Hapus dari bookmark' : 'Simpan bookmark'}
					aria-pressed={isBookmarked}
				>
					<Bookmark
						size={18}
						strokeWidth={1.8}
						fill={isBookmarked ? 'currentColor' : 'none'}
					/>
				</button>
			</div>

			{/* Card body */}
			<Card.Body className="d-flex flex-column justify-content-between p-3 gap-3">
				<div>
					{/* Title */}
					<h3 className="h6 fw-bold text-body mb-2 explore-clamp-2" title={item.title}>
						{item.title}
					</h3>

					{/* Description */}
					<p className="small text-muted mb-0 explore-clamp-2">{item.description}</p>
				</div>

				{/* Metadata and CTA */}
				<div className="d-flex flex-column gap-2 mt-auto">
					{/* Learning Path metadata */}
					{isLearningPath && (
						<div className="d-flex align-items-center justify-content-between gap-2 py-2 small text-muted">
							<span>
								<strong className="text-body fw-semibold">
									{item.moduleCount ?? 0}
								</strong>{' '}
								Modul
								<span className="mx-1">·</span>
								<strong className="text-body fw-semibold">
									{item.lessonCount ?? 0}
								</strong>{' '}
								Lesson
							</span>
							<span className="d-inline-flex align-items-center gap-1">
								<Clock size={13} className="text-primary" />
								{item.durationLabel}
							</span>
						</div>
					)}

					{/* Module metadata */}
					{isModule && (
						<div className="py-2 small text-muted">
							{item.isEnrolled ? (
								<div>
									<div className="d-flex align-items-center justify-content-between gap-2 mb-1">
										<span className="text-primary fw-semibold">
											Sedang Dipelajari
										</span>
										<strong className="text-body fw-bold">
											{item.progressPercent ?? 0}%
										</strong>
									</div>
									<ProgressBar
										now={Math.min(100, Math.max(0, item.progressPercent ?? 0))}
										className="explore-progress-bar"
										aria-label={`Progres modul ${item.progressPercent ?? 0}%`}
									/>
								</div>
							) : (
								<div className="d-flex align-items-center justify-content-between gap-2">
									<span>
										<strong className="text-body fw-semibold">
											{item.lessonCount ?? 0}
										</strong>{' '}
										Lesson
										<span className="mx-1">·</span>
										{item.level}
									</span>
									<span className="d-inline-flex align-items-center gap-1">
										<Clock size={13} className="text-primary" />
										{item.durationLabel}
									</span>
								</div>
							)}
						</div>
					)}

					{/* Lesson metadata */}
					{isLesson && (
						<div className="d-flex align-items-center justify-content-between gap-2 py-2 small text-muted">
							<span className="d-inline-flex align-items-center gap-1">
								<Clock size={13} className="text-primary" />
								{item.durationLabel}
							</span>
						</div>
					)}

					{/* CTA */}
					{isLearningPath && (
						<Button
							variant="outline-primary"
							className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
							onClick={handleNavigate}
						>
							Mulai Path Belajar
							<ArrowRight size={15} />
						</Button>
					)}

					{isModule && (
						<Button
							variant="outline-primary"
							className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
							onClick={handleNavigate}
						>
							{item.isEnrolled ? 'Lanjutkan Modul' : 'Lihat Modul'}
							<ArrowRight size={15} />
						</Button>
					)}

					{isLesson && (
						<Button
							variant="outline-primary"
							className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
							onClick={handleNavigate}
						>
							<Zap size={14} />
							Pelajari Sekarang
						</Button>
					)}
				</div>
			</Card.Body>
		</Card>
	);
};

export default ExploreGridCard;
