// 	import React, { useState, useEffect } from 'react';
// import { Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
// import { Link as LinkIcon, Copy, RefreshCw, QrCode } from 'lucide-react'; // Tambah QrCode icon
// import { useParams } from 'react-router-dom';
// import { QRCodeCanvas } from 'qrcode.react'; // Import library QR Code
// import api from '@/api/axios';
// import { notify } from '@/utils/notify';

// const OnlineAttendanceTool = () => {
// 	const { eventId } = useParams();

// 	const [isFetching, setIsFetching] = useState(true);

// 	const [linkIn, setLinkIn] = useState('');
// 	const [loadingIn, setLoadingIn] = useState(false);
// 	const [expiresIn, setExpiresIn] = useState('');

// 	const [linkOut, setLinkOut] = useState('');
// 	const [loadingOut, setLoadingOut] = useState(false);
// 	const [expiresOut, setExpiresOut] = useState('');

// 	// State untuk Modal QR Code
// 	const [showQRModal, setShowQRModal] = useState(false);
// 	const [qrData, setQrData] = useState({ link: '', title: '' });

// 	const formatDateTimeForInput = (dbDateTime) => {
// 		if (!dbDateTime) return '';
// 		return dbDateTime.replace(' ', 'T').substring(0, 16);
// 	};

// 	useEffect(() => {
// 		const fetchLinks = async () => {
// 			try {
// 				const res = await api.get(`/event-dashboard/${eventId}/attendance/links`);
// 				if (res.data?.success) {
// 					const eventData = res.data.data;

// 					setLinkIn(eventData.checkin_link || '');
// 					setExpiresIn(formatDateTimeForInput(eventData.checkin_expires_at));

// 					setLinkOut(eventData.checkout_link || '');
// 					setExpiresOut(formatDateTimeForInput(eventData.checkout_expires_at));
// 				}
// 			} catch (error) {
// 				console.error('Failed to fetch links:', error);
// 			} finally {
// 				setIsFetching(false);
// 			}
// 		};

// 		fetchLinks();
// 	}, [eventId]);

// 	const handleGenerate = async (type) => {
// 		const expiresAt = type === 'in' ? expiresIn : expiresOut;

// 		if (!expiresAt) {
// 			notify('error', 'Perhatian!', 'Batas waktu akses wajib diisi sebelum membuat link.');
// 			return;
// 		}

// 		const setLoading = type === 'in' ? setLoadingIn : setLoadingOut;
// 		const setLink = type === 'in' ? setLinkIn : setLinkOut;

// 		setLoading(true);
// 		try {
// 			let query = `?type=${type}&expires_at=${expiresAt}`;

// 			const res = await api.get(`/event-dashboard/${eventId}/attendance/create-link${query}`);

// 			if (res.data?.success) {
// 				const {
// 					event_id,
// 					signature,
// 					type: resType,
// 					expires_at,
// 					url: backendUrl,
// 				} = res.data.data;

// 				let finalUrl =
// 					backendUrl ||
// 					`${window.location.origin}/attend-venue?event_id=${event_id}&type=${resType}&signature=${signature}&expires_at=${expires_at}`;

// 				setLink(finalUrl);
// 				notify(
// 					'success',
// 					'Berhasil!',
// 					`Link ${type === 'in' ? 'Check-in' : 'Check-out'} berhasil dibuat!`,
// 				);
// 			}
// 		} catch (error) {
// 			console.error('Failed to generate magic link:', error);
// 			notify('error', 'Gagal', 'Gagal membuat link presensi.');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleCopy = (link) => {
// 		navigator.clipboard
// 			.writeText(link)
// 			.then(() => notify('success', 'Berhasil!', 'Link disalin ke clipboard!'))
// 			.catch(() => notify('error', 'Gagal!', 'Gagal menyalin link.'));
// 	};

// 	const handleShowQR = (link, title) => {
// 		setQrData({ link, title });
// 		setShowQRModal(true);
// 	};

// 	const renderActionRow = (type, title, link, loading, expires, setExpires) => (
// 		<div className="p-3 border rounded-3 bg-light d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 shadow-none">
// 			<div className="fw-medium text-dark" style={{ fontSize: '0.875rem' }}>
// 				<Form.Label className="form-label mb-1">{title}</Form.Label>
// 				<div className="d-flex align-items-center gap-2 mt-1">
// 					<Form.Control
// 						type="datetime-local"
// 						size="sm"
// 						value={expires}
// 						onChange={(e) => setExpires(e.target.value)}
// 						className={`shadow-none border rounded-2 ${!expires && !link ? 'border-danger' : ''}`}
// 						style={{ width: '180px', height: '34px', fontSize: '0.875rem' }}
// 						title="Batas waktu akses (Wajib)"
// 						required
// 					/>
// 					<Button
// 						variant="outline-dark"
// 						size="sm"
// 						className="border bg-white"
// 						style={{ height: '34px' }}
// 						onClick={() => handleGenerate(type)}
// 						disabled={loading || (!link && !expires)}
// 					>
// 						{loading ? (
// 							<Spinner size="sm" />
// 						) : (
// 							<>
// 								<LinkIcon size={14} className="me-1" /> Buat Link
// 							</>
// 						)}
// 					</Button>
// 				</div>
// 				{!expires && !link && (
// 					<div className="text-danger mt-1" style={{ fontSize: '0.75rem' }}>
// 						* Wajib diisi
// 					</div>
// 				)}
// 			</div>

// 			<div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '650px', width: '100%' }}>
// 				{link && (
// 					<InputGroup size="sm" style={{ width: '100%', height: '34px' }}>
// 						<Form.Control
// 							value={link}
// 							readOnly
// 							className="bg-white border-end-0 shadow-none text-muted text-truncate"
// 							style={{ fontSize: '0.825rem' }}
// 						/>
// 						{/* Tombol Tampilkan QR Code */}
// 						<Button
// 							variant="white"
// 							onClick={() => handleShowQR(link, title)}
// 							className="d-flex align-items-center border border-start-0 px-3 shadow-none text-dark bg-white"
// 							title="Tampilkan QR Code"
// 						>
// 							<QrCode size={14} />
// 						</Button>
// 						<Button
// 							variant="white"
// 							onClick={() => handleCopy(link)}
// 							className="d-flex align-items-center border border-start-0 px-3 shadow-none text-dark bg-white"
// 							title="Salin Link"
// 						>
// 							<Copy size={14} />
// 						</Button>
// 						<Button
// 							variant="white"
// 							onClick={() => handleGenerate(type)}
// 							disabled={loading || !expires}
// 							className="d-flex align-items-center border px-3 shadow-none ms-1 rounded-end text-dark bg-white"
// 							title="Buat ulang link"
// 						>
// 							{loading ? <Spinner size="sm" /> : <RefreshCw size={14} />}
// 						</Button>
// 					</InputGroup>
// 				)}
// 			</div>
// 		</div>
// 	);

// 	if (isFetching) {
// 		return (
// 			<div className="bg-white border rounded-3 p-5 d-flex justify-content-center">
// 				<Spinner animation="border" variant="secondary" />
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="bg-white border rounded-3 p-4 shadow-none">
// 			<div className="mb-4">
// 				<h6 className="mb-1 text-dark fw-semibold">Manajemen Link Presensi Online</h6>
// 				<p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
// 					Buat link terpisah untuk check-in dan check-out peserta. Anda{' '}
// 					<strong>wajib</strong> mengatur batas waktu kedaluwarsa agar presensi lebih
// 					disiplin.
// 				</p>
// 			</div>

// 			<div className="d-flex flex-column gap-3">
// 				{renderActionRow(
// 					'in',
// 					'Akses Check-in',
// 					linkIn,
// 					loadingIn,
// 					expiresIn,
// 					setExpiresIn,
// 				)}
// 				{renderActionRow(
// 					'out',
// 					'Akses Check-out',
// 					linkOut,
// 					loadingOut,
// 					expiresOut,
// 					setExpiresOut,
// 				)}
// 			</div>

// 			{/* Modal untuk menampilkan QR Code */}
// 			<Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
// 				<Modal.Header closeButton>
// 					<Modal.Title className="fs-5">QR Code {qrData.title}</Modal.Title>
// 				</Modal.Header>
// 				<Modal.Body className="text-center p-4">
// 					<QRCodeCanvas
// 						value={qrData.link}
// 						size={256} // Ukuran QR agar mudah di-scan
// 						level={'H'} // Error correction level High (bagus jika layarnya kotor/berkedip)
// 					/>
// 					<p className="mt-4 mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
// 						Minta peserta untuk melakukan scan QR Code ini menggunakan kamera atau
// 						aplikasi pemindai QR.
// 					</p>
// 				</Modal.Body>
// 				<Modal.Footer>
// 					<Button variant="secondary" onClick={() => setShowQRModal(false)}>
// 						Tutup
// 					</Button>
// 				</Modal.Footer>
// 			</Modal>
// 		</div>
// 	);
// };

// export default OnlineAttendanceTool;
