import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Calendar, MapPin, Users, LayoutDashboard, Trash2, Image as ImageIcon } from 'lucide-react';

const EventCard = ({ event, onDelete }) => {
	// Format tanggal
	const formatDate = (dateString) => {
		if (!dateString) return 'TBD';
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	// Get status badge style
	const getStatusStyle = (status) => {
		switch (status) {
			case 'published':
				return {
					bg: 'var(--bahama-blue-100)',
					color: 'var(--bahama-blue-800)',
					border: 'var(--bahama-blue-300)',
					text: 'Dipublikasikan',
				};
			case 'active':
				return {
					bg: 'var(--bahama-blue-100)',
					color: 'var(--bahama-blue-800)',
					border: 'var(--bahama-blue-300)',
					text: 'Aktif',
				};
			case 'draft':
				return {
					bg: '#fff3cd', // Asumsi warning-bg
					color: '#856404', // Asumsi warning-text
					border: '#ffeeba', // Asumsi warning-border
					text: 'Draft',
				};
			case 'cancelled':
				return {
					bg: '#f8d7da', // Asumsi error-bg
					color: '#721c24', // Asumsi error-text
					border: '#f5c6cb', // Asumsi error-border
					text: 'Dibatalkan',
				};
			default:
				return {
					bg: 'var(--color-bg-2)',
					color: 'var(--color-secondary)',
					border: 'var(--color-border)',
					text: status,
				};
		}
	};

	const statusStyle = getStatusStyle(event.status);

	return (
		<Card
			className="rounded-3 border overflow-hidden h-100"
			style={{
				borderColor: 'var(--color-border)',
				transition: 'all 0.3s ease',
				// backgroundColor: 'var(--color-white)',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = 'var(--color-primary)';
				e.currentTarget.style.transform = 'translateY(-5px)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = 'var(--color-border)';
				e.currentTarget.style.transform = 'translateY(0)';
			}}>
			<Row className="g-0 h-100">
				{/* KOLOM KIRI: GAMBAR */}
				<Col xs={12} md={4} className="position-relative">
					<div
						style={{
							width: '100%',
							height: '100%',
							minHeight: '200px',
							backgroundColor: 'var(--color-bg-2)',
							position: 'relative',
							overflow: 'hidden',
						}}>
						{event.image_path ? (
							<img
								src={event.image_path}
								alt={event.title}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									position: 'absolute',
									top: 0,
									left: 0,
								}}
								onError={(e) => {
									e.target.style.display = 'none';
									e.target.parentElement.querySelector(
										'.placeholder',
									).style.display = 'flex';
								}}
							/>
						) : null}

						{/* Placeholder jika gambar tidak ada */}
						<div
							className="placeholder"
							style={{
								display: event.image_path ? 'none' : 'flex',
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: 'var(--color-bg-2)',
								flexDirection: 'column',
							}}>
							<ImageIcon size={48} style={{ color: 'var(--color-secondary)' }} />
							<p
								style={{
									color: 'var(--color-secondary)',
									fontSize: 'var(--font-sm)',
									marginTop: '8px',
									marginBottom: 0,
								}}>
								Tidak ada gambar
							</p>
						</div>

						{/* Featured Badge - TELAH DIHAPUS DARI SINI */}
					</div>
				</Col>

				{/* KOLOM KANAN: KONTEN */}
				<Col xs={12} md={8}>
					<Card.Body className="p-4 d-flex flex-column h-100">
						{/* Baris Judul & Badge Status Horizontal */}
						<div className="d-flex align-items-start gap-2 mb-2">
							<Badge
								bg="transparent"
								className="rounded-pill px-2 py-1 fw-semibold flex-shrink-0 mt-1"
								style={{
									backgroundColor: statusStyle.bg,
									color: statusStyle.color,
									border: `1px solid ${statusStyle.border}`,
									fontSize: 'var(--font-xs)',
								}}>
								{statusStyle.text}
							</Badge>

							<Card.Title
								className="fw-bold mb-0 flex-grow-1"
								style={{
									fontSize: 'var(--font-lg)',
									color: 'var(--color-text)',
									lineHeight: '1.4',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									display: '-webkit-box',
									WebkitLineClamp: '2',
									WebkitBoxOrient: 'vertical',
								}}>
								{event.title}
							</Card.Title>
						</div>

						{/* ⭐ Featured Badge - TELAH DIPINDAHKAN KE SINI (Di bawah Judul) */}
						{event.is_featured && (
							<div className="mb-3">
								<Badge
									className="rounded-pill px-3 py-2 fw-semibold"
									bg="transparent"
									style={{
										backgroundColor: 'var(--bahama-blue-700)',
										color: 'var(--color-white)',
										fontSize: 'var(--font-xs)',
									}}>
									⭐ Featured
								</Badge>
							</div>
						)}

						{/* Description Preview */}
						{event.description && (
							<p
								className="mb-3"
								style={{
									fontSize: 'var(--font-sm)',
									color: 'var(--color-text-muted)',
									lineHeight: '1.5',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									display: '-webkit-box',
									WebkitLineClamp: '2',
									WebkitBoxOrient: 'vertical',
								}}>
								{event.description}
							</p>
						)}

						{/* Event Info */}
						<div className="mb-4">
							<Row className="g-2">
								<Col sm={6} className="d-flex align-items-center">
									<Calendar
										size={16}
										className="me-2"
										style={{ color: 'var(--color-primary)', flexShrink: 0 }}
									/>
									<span
										style={{
											fontSize: 'var(--font-sm)',
											color: 'var(--color-secondary)',
										}}>
										{formatDate(event.start_date)}
										{event.end_date &&
											event.start_date !== event.end_date &&
											` - ${formatDate(event.end_date)}`}
									</span>
								</Col>

								<Col sm={6} className="d-flex align-items-center">
									<Users
										size={16}
										className="me-2"
										style={{ color: 'var(--color-primary)', flexShrink: 0 }}
									/>
									<span
										style={{
											fontSize: 'var(--font-sm)',
											color: 'var(--color-secondary)',
										}}>
										{event.attendees || '0'} peserta
									</span>
								</Col>

								{event.location && (
									<Col xs={12} className="d-flex align-items-center mt-2">
										<MapPin
											size={16}
											className="me-2"
											style={{ color: 'var(--color-primary)', flexShrink: 0 }}
										/>
										<span
											style={{
												fontSize: 'var(--font-sm)',
												color: 'var(--color-secondary)',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}>
											{event.location}
										</span>
									</Col>
								)}
							</Row>
						</div>

						{/* Action Buttons */}
						<div className="d-flex gap-2 mt-auto">
							<Button
								as={NavLink}
								to={`/organizer/${event.id}/event-dashboard`}
								variant="outline-dark"
								className="flex-grow-1 d-flex justify-content-center align-items-center rounded-3 fw-semibold text-decoration-none"
								style={{
									fontSize: 'var(--font-sm)',
									padding: '8px 16px',
								}}>
								{/* Ganti icon dan teks di sini */}
								<LayoutDashboard size={16} className="me-2" />
								Kelola Event
							</Button>

							<Button
								variant="outline-dark" // Menggunakan outline-dark untuk desain clean
								className="flex-grow-1 d-flex justify-content-center align-items-center rounded-3 fw-semibold"
								style={{
									fontSize: 'var(--font-sm)',
									padding: '8px 16px',
								}}
								onClick={() => onDelete(event.id)}>
								<Trash2 size={16} className="me-2" />
								Hapus
							</Button>
						</div>
					</Card.Body>
				</Col>
			</Row>
		</Card>
	);
};

export default EventCard;
