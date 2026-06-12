import React from 'react';
import { Modal, Badge } from 'react-bootstrap';
import QRCode from 'react-qr-code';

const TicketModal = ({ show, onHide, ticketCode, qrToken }) => {
	const qrData = qrToken || ticketCode;
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
			<Modal.Body className="text-center pb-5 pt-0">
				<h5 className="fw-bold mb-4">E-Tiket Anda</h5>
				<div className="bg-white p-3 rounded-4 d-inline-block border mb-3" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
					<QRCode
						value={qrData}
						size={160}
						style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
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
