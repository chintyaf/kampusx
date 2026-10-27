import React from 'react';
import { Card } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { MOCK_LEARNING_PATH } from '@/pages/lms/mock-data/mockData';

const OrganizerCard = () => {
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
					Course Instructor
				</div>

				<div className="d-flex align-items-center gap-3 mb-3">
					<img
						src={MOCK_LEARNING_PATH.instructor.avatar}
						alt={MOCK_LEARNING_PATH.instructor.name}
						className="rounded-circle border"
						style={{ width: '56px', height: '56px', objectFit: 'cover' }}
					/>
					<div>
						<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
							{MOCK_LEARNING_PATH.instructor.name}
						</h6>
						<div className="text-muted small">
							{MOCK_LEARNING_PATH.instructor.title}
						</div>
						<div className="d-flex align-items-center gap-2 text-warning small mt-1">
							<Star size={12} fill="#f59e0b" color="#f59e0b" />
							<span className="fw-bold text-dark">
								{MOCK_LEARNING_PATH.instructor.rating}
							</span>
							<span className="text-muted">
								• {MOCK_LEARNING_PATH.instructor.coursesCount} Courses
							</span>
						</div>
					</div>
				</div>

				<p
					className="text-muted small mb-0"
					style={{ fontSize: '0.8rem', lineHeight: 1.45 }}
				>
					{MOCK_LEARNING_PATH.instructor.bio}
				</p>
			</Card>
		</>
	);
};

export default OrganizerCard;
