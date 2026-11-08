import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Award, Lock, Sparkles, Brain, Layers, Flame, ShieldCheck } from 'lucide-react';
import { MOCK_LEARNING_PATH } from './mockData';

const ICON_MAP = {
	Brain: Brain,
	Layers: Layers,
	Flame: Flame,
	Sparkles: Sparkles,
	ShieldCheck: ShieldCheck,
	Award: Award,
};

const LearningBadges = ({ badges = MOCK_LEARNING_PATH.badges }) => {
	const navigate = useNavigate();
	const unlockedCount = badges.filter((b) => b.unlocked).length;

	return (
		<Card
			className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white"
			style={{ borderRadius: '16px' }}
		>
			<div className="d-flex align-items-center justify-content-between mb-3">
				<div>
					<h5 className="fw-bold mb-0 text-slate-900" style={{ fontSize: '1.05rem' }}>
						Earnable Badges
					</h5>
					<p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
						Lencana pencapaian kompetensi modul
					</p>
				</div>
				<span className="badge bg-light text-slate-700 border small">
					{unlockedCount} of {badges.length} Unlocked
				</span>
			</div>

			{/* 2x3 Grid Badges */}
			<Row className="g-2 mb-3">
				{badges.map((b, idx) => {
					const IconComp = ICON_MAP[b.icon] || Award;
					return (
						<Col key={idx} xs={6}>
							<div
								className="p-2.5 rounded-3 border text-center d-flex flex-column align-items-center justify-content-center h-100 transition-all hover:shadow-xs"
								style={{
									backgroundColor: b.unlocked ? b.bg : '#F8FAFC',
									borderColor: b.unlocked ? `${b.color}40` : '#E2E8F0',
									opacity: b.unlocked ? 1 : 0.65,
								}}
							>
								<div
									className="rounded-circle d-flex align-items-center justify-content-center mb-1.5 shadow-2xs"
									style={{
										width: '36px',
										height: '36px',
										backgroundColor: b.unlocked ? b.color : '#CBD5E1',
										color: '#FFFFFF',
									}}
								>
									{b.unlocked ? <IconComp size={18} /> : <Lock size={15} />}
								</div>
								<div className="fw-bold text-slate-800 text-truncate w-100" style={{ fontSize: '0.78rem' }}>
									{b.name}
								</div>
								<div className="text-muted" style={{ fontSize: '0.68rem' }}>
									{b.unlocked ? '✓ Terbuka' : 'Terkunci'}
								</div>
							</div>
						</Col>
					);
				})}
			</Row>

			<Button
				variant="outline-secondary"
				size="sm"
				className="w-100 rounded-pill py-1.5 small fw-semibold"
				onClick={() => navigate('/learner/badges')}
			>
				Lihat Portofolio Lencana ➔
			</Button>
		</Card>
	);
};

export default LearningBadges;