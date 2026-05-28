import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Accordion, Spinner, Alert } from 'react-bootstrap';
import { Calendar, MapPin, Share2, Heart, User, Wifi, Users, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../api/axios';
import { STORAGE_URL } from '../../../../api/storage';

export default function EventPreviewPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [eventDetails, setEventDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishErrors, setPublishErrors] = useState(null);

	useEffect(() => {
		const fetchEventDetails = async () => {
			setIsLoading(true);
			try {
				const response = await api.get(`events/${eventId}`);
				const data = response.data?.data || response.data;
				setEventDetails(data);
				setIsLoading(false);
			} catch (err) {
				console.error('Gagal memuat detail event untuk pratinjau:', err);
				setError('Data event tidak ditemukan atau terjadi kesalahan server.');
				setIsLoading(false);
			}
		};

		if (eventId) {
			fetchEventDetails();
		}
	}, [eventId]);

	const handlePublish = async () => {
		setIsPublishing(true);
		setPublishErrors(null);
		try {
			const response = await api.post(`events/${eventId}/publish`);
			if (response.data?.status === 'success') {
				alert('Selamat! Event Anda berhasil dipublikasikan.');
				navigate(`/organizer/${eventId}/event-dashboard`);
			}
		} catch (err) {
			console.error('Gagal mem-publish event:', err);
			const errData = err.response?.data;
			if (err.response?.status === 422 && errData?.errors) {
				setPublishErrors(errData.errors);
				// Scroll to top to see errors
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				alert(errData?.message || 'Terjadi kesalahan saat mempublikasikan event.');
			}
		} finally {
			setIsPublishing(false);
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return '-';
		try {
			const d = new Date(dateStr);
			const formatTimezone = (tz) => {
				if (!tz) return '';
				const mapping = {
					'Asia/Jakarta': 'WIB',
					'Asia/Makassar': 'WITA',
					'Asia/Jayapura': 'WIT',
					'WIB': 'WIB',
					'WITA': 'WITA',
					'WIT': 'WIT',
				};
				return mapping[tz] || tz;
			};
			const tzDisplay = formatTimezone(eventDetails?.timezone);
			return (
				d.toLocaleDateString('id-ID', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				}) + (tzDisplay ? ` (${tzDisplay})` : '')
			);
		} catch (e) {
			return dateStr;
		}
	};

	if (isLoading) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
				<Spinner animation="border" style={{ color: 'var(--color-primary, #00699e)' }} />
				<p className="mt-3 text-muted">Memuat pratinjau event...</p>
			</div>
		);
	}

	if (error || !eventDetails) {
		return (
			<Container className="py-5 text-center">
				<Alert variant="danger" className="mb-4 rounded-0 border-2">
					{error}
				</Alert>
				<Button variant="outline-dark" className="rounded-0 border-2 fw-semibold" onClick={() => navigate(-1)}>
					Kembali ke Dashboard
				</Button>
			</Container>
		);
	}

	// Group sessions dynamically by day_number
	const sessions = eventDetails.sessions || [];
	const sessionsByDay = {};
	sessions.forEach((s) => {
		const day = s.day_number || s.dayNumber || 1;
		if (!sessionsByDay[day]) {
			sessionsByDay[day] = [];
		}
		sessionsByDay[day].push(s);
	});
	const sortedDays = Object.keys(sessionsByDay).sort((a, b) => Number(a) - Number(b));

	const eventTypes = eventDetails.event_types || eventDetails.eventTypes || [];
	const categories = eventDetails.categories || [];

	return (
		<div style={{ backgroundColor: 'var(--color-bg, #f4f5f7)', minHeight: '100vh', paddingBottom: '80px' }}>
			{/* --- STICKY WARNING BANNER --- */}
			<div
				className="alert alert-warning rounded-0 shadow-none d-flex justify-content-between align-items-center sticky-top m-0 border-0 border-bottom"
				style={{
					zIndex: 1050,
					top: 0,
					borderBottomColor: '#f59e0b',
					backgroundColor: '#fffbeb',
					color: '#854d0e',
					padding: '12px 24px',
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<span style={{ fontSize: '1.2rem' }}>⚠️</span>
					<div style={{ fontSize: '13px' }}>
						<strong>Mode Preview:</strong> Ini adalah pratinjau halaman detail acara Anda. Peserta tidak dapat membeli tiket dalam mode ini.
					</div>
				</div>
				<div className="d-flex gap-2">
					<button
						className="btn btn-outline-dark rounded-0 px-3 py-2 fw-semibold shadow-none"
						style={{ fontSize: '12px', borderWidth: '1.5px' }}
						onClick={() => navigate(`/organizer/${eventId}/event-dashboard`)}
					>
						Kembali ke Dashboard
					</button>
					<button
						className="btn btn-dark rounded-0 px-3 py-2 fw-semibold shadow-none"
						style={{ fontSize: '12px' }}
						onClick={handlePublish}
						disabled={isPublishing}
					>
						{isPublishing ? 'Publishing...' : 'Publish Event'}
					</button>
				</div>
			</div>

			{/* --- VALIDATION ERROR CHECKLIST --- */}
			{publishErrors && (
				<Container className="mt-4">
					<Alert variant="danger" className="rounded-0 border-2 shadow-none mb-0 d-flex flex-column gap-2" onClose={() => setPublishErrors(null)} dismissible>
						<div className="fw-bold fs-6">Tidak Dapat Mempublikasikan Event</div>
						<div style={{ fontSize: '13px' }}>
							Silakan lengkapi data wajib berikut terlebih dahulu sebelum melakukan publikasi acara:
						</div>
						<ul className="mb-0 ps-3" style={{ fontSize: '12px', lineHeight: '1.6' }}>
							{publishErrors.map((msg, idx) => (
								<li key={idx} className="fw-medium text-danger">
									{msg}
								</li>
							))}
						</ul>
					</Alert>
				</Container>
			)}

			{/* --- HEADER BANNER --- */}
			<div className="bg-white border-bottom pt-4 pb-4 mb-4">
				<Container>
					<Button
						variant="link"
						className="text-decoration-none p-0 d-flex align-items-center mb-3 text-muted"
						style={{ fontSize: '13px', fontWeight: 600 }}
						onClick={() => navigate(-1)}
					>
						<ArrowLeft size={16} className="me-2" /> Kembali ke Halaman Sebelumnya
					</Button>
					<div className="d-flex gap-2 mb-3 flex-wrap">
						{/* Event Types */}
						{eventTypes.length > 0 ? (
							eventTypes.map((t) => {
								const typeName = typeof t === 'object' ? t.name : t;
								return (
									<Badge
										key={t.id || typeName}
										bg="light"
										text="primary"
										className="border border-primary px-3 py-2 d-flex align-items-center rounded-0 fw-semibold"
										style={{ fontSize: '11px' }}
									>
										{typeName === 'Online' ? <Wifi size={13} className="me-1" /> : <Users size={13} className="me-1" />}
										{typeName}
									</Badge>
								);
							})
						) : (
							<>
								{eventDetails.is_in_person && (
									<Badge bg="light" text="dark" className="border px-3 py-2 d-flex align-items-center rounded-0 fw-semibold" style={{ fontSize: '11px' }}>
										<Users size={13} className="me-1" /> Onsite
									</Badge>
								)}
								{eventDetails.is_online && (
									<Badge bg="light" text="primary" className="border border-primary px-3 py-2 d-flex align-items-center rounded-0 fw-semibold" style={{ fontSize: '11px' }}>
										<Wifi size={13} className="me-1" /> Online
									</Badge>
								)}
							</>
						)}

						{/* Categories */}
						{categories.length > 0 ? (
							categories.map((c) => {
								const catName = typeof c === 'object' ? c.name : c;
								return (
									<Badge key={c.id || catName} bg="light" text="dark" className="border px-3 py-2 rounded-0 fw-semibold" style={{ fontSize: '11px' }}>
										{catName}
									</Badge>
								);
							})
						) : (
							<>
								{eventDetails.category && (
									<Badge bg="light" text="dark" className="border px-3 py-2 rounded-0 fw-semibold" style={{ fontSize: '11px' }}>
										{eventDetails.category}
									</Badge>
								)}
							</>
						)}
					</div>

					<h1 className="fw-bold mb-3 text-dark" style={{ fontSize: '2.25rem', letterSpacing: '-0.5px' }}>
						{eventDetails.title}
					</h1>

					<p className="text-muted mb-0" style={{ maxWidth: '800px', fontSize: '15px', lineHeight: '1.6' }}>
						{eventDetails.short_description || 'Bergabunglah dalam event luar biasa ini dan tingkatkan portofolio serta kemampuan profesional Anda bersama KampusX.'}
					</p>
				</Container>
			</div>

			{/* --- MAIN CONTENT --- */}
			<Container>
				<Row className="g-4">
					{/* LEFT COLUMN: EVENT DETAILS */}
					<Col lg={8}>
						{/* Banner Image */}
						<div className="mb-4">
							<img
								src={eventDetails.image_path ? `${STORAGE_URL}/${eventDetails.image_path}` : `${STORAGE_URL}/event-banners/${eventDetails.id}.jpg`}
								alt={eventDetails.title}
								className="w-100 rounded-0 object-fit-cover border-2 border"
								style={{ height: '400px', objectPosition: 'center' }}
							/>
						</div>

						{/* Description */}
						<div className="bg-white p-4 rounded-0 border-2 border mb-4">
							<h4 className="fw-bold mb-3 text-dark border-bottom pb-2" style={{ fontSize: '18px' }}>
								Tentang Event Ini
							</h4>
							<div
								style={{ lineHeight: '1.8', color: '#334155', fontSize: '14px' }}
								dangerouslySetInnerHTML={{ __html: eventDetails.description || '<p className="text-muted">Deskripsi detail belum diatur.</p>' }}
							/>
						</div>

						{/* Agenda Accordion */}
						<div className="bg-white p-4 rounded-0 border-2 border mb-4">
							<h4 className="fw-bold mb-4 text-dark border-bottom pb-2" style={{ fontSize: '18px' }}>
								Jadwal &amp; Agenda
							</h4>
							{sortedDays.length === 0 ? (
								<div className="py-4 text-center border-2 border border-dashed rounded-0 bg-light">
									<p className="text-muted mb-0" style={{ fontSize: '13px' }}>
										Belum ada jadwal sesi yang didaftarkan untuk event ini.
									</p>
								</div>
							) : (
								<Accordion defaultActiveKey="0" className="border-0 shadow-none">
									{sortedDays.map((dayNum, index) => (
										<Accordion.Item eventKey={index.toString()} key={dayNum} className="mb-3 border rounded-0 shadow-none border-2">
											<Accordion.Header className="rounded-0">
												<div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
													Hari {dayNum} ({sessionsByDay[dayNum]?.[0]?.date || 'Tanggal belum diatur'})
												</div>
											</Accordion.Header>
											<Accordion.Body className="rounded-0 p-3">
												<ul className="list-unstyled m-0">
													{sessionsByDay[dayNum].map((session, sIdx) => (
														<li key={session.id || sIdx} className="d-flex mb-3 align-items-start border-bottom pb-3 last-border-none flex-wrap flex-sm-nowrap gap-2">
															<div
																className="fw-bold me-sm-3 text-nowrap py-1 px-2 border d-inline-block text-center bg-light"
																style={{
																	minWidth: '120px',
																	color: 'var(--color-primary, #00699e)',
																	fontFamily: 'monospace',
																	fontSize: '12px',
																}}
															>
																{session.start_time ? session.start_time.substring(0, 5) : '00:00'} - {session.end_time ? session.end_time.substring(0, 5) : '00:00'}
															</div>
															<div className="flex-grow-1" style={{ minWidth: 0 }}>
																<div className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
																	{session.title}
																</div>
																<div className="text-muted mb-2" style={{ fontSize: '12px', lineHeight: '1.5' }}>
																	{session.description || 'Tidak ada deskripsi sesi.'}
																</div>
																{session.speakers && session.speakers.length > 0 && (
																	<div className="mt-2 d-flex flex-wrap gap-2">
																		{session.speakers.map((spk) => (
																			<span key={spk.id} className="badge bg-light text-dark border-2 border px-2 py-1 rounded-0 font-monospace" style={{ fontSize: '10px' }}>
																				👤 {spk.name} {spk.role && `(${spk.role})`}
																			</span>
																		))}
																	</div>
																)}
															</div>
														</li>
													))}
												</ul>
											</Accordion.Body>
										</Accordion.Item>
									))}
								</Accordion>
							)}
						</div>
					</Col>

					{/* RIGHT COLUMN: STICKY TICKET & INFO CARDS */}
					<Col lg={4}>
						<div className="position-sticky" style={{ top: '80px' }}>
							{/* Ticket purchase mock card */}
							<Card className="border-2 rounded-0 shadow-none mb-4">
								<Card.Body className="p-4">
									<h4 className="fw-bold mb-1 text-dark" style={{ fontSize: '18px' }}>
										Beli Tiket
									</h4>
									<p className="text-muted small mb-4">Pilih jenis tiket atau sesi yang ingin Anda ikuti.</p>

									<div className="border border-2 rounded-0 p-3 mb-4 bg-light">
										<div className="d-flex align-items-center">
											<input type="radio" id="ticket-preview" className="me-2" checked readOnly style={{ accentColor: '#0f172a' }} />
											<label htmlFor="ticket-preview" className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>
												General Admission
											</label>
										</div>
										<div className="ms-4 mt-2 d-flex justify-content-between align-items-center flex-wrap gap-1">
											<span className="small text-muted" style={{ fontSize: '11px' }}>
												Akses ke seluruh sesi &amp; materi
											</span>
											<span className="fw-bold" style={{ color: 'var(--color-primary, #00699e)', fontSize: '14px' }}>
												{eventDetails.price === 0 || eventDetails.price === 'Free' || !eventDetails.price
													? 'Gratis'
													: `Rp ${Number(eventDetails.price).toLocaleString('id-ID')}`}
											</span>
										</div>
									</div>

									<Button
										variant="secondary"
										className="w-100 py-3 fw-bold rounded-0 border-0 mb-3 text-uppercase shadow-none"
										style={{ fontSize: '12px', cursor: 'not-allowed', backgroundColor: '#64748b' }}
										disabled
									>
										Pendaftaran Dinonaktifkan (Pratinjau)
									</Button>

									<div className="d-flex justify-content-center gap-2">
										<Button variant="light" className="d-flex align-items-center flex-fill justify-content-center border-2 border rounded-0 py-2 fw-semibold" style={{ fontSize: '12px' }} disabled>
											<Share2 size={14} className="me-2" /> Share
										</Button>
										<Button variant="light" className="d-flex align-items-center flex-fill justify-content-center border-2 border rounded-0 py-2 fw-semibold" style={{ fontSize: '12px' }} disabled>
											<Heart size={14} className="me-2 text-danger" /> Simpan
										</Button>
									</div>
								</Card.Body>
							</Card>

							{/* Card Detail Waktu & Lokasi */}
							<Card className="border-2 rounded-0 shadow-none mb-4">
								<Card.Body className="p-4">
									<h6 className="fw-bold mb-3 border-bottom pb-2" style={{ fontSize: '15px' }}>
										Waktu &amp; Lokasi
									</h6>

									<div className="d-flex mb-3 align-items-start">
										<div className="bg-light p-2 me-3 d-flex align-items-center justify-content-center border-2 border rounded-0" style={{ width: '40px', height: '40px' }}>
											<Calendar size={20} style={{ color: 'var(--color-primary, #00699e)' }} />
										</div>
										<div>
											<div className="fw-bold text-dark" style={{ fontSize: '13px', lineHeight: '1.4' }}>
												Mulai
											</div>
											<div className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
												{formatDate(eventDetails.start_date)}
											</div>
											<div className="fw-bold text-dark mt-2" style={{ fontSize: '13px', lineHeight: '1.4' }}>
												Selesai
											</div>
											<div className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
												{formatDate(eventDetails.end_date)}
											</div>
										</div>
									</div>

									<div className="d-flex align-items-start">
										<div className="bg-light p-2 me-3 d-flex align-items-center justify-content-center border-2 border rounded-0" style={{ width: '40px', height: '40px' }}>
											<MapPin size={20} style={{ color: 'var(--color-primary, #00699e)' }} />
										</div>
										<div>
											<div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
												{eventDetails.location_detail?.location_name || eventDetails.location_name || 'Lokasi Acara'}
											</div>
											<div className="text-muted mt-1" style={{ fontSize: '12px', lineHeight: '1.5' }}>
												{eventDetails.location_detail?.platform ? (
													<span>Platform Online: <strong>{eventDetails.location_detail.platform}</strong></span>
												) : (
													<span>
														{[
															eventDetails.location_detail?.address_detail,
															eventDetails.location_detail?.district,
															eventDetails.location_detail?.city,
															eventDetails.location_detail?.province,
														]
															.filter(Boolean)
															.join(', ') ||
															eventDetails.location ||
															eventDetails.address ||
															'Detail lokasi fisik belum diatur.'}
													</span>
												)}
											</div>
										</div>
									</div>
								</Card.Body>
							</Card>

							{/* Card Organizer */}
							<Card className="border-2 rounded-0 shadow-none">
								<Card.Body className="p-4 text-center">
									<h6 className="fw-bold mb-3 text-start border-bottom pb-2" style={{ fontSize: '15px' }}>
										Penyelenggara
									</h6>
									<div className="bg-light rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center border-2 border" style={{ width: '60px', height: '60px' }}>
										<User size={30} className="text-secondary" />
									</div>
									<h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>
										{eventDetails.organizer?.name || eventDetails.institution?.name || eventDetails.organizer_name || eventDetails.org || 'Panitia KampusX'}
									</h6>
									<Button variant="outline-dark" size="sm" className="w-100 rounded-0 mt-3 border-2 fw-semibold" style={{ fontSize: '12px' }} disabled>
										Follow Organizer (Mode Preview)
									</Button>
								</Card.Body>
							</Card>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
