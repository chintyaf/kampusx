import React from 'react';
import { Container, Card, ProgressBar } from 'react-bootstrap';
import { Zap } from 'lucide-react';

const EventCard = ({ isCollapsed }) => {
	const progressValue = 50;

	if (isCollapsed) {
		return null;
	}

	return (
		<div
			className="px-4 py-2 border-bottom border-top sticky-bottom"
			style={{ backgroundColor: 'white' }}>
			{/* Subtitle */}
			<div className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>
				Tech Summit 2026
			</div>

			{/* Progress Bar Section */}
			<div className="d-flex align-items-center gap-3">
				<div className="flex-grow-1">
					<ProgressBar
						now={progressValue}
						variant="warning"
						style={{ height: '5px', backgroundColor: '#e9ecef' }}
					/>
				</div>
				<span className="fw-normal text-secondary" style={{ fontSize: '0.8rem' }}>
					{progressValue}%
				</span>
			</div>
		</div>
	);
};

export default EventCard;
