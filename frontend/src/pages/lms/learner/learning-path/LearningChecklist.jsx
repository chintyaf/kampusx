import React from 'react';

const LearningChecklist = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<h5 className="fw-bold mb-3" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
					What You'll Learn
				</h5>

				<div className="d-flex flex-column gap-2">
					{MOCK_LEARNING_PATH.learningObjectives.map((obj, i) => (
						<div key={i} className="d-flex align-items-start gap-2 small">
							<CheckCircle2
								size={16}
								className="flex-shrink-0 mt-1"
								style={{ color: '#028090' }}
							/>
							<span
								className="text-dark"
								style={{ lineHeight: 1.45, fontSize: '0.82rem' }}
							>
								{obj}
							</span>
						</div>
					))}
				</div>
			</Card>
		</>
	);
};

export default LearningChecklist;
