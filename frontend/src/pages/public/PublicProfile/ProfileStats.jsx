import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Award, Zap, Calendar as CalendarIcon } from 'lucide-react';

const ProfileStats = ({ stats = {} }) => {
	const items = [
		// { label: 'Total Point', value: stats.points ?? 0, icon: <Zap size={20} style={{ color: '#ffb020' }} className="mb-1" /> },
		// { label: 'Level', value: stats.level ?? 1, icon: <Award size={20} style={{ color: 'var(--color-primary)' }} className="mb-1" /> },
		{ label: 'Event Diikuti', value: stats.total_events ?? 0, icon: <CalendarIcon size={20} style={{ color: '#10b981' }} className="mb-1" /> },
	];

	return (
		<Row className="justify-content-center mb-4">
			<Col xs={12} md={10} lg={8}>
				<div className="d-flex justify-content-between bg-white rounded-4 py-3 px-4" style={{ borderColor: 'var(--color-border)'}}>
					{items.map((item, idx) => (
						<div 
							key={idx} 
							className="text-center flex-fill" 
							style={{ 
								borderRight: idx !== items.length - 1 ? '1px solid var(--color-border)' : 'none' 
							}}
						>
							{item.icon}
							<div className="fw-bold text-uppercase mt-1" style={{ fontSize: '10px', letterSpacing: '0.5px', color: 'var(--color-secondary)' }}>
								{item.label}
							</div>
							<div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>
								{item.value}
							</div>
						</div>
					))}
				</div>
			</Col>
		</Row>
	);
};

export default ProfileStats;
