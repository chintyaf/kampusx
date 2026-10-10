import React from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar } from 'react-bootstrap';
import { Play, Clock, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockContinueLearning } from '../../data/learningMockData';

/**
 * ContinueLearningCard
 * Displays the user's latest active microlearning module with thumbnail,
 * current lesson status, progress indicator, and action CTA.
 */
const ContinueLearningCard = ({ module = mockContinueLearning }) => {
	const navigate = useNavigate();

	const {
		id = 'mod-1',
		title = 'Web Application Architecture & REST API Design',
		category = 'System Architecture',
		thumbnail,
		currentLesson = 'Lesson 4 of 8: Scalable Endpoints & Idempotency',
		progressPercent = 65,
		timeRemaining = '15 min remaining',
		instructor = 'Ir. Hendra Pratama, M.T.',
	} = module;

	const handleContinue = () => {
		// Navigate to module lesson or interactive player
		navigate(`/learner/modules/${id}`);
	};

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
				{/* Left: Thumbnail with Play Hover */}
				<Col md={3}>
					<div
						className="continue-card-img-wrapper"
						onClick={handleContinue}
						style={{ cursor: 'pointer' }}
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
					</div>
				</Col>

				{/* Right: Module Details & Action */}
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
							{/* <div className="small text-muted mb-3">
								Instructor:{' '}
								<span className="fw-medium text-dark">{instructor}</span>
							</div> */}
						</div>

						<div>
							{/* Progress and percentage */}
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

							{/* Action Button */}
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
								<Button
									variant="primary"
									className="btn btn-primary d-inline-flex align-items-center gap-2 fw-semibold px-4 py-2 rounded-3 shadow-sm"
									style={{
										backgroundColor: 'var(--primary-purple)',
										borderColor: 'var(--primary-purple)',
									}}
									onClick={handleContinue}
								>
									<Play size={16} fill="currentColor" />
									<span>Continue Learning</span>
								</Button>

								<button
									type="button"
									className="btn btn-link text-decoration-none text-muted p-0 small fw-semibold d-inline-flex align-items-center gap-1"
									onClick={() => navigate('/explore-microlearning')}
								>
									<span>View All Modules</span>
									<ChevronRight size={14} />
								</button>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</Card>
	);
};

export default ContinueLearningCard;
