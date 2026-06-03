import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Modal, Badge, Card, InputGroup } from 'react-bootstrap';
import {
	Link as LinkIcon,
	Copy,
	QrCode,
	Calendar,
	Clock,
	CheckCircle,
	AlertCircle,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const MultiSessionAttendanceTool = () => {
	const { eventId } = useParams();

	const [isFetching, setIsFetching] = useState(true);
	const [initialCheckIn, setInitialCheckIn] = useState({ link: '', expires: '', loading: false });
	const [finalCheckOut, setFinalCheckOut] = useState({ link: '', expires: '', loading: false });
	const [sessions, setSessions] = useState([]);

	// State for QR Code Modal
	const [showQRModal, setShowQRModal] = useState(false);
	const [qrData, setQrData] = useState({ link: '', title: '' });

	const formatDateTimeForInput = (dbDateTime) => {
		if (!dbDateTime) return '';
		return dbDateTime.replace(' ', 'T').substring(0, 16);
	};

	const fetchAttendanceData = async () => {
		try {
			setIsFetching(true);
			const res = await api.get(`/event-dashboard/${eventId}/attendance/links`);
			if (res.data?.success) {
				const data = res.data.data;
				
				// Auto-fill initialCheckIn if empty using first session's start time
				let checkinExpires = formatDateTimeForInput(data.checkin_expires_at);
				if (!checkinExpires && data.sessions && data.sessions.length > 0) {
					const firstSession = data.sessions[0];
					if (firstSession.date && firstSession.start_time) {
						checkinExpires = `${firstSession.date}T${firstSession.start_time.substring(0, 5)}`;
					}
				}

				// Auto-fill finalCheckOut if empty using last session's end time
				let checkoutExpires = formatDateTimeForInput(data.checkout_expires_at);
				if (!checkoutExpires && data.sessions && data.sessions.length > 0) {
					const lastSession = data.sessions[data.sessions.length - 1];
					if (lastSession.date && lastSession.end_time) {
						checkoutExpires = `${lastSession.date}T${lastSession.end_time.substring(0, 5)}`;
					}
				}

				setInitialCheckIn({
					link: data.checkin_link || '',
					expires: checkinExpires,
					loading: false,
				});
				setFinalCheckOut({
					link: data.checkout_link || '',
					expires: checkoutExpires,
					loading: false,
				});

				const fetchedSessions = (data.sessions || []).map((session, index) => {
					let sessionExpires = formatDateTimeForInput(session.checkin_expires_at);
					if (!sessionExpires && session.date && session.end_time) {
						sessionExpires = `${session.date}T${session.end_time.substring(0, 5)}`;
					}

					return {
						id: session.id,
						title: session.title,
						dayNumber: session.day_number,
						date: session.date,
						startTime: session.start_time,
						endTime: session.end_time,
						isFirstSession: index === 0,
						checkin: {
							link: session.checkin_link || '',
							expires: sessionExpires,
							loading: false,
						},
					};
				});
				setSessions(fetchedSessions);
			}
		} catch (error) {
			console.error('Failed to fetch attendance data:', error);
			notify('error', 'Gagal', 'Gagal memuat data presensi.');
		} finally {
			setIsFetching(false);
		}
	};

	useEffect(() => {
		fetchAttendanceData();
	}, [eventId]);

	const handleGenerate = async (type, sessionId = null) => {
		let expiresAt = '';
		if (type === 'in') expiresAt = initialCheckIn.expires;
		else if (type === 'out') expiresAt = finalCheckOut.expires;
		else {
			const s = sessions.find((session) => session.id === sessionId);
			expiresAt = s?.checkin.expires;
		}

		if (!expiresAt) {
			notify('error', 'Perhatian!', 'Batas waktu akses wajib diisi sebelum membuat link.');
			return;
		}

		// Set loading state
		if (type === 'in') setInitialCheckIn((prev) => ({ ...prev, loading: true }));
		else if (type === 'out') setFinalCheckOut((prev) => ({ ...prev, loading: true }));
		else {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, loading: true } } : s))
			);
		}

		try {
			let query = `?type=${type}&expires_at=${expiresAt}`;
			if (sessionId) {
				query += `&session_id=${sessionId}`;
			}

			const res = await api.get(`/event-dashboard/${eventId}/attendance/create-link${query}`);

			if (res.data?.success) {
				const responseData = res.data.data;
				const finalUrl = responseData.url;

				if (type === 'in') {
					setInitialCheckIn({
						link: finalUrl,
						expires: formatDateTimeForInput(responseData.expires_at),
						loading: false,
					});
				} else if (type === 'out') {
					setFinalCheckOut({
						link: finalUrl,
						expires: formatDateTimeForInput(responseData.expires_at),
						loading: false,
					});
				} else {
					setSessions((prev) =>
						prev.map((s) =>
							s.id === sessionId
								? {
										...s,
										checkin: {
											link: finalUrl,
											expires: formatDateTimeForInput(responseData.expires_at),
											loading: false,
										},
								  }
								: s
						)
					);
				}

				notify('success', 'Berhasil!', 'Link presensi berhasil dibuat!');
			}
		} catch (error) {
			console.error('Failed to generate magic link:', error);
			notify('error', 'Gagal', 'Gagal membuat link presensi.');
			// Reset loading states
			if (type === 'in') setInitialCheckIn((prev) => ({ ...prev, loading: false }));
			else if (type === 'out') setFinalCheckOut((prev) => ({ ...prev, loading: false }));
			else {
				setSessions((prev) =>
					prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, loading: false } } : s))
				);
			}
		}
	};

	const handleCopy = (link) => {
		navigator.clipboard
			.writeText(link)
			.then(() => notify('success', 'Berhasil!', 'Link disalin ke clipboard!'))
			.catch(() => notify('error', 'Gagal!', 'Gagal menyalin link.'));
	};

	const handleShowQR = (link, title) => {
		setQrData({ link, title });
		setShowQRModal(true);
	};

	const handleExpiresChange = (type, value, sessionId = null) => {
		if (type === 'in') {
			setInitialCheckIn((prev) => ({ ...prev, expires: value }));
		} else if (type === 'out') {
			setFinalCheckOut((prev) => ({ ...prev, expires: value }));
		} else {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, expires: value } } : s))
			);
		}
	};

	if (isFetching) {
		return (
			<div className="bg-white border rounded-4 p-5 d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
				<div className="text-center">
					<Spinner animation="border" variant="primary" className="mb-2" />
					<div className="text-muted" style={{ fontSize: '0.875rem' }}>Memuat konfigurasi presensi...</div>
				</div>
			</div>
		);
	}

	const renderActionRow = (type, title, subtitle, data, icon, sessionId = null) => {
		const hasLink = !!data.link;

		return (
			<div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 border-bottom last-border-0 gap-3">
				{/* Left Info Column */}
				<div className="d-flex align-items-start gap-3">
					<div className="mt-1 p-2 bg-light rounded text-muted d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
						{icon}
					</div>
					<div>
						<div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
							{title}
						</div>
						{subtitle && (
							<div className="text-muted mt-0.5" style={{ fontSize: '0.75rem' }}>
								{subtitle}
							</div>
						)}
					</div>
				</div>

				{/* Right Control/Action Column */}
				<div className="d-flex flex-wrap align-items-center gap-2 justify-content-md-end">
					<div className="d-flex align-items-center gap-1.5">
						<Form.Control
							type="datetime-local"
							size="sm"
							value={data.expires || ''}
							onChange={(e) => handleExpiresChange(type, e.target.value, sessionId)}
							className={`shadow-none border rounded-2 ${!data.expires && !data.link ? 'border-danger' : ''}`}
							style={{ width: '165px', height: '32px', fontSize: '0.8rem' }}
							title="Batas waktu akses (Wajib)"
							required
						/>
						<Button
							variant={hasLink ? "outline-secondary" : "dark"}
							size="sm"
							className="border px-2.5 d-flex align-items-center justify-content-center"
							style={{ height: '32px', fontSize: '0.8rem', fontWeight: 500 }}
							onClick={() => handleGenerate(type, sessionId)}
							disabled={data.loading || (!data.link && !data.expires)}
						>
							{data.loading ? (
								<Spinner size="sm" style={{ width: '12px', height: '12px' }} />
							) : (
								<>
									<LinkIcon size={12} className="me-1" />
									{hasLink ? 'Perbarui' : 'Buat Link'}
								</>
							)}
						</Button>
					</div>

					{hasLink ? (
						<div className="d-flex align-items-center gap-1">
							<Button
								variant="light"
								size="sm"
								onClick={() => handleShowQR(data.link, title)}
								className="border px-2.5 d-flex align-items-center justify-content-center"
								style={{ height: '32px' }}
								title="Tampilkan QR Code"
							>
								<QrCode size={13} className="text-dark" />
							</Button>
							<Button
								variant="light"
								size="sm"
								onClick={() => handleCopy(data.link)}
								className="border px-2.5 d-flex align-items-center justify-content-center"
								style={{ height: '32px' }}
								title="Salin Link"
							>
								<Copy size={13} className="text-dark" />
							</Button>
						</div>
					) : (
						<Badge
							bg="warning"
							className="text-dark d-flex align-items-center gap-1.5 px-3 py-2 rounded-pill font-semibold border-0"
							style={{ fontSize: '0.75rem', height: '32px' }}
						>
							<AlertCircle size={12} />
							<span>Belum Dibuat</span>
						</Badge>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white border rounded-4 p-4 shadow-none">
			<div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
				<div>
					<h5 className="mb-1 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>
						Link Presensi Online
					</h5>
					<p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
						Atur batas waktu pengisian dan bagikan tautan kehadiran peserta.
					</p>
				</div>
				<Badge bg="light" className="text-dark border px-2.5 py-1 text-xs font-semibold rounded-pill">
					Online Flow
				</Badge>
			</div>

			<div className="border rounded-3 overflow-hidden d-flex flex-column bg-white">
				{/* 1. INITIAL CHECK-IN */}
				{renderActionRow(
					'in',
					'Check-in Masuk Awal Event',
					'Akses masuk utama & registrasi perangkat',
					initialCheckIn,
					<CheckCircle size={16} className="text-success" />
				)}

				{/* 2. SESSION CHECK-INS */}
				{sessions.map((session, index) => {
					if (session.isFirstSession) return null;

					return renderActionRow(
						'session_in',
						`Check-in Sesi: ${session.title}`,
						`Sesi ${index + 1} (${session.startTime} - ${session.endTime})`,
						session.checkin,
						<Calendar size={16} className="text-primary" />,
						session.id
					);
				})}

				{/* 3. FINAL CHECK-OUT */}
				{renderActionRow(
					'out',
					'Check-out Keluar Akhir Event',
					'Akses keluar setelah seluruh sesi selesai',
					finalCheckOut,
					<CheckCircle size={16} className="text-danger" />
				)}
			</div>

			{/* Modal QR Code */}
			<Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
				<Modal.Header closeButton className="border-0 pb-0">
					<Modal.Title className="fs-6 fw-bold">{qrData.title}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="text-center p-4">
					<div className="d-inline-block p-3 bg-white border rounded-4 shadow-sm mb-3">
						<QRCodeCanvas value={qrData.link} size={220} level="H" />
					</div>
					<p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
						Minta peserta memindai QR Code untuk mengisi presensi kehadiran.
					</p>
				</Modal.Body>
				<Modal.Footer className="border-0 pt-0 justify-content-center">
					<Button variant="light" className="border px-4" size="sm" onClick={() => setShowQRModal(false)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default MultiSessionAttendanceTool;
