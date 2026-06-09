import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const formatDate = (dateString) => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
};

const EventTicketCard = ({
	eventDetails,
	selectedTicket,
	setSelectedTicket,
	registration,
	handleLanjutPembayaran,
}) => {
	const tickets = eventDetails?.event_tickets || eventDetails?.eventTickets || [];

	const displayTickets =
		tickets.length > 0
			? tickets
			: [
					{
						id: 'day1',
						name: 'Tiket Peserta',
						description: 'Akses event standar',
						price: eventDetails?.price || 195000,
						sale_start: '2026-05-26T10:31:00',
						sale_end: '2026-06-04T10:31:00',
					},
				];

	let btnStyle = { backgroundColor: '#2b6cb0', color: '#fff' };
	let btnText = 'Beli Tiket';
	const isSoldOut = eventDetails?.quota <= 0;
	const isFree = Number(eventDetails?.price) === 0;
	const isBtnDisabled = !registration?.registered && isSoldOut;

	if (registration?.registered) {
		if (registration.status === 'paid') {
			btnStyle = { backgroundColor: '#e9ecef', color: '#495057' };
			btnText = 'Tiket Anda';
		} else {
			btnStyle = { backgroundColor: '#ffc107', color: '#000' };
			btnText = 'Menunggu Pembayaran';
		}
	} else if (isSoldOut) {
		btnText = 'Habis Terjual';
	} else if (isFree) {
		btnText = 'Daftar Gratis';
	}

	return (
		<Card className="border-0 shadow-sm rounded-4 mb-4">
			<Card.Body className="p-3 p-md-4">
				{/* Changed heading from "Beli Tiket" to "Pilih Tiket" to avoid repetition */}
				<h5 className="fw-bold mb-3 text-dark">Pilih Tiket</h5>

				<Form onSubmit={handleLanjutPembayaran}>
					{displayTickets.map((ticket, idx) => {
						const isSelected = selectedTicket === ticket.id;
						const priceValue =
							ticket.price !== undefined ? ticket.price : eventDetails?.price;

						return (
							<div
								key={ticket.id || idx}
								className={`rounded-4 p-3 mb-3 cursor-pointer ${
									isSelected
										? 'border border-primary bg-white shadow-sm'
										: 'border border-transparent bg-light text-muted'
								}`}
								onClick={() => setSelectedTicket(ticket.id)}
								style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
							>
								<div className="d-flex justify-content-between align-items-sm-center flex-column flex-sm-row">
									<div className="d-flex align-items-start mb-2 mb-sm-0">
										<Form.Check
											type="radio"
											id={`ticket-${ticket.id || idx}`}
											checked={isSelected}
											onChange={() => setSelectedTicket(ticket.id)}
											className="mb-0 me-3 mt-1"
										/>
										<div>
											<label
												htmlFor={`ticket-${ticket.id || idx}`}
												className={`mb-0 ${isSelected ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`}
												style={{ fontSize: '1.05rem', cursor: 'pointer' }}
											>
												{ticket.name}
											</label>

											{ticket.description && (
												<div className="small text-secondary mt-1">
													{ticket.description}
												</div>
											)}

											{(ticket.sale_start || ticket.sale_end) && (
												<div
													className="text-secondary mt-1"
													style={{ fontSize: '0.85rem' }}
												>
													{formatDate(ticket.sale_start)} —{' '}
													{formatDate(ticket.sale_end)}
												</div>
											)}
										</div>
									</div>

									<div className="text-sm-end ms-4 ms-sm-0 ps-2 ps-sm-0">
										<span
											className={`fw-bold fs-5 ${isSelected ? 'text-primary' : 'text-secondary'}`}
										>
											{priceValue === undefined
												? '...'
												: Number(priceValue) === 0
													? 'Gratis'
													: new Intl.NumberFormat('id-ID', {
															style: 'currency',
															currency: 'IDR',
															maximumFractionDigits: 0,
														}).format(priceValue)}
										</span>
									</div>
								</div>
							</div>
						);
					})}

					<Button
						type="submit"
						className="w-100 py-3 fw-semibold rounded-3 border-0 mt-2 d-flex justify-content-center align-items-center"
						style={btnStyle}
						disabled={isBtnDisabled}
					>
						{btnText}
					</Button>
				</Form>
			</Card.Body>
		</Card>
	);
};

export default EventTicketCard;
