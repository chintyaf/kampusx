import React, { useState, useEffect } from 'react';
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Badge,
	Form,
	Accordion,
	Spinner,
	Alert,
} from 'react-bootstrap';
import {
	Calendar,
	MapPin,
	Clock,
	Share2,
	Heart,
	User,
	Info,
	Wifi,
	Users,
	ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
// import axios from 'axios';
import api from '../../../../api/axios';
import { useAuth } from '../../../../context/AuthContext';
import { STORAGE_URL } from '../../../../api/storage';
import { Toast } from 'react-bootstrap';

const EventDetail = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();

	const [eventDetails, setEventDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedTicket, setSelectedTicket] = useState('day1');
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [registration, setRegistration] = useState({
		registered: false,
		status: null,
		order_id: null,
	});

	const [showToast, setShowToast] = useState(false);
	const [toastMsg, setToastMsg] = useState('');

	useEffect(() => {
		const fetchSingleEvent = async () => {
			setIsLoading(true);
			try {
				const response = await api.get(`events/${slug}`);
				const data = response.data.data || response.data;
				setEventDetails(data);
				setIsBookmarked(data.is_bookmarked || false);
				setIsLoading(false);
			} catch (err) {
				console.error('Gagal memuat detail event:', err);
				setError('Data event tidak ditemukan atau terjadi kesalahan server.');
				setIsLoading(false);
			}
		};

		if (slug) {
			fetchSingleEvent();
		}
	}, [slug]);

	useEffect(() => {
		const checkUserRegistration = async () => {
			if (user && eventDetails?.id) {
				try {
					const res = await api.get(`/checkout/check/${eventDetails.id}`);
					setRegistration(res.data);
				} catch (err) {
					console.error('Gagal mengecek registrasi user:', err);
				}
			}
		};
		checkUserRegistration();
	}, [eventDetails?.id, user]);

	const handleLanjutPembayaran = (e) => {
		e.preventDefault();
		console.log('Tombol diklik! ID event:', eventDetails?.id);

		if (!user) {
			console.log('User belum login, redirect ke Sign In');
			alert('Silakan Sign In terlebih dahulu untuk melanjutkan pembayaran.');
			navigate('/login', { state: { from: location.pathname } });
			return;
		}

		if (registration.registered) {
			if (registration.status === 'paid') {
				navigate('/my-tickets');
			} else if (registration.status === 'pending') {
				const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
				const sandboxUrl =
					apiBase.replace('/api/v1', '').replace('/api', '') +
					'/payment-sandbox/' +
					registration.order_id;
				window.location.href = sandboxUrl;
			}
			return;
		}

		navigate(`/checkout/${eventDetails?.id}`);
		console.log('Navigasi ke halaman checkout dengan ID event:', eventDetails?.id);
	};

	const handleToggleBookmark = async () => {
		if (!user) {
			alert('Silakan Sign In terlebih dahulu untuk menyimpan bookmark event.');
			navigate('/login', { state: { from: location.pathname } });
			return;
		}

		try {
			const response = await api.post(`v1/events/${eventDetails?.id}/bookmark`);
			if (response.data.status === 'success') {
				setIsBookmarked(response.data.is_bookmarked);
			}

			setToastMsg(
				response.data.is_bookmarked
					? 'Event disimpan ke Bookmark'
					: 'Event dihapus dari Bookmark',
			);
			setShowToast(true);
		} catch (err) {
			console.error('Gagal mengubah bookmark:', err);
			alert('Gagal memperbarui status bookmark.');
		}
	};

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		// alert("Link event berhasil disalin!");
		setToastMsg('Link event berhasil disalin!');
		setShowToast(true);
	};

	if (isLoading) {
		return (
			<div
				className="d-flex flex-column justify-content-center align-items-center"
				style={{ minHeight: '80vh' }}
			>
				<Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
				<p className="mt-3 text-muted">Memuat detail event...</p>
			</div>
		);
	}

	if (error || !eventDetails) {
		return (
			<Container className="py-5 text-center">
				<Alert variant="danger" className="mb-4">
					{error}
				</Alert>
				<Button variant="outline-primary" onClick={() => navigate(-1)}>
					Kembali ke Eksplor
				</Button>
			</Container>
		);
	}

	return (
		<div
			style={{
				backgroundColor: 'var(--color-bg)',
				minHeight: '100vh',
				paddingBottom: '80px',
			}}
		>
			{/* --- HEADER BANNER --- */}
			<div className="bg-white border-bottom pt-4 pb-4 mb-4 shadow-sm">
				<Container>
					<Button
						variant="link"
						className="text-decoration-none p-0 d-flex align-items-center mb-3 text-muted"
						onClick={() => navigate(-1)}
					>
						<ArrowLeft size={16} className="me-2" /> Kembali
					</Button>
					<div className="d-flex gap-2 mb-3">
						{/* Render tipe event (Online/Onsite) */}
						{eventDetails.is_in_person ? (
							<Badge
								bg="light"
								text="dark"
								className="border px-3 py-2 d-flex align-items-center"
							>
								<Users size={14} className="me-1" /> Onsite
							</Badge>
						) : null}
						{eventDetails.is_online ? (
							<Badge
								bg="light"
								text="primary"
								className="border border-primary px-3 py-2 d-flex align-items-center"
							>
								<Wifi size={14} className="me-1" /> Online
							</Badge>
						) : null}
						{/* Kategori Event (Jika ada) */}
						{eventDetails.category ? (
							<Badge bg="light" text="dark" className="border px-3 py-2">
								{eventDetails.category}
							</Badge>
						) : null}
					</div>

					{/* --- TITLE & ACTION BUTTONS --- */}
					{/* Judul + Action Buttons */}
					<div className="d-flex justify-content-between align-items-start mb-3 gap-3">
						<div className="flex-grow-1">
							<h1
								className="fw-bold m-0"
								style={{
									color: 'var(--color-text)',
									fontSize: '2.5rem',
									lineHeight: 1.2,
								}}
							>
								{eventDetails.title}
							</h1>

							<p className="text-muted fs-5 mb-0" style={{ maxWidth: '800px' }}>
								{/* Menampilkan deskripsi singkat (jika ada field short_description), atau potong deskripsi panjang */}
								{eventDetails.short_description ||
									'Bergabunglah dalam event luar biasa ini dan tingkatkan portofolio serta kemampuan profesional Anda bersama KampusX.'}
							</p>
						</div>

						<div className="d-flex gap-2 flex-shrink-0 mt-2">
							{/* Share */}
							<button
								onClick={handleShare}
								title="Bagikan Event"
								style={{
									width: '38px',
									height: '38px',
									borderRadius: '50%',
									border: '1.5px solid #e2e8f0',
									background: 'transparent',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
									color: '#64748b',
									transition: 'all 0.15s ease',
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.background = '#f8fafc';
									e.currentTarget.style.borderColor = '#cbd5e1';
									e.currentTarget.style.color = '#334155';
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.background = 'transparent';
									e.currentTarget.style.borderColor = '#e2e8f0';
									e.currentTarget.style.color = '#64748b';
								}}
							>
								<Share2 size={16} strokeWidth={2} />
							</button>

							{/* Bookmark */}
							<button
								onClick={handleToggleBookmark}
								title={isBookmarked ? 'Hapus dari Simpan' : 'Simpan Event'}
								style={{
									width: '38px',
									height: '38px',
									borderRadius: '50%',
									border: `1.5px solid ${isBookmarked ? '#fecaca' : '#e2e8f0'}`,
									background: isBookmarked ? '#fff5f5' : 'transparent',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
									transition: 'all 0.15s ease',
								}}
								onMouseOver={(e) => {
									if (!isBookmarked) {
										e.currentTarget.style.background = '#fff5f5';
										e.currentTarget.style.borderColor = '#fecaca';
									}
								}}
								onMouseOut={(e) => {
									if (!isBookmarked) {
										e.currentTarget.style.background = 'transparent';
										e.currentTarget.style.borderColor = '#e2e8f0';
									}
								}}
							>
								<Heart
									size={16}
									strokeWidth={2}
									style={{
										fill: isBookmarked ? '#ef4444' : 'none',
										color: isBookmarked ? '#ef4444' : '#64748b',
										transition: 'all 0.15s ease',
									}}
								/>
							</button>
						</div>
					</div>
				</Container>
			</div>

			<Container>
				<Row className="g-4">
					{/* ========================================== */}
					{/* KOLOM KIRI: KONTEN UTAMA */}
					{/* ========================================== */}
					<Col lg={8}>
						{/* Gambar Utama Event */}
						<div className="mb-4">
							<img
								src={
									eventDetails.image_path
										? `${STORAGE_URL}/${eventDetails.image_path}`
										: `${STORAGE_URL}/event-banners/${eventDetails.id}.jpg`
								}
								alt={eventDetails.title}
								className="w-100 rounded-4 object-fit-cover shadow-sm"
								style={{ height: '400px' }}
							/>
						</div>

						{/* Deskripsi Event */}
						<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
							<h4 className="fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
								Tentang Event Ini
							</h4>

							{/* Jika dari Laravel Anda mengirim format HTML (misal dari CKEditor), gunakan dangerouslySetInnerHTML */}
							<div
								style={{ lineHeight: '1.8', color: 'var(--color-secondary)' }}
								dangerouslySetInnerHTML={{
									__html:
										eventDetails.description ||
										'<p>Deskripsi tidak tersedia.</p>',
								}}
							/>
						</div>

						{/* Jadwal & Sesi */}
						<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
							<h4 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
								Jadwal & Agenda
							</h4>

							{eventDetails.sessions && eventDetails.sessions.length > 0 ? (
								(() => {
									const sessionsByDay = eventDetails.sessions.reduce(
										(acc, session) => {
											const day = session.day_number || 1;
											if (!acc[day]) acc[day] = [];
											acc[day].push(session);
											return acc;
										},
										{},
									);

									return (
										<Accordion defaultActiveKey="day-1">
											{Object.keys(sessionsByDay).map((day) => (
												<Accordion.Item
													eventKey={`day-${day}`}
													key={day}
													className="mb-3 border rounded"
												>
													<Accordion.Header>
														<div className="fw-bold">Hari {day}</div>
													</Accordion.Header>
													<Accordion.Body>
														<ul className="list-unstyled m-0">
															{sessionsByDay[day]
																.sort((a, b) =>
																	(
																		a.start_time || ''
																	).localeCompare(
																		b.start_time || '',
																	),
																)
																.map((session, index) => (
																	<li
																		key={session.id || index}
																		className="d-flex mb-4 align-items-start"
																	>
																		<div
																			className="fw-bold me-3"
																			style={{
																				minWidth: '90px',
																				color: 'var(--color-primary)',
																				fontSize:
																					'var(--font-sm)',
																			}}
																		>
																			{session.start_time
																				? session.start_time.substring(
																						0,
																						5,
																					)
																				: '09:00'}{' '}
																			-{' '}
																			{session.end_time
																				? session.end_time.substring(
																						0,
																						5,
																					)
																				: '10:00'}
																		</div>
																		<div className="flex-grow-1">
																			<div
																				className="fw-semibold text-dark"
																				style={{
																					fontSize:
																						'var(--font-sm)',
																				}}
																			>
																				{session.title}
																			</div>
																			{session.description && (
																				<p className="text-muted small mb-2">
																					{
																						session.description
																					}
																				</p>
																			)}
																			{session.speakers &&
																				session.speakers
																					.length > 0 && (
																					<div className="d-flex flex-wrap gap-2 mt-1">
																						{session.speakers.map(
																							(
																								speaker,
																								idx,
																							) => (
																								<span
																									key={
																										speaker.id ||
																										idx
																									}
																									className="badge bg-light text-dark border small py-1.5 px-2.5"
																									style={{
																										borderRadius:
																											'6px',
																									}}
																								>
																									🎤{' '}
																									{
																										speaker.name
																									}{' '}
																									(
																									{speaker.role ||
																										'Pembicara'}
																									)
																								</span>
																							),
																						)}
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
									);
								})()
							) : (
								<p className="text-muted small m-0">
									Rundown sesi belum diumumkan oleh penyelenggara.
								</p>
							)}
						</div>
					</Col>

					{/* ========================================== */}
					{/* KOLOM KANAN: STICKY TICKET CARD */}
					{/* ========================================== */}
					<Col lg={4}>
						<div className="" style={{ top: '90px' }}>
							{/* Card Pembelian Tiket */}
							<Card className="border shadow-sm rounded-4 mb-4">
								<Card.Body className="p-4">
									<h4
										className="fw-bold mb-1"
										style={{ color: 'var(--color-text)' }}
									>
										Beli Tiket
									</h4>
									<p className="text-muted small mb-4">
										Pilih jenis tiket atau sesi yang ingin Anda ikuti.
									</p>

									<Form onSubmit={handleLanjutPembayaran}>
										<div
											className={`border rounded-3 p-3 mb-4 cursor-pointer ${selectedTicket === 'day1' ? 'border-primary bg-light' : ''}`}
											onClick={() => setSelectedTicket('day1')}
										>
											<Form.Check
												type="radio"
												id="ticket-day1"
												label={
													<span className="fw-bold">
														General Admission
													</span>
												}
												checked={selectedTicket === 'day1'}
												onChange={() => setSelectedTicket('day1')}
											/>
											<div className="ms-4 mt-1 d-flex justify-content-between align-items-center">
												<span className="small text-muted">
													Akses ke semua materi
												</span>
												<span
													className="fw-bold"
													style={{ color: 'var(--color-primary)' }}
												>
													{eventDetails.price === undefined
														? 'Memuat...'
														: Number(eventDetails.price) === 0
															? 'Gratis'
															: new Intl.NumberFormat('id-ID', {
																	style: 'currency',
																	currency: 'IDR',
																	maximumFractionDigits: 0,
																}).format(eventDetails.price)}
												</span>
											</div>
										</div>

										<Button
											type="submit"
											className="w-100 py-3 fw-bold rounded-3 border-0 mb-3"
											style={
												registration.registered
													? registration.status === 'paid'
														? {
																backgroundColor: '#6c757d',
																color: '#fff',
															}
														: {
																backgroundColor: '#ffc107',
																color: '#000',
															}
													: { backgroundColor: 'var(--color-primary)' }
											}
											disabled={
												!registration.registered && eventDetails.quota <= 0
											} // Disable jika kuota habis dan belum register
										>
											{registration.registered
												? registration.status === 'paid'
													? 'Sudah Terdaftar (Lihat Tiket)'
													: 'Menunggu Pembayaran'
												: eventDetails.quota <= 0
													? 'Kuota Habis'
													: Number(eventDetails.price) === 0
														? 'Klaim Tiket Gratis'
														: 'Lanjutkan ke Pembayaran'}
										</Button>
									</Form>

									{/* <div className="d-flex justify-content-center gap-3">
                                        <Button variant="light" className="d-flex align-items-center flex-fill justify-content-center border">
                                            <Share2 size={16} className="me-2" /> Share
                                        </Button>
                                        <Button
                                            variant="light"
                                            onClick={handleToggleBookmark}
                                            className="d-flex align-items-center flex-fill justify-content-center border"
                                        >
                                            <Heart
                                                size={16}
                                                className={`me-2 ${isBookmarked ? 'text-danger' : 'text-secondary'}`}
                                                style={isBookmarked ? { fill: '#dc3545', color: '#dc3545' } : {}}
                                            />
                                            {isBookmarked ? 'Disimpan' : 'Simpan'}
                                        </Button>
                                    </div> */}
								</Card.Body>
							</Card>

							{/* Card Detail Waktu & Lokasi */}
							<Card className="border shadow-sm rounded-4 mb-4">
								<Card.Body className="p-4">
									<h6 className="fw-bold mb-3">Waktu & Lokasi</h6>

									<div className="d-flex mb-3">
										<div
											className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center"
											style={{ width: '40px', height: '40px' }}
										>
											<Calendar
												size={20}
												style={{ color: 'var(--color-primary)' }}
											/>
										</div>
										<div>
											<div
												className="fw-semibold text-dark"
												style={{ fontSize: 'var(--font-sm)' }}
											>
												{eventDetails.date || eventDetails.start_date}
											</div>
											<div
												className="text-muted"
												style={{ fontSize: 'var(--font-xs)' }}
											>
												Sesuai Jadwal
											</div>
										</div>
									</div>

									<div className="d-flex mb-3">
										<div
											className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center"
											style={{ width: '40px', height: '40px' }}
										>
											<MapPin
												size={20}
												style={{ color: 'var(--color-primary)' }}
											/>
										</div>
										<div>
											<div
												className="fw-semibold text-dark"
												style={{ fontSize: 'var(--font-sm)' }}
											>
												{eventDetails.location_name || 'Lokasi Event'}
											</div>
											<div
												className="text-muted"
												style={{ fontSize: 'var(--font-xs)' }}
											>
												{eventDetails.location || eventDetails.address}
											</div>
										</div>
									</div>
								</Card.Body>
							</Card>

							{/* Card Organizer */}
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
						</div>
					</Col>
				</Row>
			</Container>

			{/* Toast */}
			<Toast
				show={showToast}
				onClose={() => setShowToast(false)}
				delay={2500}
				autohide
				className="position-fixed bottom-0 start-50 translate-middle-x mb-4"
				style={{ zIndex: 9999 }}
			>
				<Toast.Body className="text-white bg-dark rounded-pill px-4 text-center">
					{toastMsg}
				</Toast.Body>
			</Toast>
		</div>
	);
};

export default EventDetail;
