import React, { useState, useEffect } from 'react';
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Nav,
	ProgressBar,
	Badge,
	Accordion,
	Modal,
	Spinner,
	Alert,
} from 'react-bootstrap';
import {
	ArrowLeft,
	Layout,
	BookOpen,
	PlayCircle,
	MessageCircle,
	QrCode,
	Download,
	CheckCircle,
	FileText,
	Award,
	Lock,
	Sparkles,
	Star,
	Calendar,
	MapPin,
	Clock,
	Megaphone,
	Bell,
	User,
	Users,
	Info,
	Wifi,
	Gift,
	AlertTriangle,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ParticipantMaterialsTab from '../../components/event/ParticipantMaterialsTab';
import EventAnnouncementsTab from '../../components/event/EventAnnouncementsTab';
import { STORAGE_URL } from '../../api/storage';

const EventSpace = () => {
	const { id } = useParams(); // Mengambil ID event dari URL
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('overview');
	const [showTicketModal, setShowTicketModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [apiError, setApiError] = useState(null);

	// Dynamic states from backend
	const [event, setEvent] = useState(null);
	const [alreadySubmitted, setAlreadySubmitted] = useState(false);
	const [ticketCode, setTicketCode] = useState('TKT-ACTIVE-001');
	const [participantName, setParticipantName] = useState('');

	const [announcements, setAnnouncements] = useState([]);

	// Poin & Reward States
	const [memberPoints, setMemberPoints] = useState(120);
	const [localRewardsCatalog, setLocalRewardsCatalog] = useState([
		{
			id: 1,
			title: 'Kaos Eksklusif KampusX',
			description: 'Bahan cotton combed 30s premium, sablon discharge rapi, tersedia ukuran S-XXL.',
			points_cost: 100,
			stock: 50,
			limit_per_user: 1,
			reward_type: 'physical',
			image_path: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
			is_active: true
		},
		{
			id: 2,
			title: 'E-Voucher Gopay Rp50.000',
			description: 'Saldo Gopay senilai Rp50.000. Kode voucher dikirim otomatis via log penukaran.',
			points_cost: 80,
			stock: 20,
			limit_per_user: 2,
			reward_type: 'digital',
			image_path: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=300',
			is_active: true
		},
		{
			id: 3,
			title: 'Stiker Pack Hologram',
			description: 'Satu pack berisi 5 stiker hologram desain maskot dan ikon KampusX.',
			points_cost: 15,
			stock: 200,
			limit_per_user: 5,
			reward_type: 'physical',
			image_path: 'https://images.unsplash.com/photo-1572375995301-3b9894856aef?w=300',
			is_active: true
		}
	]);
	const [myRedemptions, setMyRedemptions] = useState([
		{
			id: 1,
			reward_title: 'Stiker Pack Hologram',
			points_spent: 15,
			reward_type: 'physical',
			redeemed_at: new Date(Date.now() - 86400000).toISOString(),
			status: 'claimed',
			notes: 'Diambil langsung di Booth Utama.'
		}
	]);
	const [showRedeemWarningModal, setShowRedeemWarningModal] = useState(false);
	const [pendingRedeemReward, setPendingRedeemReward] = useState(null);

	const handleRedeemReward = (reward) => {
		if (memberPoints < reward.points_cost) {
			toast.error('Saldo poin lokal Anda tidak mencukupi!');
			return;
		}

		if (reward.stock !== null && reward.stock <= 0) {
			toast.error('Stok reward ini telah habis!');
			return;
		}

		const claimCount = myRedemptions.filter(r => r.reward_title === reward.title && r.status !== 'cancelled').length;
		if (reward.limit_per_user !== null && claimCount >= reward.limit_per_user) {
			toast.error(`Anda telah mencapai batas maksimum penukaran (${reward.limit_per_user}x) untuk reward ini.`);
			return;
		}

		// Jika event diselenggarakan online (is_online) dan reward fisik
		if (event?.is_online && reward.reward_type === 'physical') {
			setPendingRedeemReward(reward);
			setShowRedeemWarningModal(true);
		} else {
			executeRedemption(reward);
		}
	};

	const executeRedemption = (reward) => {
		setMemberPoints(prev => prev - reward.points_cost);
		setLocalRewardsCatalog(prev => prev.map(r =>
			r.id === reward.id ? { ...r, stock: r.stock !== null ? r.stock - 1 : null } : r
		));

		const newRedemption = {
			id: Date.now(),
			reward_title: reward.title,
			points_spent: reward.points_cost,
			reward_type: reward.reward_type,
			redeemed_at: new Date().toISOString(),
			status: 'pending',
			notes: reward.reward_type === 'physical'
				? 'Menunggu pengambilan di lokasi event.'
				: 'Kode e-voucher akan segera dikirim oleh panitia.'
		};

		setMyRedemptions([newRedemption, ...myRedemptions]);
		toast.success(`Berhasil menukar ${reward.title}!`);
		setShowRedeemWarningModal(false);
	};

	const formatTimeAgo = (dateString) => {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMins / 60000);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMins < 1) return 'Baru saja';
			if (diffMins < 60) return `${diffMins} menit yang lalu`;
			if (diffHours < 24) return `${diffHours} jam yang lalu`;
			if (diffDays < 7) return `${diffDays} hari yang lalu`;

			return date.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			});
		} catch (e) {
			return 'Baru saja';
		}
	};

	useEffect(() => {
		const fetchEventDetails = async () => {
			setIsLoading(true);
			setApiError(null);
			try {
				// Fetch basic event space survey status
				const resSurvey = await api.get(`/events/${id}/survey`);
				// Fetch full details of the event including sessions, speakers, and image
				const resDetail = await api.get(`/events/${id}`);

				if (resSurvey.data.success) {
					const data = resSurvey.data.data;
					const eventData = resDetail.data.data || resDetail.data;

					setEvent({
						...data.event,
						...eventData,
					});
					setAlreadySubmitted(data.already_submitted);
					setTicketCode(data.ticket_code);
					setParticipantName(data.participant_name);

					// Fetch official announcements
					let fetchedAnnouncements = [];
					try {
						const resAnn = await api.get(`/events/${id}/announcements`);
						if (resAnn.data?.success) {
							fetchedAnnouncements = resAnn.data.data || [];
						}
					} catch (err) {
						console.error('Gagal mengambil pengumuman:', err);
					}

					// Fetch notifications for the user
					let filteredNotifications = [];
					try {
						const resNotif = await api.get('/notifications');
						if (resNotif.data?.success) {
							const allNotifs = resNotif.data.data || [];
							filteredNotifications = allNotifs.filter((notif) => {
								const notifData =
									typeof notif.data === 'string'
										? JSON.parse(notif.data)
										: notif.data || {};

								const notifEventId = notifData.event_id;
								const matchesEvent = String(notifEventId) === String(id);

								const relevantTypes = ['event_updated', 'H-24', 'H-1', 'M-15'];
								const matchesType = relevantTypes.includes(notifData.type);

								return matchesEvent && matchesType;
							});
						}
					} catch (err) {
						console.error('Gagal mengambil notifikasi:', err);
					}

					// Format and merge them
					const mappedAnnouncements = fetchedAnnouncements.map((ann) => ({
						id: `ann-${ann.id}`,
						title: ann.title,
						content: ann.content,
						date: ann.created_at,
						type: 'announcement',
						isPinned: true,
					}));

					const mappedNotifications = filteredNotifications.map((notif) => {
						const notifData =
							typeof notif.data === 'string'
								? JSON.parse(notif.data)
								: notif.data || {};

						return {
							id: `notif-${notif.id}`,
							title: notifData.title || 'Update Acara',
							content: notifData.message,
							date: notif.created_at,
							type: notifData.type,
							isPinned: ['H-1', 'M-15'].includes(notifData.type),
						};
					});

					// Sort chronologically (latest first)
					const combined = [...mappedAnnouncements, ...mappedNotifications].sort(
						(a, b) => {
							return new Date(b.date) - new Date(a.date);
						},
					);

					setAnnouncements(combined);
				}
			} catch (err) {
				console.error('Gagal mengambil info event:', err);
				setApiError(err.response?.data?.message || 'Gagal memuat beberapa data event.');
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchEventDetails();
		}
	}, [id]);

	if (isLoading) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
				<Spinner
					animation="border"
					variant="primary"
					style={{ width: '3rem', height: '3rem' }}
				/>
				<p className="text-muted mt-3 fw-medium">Memuat Dashboard Event Space...</p>
			</div>
		);
	}

	// Merging fallback title and backend dynamic data
	const title = event?.title || 'Workshop & Kelas Pembelajaran Unggulan';
	const organizer = event?.organizer?.name || event?.institution?.name || 'Penyelenggara KampusX';
	const progress = alreadySubmitted ? 100 : 75; // Completing survey gives 100% completion

	// --- RENDER AREA KONTEN BERDASARKAN TAB ---
	const renderContent = () => {
		switch (activeTab) {
			case 'overview':
				return (
					<div className="fade-in">
						{/* 1. PHOTO BANNER EVENT */}
						<div
							className="mb-4 overflow-hidden rounded-4 shadow-sm border position-relative"
							style={{ height: '320px' }}
						>
							<img
								src={
									event?.image_path
										? `${STORAGE_URL}/${event.image_path}`
										: `${STORAGE_URL}/event-banners/${event?.id}.jpg`
								}
								alt={event?.title}
								className="w-100 h-100 object-fit-cover"
							/>
							<div
								style={{
									position: 'absolute',
									bottom: 0,
									left: 0,
									right: 0,
									background:
										'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
									padding: '24px',
									color: '#ffffff',
								}}
							>
								<div className="d-flex flex-wrap gap-2 mb-2">
									{event?.is_in_person && (
										<Badge
											bg="light"
											text="dark"
											className="border px-2.5 py-1.5 small"
										>
											<Users size={12} className="me-1" /> Onsite
										</Badge>
									)}
									{event?.is_online && (
										<Badge
											bg="primary"
											className="border border-primary px-2.5 py-1.5 small"
										>
											<Wifi size={12} className="me-1" /> Online
										</Badge>
									)}
									{event?.category && (
										<Badge bg="secondary" className="px-2.5 py-1.5 small">
											{event.category}
										</Badge>
									)}
								</div>
								<h3 className="fw-bold mb-1">{event?.title}</h3>
								<div className="d-flex flex-wrap gap-3 small opacity-90">
									<span className="d-flex align-items-center gap-1">
										<Calendar size={14} /> {event?.date || 'Tanggal Acara'}
									</span>
									<span className="d-flex align-items-center gap-1">
										<Clock size={14} /> {event?.time || '09:00 - Selesai'}
									</span>
									<span className="d-flex align-items-center gap-1">
										<MapPin size={14} /> {event?.location || 'Venue Acara'}
									</span>
								</div>
							</div>
						</div>

						{/* Certificate Claim Alert Banner */}
						{!alreadySubmitted ? (
							<Alert
								variant="warning"
								className="border-0 shadow-sm rounded-4 p-3.5 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
							>
								<div className="d-flex align-items-center gap-3">
									<div className="bg-warning bg-opacity-20 rounded-circle p-2 text-warning d-flex">
										<Award size={24} className="animate-bounce" />
									</div>
									<div>
										<h6
											className="fw-bold text-dark mb-1"
											style={{ fontSize: '14px' }}
										>
											E-Sertifikat Kelulusan Tersedia!
										</h6>
										<p
											className="mb-0 text-muted small"
											style={{ fontSize: '12px' }}
										>
											Berikan penilaian/feedback kelas setelah menyelesaikan
											seluruh rangkaian materi untuk mengklaim sertifikat
											kelulusan.
										</p>
									</div>
								</div>
								<Button
									variant="warning"
									size="sm"
									onClick={() => setActiveTab('sertifikat')}
									className="rounded-pill px-3.5 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-1.5"
									style={{ fontSize: '12px' }}
								>
									<Sparkles size={14} /> Klaim Sertifikat
								</Button>
							</Alert>
						) : (
							<Alert
								variant="success"
								className="border-0 shadow-sm rounded-4 p-3.5 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
							>
								<div className="d-flex align-items-center gap-3">
									<div className="bg-success bg-opacity-20 rounded-circle p-2 text-success d-flex">
										<CheckCircle size={24} />
									</div>
									<div>
										<h6
											className="fw-bold text-dark mb-1"
											style={{ fontSize: '14px' }}
										>
											E-Sertifikat Kelulusan Telah Aktif!
										</h6>
										<p
											className="mb-0 text-muted small"
											style={{ fontSize: '12px' }}
										>
											Terima kasih atas partisipasi Anda. Berkas e-sertifikat
											PDF dengan kode QR verifikasi unik telah siap diunduh.
										</p>
									</div>
								</div>
								<Button
									variant="success"
									size="sm"
									onClick={() => setActiveTab('sertifikat')}
									className="rounded-pill px-3.5 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-1.5"
									style={{ fontSize: '12px' }}
								>
									<Download size={14} /> Unduh Sertifikat
								</Button>
							</Alert>
						)}

						{/* <Row className="g-4"> */}
						{/* LEFT DETAIL COLUMN */}
						{/* <Col lg={8} md={12}> */}
						{/* PAPAN PENGUMUMAN PANITIA */}
						<Card className="border-0 shadow-sm rounded-4 mb-4">
							<Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
								<h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
									<Megaphone size={18} className="text-danger animate-pulse" />
									<span>Papan Pengumuman Panitia</span>
								</h6>
								<small className="text-secondary">
									Informasi terhangat dari panitia penyelenggara
								</small>
							</Card.Header>
							<Card.Body className="px-4 pb-4 pt-2">
								<div className="d-flex flex-column gap-3">
									{announcements.length === 0 ? (
										<div className="text-center py-4 text-muted bg-light rounded-4 border border-dashed">
											<Megaphone
												size={30}
												className="opacity-25 mb-2 mx-auto text-secondary"
											/>
											<h6
												className="fw-bold text-dark mb-1"
												style={{ fontSize: '13px' }}
											>
												Belum Ada Pengumuman
											</h6>
											<p className="small mb-0" style={{ fontSize: '11px' }}>
												Penyelenggara belum menerbitkan pengumuman atau
												perubahan baru.
											</p>
										</div>
									) : (
										announcements.map((ann) => {
											const badgeConfig = {
												announcement: {
													label: '📌 PENGUMUMAN',
													color: '#3b82f6',
													bg: 'rgba(59, 130, 246, 0.08)',
												},
												event_updated: {
													label: '🔄 UPDATE ACARA',
													color: '#06b6d4',
													bg: 'rgba(6, 182, 212, 0.08)',
												},
												'H-24': {
													label: '📅 H-1 ACARA',
													color: '#eab308',
													bg: 'rgba(234, 179, 8, 0.08)',
												},
												'H-1': {
													label: '⚠️ PENTING (1 JAM)',
													color: '#f97316',
													bg: 'rgba(249, 115, 22, 0.08)',
												},
												'M-15': {
													label: '🚨 MENDESAK (15 MENIT)',
													color: '#ef4444',
													bg: 'rgba(239, 68, 68, 0.08)',
												},
											};

											const config = badgeConfig[ann.type] || {
												label: '📢 UPDATE',
												color: '#6b7280',
												bg: 'rgba(107, 114, 128, 0.08)',
											};

											return (
												<div
													key={ann.id}
													className="p-3.5 rounded-4 border position-relative transition-all hover-shadow"
													style={{
														borderLeft: `4px solid ${config.color}`,
														backgroundColor: config.bg,
														transition: 'all 0.2s ease-in-out',
													}}
												>
													<div className="d-flex justify-content-between align-items-center mb-2">
														<span
															className="badge border px-2 py-1 rounded small fw-bold"
															style={{
																fontSize: '10px',
																borderColor: `${config.color}22`,
																color: config.color,
																backgroundColor: '#ffffff',
															}}
														>
															{config.label}
														</span>
														<span
															className="text-muted small"
															style={{ fontSize: '10px' }}
														>
															{formatTimeAgo(ann.date)}
														</span>
													</div>
													<h6
														className="fw-bold mb-1 text-dark"
														style={{ fontSize: '13.5px' }}
													>
														{ann.title}
													</h6>
													<p
														className="text-muted mb-0 small"
														style={{
															fontSize: '12px',
															lineHeight: '1.5',
														}}
													>
														{ann.content}
													</p>
												</div>
											);
										})
									)}
								</div>
							</Card.Body>
						</Card>

						{/* TENTANG EVENT */}
						<Card className="border-0 shadow-sm rounded-4 mb-4">
							<Card.Body className="p-4">
								<h6 className="fw-extrabold text-dark mb-3">Tentang Event Ini</h6>
								<div
									style={{
										lineHeight: '1.8',
										color: 'var(--color-secondary)',
										fontSize: '13px',
									}}
									dangerouslySetInnerHTML={{
										__html:
											event?.description ||
											'<p>Deskripsi tidak tersedia.</p>',
									}}
								/>
							</Card.Body>
						</Card>

						{/* RUNDOWN & SESSIONS */}
						<Card className="border-0 shadow-sm rounded-4 mb-4">
							<Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
								<h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
									<Clock size={18} className="text-primary" />
									<span>Rundown & Agenda Sesi</span>
								</h6>
								<small className="text-secondary">
									Waktu pelaksanaan dan detail pemateri acara
								</small>
							</Card.Header>
							<Card.Body className="px-4 pb-4 pt-2">
								{event?.sessions && event.sessions.length > 0 ? (
									(() => {
										const sessionsByDay = event.sessions.reduce(
											(acc, session) => {
												const day = session.day_number || 1;
												if (!acc[day]) acc[day] = [];
												acc[day].push(session);
												return acc;
											},
											{},
										);

										return (
											<Accordion
												defaultActiveKey="day-1"
												className="custom-accordion"
											>
												{Object.keys(sessionsByDay).map((day) => (
													<Accordion.Item
														eventKey={`day-${day}`}
														key={day}
														className="mb-3 border rounded-4 overflow-hidden shadow-sm"
													>
														<Accordion.Header>
															<div className="fw-bold text-dark">
																Hari {day}
															</div>
														</Accordion.Header>
														<Accordion.Body className="p-3">
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
																			key={
																				session.id || index
																			}
																			className="d-flex mb-4 align-items-start gap-3"
																		>
																			<div
																				className="fw-bold text-primary"
																				style={{
																					minWidth:
																						'95px',
																					fontSize:
																						'12px',
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
																					className="fw-bold text-dark"
																					style={{
																						fontSize:
																							'13px',
																					}}
																				>
																					{session.title}
																				</div>
																				{session.description && (
																					<p
																						className="text-muted small mb-2"
																						style={{
																							fontSize:
																								'12px',
																						}}
																					>
																						{
																							session.description
																						}
																					</p>
																				)}
																				{session.speakers &&
																					session.speakers
																						.length >
																					0 && (
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
																										className="badge bg-light text-dark border small py-1 px-2"
																										style={{
																											borderRadius:
																												'6px',
																											fontSize:
																												'10px',
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
									<p className="text-muted small m-0 text-center py-4 bg-light rounded-4">
										Jadwal sesi acara belum diumumkan oleh penyelenggara.
									</p>
								)}
							</Card.Body>
						</Card>
						{/* </Col> */}

						{/* RIGHT STICKY TICKET DETAILS COLUMN */}
						{/* <Col lg={4} md={12}>
                                <Card className="border-0 shadow-sm rounded-4 text-center p-4 bg-white position-sticky" style={{ top: '100px', zIndex: 10 }}>
                                    <h6 className="fw-extrabold text-dark mb-3">E-Tiket Check-in Anda</h6>
                                    <div className="bg-light p-3.5 rounded-4 d-inline-block border border-dashed mb-3">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}`}
                                            alt="QR Code Tiket"
                                            className="mix-blend-multiply"
                                            style={{ width: '130px', height: '130px' }}
                                        />
                                    </div>
                                    <div className="fw-bold text-dark mb-1" style={{ fontSize: '16px' }}>{ticketCode}</div>
                                    <div className="text-muted small mb-3" style={{ fontSize: '11px' }}>Tunjukkan QR Code ini ke petugas pos kehadiran untuk check-in kehadiran di venue.</div>
                                    <Badge bg="success" className="px-2.5 py-1.5 rounded-pill fw-semibold bg-success bg-opacity-10 text-success border border-success border-opacity-10" style={{ fontSize: '11px' }}>
                                        STATUS: TIKET AKTIF
                                    </Badge>
                                </Card>
                            </Col> */}
						{/* </Row> */}
						{/* <Row className="g-4">
							<Col lg={4} md={12}>
								<div
									className="position-sticky"
									style={{ top: '100px', zIndex: 10 }}
								>
									{(event?.locationDetail?.type === 'online' ||
										event?.locationDetail?.type === 'hybrid') &&
										event?.locationDetail?.meeting_link && (
											<Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-3 text-start">
												<h6 className="fw-extrabold text-dark mb-2.5 d-flex align-items-center gap-2">
													<Wifi
														size={18}
														className="text-primary animate-pulse"
													/>
													<span>Akses Kelas Online</span>
												</h6>
												<p
													className="text-muted mb-3 small"
													style={{ fontSize: '12px', lineHeight: '1.5' }}
												>
													Acara ini diselenggarakan secara{' '}
													<strong>
														{event?.locationDetail?.type === 'hybrid'
															? 'Hybrid'
															: 'Online'}
													</strong>{' '}
													melalui platform{' '}
													<strong>
														{event?.locationDetail?.platform ||
															'Video Conference'}
													</strong>
													.
												</p>

												{event?.locationDetail?.online_instruction && (
													<div
														className="bg-light p-3 rounded-3 mb-3 text-muted small"
														style={{
															fontSize: '11.5px',
															whiteSpace: 'pre-line',
															border: '1px solid #f1f3f5',
														}}
													>
														<span className="fw-bold text-dark d-block mb-1">
															📖 Petunjuk Akses:
														</span>
														{event.locationDetail.online_instruction}
													</div>
												)}

												<a
													href={event.locationDetail.meeting_link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-decoration-none"
												>
													<Button
														variant="primary"
														className="w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
													>
														<PlayCircle size={16} /> Gabung Pertemuan
													</Button>
												</a>
											</Card>
										)}

									<Card className="border-0 shadow-sm rounded-4 text-center p-4 bg-white">
										<h6 className="fw-extrabold text-dark mb-3">
											E-Tiket Check-in Anda
										</h6>
										<div className="bg-light p-3.5 rounded-4 d-inline-block border border-dashed mb-3">
											<img
												src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}`}
												alt="QR Code Tiket"
												className="mix-blend-multiply"
												style={{ width: '130px', height: '130px' }}
											/>
										</div>
										<div
											className="fw-bold text-dark mb-1"
											style={{ fontSize: '16px' }}
										>
											{ticketCode}
										</div>
										<div
											className="text-muted small mb-3"
											style={{ fontSize: '11px' }}
										>
											Tunjukkan QR Code ini ke petugas pos kehadiran untuk
											check-in kehadiran di venue.
										</div>
										<Badge
											bg="success"
											className="px-2.5 py-1.5 rounded-pill fw-semibold bg-success bg-opacity-10 text-success border border-success border-opacity-10"
											style={{ fontSize: '11px' }}
										>
											STATUS: TIKET AKTIF
										</Badge>
									</Card>
								</div>
							</Col>
						</Row> */}
					</div>
				);
			case 'materi':
				return (
					<div className="fade-in">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h4 className="fw-bold mb-0">Materi Pembelajaran</h4>
							<span className="text-muted small">{progress}% Selesai</span>
						</div>
						<ProgressBar
							now={progress}
							variant={progress === 100 ? 'success' : 'primary'}
							className="mb-4"
							style={{ height: '8px' }}
						/>

						<Accordion defaultActiveKey="0" className="custom-accordion">
							{fallbackMateri.map((bab, index) => (
								<Accordion.Item
									eventKey={index.toString()}
									key={bab.id}
									className="mb-3 border-0 rounded-4 shadow-sm overflow-hidden"
								>
									<Accordion.Header className="fw-bold bg-white">
										{bab.chapter}
									</Accordion.Header>
									<Accordion.Body className="p-0 bg-light">
										{bab.lessons.map((lesson) => (
											<div
												key={lesson.id}
												className="d-flex align-items-center justify-content-between p-3 border-bottom cursor-pointer hover-bg-white transition-all"
											>
												<div className="d-flex align-items-center gap-3">
													{lesson.isCompleted ? (
														<CheckCircle
															size={20}
															className="text-success"
														/>
													) : lesson.type === 'video' ? (
														<PlayCircle
															size={20}
															className="text-primary opacity-50"
														/>
													) : (
														<FileText
															size={20}
															className="text-primary opacity-50"
														/>
													)}
													<div>
														<div
															className={`fw-medium ${lesson.isCompleted ? 'text-muted' : 'text-dark'}`}
														>
															{lesson.title}
														</div>
														<div
															className="text-muted"
															style={{ fontSize: '12px' }}
														>
															{lesson.type === 'video'
																? 'Video'
																: 'Modul'}{' '}
															• {lesson.duration}
														</div>
													</div>
												</div>
												{!lesson.isCompleted && (
													<Button
														variant="outline-primary"
														size="sm"
														className="rounded-pill px-3"
													>
														Mulai
													</Button>
												)}
											</div>
										))}
									</Accordion.Body>
								</Accordion.Item>
							))}
						</Accordion>
					</div>
				);
			case 'diskusi':
				return (
					<div className="fade-in text-center py-5">
						<MessageCircle size={48} className="text-muted mb-3 opacity-50" />
						<h5 className="fw-bold text-muted">Forum Diskusi</h5>
						<p className="text-muted small">
							Ruang diskusi untuk event ini akan segera dibuka oleh penyelenggara.
						</p>
					</div>
				);
			case 'pengumuman':
				return (
					<div className="fade-in">
						<EventAnnouncementsTab eventId={id} />
					</div>
				);
			case 'sertifikat':
				return (
					<div className="fade-in text-center py-4">
						{!alreadySubmitted ? (
							<Card
								className="border-0 shadow-sm rounded-4 d-inline-block text-start"
								style={{ maxWidth: '500px', width: '100%' }}
							>
								<Card.Body className="p-5 d-flex flex-column align-items-center text-center">
									<div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3.5 mb-4 border border-warning border-opacity-25">
										<Lock size={40} className="animate-pulse" />
									</div>
									<h4 className="fw-bold mb-2">Sertifikat Belum Terbuka</h4>
									<p className="text-muted small mb-4">
										Sertifikat apresiasi kelulusan Anda saat ini masih terkunci.
										Mohon berikan feedback/penilaian evaluasi singkat Anda
										mengenai pelaksanaan event ini untuk membuka sertifikat.
									</p>
									<Link
										to={`/event-space/${id}/survey`}
										className="w-100 text-decoration-none"
									>
										<Button
											variant="primary"
											className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
										>
											<Sparkles size={18} /> Mulai Isi Survei Feedback
										</Button>
									</Link>
								</Card.Body>
							</Card>
						) : (
							<Card
								className="border-0 shadow-sm rounded-4 d-inline-block text-start"
								style={{ maxWidth: '550px', width: '100%' }}
							>
								<Card.Body className="p-5 d-flex flex-column align-items-center text-center">
									<div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3.5 mb-4 border border-success border-opacity-25">
										<Award size={44} className="text-warning" />
									</div>
									<h4 className="fw-bold mb-2">Sertifikat Anda Telah Siap!</h4>
									<p className="text-muted small mb-4">
										Terima kasih telah berpartisipasi dan mengirimkan ulasan
										evaluasi. Anda dapat melihat preview sertifikat digital Anda
										secara instan dan mengunduhnya dalam format PDF berkualitas
										tinggi.
									</p>
									<div className="bg-light p-3.5 rounded-4 w-100 mb-4 border border-dashed text-start">
										<div className="d-flex justify-content-between mb-2">
											<span className="text-muted small">Status Klaim</span>
											<Badge
												bg="success"
												className="px-2.5 py-1.5 rounded-pill fw-semibold"
											>
												AKTIF & TERVERIFIKASI
											</Badge>
										</div>
										<div className="d-flex justify-content-between">
											<span className="text-muted small">Nama Penerima</span>
											<span
												className="fw-bold text-dark text-truncate"
												style={{ maxWidth: '220px' }}
											>
												{participantName || 'Peserta Kelas'}
											</span>
										</div>
									</div>
									<Link
										to={`/event-space/${id}/survey`}
										className="w-100 text-decoration-none"
									>
										<Button
											variant="success"
											className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
										>
											<Download size={18} /> Lihat & Unduh Sertifikat (PDF)
										</Button>
									</Link>
								</Card.Body>
							</Card>
						)}
					</div>
				);
			case 'rewards':
				return (
					<div className="fade-in">
						{/* Point balance widget */}
						<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4 rounded-4 mb-4 border bg-gradient text-dark" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)', borderColor: '#ffe4e6' }}>
							<div>
								<span className="text-secondary small fw-semibold">Saldo Poin Lokal Anda</span>
								<h2 className="fw-extrabold text-primary mb-1 d-flex align-items-center gap-2">
									<Gift className="text-warning animate-bounce" />
									<span>{memberPoints} Poin</span>
								</h2>
								<p className="text-muted mb-0 small" style={{ fontSize: '0.75rem' }}>
									Dapatkan lebih banyak poin dengan melakukan check-in, mengisi survey, bertanya di sesi, atau mengunjungi booth sponsor.
								</p>
							</div>
							<Badge bg="light" className="text-dark border px-3 py-2 rounded-pill mt-3 mt-md-0 font-semibold text-xs shadow-sm">
								Event: {event?.title || 'Workshop & Kelas'}
							</Badge>
						</div>

						{/* Rewards Catalog */}
						<h5 className="fw-bold text-dark mb-3">Katalog Hadiah Lokal</h5>
						<Row className="g-4 mb-5">
							{localRewardsCatalog.filter(r => r.is_active).map((reward) => {
								const claimCount = myRedemptions.filter(r => r.reward_title === reward.title && r.status !== 'cancelled').length;
								const isReachedLimit = reward.limit_per_user !== null && claimCount >= reward.limit_per_user;
								const isOutOfStock = reward.stock !== null && reward.stock <= 0;
								const isPointsInsufficient = memberPoints < reward.points_cost;

								return (
									<Col xs={12} md={6} key={reward.id}>
										<Card className="border shadow-none rounded-4 overflow-hidden h-100 transition-all hover-shadow">
											<div className="position-relative" style={{ height: '180px' }}>
												<img
													src={reward.image_url || reward.image_path}
													alt={reward.title}
													className="w-100 h-100 object-fit-cover"
												/>
												<div className="position-absolute top-0 start-0 p-2.5">
													<Badge bg={reward.reward_type === 'physical' ? 'info' : 'success'} className="px-2.5 py-1.5 shadow-sm text-xxs font-bold text-white border border-opacity-10">
														{reward.reward_type === 'physical' ? '🎁 Fisik' : '💻 Digital'}
													</Badge>
												</div>
												<div className="position-absolute top-0 end-0 p-2.5">
													<Badge bg="dark" className="bg-opacity-75 px-2.5 py-1.5 shadow-sm text-xxs font-bold text-white">
														{reward.points_cost} Pts
													</Badge>
												</div>
											</div>
											<Card.Body className="p-3.5 d-flex flex-column justify-content-between">
												<div>
													<h6 className="fw-bold text-dark mb-1.5">{reward.title}</h6>
													<p className="text-muted small mb-3" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
														{reward.description}
													</p>
												</div>
												<div>
													<div className="d-flex justify-content-between text-secondary mb-3 small" style={{ fontSize: '0.75rem' }}>
														<span>
															Stok: {reward.stock !== null ? <strong>{reward.stock} Pcs</strong> : <strong className="text-muted">Tak terbatas</strong>}
														</span>
														{reward.limit_per_user && (
															<span>
																Batas: <strong>{claimCount}/{reward.limit_per_user}x</strong>
															</span>
														)}
													</div>
													<Button
														variant={isOutOfStock ? "secondary" : isReachedLimit ? "light" : "primary"}
														disabled={isOutOfStock || isReachedLimit || isPointsInsufficient}
														className="w-100 rounded-pill py-2 text-xs fw-bold shadow-sm"
														onClick={() => handleRedeemReward(reward)}
													>
														{isOutOfStock
															? 'Stok Habis'
															: isReachedLimit
																? 'Mencapai Batas'
																: isPointsInsufficient
																	? `Butuh ${reward.points_cost} Poin`
																	: 'Tukar Poin Sekarang'}
													</Button>
												</div>
											</Card.Body>
										</Card>
									</Col>
								);
							})}
						</Row>

						{/* Redemption History */}
						<h5 className="fw-bold text-dark mb-3">Riwayat Penukaran Saya</h5>
						<Card className="border shadow-none rounded-4 overflow-hidden">
							<div className="table-responsive">
								<Table hover className="align-middle mb-0 custom-table" style={{ fontSize: '0.85rem' }}>
									<thead className="bg-light">
										<tr className="text-secondary" style={{ fontSize: '0.8rem' }}>
											<th className="px-4 py-2.5">Tanggal</th>
											<th className="py-2.5">Hadiah</th>
											<th className="py-2.5 text-center">Poin spent</th>
											<th className="py-2.5">Status</th>
											<th className="px-4 py-2.5">Catatan Penukaran</th>
										</tr>
									</thead>
									<tbody>
										{myRedemptions.length === 0 ? (
											<tr>
												<td colSpan="5" className="text-center py-4 text-muted small">
													Belum ada penukaran reward yang tercatat.
												</td>
											</tr>
										) : (
											myRedemptions.map((item) => (
												<tr key={item.id}>
													<td className="px-4 py-3 text-secondary">
														{new Date(item.redeemed_at).toLocaleDateString('id-ID', {
															day: 'numeric',
															month: 'short',
															year: 'numeric'
														})}
													</td>
													<td className="py-3">
														<span className="fw-bold text-dark">{item.reward_title}</span>
														<div className="text-xxs text-muted">{item.reward_type === 'physical' ? '🎁 Fisik' : '💻 Digital'}</div>
													</td>
													<td className="py-3 text-center fw-bold text-secondary">{item.points_spent}</td>
													<td className="py-3">
														{item.status === 'pending' && <Badge bg="warning" className="text-dark">🕒 Menunggu</Badge>}
														{item.status === 'claimed' && <Badge bg="success" className="text-white">🤝 Diambil</Badge>}
														{item.status === 'delivered' && <Badge bg="success" className="text-white">📩 Terkirim</Badge>}
														{item.status === 'cancelled' && <Badge bg="danger" className="text-white">❌ Dibatalkan</Badge>}
													</td>
													<td className="px-4 py-3">
														<div className="small text-secondary" style={{ fontSize: '0.75rem', maxWidth: '250px' }}>
															{item.status === 'cancelled' ? (
																<span className="text-danger fw-semibold">Ditolak: {item.cancellation_reason || 'Dibatalkan oleh panitia'}</span>
															) : (
																item.notes
															)}
														</div>
													</td>
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>
						</Card>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="bg-light min-vh-100 pb-5">
			{/* HEADER MICRO LMS */}
			<div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
				<Container className="py-3">
					<div className="d-flex align-items-center justify-content-between">
						<div className="d-flex align-items-center gap-3">
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex border"
								onClick={() => navigate(-1)}
							>
								<ArrowLeft size={20} className="text-dark" />
							</Button>
							<div>
								<h5
									className="fw-bold mb-0 text-truncate"
									style={{
										maxWidth: '600px',
										color: 'var(--color-primary, #1A365D)',
									}}
								>
									{title}
								</h5>
								<span className="text-muted small">Penyelenggara: {organizer}</span>
							</div>
						</div>

						{/* TOMBOL CEPAT QR CODE DI HEADER */}
						<Button
							variant="dark"
							className="rounded-pill px-4 py-2 d-flex align-items-center shadow-sm fw-medium"
							onClick={() => setShowTicketModal(true)}
						>
							<QrCode size={18} className="me-2" /> E-Tiket QR
						</Button>
					</div>
				</Container>
			</div>

			<Container className="mt-4">
				{apiError && (
					<Alert variant="warning" className="rounded-4 border-0 shadow-sm mb-4">
						{apiError}
					</Alert>
				)}

				<Row className="g-4">
					{/* SIDEBAR NAVIGASI */}
					<Col lg={3} md={4}>
						<Card
							className="border-0 shadow-sm rounded-4 position-sticky"
							style={{ top: '100px' }}
						>
							<Card.Body className="p-3">
								<Nav className="flex-column gap-2 custom-pills">
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('overview')}
									>
										<Layout size={18} className="me-3" /> Overview
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'materi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('materi')}
									>
										<BookOpen size={18} className="me-3" /> Materi Pembelajaran
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'diskusi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('diskusi')}
									>
										<MessageCircle size={18} className="me-3" /> Forum Diskusi
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'pengumuman' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('pengumuman')}
									>
										<Megaphone size={18} className="me-3" /> Pengumuman Event
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'rewards' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('rewards')}
									>
										<Gift size={18} className="me-3" /> Tukar Reward & Poin
										<Badge bg="primary-subtle" className="text-primary ms-auto rounded-pill border small font-bold px-2 py-1">
											{memberPoints} Pts
										</Badge>
									</Nav.Link>

									<hr className="my-2.5 opacity-25" />

									{/* MENU SERTIFIKAT & ULASAN DI SIDEBAR */}
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'sertifikat' ? 'bg-success text-white shadow-sm' : 'text-success hover-bg-success-subtle'}`}
										onClick={() => setActiveTab('sertifikat')}
										style={{ transition: 'all 0.2s ease' }}
									>
										<Award size={18} className="me-3" /> Sertifikat & Ulasan
										{alreadySubmitted ? (
											<Badge
												bg="success-subtle"
												text="success"
												className="ms-auto rounded-pill border border-success border-opacity-10 small"
											>
												Aktif
											</Badge>
										) : (
											<Badge
												bg="warning-subtle"
												text="warning"
												className="ms-auto rounded-pill border border-warning border-opacity-10 small"
											>
												Klaim
											</Badge>
										)}
									</Nav.Link>
								</Nav>
							</Card.Body>
						</Card>
					</Col>

					{/* MAIN CONTENT AREA */}
					<Col lg={9} md={8}>
						{activeTab === 'materi' ? (
							<div className="fade-in">
								<ParticipantMaterialsTab eventId={id} />
							</div>
						) : (
							<Card
								className="border-0 shadow-sm rounded-4"
								style={{ minHeight: '450px' }}
							>
								<Card.Body className="p-4 p-md-5">{renderContent()}</Card.Body>
							</Card>
						)}
					</Col>
				</Row>
			</Container>

			{/* MODAL POP-UP QR TIKET (Saat diklik dari Header) */}
			<Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} centered>
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

			{/* WARNING MODAL: ONLINE EVENT + PHYSICAL REWARD */}
			<Modal
				show={showRedeemWarningModal}
				onHide={() => setShowRedeemWarningModal(false)}
				centered
				backdrop="static"
				contentClassName="border-0 rounded-4 shadow-lg"
			>
				<Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
				<Modal.Body className="text-center px-4 pb-5 pt-0">
					<div className="mb-4">
						<div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3.5 mb-2 border border-warning border-opacity-25">
							<AlertTriangle size={48} className="text-warning animate-bounce" />
						</div>
					</div>
					<h4 className="fw-bold text-dark mb-2">Peringatan: Event Online + Reward Fisik</h4>
					<p className="text-muted small mb-4 px-2" style={{ lineHeight: '1.6', fontSize: '0.86rem' }}>
						Anda saat ini mengikuti event ini secara <strong>Online</strong>, namun Anda menukar reward fisik <strong>({pendingRedeemReward?.title})</strong>.
						<br /><br />
						Harap diperhatikan bahwa reward fisik hanya dapat diambil secara langsung di lokasi fisik acara atau harus diatur pengirimannya dengan panitia. Apakah Anda yakin ingin melanjutkan penukaran?
					</p>

					<div className="d-flex flex-column gap-2">
						<Button
							variant="warning"
							size="lg"
							className="rounded-pill fw-bold text-white shadow-sm"
							onClick={() => pendingRedeemReward && executeRedemption(pendingRedeemReward)}
						>
							Ya, Tukar Sekarang
						</Button>
						<Button
							variant="outline-secondary"
							size="lg"
							className="rounded-pill"
							onClick={() => setShowRedeemWarningModal(false)}
						>
							Batal
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default EventSpace;
