import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Award } from 'lucide-react';
import CertificateCard from './CertificateCard';

const CertificateGrid = ({ certificates = [] }) => {
	if (certificates.length === 0) {
		return (
			<div className="text-center py-5">
				<div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
					<Award size={28} className="text-muted" />
				</div>
				<h5 className="fw-bold" style={{ color: 'var(--color-text)' }}>Belum Ada Sertifikat</h5>
				<p className="text-muted small mx-auto" style={{ maxWidth: '300px' }}>
					User ini belum mengklaim atau memperoleh e-sertifikat resmi dari event yang diselesaikan.
				</p>
			</div>
		);
	}

	return (
		<Row className="g-3 g-md-4">
			{certificates.map((cert) => (
				<Col xs={6} md={4} lg={3} key={cert.id}>
					<CertificateCard cert={cert} />
				</Col>
			))}
		</Row>
	);
};

export default CertificateGrid;
