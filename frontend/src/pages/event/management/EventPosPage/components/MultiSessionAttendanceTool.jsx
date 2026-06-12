import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Modal, Badge, Card, InputGroup, Dropdown } from 'react-bootstrap';
import {
	Link as LinkIcon,
	Copy,
	QrCode,
	Calendar,
	Clock,
	CheckCircle,
	AlertCircle,
	MoreVertical,
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

	const addMinutesToTime = (timeStr, minutes) => {
		if (!timeStr) return '';
		const parts = timeStr.split(':');
		const hours = parseInt(parts[0], 10);
		const mins = parseInt(parts[1], 10);
		const date = new Date();
		date.setHours(hours, mins + minutes, 0, 0);
		const h = String(date.getHours()).padStart(2, '0');
		const m = String(date.getMinutes()).padStart(2, '0');
		return `${h}:${m}`;
	};

	const fetchAttendanceData = async () => {
		try {
			setIsFetching(true);
			const res = await api.get(`/event-dashboard/${eventId}/attendance/links`);
			if (res.data?.success) {
				const data = res.data.data;

				// Auto-fill initialCheckIn if empty using first session's start time + 15 mins
				let checkinExpires = formatDateTimeForInput(data.checkin_expires_at);
				if (!checkinExpires && data.sessions && data.sessions.length > 0) {
					const firstSession = data.sessions[0];
					if (firstSession.date && firstSession.start_time) {
						checkinExpires = `${firstSession.date}T${addMinutesToTime(firstSession.start_time, 15)}`;
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
					if (!sessionExpires && session.date && session.start_time) {
						sessionExpires = `${session.date}T${addMinutesToTime(session.start_time, 15)}`;
					}

					let sessionCheckoutExpires = formatDateTimeForInput(session.checkout_expires_at);
					if (!sessionCheckoutExpires && session.date && session.end_time) {
						sessionCheckoutExpires = `${session.date}T${session.end_time.substring(0, 5)}`;
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
						checkout: {
							link: session.checkout_link || '',
							expires: sessionCheckoutExpires,
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

	const handleGenerate = async (type, sessionId = null, customExpires = null) => {
		let expiresAt = customExpires;
		if (!expiresAt) {
			if (type === 'in') expiresAt = initialCheckIn.expires;
			else if (type === 'out') expiresAt = finalCheckOut.expires;
			else if (type === 'session_in') {
				const s = sessions.find((session) => session.id === sessionId);
				expiresAt = s?.checkin.expires;
			} else if (type === 'session_out') {
				const s = sessions.find((session) => session.id === sessionId);
				expiresAt = s?.checkout.expires;
			}
		}

		if (!expiresAt) {
			notify('error', 'Perhatian!', 'Batas waktu akses wajib diisi sebelum membuat link.');
			return;
		}

		// Set loading state
		if (type === 'in') setInitialCheckIn((prev) => ({ ...prev, loading: true }));
		else if (type === 'out') setFinalCheckOut((prev) => ({ ...prev, loading: true }));
		else if (type === 'session_in') {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, loading: true } } : s))
			);
		} else if (type === 'session_out') {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkout: { ...s.checkout, loading: true } } : s))
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
				} else if (type === 'session_in') {
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
				} else if (type === 'session_out') {
					setSessions((prev) =>
						prev.map((s) =>
							s.id === sessionId
								? {
									...s,
									checkout: {
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
			else if (type === 'session_in') {
				setSessions((prev) =>
					prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, loading: false } } : s))
				);
			} else if (type === 'session_out') {
				setSessions((prev) =>
					prev.map((s) => (s.id === sessionId ? { ...s, checkout: { ...s.checkout, loading: false } } : s))
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
		} else if (type === 'session_in') {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkin: { ...s.checkin, expires: value } } : s))
			);
		} else if (type === 'session_out') {
			setSessions((prev) =>
				prev.map((s) => (s.id === sessionId ? { ...s, checkout: { ...s.checkout, expires: value } } : s))
			);
		}
	};

	const handleDateChange = (type, value, sessionId = null) => {
		handleExpiresChange(type, value, sessionId);

		const hasLink = (() => {
			if (type === 'in') return !!initialCheckIn.link;
			if (type === 'out') return !!finalCheckOut.link;
			const s = sessions.find((session) => session.id === sessionId);
			if (type === 'session_in') return !!s?.checkin.link;
			if (type === 'session_out') return !!s?.checkout.link;
			return false;
		})();

		if (hasLink && value) {
			handleGenerate(type, sessionId, value);
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

	// Custom Toggle to hide caret in React-Bootstrap Dropdown
	const CustomToggle = React.forwardRef(({ onClick }, ref) => (
		<button
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
			className="btn btn-light border p-0 d-flex align-items-center justify-content-center shadow-none"
			style={{ height: '32px', width: '32px', borderRadius: '6px' }}
			title="Opsi Lainnya"
		>
			<MoreVertical size={16} className="text-dark" />
		</button>
	));

	const renderActionRow = (type, title, subtitle, data, icon, sessionId = null) => {
		const hasLink = !!data.link;

		return (
			<div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between py-4 px-4 border-bottom last-border-0 gap-3">
				{/* Left Info Column */}
				<div className="d-flex align-items-start gap-3 flex-grow-1">
					<div className="mt-1 p-2 bg-light rounded text-muted d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
						{icon}
					</div>
					<div className="flex-grow-1">
						<div className="d-flex flex-wrap align-items-center gap-2 mb-1">
							<Badge
								bg={type.includes('in') ? 'success' : 'danger'}
								style={{
									fontSize: '0.725rem',
									fontWeight: '600',
									padding: '4px 8px',
									borderRadius: '6px'
								}}
							>
								{type.includes('in') ? 'Check-In' : 'Check-Out'}
							</Badge>
							<h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
								{title}
							</h6>
						</div>
						{subtitle && (
							<div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
								{subtitle}
							</div>
						)}
					</div>
				</div>

				{/* Right Control/Action Column */}
				<div className="d-flex flex-wrap align-items-center gap-3 justify-content-md-end flex-shrink-0">
					<div className="d-flex align-items-center gap-2">
						<span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
							Batas Waktu:
						</span>
						<Form.Control
							type="datetime-local"
							size="sm"
							value={data.expires || ''}
							onChange={(e) => handleDateChange(type, e.target.value, sessionId)}
							className={`shadow-none border rounded-2 ${!data.expires && !data.link ? 'border-danger' : ''}`}
							style={{ width: '175px', height: '32px', fontSize: '0.8rem' }}
							title="Batas waktu akses (Wajib)"
							required
							disabled={data.loading}
						/>
					</div>

					{data.loading ? (
						<div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
							<Spinner size="sm" variant="primary" style={{ width: '16px', height: '16px' }} />
						</div>
					) : hasLink ? (
						<Dropdown align="end">
							<Dropdown.Toggle as={CustomToggle} id={`dropdown-${type}-${sessionId || 'main'}`} />

							<Dropdown.Menu className="shadow-sm border rounded-3" style={{ fontSize: '0.85rem' }}>
								<Dropdown.Item onClick={() => handleShowQR(data.link, `${type.includes('in') ? 'Check-in' : 'Check-out'} - ${title}`)} className="d-flex align-items-center gap-2 py-2">
									<QrCode size={14} className="text-muted" />
									<span>Tampilkan QR Code</span>
								</Dropdown.Item>
								<Dropdown.Item onClick={() => handleCopy(data.link)} className="d-flex align-items-center gap-2 py-2">
									<Copy size={14} className="text-muted" />
									<span>Salin Link</span>
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					) : (
						<Button
							variant="dark"
							size="sm"
							className="px-3 d-flex align-items-center justify-content-center shadow-none"
							style={{ height: '32px', fontSize: '0.8rem', fontWeight: 500 }}
							onClick={() => handleGenerate(type, sessionId)}
							disabled={!data.expires}
						>
							<LinkIcon size={12} className="me-1.5" />
							Buat Link
						</Button>
					)}
				</div>
			</div>
		);
	};

	// Group sessions by day using date fallback
	const sessionsByDay = {};
	const uniqueDates = [...new Set(sessions.map((s) => s.date).filter(Boolean))].sort();

	sessions.forEach((session) => {
		let day = session.dayNumber;
		if (!day && session.date) {
			day = uniqueDates.indexOf(session.date) + 1;
		}
		if (!day) day = 1;

		if (!sessionsByDay[day]) {
			sessionsByDay[day] = [];
		}
		sessionsByDay[day].push(session);
	});

	// Sort sessions in each day by start time
	Object.keys(sessionsByDay).forEach((day) => {
		sessionsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
	});

	const days = Object.keys(sessionsByDay).sort((a, b) => Number(a) - Number(b));

	return (
		<div className="bg-white border rounded-4 p-4 shadow-none">
			<div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
				<div>
					<h5 className="mb-1 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>
						Link Presensi
					</h5>
					<p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
						Atur batas waktu pengisian dan bagikan tautan kehadiran peserta.
					</p>
				</div>
			</div>

			<div className="border rounded-3 overflow-hidden d-flex flex-column bg-white">
				{days.map((day) => {
					const daySessions = sessionsByDay[day];
					const firstSession = daySessions[0];
					const lastSession = daySessions[daySessions.length - 1];
					const dateStr = firstSession?.date ? `(${firstSession.date})` : '';

					const isFirstDay = day === '1';
					const isLastDay = day === String(days.length);

					const checkinType = isFirstDay ? 'in' : 'session_in';
					const checkinSessionId = isFirstDay ? null : firstSession.id;
					const checkinData = isFirstDay ? initialCheckIn : firstSession.checkin;

					const checkoutType = isLastDay ? 'out' : 'session_out';
					const checkoutSessionId = isLastDay ? null : lastSession.id;
					const checkoutData = isLastDay ? finalCheckOut : lastSession.checkout;

					const timeRangeStr = firstSession && lastSession
						? `${firstSession.startTime.substring(0, 5)} - ${lastSession.endTime.substring(0, 5)}`
						: '';

					return (
						<div key={day} className="border-bottom last-border-0">
							<div className="bg-light px-3 py-2 fw-bold text-dark border-bottom" style={{ fontSize: '0.85rem' }}>
								Hari {day} {dateStr}
							</div>
							<div>
								{renderActionRow(
									checkinType,
									'Presensi Masuk',
									`Akses masuk utama & registrasi kehadiran Hari ${day} • ${timeRangeStr}`,
									checkinData,
									<CheckCircle size={16} className="text-success" />,
									checkinSessionId
								)}
								{renderActionRow(
									checkoutType,
									'Presensi Keluar',
									`Akses keluar setelah seluruh sesi Hari ${day} selesai • ${timeRangeStr}`,
									checkoutData,
									<CheckCircle size={16} className="text-danger" />,
									checkoutSessionId
								)}
							</div>
						</div>
					);
				})}
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
