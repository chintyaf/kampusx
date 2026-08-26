import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Calendar as CalendarIcon, Coins, BookOpen, CheckCircle } from 'lucide-react';

const ProfileStats = ({ stats = {}, onEventClick }) => {
	const items = [
		{ 
			label: 'Poin Saya', 
			value: stats.points ?? 0, 
			icon: <Coins size={20} style={{ color: '#eab308' }} className="mb-1" /> 
		},
		{ 
			label: 'Modul Selesai', 
			value: stats.completed_modules ?? 0, 
			icon: <BookOpen size={20} style={{ color: '#7c3aed' }} className="mb-1" /> 
		},
		{ 
			label: 'Pelajaran Selesai', 
			value: stats.completed_lessons ?? 0, 
			icon: <CheckCircle size={20} style={{ color: '#16a34a' }} className="mb-1" /> 
		},
		{ 
			label: 'Event Diikuti', 
			value: stats.total_events ?? 0, 
			icon: <CalendarIcon size={20} style={{ color: '#00699e' }} className="mb-1" />,
			onClick: onEventClick
		},
	];

	return (
		<Row className="justify-content-center mb-4">
			<Col xs={12} md={10} lg={8}>
				<div className="d-flex justify-content-between bg-white rounded-4 py-3 px-4" style={{ borderColor: 'var(--color-border)', border: '1px solid #e8ecf0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
					{items.map((item, idx) => (
						<div 
							key={idx} 
							className="text-center flex-fill" 
							onClick={item.onClick}
							style={{ 
								borderRight: idx !== items.length - 1 ? '1px solid var(--color-border)' : 'none',
								cursor: item.onClick ? 'pointer' : 'default',
								transition: 'opacity 0.2s ease',
								userSelect: 'none'
							}}
							onMouseEnter={(e) => { if (item.onClick) e.currentTarget.style.opacity = '0.7'; }}
							onMouseLeave={(e) => { if (item.onClick) e.currentTarget.style.opacity = '1'; }}
						>
							<div className="d-flex flex-column align-items-center">
								{item.icon}
								<div className="fw-bold text-uppercase mt-1" style={{ fontSize: '9px', letterSpacing: '0.5px', color: 'var(--color-secondary)' }}>
									{item.label}
								</div>
								<div className="fw-bold" style={{ fontSize: '1.2rem', color: 'var(--color-text)', marginTop: 2 }}>
									{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
								</div>
							</div>
						</div>
					))}
				</div>
			</Col>
		</Row>
	);
};

export default ProfileStats;
