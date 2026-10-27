import React from 'react';

const LearningOutcomes = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-3 p-md-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<h4 className="fw-bold mb-3" style={{ fontSize: '1.15rem', color: '#0B2545' }}>
					Apa yang Akan Kamu Kuasai
				</h4>

				<div className="d-flex flex-column gap-2 mb-4">
					{moduleData.learningOutcomes.map((out, idx) => (
						<div key={idx} className="d-flex align-items-start gap-2">
							<CheckCircle2 size={16} className="flex-shrink-0 mt-1 text-success" />
							<span
								className="text-dark small"
								style={{ fontSize: '0.85rem', lineHeight: 1.45 }}
							>
								{out}
							</span>
						</div>
					))}
				</div>

				<div className="pt-3 border-top">
					<h6
						className="fw-bold text-dark small text-uppercase mb-2"
						style={{ letterSpacing: '0.03em', fontSize: '0.75rem' }}
					>
						Prasyarat Pengetahuan (Prerequisites):
					</h6>
					<div className="d-flex gap-2 flex-wrap">
						{moduleData.prerequisites.map((pre, i) => (
							<span
								key={i}
								className="badge bg-light text-muted border px-3 py-1 rounded-pill"
								style={{ fontSize: '0.75rem' }}
							>
								• {pre}
							</span>
						))}
					</div>
				</div>
			</Card>
		</>
	);
};

export default LearningOutcomes;
