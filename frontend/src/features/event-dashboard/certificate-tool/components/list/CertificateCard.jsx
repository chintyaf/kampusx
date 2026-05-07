import React from 'react';

const CertificateCard = ({ cert, index, onEdit }) => {
	const color = PALETTE[index % PALETTE.length];

	return (
		<Card
			className="h-100 border rounded-4 overflow-hidden"
			style={{
				borderColor: '#e2e8f0',
				transition: 'transform 0.2s, box-shadow 0.2s',
				cursor: 'pointer',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = 'none';
			}}>
			<div
				className="d-flex align-items-center justify-content-center position-relative"
				style={{
					height: '110px',
					background: `linear-gradient(135deg, ${color}18, ${color}08)`,
					borderBottom: `1px solid ${color}22`,
				}}>
				<Badge
					pill
					bg={cert.status === 'active' ? 'success' : 'warning'}
					text={cert.status === 'active' ? 'light' : 'dark'}
					className="position-absolute top-0 end-0 m-2 fw-semibold border"
					style={{ borderColor: cert.status === 'active' ? '#bbf7d0' : '#fde68a' }}>
					{cert.status === 'active' ? '✓ Aktif' : '○ Draft'}
				</Badge>
			</div>
			<Card.Body className="d-flex flex-column p-3">
				<Card.Title className="fs-6 fw-bold text-dark mb-1 lh-sm">{cert.name}</Card.Title>
				<Card.Subtitle className="text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
					{cert.event}
				</Card.Subtitle>
				<div className="mt-auto pt-3">
					<Button
						variant="primary"
						size="sm"
						className="w-100 fw-bold bg-opacity-10 text-primary border-primary rounded-3"
						style={{ backgroundColor: '#eff6ff' }}
						onClick={() => onEdit(cert)}>
						Edit Template
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
};

export default CertificateCard;