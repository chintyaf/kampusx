import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Plus, Search, Sparkles } from 'lucide-react';
import EventCard from './EventCard'; // Sesuaikan path

const EventList = ({ events }) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredEvents = events.filter(
		(event) =>
			event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleDeleteEvent = (eventId) => {
		// Implementasi delete - bisa dengan modal konfirmasi
		if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
			// API call untuk delete
			console.log('Delete event:', eventId);
			// TODO: Implement actual delete logic with API call
		}
	};

	return (
		<>
			{/* Header Section */}
			<div className="mb-4">
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
					<div>
						<h3 className="fw-bold mb-2" style={{ color: 'var(--color-text)' }}>
							<Sparkles
								size={28}
								className="me-2"
								style={{ color: 'var(--color-primary)' }}
							/>
							Dashboard Event Organizer
						</h3>
						<p
							className="mb-0"
							style={{ fontSize: 'var(--font-md)', color: 'var(--color-secondary)' }}>
							Kelola dan pantau semua event Anda dalam satu tempat
						</p>
					</div>
					<NavLink to="/organizer/buat-acara" className="text-decoration-none">
						<Button
							className="fw-semibold rounded-3 border-0 d-flex align-items-center"
							style={{
								backgroundColor: 'var(--color-primary)',
								padding: '12px 24px',
								fontSize: 'var(--font-sm)',
							}}>
							<Plus size={18} className="me-2" />
							Buat Event Baru
						</Button>
					</NavLink>
				</div>
			</div>

			{/* Main Card */}
			<Card
				className="rounded-4 border shadow-sm"
				style={{
					borderColor: 'var(--color-border)',
					backgroundColor: 'var(--color-white)',
				}}>
				<Card.Body className="p-4 p-md-5">
					{/* Title & Search */}
					<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
						<h4
							className="fw-bold mb-0"
							style={{
								color: 'var(--color-text)',
								fontSize: 'var(--font-xl)',
							}}>
							My Events
							<span
								className="ms-2 px-3 py-1 rounded-pill"
								style={{
									backgroundColor: 'var(--bahama-blue-100)',
									color: 'var(--bahama-blue-800)',
									fontSize: 'var(--font-sm)',
									fontWeight: '600',
								}}>
								{filteredEvents.length}
							</span>
						</h4>

						{/* Search Bar */}
						<InputGroup style={{ maxWidth: '400px' }}>
							<InputGroup.Text
								className="bg-white border-end-0 ps-3"
								style={{ borderColor: 'var(--color-border)' }}>
								<Search size={18} style={{ color: 'var(--color-secondary)' }} />
							</InputGroup.Text>
							<Form.Control
								placeholder="Cari event..."
								className="border-start-0 ps-0"
								style={{
									boxShadow: 'none',
									borderColor: 'var(--color-border)',
									fontSize: 'var(--font-sm)',
								}}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</InputGroup>
					</div>

					{/* Event Cards Grid */}
					<Row className="g-4">
						{filteredEvents.length === 0 ? (
							<Col xs={12}>
								<div className="text-center py-5">
									<Search
										size={48}
										style={{ color: 'var(--color-border)' }}
										className="mb-3"
									/>
									<p
										style={{
											color: 'var(--color-secondary)',
											fontSize: 'var(--font-md)',
										}}>
										{searchQuery
											? 'Tidak ada event yang sesuai dengan pencarian Anda'
											: 'Belum ada event yang dibuat'}
									</p>
								</div>
							</Col>
						) : (
							filteredEvents.map((event) => (
								<Col lg={12} md={12} key={event.id}>
									<EventCard event={event} onDelete={handleDeleteEvent} />
								</Col>
							))
						)}
					</Row>
				</Card.Body>
			</Card>
		</>
	);
};

export default EventList;
