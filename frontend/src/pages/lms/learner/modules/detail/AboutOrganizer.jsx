import React from 'react';

const AboutOrganizer = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 mb-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<div
					className="fw-bold text-muted small text-uppercase mb-3"
					style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
				>
					Instruktur Pengampu
				</div>

				<div className="d-flex align-items-center gap-3 mb-3">
					<img
						src={moduleData.instructor.avatar}
						alt={moduleData.instructor.name}
						className="rounded-circle border"
						style={{ width: '54px', height: '54px', objectFit: 'cover' }}
					/>
					<div>
						<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.98rem' }}>
							{moduleData.instructor.name}
						</h6>
						<div className="text-muted small" style={{ fontSize: '0.78rem' }}>
							{moduleData.instructor.title}
						</div>
						<div className="d-flex align-items-center gap-2 text-warning small mt-1">
							<Star size={13} fill="#f59e0b" color="#f59e0b" />
							<span className="fw-bold text-dark">
								{moduleData.instructor.rating}
							</span>
							<span className="text-muted">
								• {moduleData.instructor.totalStudents} Siswa
							</span>
						</div>
					</div>
				</div>

				<p
					className="text-muted small mb-0"
					style={{ fontSize: '0.8rem', lineHeight: 1.45 }}
				>
					{moduleData.instructor.bio}
				</p>
			</Card>
		</>
	);
};

export default AboutOrganizer;
