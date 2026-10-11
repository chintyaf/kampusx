import React from 'react';

const LearningBadges = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 mb-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<div className="d-flex align-items-center justify-content-between mb-3">
					<h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
						Earnable Badges
					</h5>
					<span className="badge bg-light text-muted border small">3 Unlocked</span>
				</div>

				{/* 2x3 Grid Badges */}
				<Row className="g-2">
					{MOCK_LEARNING_PATH.badges.map((b, idx) => (
						<Col key={idx} xs={6}>
							<div
								className="p-2 rounded-3 border text-center d-flex flex-column align-items-center justify-content-center h-100"
								style={{
									backgroundColor: b.unlocked ? b.bg : '#F8FAFC',
									borderColor: b.unlocked ? b.color : '#E2E8F0',
									opacity: b.unlocked ? 1 : 0.65,
								}}
							>
								<div
									className="rounded-circle d-flex align-items-center justify-content-center mb-2"
									style={{
										width: '36px',
										height: '36px',
										backgroundColor: b.unlocked ? b.color : '#CBD5E1',
										color: '#FFFFFF',
									}}
								>
									<Award size={18} />
								</div>
								<div className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
									{b.name}
								</div>
								<div className="text-muted" style={{ fontSize: '0.68rem' }}>
									{b.unlocked ? 'Unlocked' : 'Locked'}
								</div>
							</div>
						</Col>
					))}
				</Row>
			</Card>
		</>
	);
};

export default LearningBadges;
