import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { User } from 'lucide-react';

const EventOrganizerCard = ({ eventDetails }) => {
	return (
		<Card className="border shadow-sm rounded-4">
			<Card.Body className="p-4 text-center">
				<h6 className="fw-bold mb-3 text-start">Penyelenggara</h6>
				<div
					className="bg-light rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
					style={{ width: '60px', height: '60px' }}
				>
					<User size={30} className="text-secondary" />
				</div>
				<h6 className="fw-bold mb-1">
					{eventDetails.organizer_name ||
						eventDetails.org ||
						'Panitia KampusX'}
				</h6>
				<Button
					variant="outline-dark"
					size="sm"
					className="w-100 rounded-pill mt-3"
				>
					Follow Organizer
				</Button>
			</Card.Body>
		</Card>
	);
};

export default EventOrganizerCard;
