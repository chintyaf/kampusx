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

	const selectedTicketObj = displayTickets.find((t) => t.id === selectedTicket);
	const ticketPrice = selectedTicketObj
		? (selectedTicketObj.price !== undefined ? selectedTicketObj.price : eventDetails?.price)
		: eventDetails?.price;

	let btnStyle = { backgroundColor: '#2b6cb0', color: '#fff' };
	let btnText = 'Beli Tiket';
	
	const allSoldOut = displayTickets.length > 0 && displayTickets.every((t) => t.remaining_count === 0);
	const isSelectedTicketSoldOut = selectedTicketObj && selectedTicketObj.remaining_count === 0;
	const isSoldOut = allSoldOut || isSelectedTicketSoldOut;

	const isFree = Number(ticketPrice) === 0;
	const isBtnDisabled = !registration?.registered && (isSoldOut || !selectedTicket);

	if (registration?.registered) {
		if (registration.status === 'paid') {
			btnStyle = { backgroundColor: '#e9ecef', color: '#495057' };
			btnText = 'Tiket Anda';
		} else {
			btnStyle = { backgroundColor: '#ffc107', color: '#000' };
			btnText = 'Menunggu Pembayaran';
		}
	} else if (allSoldOut) {
		btnText = 'Habis Terjual';
		btnStyle = { backgroundColor: '#cbd5e0', color: '#718096', cursor: 'not-allowed' };
	} else if (isSelectedTicketSoldOut) {
		btnText = 'Tiket Pilihan Habis';
		btnStyle = { backgroundColor: '#cbd5e0', color: '#718096', cursor: 'not-allowed' };
	} else if (!selectedTicket) {
		btnText = 'Pilih Tiket';
		btnStyle = { backgroundColor: '#cbd5e0', color: '#718096', cursor: 'not-allowed' };
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
						const isTicketSoldOut = ticket.remaining_count === 0;
						const priceValue =
							ticket.price !== undefined ? ticket.price : eventDetails?.price;

						return (
							<div
								key={ticket.id || idx}
								className={`rounded-4 p-3 mb-3 ${
									isTicketSoldOut
										? 'bg-light border border-dashed opacity-75'
										: isSelected
											? 'border border-primary bg-white shadow-sm'
											: 'border border-transparent bg-light text-muted'
								}`}
								onClick={() => {
									if (!isTicketSoldOut) {
										setSelectedTicket(ticket.id);
									}
								}}
								style={{
									transition: 'all 0.2s ease',
									cursor: isTicketSoldOut ? 'not-allowed' : 'pointer'
								}}
							>
								<div className="d-flex justify-content-between align-items-sm-center flex-column flex-sm-row">
									<div className="d-flex align-items-start mb-2 mb-sm-0">
										<Form.Check
											type="radio"
											id={`ticket-${ticket.id || idx}`}
											checked={isSelected}
											disabled={isTicketSoldOut}
											onChange={() => {
												if (!isTicketSoldOut) {
													setSelectedTicket(ticket.id);
												}
											}}
											className="mb-0 me-3 mt-1"
										/>
										<div>
											<label
												htmlFor={`ticket-${ticket.id || idx}`}
												className={`mb-0 ${
													isTicketSoldOut
														? 'text-decoration-line-through text-muted fw-normal'
														: isSelected
															? 'fw-bold text-dark'
															: 'fw-semibold text-secondary'
												}`}
												style={{
													fontSize: '1.05rem',
													cursor: isTicketSoldOut ? 'not-allowed' : 'pointer'
												}}
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

											{/* Remaining Quota Badge */}
											{ticket.remaining_count !== undefined && ticket.remaining_count !== null && (
												<div className="mt-2">
													{ticket.remaining_count === 0 ? (
														<span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded fw-medium" style={{ fontSize: '0.75rem' }}>
															Habis Terjual
														</span>
													) : ticket.remaining_count <= 10 ? (
														<span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 rounded fw-medium animate-pulse" style={{ fontSize: '0.75rem' }}>
															Segera Habis! Sisa {ticket.remaining_count} tiket
														</span>
													) : (
														<span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded fw-medium" style={{ fontSize: '0.75rem' }}>
															Sisa {ticket.remaining_count} tiket
														</span>
													)}
												</div>
											)}
											{ticket.remaining_count === null && (
												<div className="mt-2">
													<span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded fw-medium" style={{ fontSize: '0.75rem' }}>
														Kuota Tak Terbatas
													</span>
												</div>
											)}
										</div>
									</div>

									<div className="text-sm-end ms-4 ms-sm-0 ps-2 ps-sm-0">
										<span
											className={`fw-bold fs-5 ${
												isTicketSoldOut 
													? 'text-muted text-decoration-line-through' 
													: isSelected 
														? 'text-primary' 
														: 'text-secondary'
											}`}
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
