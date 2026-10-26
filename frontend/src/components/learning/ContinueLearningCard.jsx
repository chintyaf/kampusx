import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockContinueLearning } from '../../data/learningMockData';

/**
 * ContinueLearningCard
 * Displays the user's latest active microlearning module with thumbnail,
 * current lesson status, progress indicator, and action CTA.
 */
const ContinueLearningCard = ({ module = mockContinueLearning }) => {
	const {
		id = 'mod-arch-101',
		lessonId = 'lesson-4',
		title = 'Web Application Architecture & REST API Design',
		category = 'System Architecture',
		thumbnail,
		currentLesson = 'Lesson 4 of 8: Scalable Endpoints & Idempotency',
		progressPercent = 65,
		timeRemaining = '15 min remaining',
	} = module;

	// Generates /learner/mod-arch-101/lesson-4
	const continueUrl = `/learner/${id}/${lessonId}`;
	const catalogUrl = '/learner/catalog';

	return (
		<Card className="learning-card continue-card p-2 p-md-4 mb-4">
			<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
				<div className="d-flex align-items-center gap-2">
					<span
						className="badge bg-purple-subtle text-primary fw-semibold px-2.5 py-1.5 rounded-pill"
						style={{
							backgroundColor: 'var(--primary-purple-subtle)',
							color: 'var(--primary-purple)',
						}}
					>
						Resume Learning
					</span>
					<Badge bg="light" text="dark" className="border fw-medium">
						{category}
					</Badge>
				</div>
				<div className="d-flex align-items-center gap-1 text-muted small">
					<Clock size={14} />
					<span style={{ fontSize: '12px' }}>{timeRemaining}</span>
				</div>
			</div>

			<Row className="g-3 align-items-center">
				{/* Thumbnail Link */}
				<Col md={3}>
					<Link
						to={continueUrl}
						className="continue-card-img-wrapper d-block text-decoration-none"
					>
						<img
							src={
								thumbnail ||
								'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
							}
							alt={title}
							className="continue-card-img"
						/>
						<div className="continue-card-play-overlay">
							<div className="play-circle-btn">
								<Play size={20} fill="currentColor" />
							</div>
						</div>
					</Link>
				</Col>

				{/* Content & Actions */}
				<Col md={9}>
					<div className="d-flex flex-column h-100 justify-content-between">
						<div className="mb-3">
							<h4
								className="fw-bold mb-1"
								style={{ fontSize: '1rem', color: 'var(--text-dark)' }}
							>
								{title}
							</h4>
							<p
								className="text-muted small mb-2 d-flex align-items-center gap-1"
								style={{ fontSize: '12px' }}
							>
								{currentLesson}
							</p>
						</div>

						<div>
							{/* Progress bar */}
							<div className="d-flex align-items-center justify-content-between mb-1 small">
								<span className="text-muted fw-medium" style={{ fontSize: '12px' }}>
									Module Progress
								</span>
								<span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
									{progressPercent}% Completed
								</span>
							</div>
							<div
								className="progress mb-3"
								style={{
									height: '7px',
									borderRadius: '9999px',
									backgroundColor: '#e2e8f0',
								}}
							>
								<div
									className="progress-bar"
									role="progressbar"
									style={{
										width: `${progressPercent}%`,
										backgroundColor: 'var(--primary-purple)',
										borderRadius: '9999px',
									}}
									aria-valuenow={progressPercent}
									aria-valuemin="0"
									aria-valuemax="100"
								/>
							</div>

							{/* Actions */}
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
								<Button
									as={Link}
									to={continueUrl}
									variant="primary"
									className="d-inline-flex align-items-center gap-2 fw-semibold px-4 py-2 rounded-3 shadow-sm text-decoration-none"
									style={{
										backgroundColor: 'var(--primary-purple)',
										borderColor: 'var(--primary-purple)',
									}}
								>
									<Play size={16} fill="currentColor" />
									<span>Continue Learning</span>
								</Button>

								<Link
									to={catalogUrl}
									className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center gap-1"
								>
									<span>View All Modules</span>
									<ChevronRight size={14} />
								</Link>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</Card>
	);
};

export default ContinueLearningCard;
