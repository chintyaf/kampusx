import React from 'react';

const LearningAnalytics = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 mb-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<div className="d-flex align-items-center justify-content-between mb-3">
					<h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
						Learning Analytics & Progress
					</h5>
					<span className="badge bg-light text-muted border small">Live</span>
				</div>

				{/* Radial Progress Gauge */}
				<div className="d-flex align-items-center justify-content-center my-3">
					<div
						style={{
							position: 'relative',
							width: '120px',
							height: '120px',
						}}
					>
						<svg
							style={{
								transform: 'rotate(-90deg)',
								width: '100%',
								height: '100%',
							}}
						>
							<circle
								cx="60"
								cy="60"
								r={radius}
								fill="none"
								stroke="#E2E8F0"
								strokeWidth="8"
							/>
							<circle
								cx="60"
								cy="60"
								r={radius}
								fill="none"
								stroke="#028090"
								strokeWidth="8"
								strokeDasharray={circumference}
								strokeDashoffset={strokeDashoffset}
								strokeLinecap="round"
							/>
						</svg>
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								textAlign: 'center',
							}}
						>
							<div
								className="fw-bold text-dark"
								style={{ fontSize: '1.5rem', lineHeight: 1 }}
							>
								{MOCK_LEARNING_PATH.metrics.progressPercent}%
							</div>
							<div
								className="text-muted"
								style={{ fontSize: '0.68rem', fontWeight: 600 }}
							>
								COMPLETED
							</div>
						</div>
					</div>
				</div>

				<div className="text-center mb-3">
					<div className="fw-semibold text-dark small">
						{MOCK_LEARNING_PATH.metrics.completedModules} of{' '}
						{MOCK_LEARNING_PATH.metrics.moduleCount} Modules Finished
					</div>
					<div className="text-muted small">
						Average Quiz Score:{' '}
						<strong>{MOCK_LEARNING_PATH.metrics.averageQuizScore}/100</strong>
					</div>
				</div>

				{/* Learning Streak Card */}
				<div
					className="p-3 rounded-3 d-flex align-items-center gap-3 border"
					style={{
						background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
						borderColor: '#FED7AA',
					}}
				>
					<div
						className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
						style={{
							width: '40px',
							height: '40px',
							backgroundColor: '#EA580C',
							color: '#FFF',
						}}
					>
						<Flame size={20} fill="currentColor" />
					</div>
					<div>
						<div className="fw-bold text-dark small" style={{ color: '#C2410C' }}>
							🔥 5-Day Learning Streak!
						</div>
						<div className="text-muted" style={{ fontSize: '0.75rem' }}>
							Keep going — next milestone unlocked at 7 days.
						</div>
					</div>
				</div>
			</Card>
		</>
	);
};

export default LearningAnalytics;
