import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, Users, Edit, Trash2, Sparkles } from 'lucide-react';

const DashboardEventList = ({ events }) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredEvents = events.filter(
		(event) =>
			event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<>
			{/* Header Section */}
			<div className="mb-4">
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
					<div>
						<h3
							className="fw-bold mb-2"
							style={{ color: '#0f172a', fontFamily: 'var(--font)' }}>
							<Sparkles size={28} className="me-2" style={{ color: '#00699e' }} />
							Dashboard Event Organizer
						</h3>
						<p
							className="text-muted mb-0"
							style={{ fontSize: '16px', color: '#64748b' }}>
							Kelola dan pantau semua event Anda dalam satu tempat
						</p>
					</div>
					<NavLink to="/organizer/buat-acara" className="text-decoration-none">
						<Button
							className="fw-semibold rounded-3 border-0 d-flex align-items-center"
							style={{
								backgroundColor: '#00699e',
								padding: '10px 20px',
								fontSize: '14px',
								fontFamily: 'var(--font)',
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
					borderColor: '#3762a739',
					backgroundColor: '#fff',
				}}>
				<Card.Body className="p-4 p-md-5">
					{/* Title & Search */}
					<div className="mb-4">
						<h4
							className="fw-bold mb-3"
							style={{
								color: '#0f172a',
								fontSize: '20px',
								fontFamily: 'var(--font)',
							}}>
							My Events
						</h4>

						{/* Search Bar */}
						<InputGroup style={{ maxWidth: '450px' }}>
							<InputGroup.Text
								className="bg-white border-end-0 ps-3"
								style={{ borderColor: '#3762a739' }}>
								<Search size={18} style={{ color: '#64748b' }} />
							</InputGroup.Text>
							<Form.Control
								placeholder="Cari event, lokasi, peserta..."
								className="border-start-0 ps-0"
								style={{
									boxShadow: 'none',
									borderColor: '#3762a739',
									fontFamily: 'var(--font)',
									fontSize: '14px',
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
										style={{ color: '#cbd5e1' }}
										className="mb-3"
									/>
									<p style={{ color: '#64748b', fontSize: '14px' }}>
										Tidak ada event yang sesuai dengan pencarian Anda
									</p>
								</div>
							</Col>
						) : (
							filteredEvents.map((event) => (
								<Col lg={4} md={6} key={event.id}>
									<Card
										className="h-100 rounded-3 shadow-none border"
										style={{
											borderColor: '#3762a739',
											transition: 'all 0.2s ease',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.borderColor = '#00699e';
											e.currentTarget.style.boxShadow =
												'0 4px 12px rgba(0, 105, 158, 0.1)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.borderColor = '#3762a739';
											e.currentTarget.style.boxShadow = 'none';
										}}>
										<Card.Body className="p-4 d-flex flex-column">
											<Card.Title
												className="fw-bold mb-3"
												style={{
													color: '#0f172a',
													fontSize: '18px',
													fontFamily: 'var(--font)',
												}}>
												{event.title}
											</Card.Title>

											<div className="mb-4">
												<Badge
													className="rounded-pill px-3 py-2 fw-normal border-0"
													style={{
														backgroundColor:
															event.status === 'active'
																? '#0aabed'
																: '#64748b',
														color: '#fff',
														fontSize: '12px',
														fontFamily: 'var(--font)',
													}}>
													{event.status === 'active'
														? 'Aktif'
														: event.status}
												</Badge>
											</div>

											<div
												className="flex-grow-1"
												style={{ fontSize: '14px', color: '#64748b' }}>
												<div className="d-flex align-items-center mb-3">
													<Calendar
														size={18}
														className="me-3"
														style={{ color: '#00699e', flexShrink: 0 }}
													/>
													<span>{event.date || 'TBD'}</span>
												</div>
												<div className="d-flex align-items-center mb-3">
													<MapPin
														size={18}
														className="me-3"
														style={{ color: '#00699e', flexShrink: 0 }}
													/>
													<span>{event.location || 'TBD'}</span>
												</div>
												<div className="d-flex align-items-center mb-4">
													<Users
														size={18}
														className="me-3"
														style={{ color: '#00699e', flexShrink: 0 }}
													/>
													<span>{event.attendees || '0'} peserta</span>
												</div>
											</div>

											{/* Action Buttons */}
											<div className="d-flex gap-2 mt-auto">
												<NavLink
													to={`/organizer/${event.id}/event-dashboard`}
													className="flex-grow-1 text-decoration-none">
													<Button
														className="w-100 d-flex justify-content-center align-items-center rounded-3 fw-semibold"
														style={{
															backgroundColor: 'transparent',
															borderColor: '#00699e',
															color: '#00699e',
															fontSize: '13px',
															fontFamily: 'var(--font)',
															padding: '8px 12px',
														}}>
														<Edit size={16} className="me-2" />
														Edit
													</Button>
												</NavLink>
												<Button
													className="flex-grow-1 d-flex justify-content-center align-items-center rounded-3 fw-semibold"
													style={{
														backgroundColor: 'transparent',
														borderColor: '#fecaca',
														color: '#dc2626',
														fontSize: '13px',
														fontFamily: 'var(--font)',
														padding: '8px 12px',
													}}>
													<Trash2 size={16} className="me-2" />
													Hapus
												</Button>
											</div>
										</Card.Body>
									</Card>
								</Col>
							))
						)}
					</Row>
				</Card.Body>
			</Card>
		</>
	);
};

export default DashboardEventList;
