import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Row, Col, Badge, Table, Modal } from 'react-bootstrap';
import { Tv, KeyRound, ArrowRight, ShieldCheck, MapPin, Scan, CheckCircle, HelpCircle, XCircle, RefreshCw, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Html5Qrcode } from 'html5-qrcode';

const STATIONS = [
	{ id: 1, name: 'Booth Sponsor A' },
	{ id: 2, name: 'Booth Sponsor B' },
	{ id: 3, name: 'Booth Utama' },
	{ id: 4, name: 'Exhibition Area' }
];

const ACTIVITIES = [
	{ slug: 'check_in', name: 'Check-in Kehadiran', points: 50 },
	{ slug: 'ask_question', name: 'Tanya Jawab (Ask Question)', points: 10 },
	{ slug: 'booth_visit', name: 'Kunjungan Booth (Booth Visit)', points: 15 }
];

export default function KioskModePage({ isStaff = false }) {
	const params = useParams();
	const navigate = useNavigate();
	const eventId = isStaff ? JSON.parse(localStorage.getItem('staff_event') || 'null')?.id : params.eventId;

	// Authentication states
	const [isLocked, setIsLocked] = useState(!isStaff);
	const [pinInput, setPinInput] = useState('');
	const [pinError, setPinError] = useState(false);

	// Setup Configuration states
	const [isConfigured, setIsConfigured] = useState(false);
	const [selectedStation, setSelectedStation] = useState(1);
	const [selectedActivity, setSelectedActivity] = useState('ask_question');

	// Scanning screen states
	const [ticketInput, setTicketInput] = useState('');
	const [recentLogs, setRecentLogs] = useState([]);
	const [participantsDb, setParticipantsDb] = useState([]);
	const [loadingParticipants, setLoadingParticipants] = useState(false);
	const [isSubmittingScan, setIsSubmittingScan] = useState(false);

	// Toggle simulation state using Ctrl + Alt + D
	const [showSimulation, setShowSimulation] = useState(false);

	// Success / Error Modals
	const [showResultModal, setShowResultModal] = useState(false);
	const [resultData, setResultData] = useState(null);

	// Real QR Scanner states
	const [useCamera, setUseCamera] = useState(false);
	const html5QrCodeRef = useRef(null);
	const scanLockRef = useRef(isSubmittingScan);

	// Fetch participants on mount/change
	useEffect(() => {
		if (eventId) {
			loadParticipants();
		}
	}, [eventId]);

	useEffect(() => {
		scanLockRef.current = isSubmittingScan;
	}, [isSubmittingScan]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
				e.preventDefault();
				setShowSimulation(prev => !prev);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		if (useCamera) {
			const timer = setTimeout(() => {
				try {
					const scanner = new Html5Qrcode("kiosk-reader");
					html5QrCodeRef.current = scanner;
					scanner.start(
						{ facingMode: "environment" },
						{ 
							fps: 10, 
							qrbox: (width, height) => ({ 
								width: Math.min(width, height) * 0.7, 
								height: Math.min(width, height) * 0.7 
							}) 
						},
						(decodedText) => {
							if (scanLockRef.current) return;
							processActivityClaim(decodedText);
						},
						() => {}
					).catch(err => {
						console.error("Camera access error:", err);
						toast.error("Gagal mengakses kamera.");
						setUseCamera(false);
					});
				} catch (e) {
					console.error(e);
					setUseCamera(false);
				}
			}, 200);

			return () => {
				clearTimeout(timer);
				if (html5QrCodeRef.current?.isScanning) {
					html5QrCodeRef.current.stop().catch(() => {});
				}
			};
		}
	}, [useCamera]);

	const loadParticipants = () => {
		if (!eventId) return;
		setLoadingParticipants(true);
		const pin = localStorage.getItem('staff_pin');
		const endpoint = isStaff
			? `/v1/staff/search-tickets?event_id=${eventId}&pos_pin=${pin}`
			: `/event-dashboard/${eventId}/daftar-peserta?all=true`;

		api.get(endpoint)
			.then(res => {
				if (res.data.success) {
					const mapped = res.data.data.map(ticket => {
						const pointsList = ticket.participant?.local_points || ticket.participant?.localPoints || [];
						const pointsRecord = pointsList.find(lp => lp.event_id === parseInt(eventId));
						return {
							ticket_code: ticket.ticket_code,
							name: ticket.attendee_name,
							email: ticket.attendee_email,
							balance: pointsRecord ? pointsRecord.points_balance : 0
						};
					});
					setParticipantsDb(mapped);
				}
			})
			.catch(err => {
				console.error("Gagal memuat peserta:", err);
			})
			.finally(() => {
				setLoadingParticipants(false);
			});
	};

	// Handle PIN Unlock
	const handlePinKeyPress = (num) => {
		setPinError(false);
		if (pinInput.length < 6) {
			const nextPin = pinInput + num;
			setPinInput(nextPin);
			if (nextPin === '123456') {
				toast.success('Kiosk Mode Terbuka!');
				setTimeout(() => {
					setIsLocked(false);
				}, 300);
			} else if (nextPin.length === 6) {
				setTimeout(() => {
					setPinError(true);
					setPinInput('');
					toast.error('PIN Salah! Silakan coba lagi.');
				}, 300);
			}
		}
	};

	const handleBackspace = () => {
		setPinInput(pinInput.slice(0, -1));
	};

	const handleResetKiosk = () => {
		if (window.confirm('Reset Kiosk dan kunci kembali layar?')) {
			setIsLocked(true);
			setPinInput('');
			setIsConfigured(false);
			toast.info('Kiosk terkunci.');
		}
	};

	// Handle Activity scan submission
	const processActivityClaim = (code) => {
		const ticketCode = code.trim().toUpperCase();
		if (!ticketCode) return;

		setIsSubmittingScan(true);

		const stationName = STATIONS.find(s => s.id === selectedStation)?.name || '';
		const activityDetail = ACTIVITIES.find(a => a.slug === selectedActivity);

		const payload = {
			ticket_code: ticketCode,
			activity_slug: selectedActivity,
		};

		if (selectedActivity === 'booth_visit') {
			payload.description = stationName;
		}

		const pin = localStorage.getItem('staff_pin');
		if (isStaff) {
			payload.pos_pin = pin || '';
		}

		const endpoint = isStaff
			? '/v1/staff/kiosk-scan'
			: `/event-dashboard/${eventId}/kiosk/scan`;

		api.post(endpoint, payload)
			.then(res => {
				if (res.data.status === 'success') {
					const responseData = res.data.data;

					// Success Result Modal
					setResultData({
						success: true,
						title: 'Klaim Poin Sukses!',
						message: `Berhasil menambahkan +${responseData.points_rewarded} Poin!`,
						participantName: responseData.participant_name,
						ticketCode: responseData.ticket_code,
						oldBalance: responseData.old_balance,
						newBalance: responseData.new_balance,
						activityName: responseData.activity_name
					});
					setShowResultModal(true);

					// Update balance in participants list
					setParticipantsDb(prev => prev.map(p => 
						p.ticket_code === responseData.ticket_code ? { ...p, balance: responseData.new_balance } : p
					));

					// Record log
					const newLog = {
						id: Date.now(),
						time: new Date().toLocaleTimeString('id-ID'),
						ticket_code: responseData.ticket_code,
						name: responseData.participant_name,
						station: selectedActivity === 'booth_visit' ? stationName : '-',
						activity: responseData.activity_name,
						points: responseData.points_rewarded
					};
					setRecentLogs(prevLogs => [newLog, ...prevLogs]);
				}
			})
			.catch(err => {
				const errMsg = err.response?.data?.message || 'Gagal memproses klaim poin.';
				const participantName = err.response?.data?.data?.participant_name || '';

				setResultData({
					success: false,
					title: 'Klaim Gagal',
					message: errMsg,
					participantName: participantName,
					ticketCode: ticketCode
				});
				setShowResultModal(true);
			})
			.finally(() => {
				setIsSubmittingScan(false);
			});
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		if (!ticketInput.trim()) return;
		processActivityClaim(ticketInput);
		setTicketInput('');
	};

	// 1. PIN LOCK SCREEN VIEW
	if (isLocked) {
		return (
			<div className="d-flex align-items-center justify-content-center py-5 min-vh-75">
				<Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-white text-center p-4 p-md-5" style={{ maxWidth: '400px', width: '100%' }}>
					<div className="mb-4 text-center">
						<div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3 border">
							<Tv size={32} />
						</div>
						<h5 className="fw-bold text-dark mb-1">Masuk Kiosk Mode</h5>
						<p className="text-muted small">
							Masukkan PIN POS Event untuk mengunci layar tablet/device ke Mode Kios.
						</p>
					</div>

					{/* Dot PIN indicators */}
					<div className="d-flex justify-content-center gap-3 mb-4">
						{[...Array(6)].map((_, i) => (
							<div 
								key={i} 
								className={`rounded-circle border ${pinError ? 'bg-danger border-danger animate-shake' : ''} `}
								style={{ 
									width: '16px', 
									height: '16px',
									backgroundColor: i < pinInput.length ? 'var(--color-primary, #0d6efd)' : '#e2e8f0',
									transition: 'background-color 0.15s ease'
								}}
							/>
						))}
					</div>

					{/* Custom Keypad */}
					<div className="mx-auto" style={{ maxWidth: '280px' }}>
						<Row className="g-2.5 mb-2.5">
							{[1, 2, 3].map(n => (
								<Col xs={4} key={n}>
									<Button 
										variant="light" 
										className="w-100 py-3 fw-bold rounded-3 border bg-light bg-opacity-40" 
										style={{ fontSize: '1.2rem' }}
										onClick={() => handlePinKeyPress(n)}
									>
										{n}
									</Button>
								</Col>
							))}
						</Row>
						<Row className="g-2.5 mb-2.5">
							{[4, 5, 6].map(n => (
								<Col xs={4} key={n}>
									<Button 
										variant="light" 
										className="w-100 py-3 fw-bold rounded-3 border bg-light bg-opacity-40" 
										style={{ fontSize: '1.2rem' }}
										onClick={() => handlePinKeyPress(n)}
									>
										{n}
									</Button>
								</Col>
							))}
						</Row>
						<Row className="g-2.5 mb-2.5">
							{[7, 8, 9].map(n => (
								<Col xs={4} key={n}>
									<Button 
										variant="light" 
										className="w-100 py-3 fw-bold rounded-3 border bg-light bg-opacity-40" 
										style={{ fontSize: '1.2rem' }}
										onClick={() => handlePinKeyPress(n)}
									>
										{n}
									</Button>
								</Col>
							))}
						</Row>
						<Row className="g-2.5">
							<Col xs={4} />
							<Col xs={4}>
								<Button 
									variant="light" 
									className="w-100 py-3 fw-bold rounded-3 border bg-light bg-opacity-40" 
									style={{ fontSize: '1.2rem' }}
									onClick={() => handlePinKeyPress(0)}
								>
									0
								</Button>
							</Col>
							<Col xs={4}>
								<Button 
									variant="light" 
									className="w-100 py-3 fw-bold rounded-3 border bg-light bg-opacity-40 text-danger" 
									style={{ fontSize: '0.9rem' }}
									onClick={handleBackspace}
								>
									DEL
								</Button>
							</Col>
						</Row>
					</div>

					<div className="mt-4 text-muted small">
						<KeyRound size={14} className="me-1 mb-0.5" /> PIN Default: <strong>123456</strong>
					</div>
				</Card>
			</div>
		);
	}

	// 2. CONFIGURATION SCREEN VIEW
	if (!isConfigured) {
		return (
			<div className="d-flex align-items-center justify-content-center py-5 min-vh-75">
				<Card className="border shadow-none rounded-4 bg-white p-4 p-md-5" style={{ maxWidth: '500px', width: '100%' }}>
					<div className="d-flex justify-content-between align-items-start mb-4">
						<div>
							<h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
								<ShieldCheck className="text-success" size={24} />
								<span>Konfigurasi Kiosk Stasiun</span>
							</h5>
							<p className="text-muted mb-0 small">
								Pilih stasiun operasional dan jenis aktivitas untuk device Kios ini.
							</p>
						</div>
						<Button 
							variant={isStaff ? "outline-secondary" : "outline-danger"} 
							size="sm" 
							className="rounded-pill" 
							onClick={() => isStaff ? navigate('/staff/dashboard') : handleResetKiosk()}
						>
							{isStaff ? 'Kembali' : 'Kunci'}
						</Button>
					</div>

					<Form.Group className="mb-3">
						<Form.Label className="fw-bold small text-secondary">Stasiun / Booth Kiosk</Form.Label>
						<Form.Select 
							value={selectedStation} 
							onChange={e => setSelectedStation(parseInt(e.target.value))}
							className="py-2.5"
						>
							{STATIONS.map(s => (
								<option key={s.id} value={s.id}>{s.name}</option>
							))}
						</Form.Select>
					</Form.Group>

					<Form.Group className="mb-4">
						<Form.Label className="fw-bold small text-secondary">Aktivitas Point yang Diberikan</Form.Label>
						<div className="d-flex flex-column gap-2">
							{ACTIVITIES.map(a => (
								<div 
									key={a.slug}
									className={`p-3 border rounded-3 cursor-pointer transition-all ${selectedActivity === a.slug ? 'border-primary bg-primary bg-opacity-5' : 'hover-bg-light'}`}
									onClick={() => setSelectedActivity(a.slug)}
								>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<span className="fw-bold text-dark small d-block">{a.name}</span>
											<span className="text-muted small" style={{ fontSize: '0.75rem' }}>
												Aktivitas berpoin lokal event
											</span>
										</div>
										<Badge bg="primary" className="px-2.5 py-1.5 font-bold">
											+{a.points} Pts
										</Badge>
									</div>
								</div>
							))}
						</div>
					</Form.Group>
					<Button 
						variant="primary" 
						size="lg" 
						className="w-100 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2.5"
						onClick={() => setIsConfigured(true)}
					>
						<span>Mulai Operasi Kiosk</span>
						<ArrowRight size={18} />
					</Button>
				</Card>
			</div>
		);
	}

	// 3. SCANNING DASHBOARD VIEW
	const currentStationObj = STATIONS.find(s => s.id === selectedStation);
	const currentActivityObj = ACTIVITIES.find(a => a.slug === selectedActivity);

	return (
		<div className="fade-in pb-5">
			{/* Kiosk Mode Active Bar */}
			<div className="alert alert-dark border-0 rounded-4 p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-sm">
				<div className="d-flex align-items-center gap-3">
					<div className="bg-success text-white rounded-circle p-2 d-flex">
						<Tv size={20} className="animate-pulse" />
					</div>
					<div>
						<h6 className="fw-bold text-white mb-0.5" style={{ fontSize: '0.9rem' }}>
							Kiosk Active Mode: {currentStationObj?.name}
						</h6>
						<p className="mb-0 text-secondary" style={{ fontSize: '0.78rem' }}>
							Melayani: <span className="text-warning fw-bold">{currentActivityObj?.name} (+{currentActivityObj?.points} Poin)</span>
						</p>
					</div>
				</div>
				<div className="d-flex gap-2">
					<Button variant="outline-light" size="sm" className="rounded-pill px-3" onClick={() => setIsConfigured(false)}>
						<RefreshCw size={12} className="me-1 mb-0.5" /> Ganti Tugas
					</Button>
					<Button variant={isStaff ? "secondary" : "danger"} size="sm" className="rounded-pill px-3 text-white border-0" onClick={() => isStaff ? navigate('/staff/dashboard') : handleResetKiosk()}>
						{isStaff ? "Kembali" : "Kunci Kiosk"}
					</Button>
				</div>
			</div>

			<Row className="g-4">
				{/* Kiri: Scanner Simulasi */}
				<Col xs={12} lg={6}>
					<Card className="border shadow-none rounded-4 overflow-hidden mb-4">
						<Card.Header className="bg-light border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
							<h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
								<Scan size={18} className="text-primary" />
								<span>Pemindai QR Kode Tiket</span>
							</h6>
							<Button 
								variant={useCamera ? "danger" : "primary"} 
								size="sm" 
								className="rounded-pill px-3 py-1 shadow-none font-semibold"
								onClick={() => setUseCamera(!useCamera)}
							>
								{useCamera ? "Matikan Kamera" : "Aktifkan Kamera"}
							</Button>
						</Card.Header>
						<Card.Body className="p-4 bg-light bg-opacity-40 text-center">
							{useCamera ? (
								<div 
									className="mx-auto border rounded-4 bg-dark overflow-hidden position-relative"
									style={{ width: '100%', maxWidth: '300px', height: '220px' }}
								>
									<div id="kiosk-reader" className="w-100 h-100"></div>
								</div>
							) : (
								/* Mock Camera View */
								<div 
									className="mx-auto border-3 border-dashed border-primary rounded-4 bg-dark position-relative overflow-hidden shadow-inner d-flex align-items-center justify-content-center"
									style={{ width: '100%', maxWidth: '300px', height: '220px' }}
								>
									{/* Scan Animation Line */}
									<div 
										className="position-absolute w-100 bg-success shadow-success" 
										style={{ 
											height: '4px', 
											opacity: 0.8,
											boxShadow: '0 0 12px #22c55e',
											animation: 'scanline-anim 2.5s infinite linear',
											top: 0
										}}
									/>
									<div className="text-center text-white-50 px-3 z-1">
										<Scan size={44} className="text-primary opacity-50 mb-2 mx-auto" />
										<p className="small mb-0">Pemindai Kiosk Siap</p>
										<p className="text-secondary" style={{ fontSize: '0.7rem' }}>Kamera mendeteksi otomatis...</p>
									</div>
								</div>
							)}

							<p className="text-muted small mt-3.5 mb-4">
								{useCamera ? "Dekatkan QR Code tiket peserta ke arah kamera." : "Aktifkan kamera untuk memindai QR tiket peserta, atau gunakan simulasi / input manual di bawah ini."}
							</p>

							{/* Manual Entry Form */}
							<Form onSubmit={handleFormSubmit} className="bg-white p-3 rounded-4 border shadow-sm text-start" style={{ maxWidth: '400px', margin: '0 auto' }}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-bold small text-secondary">Masukkan Kode Tiket Secara Manual</Form.Label>
									<Form.Control 
										type="text" 
										placeholder="e.g. TKT-MEMBER-001" 
										className="py-2 text-uppercase"
										value={ticketInput}
										onChange={e => setTicketInput(e.target.value)}
										disabled={isSubmittingScan}
									/>
								</Form.Group>
								<Button type="submit" variant="primary" className="w-100 rounded-pill py-2 fw-semibold" disabled={isSubmittingScan}>
									{isSubmittingScan ? 'Memproses...' : 'Verifikasi & Beri Poin'}
								</Button>
							</Form>
						</Card.Body>
					</Card>

					{/* Simulasi Click Section */}
					{showSimulation && (
						<Card className="border shadow-none rounded-4 mt-3">
							<Card.Header className="bg-white border-bottom py-3 px-4">
								<h6 className="fw-bold text-dark mb-0">Simulasi Satu-Klik (Untuk Testing)</h6>
							</Card.Header>
							<Card.Body className="p-3">
								<p className="text-muted small mb-3">Klik tombol "Simulasikan Scan" di samping nama untuk memicu scan secara instan.</p>
								<div className="d-flex flex-column gap-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
									{loadingParticipants ? (
										<div className="text-center py-4 text-muted small">
											Memuat daftar peserta event...
										</div>
									) : participantsDb.length === 0 ? (
										<div className="text-center py-4 text-muted small">
											Belum ada peserta terdaftar untuk event ini.
										</div>
									) : (
										participantsDb.map(p => (
											<div key={p.ticket_code} className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 hover-bg-light bg-light bg-opacity-20">
												<div>
													<span className="fw-bold text-dark small d-block">{p.name}</span>
													<span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
														{p.ticket_code} | Saldo: <strong>{p.balance} Pts</strong>
													</span>
												</div>
												<Button 
													variant="outline-primary" 
													size="sm" 
													className="rounded-pill px-3"
													onClick={() => processActivityClaim(p.ticket_code)}
													disabled={isSubmittingScan}
												>
													{isSubmittingScan ? 'Loading...' : 'Simulasikan Scan'}
												</Button>
											</div>
										))
									)}
								</div>
							</Card.Body>
						</Card>
					)}
				</Col>

				{/* Kanan: Recent Session logs */}
				<Col xs={12} lg={6}>
					<Card className="border shadow-none rounded-4 overflow-hidden h-100">
						<Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
							<h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
								<Tv size={18} className="text-secondary" />
								<span>Aktivitas Scan Sesi Ini</span>
							</h6>
							<Badge bg="light" className="text-secondary border">
								{recentLogs.length} Aktivitas Baru
							</Badge>
						</Card.Header>
						<div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
							<Table hover className="align-middle mb-0 custom-table">
								<thead className="bg-light sticky-top">
									<tr className="text-secondary" style={{ fontSize: '0.8rem' }}>
										<th className="px-4 py-2.5">Waktu</th>
										<th className="py-2.5">Peserta</th>
										<th className="py-2.5">Aktivitas</th>
										<th className="px-4 py-2.5 text-end">Poin</th>
									</tr>
								</thead>
								<tbody>
									{recentLogs.length === 0 ? (
										<tr>
											<td colSpan="4" className="text-center py-5 text-muted small">
												<UserCheck size={32} className="opacity-20 mb-2 mx-auto" />
												<p className="mb-0 fw-semibold">Belum Ada Aktivitas Terdaftar</p>
												<p className="text-xxs text-muted mb-0">Lakukan scan tiket peserta untuk melihat log realtime disini.</p>
											</td>
										</tr>
									) : (
										recentLogs.map((log) => (
											<tr key={log.id} style={{ fontSize: '0.85rem' }}>
												<td className="px-4 py-2.5 text-secondary">{log.time}</td>
												<td className="py-2.5">
													<div className="fw-semibold text-dark">{log.name}</div>
													<div className="text-muted text-xxs">{log.ticket_code}</div>
												</td>
												<td className="py-2.5">
													<Badge bg="light" className="text-secondary border text-xxs font-normal">
														{log.activity}
													</Badge>
												</td>
												<td className="px-4 py-2.5 text-end fw-bold text-success">
													+{log.points}
												</td>
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Success / Error Overlay Modal */}
			<AnimatePresence>
				{showResultModal && resultData && (
					<Modal 
						show={showResultModal} 
						onHide={() => setShowResultModal(false)} 
						centered 
						contentClassName="border-0 rounded-4 shadow-lg overflow-hidden"
						backdropClassName="bg-dark bg-opacity-70"
					>
						<Modal.Body className="p-0 text-center">
							{/* Result Header Color */}
							<div className={`p-4 text-white d-flex flex-column align-items-center ${resultData.success ? 'bg-success' : 'bg-danger'}`}>
								{resultData.success ? (
									<motion.div 
										initial={{ scale: 0 }} 
										animate={{ scale: 1 }} 
										transition={{ type: 'spring', stiffness: 260, damping: 20 }}
										className="bg-white bg-opacity-20 rounded-circle p-3 mb-3 d-flex"
									>
										<CheckCircle size={48} className="text-white" />
									</motion.div>
								) : (
									<motion.div 
										initial={{ scale: 0 }} 
										animate={{ scale: 1 }} 
										transition={{ type: 'spring', stiffness: 260, damping: 20 }}
										className="bg-white bg-opacity-20 rounded-circle p-3 mb-3 d-flex"
									>
										<XCircle size={48} className="text-white" />
									</motion.div>
								)}
								<h4 className="fw-bold mb-1">{resultData.title}</h4>
								<p className="mb-0 text-white text-opacity-90 small">{resultData.activityName || 'Validasi Tiket'}</p>
							</div>

							{/* Result details body */}
							<div className="p-4 text-start">
								{resultData.success ? (
									<>
										<div className="text-center mb-4">
											<h3 className="fw-extrabold text-success mb-1">{resultData.message}</h3>
											<span className="text-muted small">Telah ditambahkan ke saldo peserta</span>
										</div>

										<div className="p-3 border rounded-3 bg-light mb-4">
											<div className="d-flex justify-content-between mb-2 small">
												<span className="text-muted">Nama Peserta</span>
												<strong className="text-dark">{resultData.participantName}</strong>
											</div>
											<div className="d-flex justify-content-between mb-2 small">
												<span className="text-muted">Kode Tiket</span>
												<code className="text-dark fw-bold">{resultData.ticketCode}</code>
											</div>
											<hr className="my-2.5 opacity-25" />
											<div className="d-flex justify-content-between mb-1 small">
												<span className="text-muted">Saldo Poin Lama</span>
												<span className="text-secondary">{resultData.oldBalance} Pts</span>
											</div>
											<div className="d-flex justify-content-between small fw-bold">
												<span className="text-muted">Saldo Poin Baru</span>
												<span className="text-primary fs-6">{resultData.newBalance} Pts</span>
											</div>
										</div>
									</>
								) : (
									<>
										<div className="alert alert-danger border-0 p-3 mb-4 rounded-3 d-flex align-items-start gap-2.5">
											<XCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
											<p className="mb-0 text-dark small" style={{ lineHeight: '1.4' }}>
												{resultData.message}
											</p>
										</div>

										{resultData.participantName && (
											<div className="p-3 border rounded-3 bg-light mb-4">
												<div className="d-flex justify-content-between mb-2 small">
													<span className="text-muted">Nama Peserta</span>
													<strong className="text-dark">{resultData.participantName}</strong>
												</div>
												<div className="d-flex justify-content-between small">
													<span className="text-muted">Kode Tiket</span>
													<code className="text-dark fw-bold">{resultData.ticketCode}</code>
												</div>
											</div>
										)}
									</>
								)}

								<Button 
									variant={resultData.success ? "success" : "danger"} 
									size="lg" 
									className="w-100 rounded-pill fw-bold text-white shadow py-2.5"
									onClick={() => setShowResultModal(false)}
								>
									Selesai
								</Button>
							</div>
						</Modal.Body>
					</Modal>
				)}
			</AnimatePresence>

			{/* CSS styling injection for scanline animation */}
			<style>{`
				@keyframes scanline-anim {
					0% { top: 0%; }
					50% { top: 98%; }
					100% { top: 0%; }
				}
				.shadow-inner {
					box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
				}
			`}</style>
		</div>
	);
}
