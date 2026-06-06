import React, { useState } from 'react';
import { Row, Col, Card, Collapse, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Coins, Award, ArrowRight, ChevronDown, ChevronUp, Gift } from 'lucide-react';

const PointSummarySection = ({ pointsData }) => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	const globalBalance = pointsData?.global_balance ?? 0;
	const localBalance = pointsData?.local_balance ?? 0;
	const breakdown = pointsData?.local_points_breakdown ?? [];

	return (
		<div className="mb-4">
			<Row className="g-3">
				{/* Global Point Card */}
				<Col xs={12} md={6}>
					<Card
						className="border-0 text-white shadow-sm position-relative overflow-hidden transition-all hover-lift"
						style={{
							background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
							borderRadius: '16px',
							minHeight: '130px',
						}}
					>
						{/* Background Decorative Coins */}
						<div
							className="position-absolute opacity-10"
							style={{ right: '-20px', bottom: '-20px', transform: 'rotate(15deg)' }}
						>
							<Coins size={140} />
						</div>

						<Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
							<div>
								<div className="d-flex align-items-center gap-2 mb-1">
									<div className="p-1.5 bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
										<Coins size={18} className="text-white" />
									</div>
									<span className="fw-semibold uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
										Saldo Global Point
									</span>
								</div>
								<h2 className="fw-extrabold mb-0 fs-1">
									{globalBalance.toLocaleString()} <span className="fs-5 fw-normal text-white-50">Pts</span>
								</h2>
							</div>

							<div className="mt-3 pt-2 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
								<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
									Gunakan untuk reward global
								</span>
								<Button
									variant="light"
									size="sm"
									className="d-flex align-items-center gap-1 border-0 shadow-sm transition-all hover-scale px-3 text-warning fw-bold"
									style={{ borderRadius: '8px', fontSize: '11px' }}
									onClick={() => navigate('/rewards')}
								>
									Tukar <ArrowRight size={12} />
								</Button>
							</div>
						</Card.Body>
					</Card>
				</Col>

				{/* Local Point Card */}
				<Col xs={12} md={6}>
					<Card
						className="border-0 text-white shadow-sm position-relative overflow-hidden transition-all hover-lift"
						style={{
							background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
							borderRadius: '16px',
							minHeight: '130px',
						}}
					>
						{/* Background Decorative Badge */}
						<div
							className="position-absolute opacity-10"
							style={{ right: '-25px', bottom: '-25px', transform: 'rotate(-10deg)' }}
						>
							<Award size={150} />
						</div>

						<Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
							<div>
								<div className="d-flex align-items-center gap-2 mb-1">
									<div className="p-1.5 bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
										<Award size={18} className="text-white" />
									</div>
									<span className="fw-semibold uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
										Saldo Local Point (Total)
									</span>
								</div>
								<h2 className="fw-extrabold mb-0 fs-1">
									{localBalance.toLocaleString()} <span className="fs-5 fw-normal text-white-50">Pts</span>
								</h2>
							</div>

							<div className="mt-3 pt-2 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
								<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
									Khusus penukaran di dalam event
								</span>
								{breakdown.length > 0 ? (
									<Button
										variant="light"
										size="sm"
										className="d-flex align-items-center gap-1 border-0 shadow-sm transition-all hover-scale px-3 fw-bold"
										style={{ borderRadius: '8px', fontSize: '11px', color: '#0d9488' }}
										onClick={() => setIsOpen(!isOpen)}
									>
										{isOpen ? 'Sembunyikan Detail' : 'Lihat Detail Poin'}
										{isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
									</Button>
								) : (
									<span style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.8 }}>
										Belum ada poin lokal
									</span>
								)}
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Local Points Breakdown Collapsible List */}
			{breakdown.length > 0 && (
				<Collapse in={isOpen}>
					<div className="mt-3">
						<Card className="border shadow-sm" style={{ borderRadius: '12px', background: 'var(--color-white)' }}>
							<Card.Header className="bg-transparent border-bottom py-2 px-3">
								<h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
									<Gift size={16} className="text-teal" style={{ color: '#0d9488' }} />
									Breakdown Saldo Poin Lokal per Event
								</h6>
							</Card.Header>
							<Card.Body className="p-0">
								<div className="divide-y">
									{breakdown.map((item) => (
										<div
											key={item.id}
											className="d-flex justify-content-between align-items-center p-3 border-bottom last-border-none hover-bg-light"
											style={{ borderBottom: '1px solid var(--color-border)' }}
										>
											<div style={{ minWidth: 0, flex: 1, marginRight: 16 }}>
												<h6 className="mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '13px' }} title={item.event?.title}>
													{item.event?.title ?? 'Unknown Event'}
												</h6>
												<p className="text-muted mb-0" style={{ fontSize: '11px' }}>
													{item.event?.start_date ? new Date(item.event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
												</p>
											</div>
											<div className="d-flex align-items-center gap-3">
												<span className="fw-bold text-teal" style={{ color: '#0d9488', fontSize: '14px' }}>
													{item.points_balance} Pts
												</span>
												<Button
													variant="outline-teal"
													size="sm"
													className="fw-bold py-1 px-2.5 transition-all hover-scale"
													style={{
														borderRadius: '6px',
														fontSize: '11px',
														borderColor: '#0d9488',
														color: '#0d9488',
													}}
													onClick={() => navigate(`/event-space/${item.event_id}/rewards`)}
												>
													Tukar Reward
												</Button>
											</div>
										</div>
									))}
								</div>
							</Card.Body>
						</Card>
					</div>
				</Collapse>
			)}

			{/* Link to Point History */}
			<div className="d-flex justify-content-end mt-3">
				<Button
					variant="link"
					className="p-0 text-decoration-none text-primary fw-semibold d-flex align-items-center gap-1 transition-all hover-scale"
					style={{ fontSize: '13px' }}
					onClick={() => navigate('/points')}
				>
					Lihat Riwayat Poin Selengkapnya <ArrowRight size={14} />
				</Button>
			</div>
		</div>
	);
};

export default PointSummarySection;
