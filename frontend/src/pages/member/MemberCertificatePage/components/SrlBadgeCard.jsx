import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { Lock } from 'lucide-react';

const SrlBadgeCard = ({ badge, inPortfolio, onTogglePortfolio }) => {
	const BadgeIcon = badge.icon;
	const isEarned = badge.isEarned;

	return (
		<Card 
			className="border-0 shadow-sm h-100 rounded-4 border border-secondary border-opacity-10 overflow-hidden d-flex flex-column"
			style={{ 
				opacity: isEarned ? 1 : 0.7,
				transition: 'all 0.2s ease',
				transform: isEarned ? 'none' : 'scale(0.98)'
			}}
		>
			<Card.Body className="p-4 d-flex flex-column flex-grow-1">
				<div className="d-flex align-items-center justify-content-between mb-3">
					{/* Badge Status Badge */}
					<span 
						className="badge px-3 py-1.5 rounded-pill fw-semibold border"
						style={{ 
							fontSize: '11px',
							backgroundColor: isEarned ? 'rgba(16, 185, 129, 0.08)' : '#F1F5F9',
							color: isEarned ? '#10B981' : '#64748B',
							borderColor: isEarned ? 'rgba(16, 185, 129, 0.15)' : '#E2E8F0'
						}}
					>
						{isEarned ? '✓ Lulus Evaluasi' : '🔒 Terkunci'}
					</span>
					
					<span className="badge bg-light text-secondary px-2.5 py-1.5 rounded-pill fw-semibold border border-secondary border-opacity-10 fw-mono" style={{ fontSize: '10px' }}>
						{badge.moduleCode}
					</span>
				</div>

				{/* Icon & Title Group */}
				<div className="d-flex align-items-center gap-3 mb-3">
					<div 
						className="rounded-circle p-3 d-flex align-items-center justify-content-center border"
						style={{ 
							backgroundColor: badge.bgColor, 
							color: badge.color,
							borderColor: badge.borderColor,
							width: '56px',
							height: '56px',
							flexShrink: 0
						}}
					>
						{isEarned ? <BadgeIcon size={24} /> : <Lock size={22} className="text-secondary" />}
					</div>
					<div>
						<h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
							{badge.title}
						</h5>
						<span className="text-muted" style={{ fontSize: '11px' }}>
							{isEarned ? `Diraih pada ${badge.earnedDate}` : 'Evaluasi belum selesai'}
						</span>
					</div>
				</div>

				<Card.Text className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
					{badge.description}
				</Card.Text>
			</Card.Body>

			{/* Portfolio integration toggle in Footer */}
			{isEarned && (
				<Card.Footer 
					className="px-4 py-3 border-0 d-flex justify-content-between align-items-center"
					style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}
				>
					<span className="text-muted font-medium" style={{ fontSize: '12px', fontWeight: 500 }}>
						Tampilkan di Profil Publik
					</span>
					<Form.Check 
						type="switch"
						id={`badge-switch-${badge.id}`}
						checked={inPortfolio}
						onChange={() => onTogglePortfolio(badge.id)}
						style={{ cursor: 'pointer' }}
					/>
				</Card.Footer>
			)}
		</Card>
	);
};

export default SrlBadgeCard;
