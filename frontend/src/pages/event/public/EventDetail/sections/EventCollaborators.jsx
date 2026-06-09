import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Landmark } from 'lucide-react';
import { STORAGE_URL } from '@/api/storage';

const EventCollaborators = ({ eventDetails }) => {
	const collaborators = eventDetails?.collaborators || [];

	if (collaborators.length === 0) return null;

	// Group collaborators by pivot role
	const grouped = collaborators.reduce((acc, col) => {
		const role = col.pivot?.role || 'sponsor';
		if (!acc[role]) acc[role] = [];
		acc[role].push(col);
		return acc;
	}, {});

	const roleLabels = {
		co_host: 'Penyelenggara Bersama (Co-Host)',
		sponsor: 'Sponsor Resmi',
		media_partner: 'Media Partner',
	};

	return (
		<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
			<h4 className="fw-bold mb-4 text-dark">Sponsor & Partner Pendukung</h4>
			
			{Object.keys(roleLabels).map((role) => {
				const items = grouped[role] || [];
				if (items.length === 0) return null;

				return (
					<div key={role} className="mb-4 last-mb-0">
						<h6 className="fw-bold text-secondary text-uppercase tracking-wider mb-3" style={{ fontSize: '0.8rem' }}>
							{roleLabels[role]}
						</h6>
						
						<Row className="g-3 align-items-center">
							{items.map((col, idx) => (
								<Col key={col.id || idx} xs={6} sm={4} md={3}>
									<Card className="h-100 border border-light rounded-3 bg-light p-2 d-flex flex-column align-items-center justify-content-center hover-lift" style={{ minHeight: '80px', transition: 'transform 0.15s ease' }}>
										{col.logo_path ? (
											<img
												src={`${STORAGE_URL}/${col.logo_path}`}
												alt={col.name}
												className="object-fit-contain w-100 mb-1"
												style={{ maxHeight: '50px' }}
											/>
										) : (
											<div className="d-flex align-items-center text-muted mb-1">
												<Landmark size={18} className="me-1" />
												<span className="small fw-semibold">{col.name}</span>
											</div>
										)}
										{col.logo_path && (
											<span className="text-muted text-center" style={{ fontSize: '10px', fontWeight: 500 }}>
												{col.name}
											</span>
										)}
									</Card>
								</Col>
							))}
						</Row>
						
						{role !== 'media_partner' && <hr className="mt-4 border-light" />}
					</div>
				);
			})}
		</div>
	);
};

export default EventCollaborators;
