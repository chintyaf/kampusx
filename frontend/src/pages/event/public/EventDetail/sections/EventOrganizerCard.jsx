import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { User, Landmark } from 'lucide-react';
import { STORAGE_URL } from '@/api/storage';

const EventOrganizerCard = ({ eventDetails }) => {
	const institution = eventDetails?.institution;
	const organizer = eventDetails?.organizer;

	return (
		<Card className="border shadow-sm rounded-4 mb-4">
			<Card.Body className="p-4 text-center">
				<h6 className="fw-bold mb-3 text-start">Penyelenggara</h6>
				
				<div className="d-flex flex-column align-items-center mb-3">
					{institution?.logo_path ? (
						<img
							src={`${STORAGE_URL}/${institution.logo_path}`}
							alt={institution.name}
							className="rounded-4 mb-2 object-fit-contain border p-1"
							style={{ width: '64px', height: '64px', backgroundColor: '#fff' }}
						/>
					) : (
						<div
							className="bg-light rounded-circle mb-2 d-flex align-items-center justify-content-center border"
							style={{ width: '60px', height: '60px' }}
						>
							<User size={30} className="text-secondary" />
						</div>
					)}
					
					<h6 className="fw-bold mb-1 text-dark">
						{organizer?.name || eventDetails.organizer_name || eventDetails.org || 'Panitia KampusX'}
					</h6>
					
					{institution && (
						<div className="small text-secondary d-flex align-items-center justify-content-center mt-1">
							<Landmark size={14} className="me-1" />
							{institution.name}
						</div>
					)}
				</div>

				{/* <Button
					variant="outline-primary"
					size="sm"
					className="w-100 rounded-3 fw-semibold py-2"
				>
					Hubungi Penyelenggara
				</Button> */}
			</Card.Body>
		</Card>
	);
};

export default EventOrganizerCard;
