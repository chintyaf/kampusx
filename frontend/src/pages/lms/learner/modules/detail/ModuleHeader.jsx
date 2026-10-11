import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Clock, BookOpen, Zap, Play, Bookmark, Share2, ChevronLeft } from 'lucide-react';

const ModuleHeader = ({ moduleData, handleNavigateToLesson, isBookmarked, setIsBookmarked }) => {
	if (!moduleData) return null;

	return (
		<section
			style={{
				backgroundColor: 'var(--color-bg-2)',
				color: 'var(--text)',
				padding: '1.75rem 0 2rem 0',
				borderBottom: 'var(--border-w-xs) solid var(--neutral-border)',
			}}
		>
			<div className="container">
				{/* Back Navigation */}
				<div
					className="d-flex align-items-center gap-2 mb-3"
					style={{ fontSize: 'var(--font-sm)' }}
				>
					<Link
						to="/learning"
						className="d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
						style={{ color: 'var(--primary)' }}
					>
						<ChevronLeft size={16} />
						<span>Kembali ke Learning Path</span>
					</Link>
					<span style={{ color: 'var(--text-muted)' }}>/</span>
					<span
						className="text-truncate fw-medium"
						style={{ color: 'var(--text-muted)', maxWidth: '300px' }}
					>
						{moduleData.title}
					</span>
				</div>

				<div className="row align-items-center g-4">
					{/* Left Column: Module Details */}
					<div className="col-lg-7">
						{/* Category Badge & Level */}
						<div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
							<span
								className="badge px-2 py-1 fw-bold d-inline-flex align-items-center gap-1"
								style={{
									backgroundColor: 'var(--bahama-blue-200)',
									color: 'var(--bahama-blue-700)',
									fontSize: 'var(--font-xs)',
									borderRadius: 'var(--radius-sm)',
									letterSpacing: '0.03em',
								}}
							>
								<Layers size={12} />
								<span>MODUL MICROLEARNING</span>
							</span>

							<span
								className="badge px-2 py-1 fw-semibold"
								style={{
									backgroundColor: 'var(--card)',
									color: 'var(--neutral-text)',
									border: 'var(--border-w-xs) solid var(--neutral-border)',
									fontSize: 'var(--font-xs)',
									borderRadius: 'var(--radius-sm)',
								}}
							>
								{moduleData.level}
							</span>
						</div>

						{/* Title with Left Accent Bar */}
						<div
							style={{
								borderLeft: 'var(--border-w-lg) solid var(--primary)',
								paddingLeft: '0.85rem',
								marginBottom: '0.75rem',
							}}
						>
							<h1
								className="fw-bold mb-0"
								style={{
									fontSize: 'clamp(1.35rem, 3vw, var(--font-xl))',
									color: 'var(--text)',
									letterSpacing: '-0.015em',
									lineHeight: 1.25,
								}}
							>
								{moduleData.title}
							</h1>
						</div>

						{/* High-Contrast Description */}
						<p
							className="mb-3"
							style={{
								fontSize: 'var(--font-sm)',
								color: 'var(--text)',
								lineHeight: 1.6,
								fontWeight: '450',
							}}
						>
							{moduleData.description}
						</p>

						{/* Metrics */}
						<div
							className="d-flex align-items-center gap-3 flex-wrap"
							style={{ fontSize: 'var(--font-sm)' }}
						>
							<span
								className="d-flex align-items-center gap-1 fw-bold"
								style={{ color: 'var(--text)' }}
							>
								<Clock size={15} style={{ color: 'var(--primary)' }} />
								{moduleData.duration} Estimasi
							</span>
							<span style={{ color: 'var(--text-muted)' }}>•</span>
							<span
								className="d-flex align-items-center gap-1 fw-bold"
								style={{ color: 'var(--text)' }}
							>
								<BookOpen size={15} style={{ color: 'var(--primary)' }} />
								{moduleData.totalLessons} Lesson Units
							</span>
							<span style={{ color: 'var(--text-muted)' }}>•</span>
							<span
								className="d-flex align-items-center gap-1 fw-bold"
								style={{ color: 'var(--warning-text)' }}
							>
								<Zap
									size={15}
									fill="var(--warning-text)"
									style={{ color: 'var(--warning-text)' }}
								/>
								+{moduleData.xpReward} XP Reward
							</span>
						</div>
					</div>

					{/* Right Column: Progress Card */}
					<div className="col-lg-5">
						<div
							className="p-3 p-md-4"
							style={{
								backgroundColor: 'var(--card)',
								border: 'var(--border-w-xs) solid var(--neutral-border)',
								borderRadius: 'var(--radius)',
								boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
							}}
						>
							{/* Progress Bar Header */}
							<div
								className="d-flex align-items-center justify-content-between mb-2"
								style={{ fontSize: 'var(--font-sm)' }}
							>
								<span style={{ color: 'var(--neutral-text)', fontWeight: '500' }}>
									Progres Modul:{' '}
									<strong style={{ color: 'var(--text)' }}>
										{moduleData.completedLessons}/{moduleData.totalLessons}{' '}
										Selesai
									</strong>
								</span>
								<span className="fw-bold" style={{ color: 'var(--primary)' }}>
									{moduleData.progressPercent}%
								</span>
							</div>

							{/* Progress Bar */}
							<div
								className="progress mb-3"
								style={{
									height: '7px',
									borderRadius: 'var(--radius-full)',
									backgroundColor: 'var(--neutral-bg)',
								}}
							>
								<div
									className="progress-bar"
									role="progressbar"
									style={{
										width: `${moduleData.progressPercent}%`,
										backgroundColor: 'var(--primary)',
										borderRadius: 'var(--radius-full)',
									}}
									aria-valuenow={moduleData.progressPercent}
									aria-valuemin="0"
									aria-valuemax="100"
								/>
							</div>

							{/* Primary CTA Button */}
							<button
								type="button"
								className="btn w-100 fw-bold py-2 mb-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
								style={{
									backgroundColor: 'var(--primary)',
									borderColor: 'var(--primary)',
									fontSize: 'var(--font-sm)',
									borderRadius: 'var(--radius-md)',
								}}
								onClick={() =>
									handleNavigateToLesson &&
									handleNavigateToLesson(moduleData.currentLessonId)
								}
							>
								<Play size={15} fill="currentColor" />
								<span>
									Lanjutkan ke Lesson{' '}
									{moduleData.currentLessonId?.replace('les-', '')}
								</span>
							</button>

							{/* Secondary Actions */}
							<div className="d-flex align-items-center gap-2">
								<button
									type="button"
									className="btn w-50 py-1 d-inline-flex align-items-center justify-content-center gap-1 fw-medium"
									style={{
										fontSize: 'var(--font-xs)',
										borderColor: isBookmarked
											? 'var(--warning-border)'
											: 'var(--neutral-border)',
										color: isBookmarked
											? 'var(--warning-text)'
											: 'var(--neutral-text)',
										backgroundColor: isBookmarked
											? 'var(--warning-bg)'
											: 'var(--card)',
										borderRadius: 'var(--radius-md)',
									}}
									onClick={() =>
										setIsBookmarked && setIsBookmarked(!isBookmarked)
									}
								>
									<Bookmark
										size={14}
										fill={isBookmarked ? 'var(--warning-text)' : 'none'}
									/>
									<span>{isBookmarked ? 'Tersimpan' : 'Bookmark'}</span>
								</button>

								<button
									type="button"
									className="btn w-50 py-1 d-inline-flex align-items-center justify-content-center gap-1 fw-medium"
									style={{
										fontSize: 'var(--font-xs)',
										borderColor: 'var(--neutral-border)',
										color: 'var(--neutral-text)',
										backgroundColor: 'var(--card)',
										borderRadius: 'var(--radius-md)',
									}}
									onClick={() => {
										if (navigator.clipboard) {
											navigator.clipboard.writeText(window.location.href);
											alert('Tautan modul berhasil disalin!');
										}
									}}
								>
									<Share2 size={14} />
									<span>Bagikan</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ModuleHeader;
