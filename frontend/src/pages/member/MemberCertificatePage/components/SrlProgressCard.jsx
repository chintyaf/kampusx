import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Award, Lock } from 'lucide-react';

const SrlProgressCard = ({ earnedCount = 3, totalCount = 5 }) => {
	const progressPercentage = (earnedCount / totalCount) * 100;
	const isAllEarned = earnedCount >= totalCount;

	const radius = 30;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

	return (
		<>
			<style>{`
				@media (max-width: 767.98px) {
					.status-panel-right {
						border-top: 1px solid #E2E8F0 !important;
						border-left: none !important;
					}
				}
				@media (min-width: 768px) {
					.status-panel-right {
						border-left: 1px solid #E2E8F0 !important;
						border-top: none !important;
					}
				}
			`}</style>

			<Card 
				className="border-0 shadow-sm rounded-4 mb-5 overflow-hidden" 
				style={{ 
					backgroundColor: '#FFFFFF', 
					border: '1px solid #E2E8F0',
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
				}}
			>
				<Card.Body className="p-0">
					<Row className="g-0 align-items-stretch">
						<Col md={8} className="p-4 p-lg-5 d-flex flex-column justify-content-center">
							<div className="d-flex align-items-center gap-2 mb-3">
								<span 
									className="badge px-3 py-1.5 rounded-pill fw-semibold border" 
									style={{ 
										fontSize: '10.5px', 
										letterSpacing: '0.5px',
										color: '#1D4ED8', 
										backgroundColor: '#EFF6FF', 
										borderColor: '#DBEAFE'
									}}
								>
									INTEGRASI EVALUASI SRL
								</span>
							</div>
							<h3 className="fw-bold mb-2" style={{ color: '#0F172A', fontSize: '1.65rem' }}>
								Sertifikat Utama SRL (Self-Regulated Learning)
							</h3>
							<p className="small mb-4" style={{ color: '#475569', lineHeight: '1.6' }}>
								Kumpulkan kelima badge modul SRL dengan menyelesaikan dan lulus evaluasi pembelajaran mandiri untuk membuka sertifikat utama SRL Anda secara otomatis.
							</p>
							
							{/* Progress bar */}
							<div className="mb-2 d-flex justify-content-between align-items-center">
								<span className="small fw-semibold text-secondary">Progress Badge Terkumpul</span>
								<span className="small fw-bold" style={{ color: '#0F172A', fontSize: '13px' }}>
									{earnedCount} / {totalCount} Badge ({progressPercentage}%)
								</span>
							</div>
							<div className="progress rounded-pill" style={{ height: '12px', backgroundColor: '#E2E8F0' }}>
								<div 
									className="progress-bar rounded-pill" 
									style={{ 
										width: `${progressPercentage}%`, 
										backgroundColor: '#0284C7',
										transition: 'width 1s ease-in-out',
										boxShadow: '0 0 12px rgba(2, 132, 199, 0.3)' 
									}} 
								/>
							</div>
						</Col>
						<Col 
							md={4} 
							className="status-panel-right text-center d-flex flex-column align-items-center justify-content-center p-4 p-lg-5"
							style={{ backgroundColor: '#F8FAFC' }}
						>
							{/* Circular Progress Indicator */}
							<div className="position-relative d-inline-flex mb-3 align-items-center justify-content-center">
								<svg width="90" height="90" viewBox="0 0 90 90">
									{/* Background Circle */}
									<circle 
										cx="45" 
										cy="45" 
										r={radius} 
										fill="none" 
										stroke="#E2E8F0" 
										strokeWidth="6" 
									/>
									{/* Progress Circle */}
									<circle 
										cx="45" 
										cy="45" 
										r={radius} 
										fill="none" 
										stroke="#0284C7" 
										strokeWidth="6" 
										strokeDasharray={circumference}
										strokeDashoffset={strokeDashoffset}
										strokeLinecap="round"
										transform="rotate(-90 45 45)"
										style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
									/>
								</svg>
								<div className="position-absolute d-flex align-items-center justify-content-center">
									{isAllEarned ? (
										<Award size={26} className="text-success" />
									) : (
										<Lock size={22} className="text-muted" style={{ color: '#94A3B8' }} />
									)}
								</div>
							</div>
							<div className="small fw-bold text-muted mb-1">Status Sertifikat Utama</div>
							{isAllEarned ? (
								<span 
									className="badge px-3 py-1.5 rounded-pill border mt-2 fw-bold" 
									style={{ 
										fontSize: '11px',
										backgroundColor: 'rgba(16, 185, 129, 0.08)',
										color: '#10B981',
										borderColor: 'rgba(16, 185, 129, 0.15)'
									}}
								>
									✓ Terbuka (Siap Diunduh)
								</span>
							) : (
								<span 
									className="badge px-3 py-1.5 rounded-pill border mt-2 fw-bold" 
									style={{ 
										fontSize: '11px',
										backgroundColor: '#FEF3C7',
										color: '#92400E',
										borderColor: '#FDE68A'
									}}
								>
									🔒 Terkunci (Butuh {totalCount - earnedCount} Badge Lagi)
								</span>
							)}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</>
	);
};

export default SrlProgressCard;
