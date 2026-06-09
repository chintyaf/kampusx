import React from 'react';
import { Modal, Badge } from 'react-bootstrap';

const TicketModal = ({ show, onHide, ticketCode }) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
			<Modal.Body className="text-center pb-5 pt-0">
				<h5 className="fw-bold mb-4">E-Tiket Anda</h5>
				<div className="bg-light p-4 rounded-4 d-inline-block border border-dashed mb-3">
					<img
						src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${ticketCode}`}
						alt="QR Code"
						className="mix-blend-multiply"
						style={{ width: '180px', height: '180px' }}
					/>
				</div>
				<div className="fw-bold fs-5 text-dark mb-1">{ticketCode}</div>
				<Badge
					bg="success"
					className="px-3 py-2 rounded-pill fw-medium border border-success border-opacity-25 text-success bg-success-subtle"
				>
					VALID UNTUK EVENT INI
				</Badge>
			</Modal.Body>
		</Modal>
	);
};

export default TicketModal;
