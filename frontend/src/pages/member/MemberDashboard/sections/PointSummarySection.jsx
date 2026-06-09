import React from 'react';
import { Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Coins, Award, Globe, Info, ArrowRight } from 'lucide-react';
import { clr } from '../constants';

const PointSummarySection = ({ pointsData, isLoading }) => {
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<Card className="border-0 shadow-sm mb-4 p-4 text-center bg-white" style={{ boxShadow: clr.shadow, borderRadius: '12px' }}>
				<Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
					<Spinner animation="border" role="status" className="mb-2" style={{ color: clr.primaryHex }}>
						<span className="visually-hidden">Loading...</span>
					</Spinner>
					<div className="text-muted small fw-medium">Menghitung saldo poin Anda...</div>
				</Card.Body>
			</Card>
		);
	}

	const localPoints = pointsData?.current_local_points ?? 0;
	const globalPoints = pointsData?.current_global_points ?? 0;

	return (
		<div className="mb-4">
			<Row className="g-3">
				{/* Local Point Card */}
				<Col xs={12} md={6}>
					<Card
						className="border-0 shadow-sm position-relative overflow-hidden transition-all hover-lift"
						style={{
							background: 'var(--color-white)',
							borderRadius: '12px',
							minHeight: '150px',
							boxShadow: clr.shadow,
						}}
					>
						{/* Background Decorative Watermark */}
						<div
							className="position-absolute"
							style={{ right: '-20px', bottom: '-20px', transform: 'rotate(15deg)', color: '#0d9488', opacity: 0.05 }}
						>
							<Award size={140} />
						</div>

						<Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
							<div>
								<div className="d-flex justify-content-between align-items-start mb-2">
									<Badge bg="transparent" className="px-2.5 py-1.5 fw-bold shadow-sm d-flex align-items-center" style={{ borderRadius: '6px', backgroundColor: '#f0fdfa', color: '#0d9488', fontSize: '10px', border: '1px solid rgba(13,148,136,0.15)' }}>
										<Award size={12} className="me-1" /> Poin Lokal (Event Space)
									</Badge>
									<span className="d-flex align-items-center text-muted small cursor-help" title="Hanya berlaku untuk ditukar dengan reward khusus di event yang sedang berlangsung." style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
										<Info size={12} className="me-1" /> Sementara
									</span>
								</div>
								<h2 className="fw-extrabold mb-0 fs-1 tracking-tight" style={{ color: 'var(--color-text)' }}>
									{localPoints.toLocaleString()} <span className="fs-5 fw-normal" style={{ color: 'var(--color-secondary)' }}>Pts</span>
								</h2>
								<p className="mb-0 mt-1" style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
									*Total poin sementara dari seluruh event aktif Anda.
								</p>
							</div>

							<div className="mt-3 pt-2 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
								<Button
									variant="link"
									className="p-0 text-decoration-none small d-flex align-items-center gap-1 opacity-90 hover-opacity-100 transition-all hover-scale"
									style={{ fontSize: '11px', fontWeight: '500', color: clr.primaryHex }}
									onClick={() => navigate('/member/points/history?type=local')}
								>
									Lihat Riwayat Poin <ArrowRight size={12} />
								</Button>
								<Button
									variant="light"
									size="sm"
									className="d-flex align-items-center gap-1 shadow-sm transition-all hover-scale px-3 fw-bold"
									style={{ borderRadius: '8px', fontSize: '11px', color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid rgba(13,148,136,0.2)' }}
									onClick={() => navigate('/my-tickets')}
								>
									Pilih Event Space <ArrowRight size={12} />
								</Button>
							</div>
						</Card.Body>
					</Card>
				</Col>

				{/* Global Point Card */}
				<Col xs={12} md={6}>
					<Card
						className="border-0 shadow-sm position-relative overflow-hidden transition-all hover-lift"
						style={{
							background: 'var(--color-white)',
							borderRadius: '12px',
							minHeight: '150px',
							boxShadow: clr.shadow,
						}}
					>
						{/* Background Decorative Watermark */}
						<div
							className="position-absolute"
							style={{ right: '-20px', bottom: '-20px', transform: 'rotate(-15deg)', color: '#d97706', opacity: 0.05 }}
						>
							<Coins size={140} />
						</div>

						<Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
							<div>
								<div className="d-flex justify-content-between align-items-start mb-2">
									<Badge bg="transparent" className="px-2.5 py-1.5 fw-bold shadow-sm d-flex align-items-center" style={{ borderRadius: '6px', backgroundColor: '#fffbeb', color: '#d97706', fontSize: '10px', border: '1px solid rgba(217,119,6,0.15)' }}>
										<Globe size={12} className="me-1" /> Poin Global (Permanen)
									</Badge>
									<span className="d-flex align-items-center text-muted small cursor-help" title="Poin permanen yang terkumpul dari penukaran atau konversi." style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
										<Info size={12} className="me-1" /> Permanen
									</span>
								</div>
								<h2 className="fw-extrabold mb-0 fs-1 tracking-tight" style={{ color: 'var(--color-text)' }}>
									{globalPoints.toLocaleString()} <span className="fs-5 fw-normal" style={{ color: 'var(--color-secondary)' }}>Pts</span>
								</h2>
								<p className="mb-0 mt-1" style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
									*Poin permanen untuk belanja di katalog global.
								</p>
							</div>

							<div className="mt-3 pt-2 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
								<Button
									variant="link"
									className="p-0 text-decoration-none small d-flex align-items-center gap-1 opacity-90 hover-opacity-100 transition-all hover-scale"
									style={{ fontSize: '11px', fontWeight: '500', color: clr.primaryHex }}
									onClick={() => navigate('/member/points/history?type=global')}
								>
									Lihat Riwayat Poin <ArrowRight size={12} />
								</Button>
								<Button
									variant="light"
									size="sm"
									className="d-flex align-items-center gap-1 shadow-sm transition-all hover-scale px-3 fw-bold"
									style={{ borderRadius: '8px', fontSize: '11px', color: '#d97706', backgroundColor: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)' }}
									onClick={() => navigate('/rewards')}
								>
									Katalog Global <ArrowRight size={12} />
								</Button>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default PointSummarySection;
