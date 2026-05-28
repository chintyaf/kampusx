import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Tabs, Tab, Modal, ButtonGroup, ToggleButton, Spinner } from 'react-bootstrap';
import { Camera, Search, UserCheck, AlertCircle, CheckCircle, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';

const ScannerPage = () => {
	const { eventId } = useParams();
	const eventIdRef = useRef(eventId);

	useEffect(() => {
		eventIdRef.current = eventId;
	}, [eventId]);

	const [manualInput, setManualInput] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [scannedData, setScannedData] = useState(null);
	const [scanType, setScanType] = useState('check-in');
	const [selfCheckinToken, setSelfCheckinToken] = useState(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const fetchSelfCheckinToken = async () => {
		try {
			const res = await api.get(`/event-dashboard/${eventIdRef.current}/self-checkin-token`);
			if (res.data.status === 'success' && res.data.token) {
				setSelfCheckinToken(res.data.token);
			}
		} catch (error) {
			console.error("Gagal mengambil token presensi mandiri", error);
		}
	};

	const generateSelfCheckinToken = async () => {
		setIsGenerating(true);
		try {
			const res = await api.post(`/event-dashboard/${eventIdRef.current}/generate-checkin-token`);
			if (res.data.status === 'success') {
				setSelfCheckinToken(res.data.token);
				toast.success("QR Code Presensi Mandiri berhasil diperbarui!");
			}
		} catch (error) {
			toast.error("Gagal membuat token QR");
		} finally {
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		fetchSelfCheckinToken();
	}, []);

	const handleScanSuccess = async (data, method = 'qr') => {
		try {
			let res;
			if (method === 'qr') {
				res = await api.post('/attendance/scan', {
					qr_string: data,
					event_id: eventIdRef.current,
					type: scanType,
				});
			} else {
				// Manual menggunakan ticket_id
				res = await api.post('/attendance/manual', {
					ticket_id: parseInt(data),
					event_id: eventIdRef.current,
					type: scanType,
				});
			}

			if (res.data.success) {
				const acquiredTicketId =
					res.data.ticket_id || (method === 'qr' ? null : parseInt(data));
				setScannedData({ data, method, ticket_id: acquiredTicketId });
				toast.success(res.data.message || 'Validasi berhasil! Tiket orisinil.');
				setShowModal(true); // Memanggil UI Engagement Checkpoint
			}
		} catch (error) {
			toast.error(error.response?.data?.message || 'Tiket tidak valid atau sudah di-scan!', {
				icon: <AlertCircle className="text-danger" />,
				style: { borderRadius: '10px', background: '#333', color: '#fff' },
			});
		}
	};

	// Initial QR Scanner setup
	useEffect(() => {
		// Hindari error re-render di React Strict Mode dengan membersihkan DOM terlebih dahulu.
		const scannerId = 'qr-reader';
		let scanner = new Html5QrcodeScanner(scannerId, {
			qrbox: { width: 250, height: 250 },
			fps: 5,
		});

		scanner.render(
			(result) => {
				console.log('QR Scanned Result: ', result);
				scanner.clear(); // Hentikan scan sementara saat memproses
				handleScanSuccess(result, 'qr');
			},
			(err) => {
				// Jangan log setiap error karena saat iddle akan terus memberi error "no QR found"
				// console.log("Scanning...", err);
			},
		);

		return () => {
			scanner
				.clear()
				.catch((error) => console.error('Failed to clear html5-qrcode scanner', error));
		};
	}, []);

	const handleManualSubmit = async (e) => {
		e.preventDefault();
		if (!manualInput.trim()) return;

		try {
			// Hit backend search
			const res = await api.get(`/ticket/search?q=${manualInput}`);
			if (res.data.data && res.data.data.length > 0) {
				const ticket = res.data.data[0]; // Auto pilih hasil pertama untuk demo
				handleScanSuccess(ticket.id.toString(), 'manual');
			} else {
				toast.error('Tiket atau Nama tidak ditemukan');
			}
		} catch (error) {
			toast.error('Gagal melakukan pencarian manual');
		}
		setManualInput('');
	};

	const handleClaimAttendance = async () => {
		setShowModal(false);
		try {
			// Kita butuh ticket_id. Jika scan QR, kita ambil ticket ID dari endpoint atau asumsikan 1 untuk demo ini
			// Di sistem nyata, backend `scanQr` dapat mereturn `ticket_id` agar frontend bisa meneruskan ke klaim poin.
			const targetTicketId = scannedData?.ticket_id || 1;

			const res = await api.post('/engagement/claim', {
				ticket_id: targetTicketId,
				event_id: eventIdRef.current,
			});

			toast.success(res.data.message || 'Poin Kehadiran berhasil diklaim!', {
				icon: <CheckCircle className="text-success" />,
				style: { borderRadius: '10px', background: '#333', color: '#fff' },
			});
		} catch (error) {
			toast.error(error.response?.data?.message || 'Gagal melakukan klaim poin', {
				icon: <AlertCircle className="text-danger" />,
				style: { borderRadius: '10px', background: '#333', color: '#fff' },
			});
		}
		setScannedData(null);
	};

	return (
		<Container className="py-5" style={{ maxWidth: '600px' }}>
			{/* UI Feedback System via react-hot-toast */}
			<Toaster position="top-right" reverseOrder={false} />

			<h3 className="mb-4 text-center fw-bold text-primary">Event Scanner Panel</h3>

			<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
				<Card.Header className="bg-white border-0 pt-4 pb-0 text-center">
					<ButtonGroup className="mb-3 w-100">
						<ToggleButton
							id="toggle-checkin"
							type="radio"
							variant={scanType === 'check-in' ? 'primary' : 'outline-primary'}
							name="scanType"
							value="check-in"
							checked={scanType === 'check-in'}
							onChange={(e) => setScanType(e.currentTarget.value)}
						>
							Check-in
						</ToggleButton>
						<ToggleButton
							id="toggle-checkout"
							type="radio"
							variant={scanType === 'check-out' ? 'warning' : 'outline-warning'}
							name="scanType"
							value="check-out"
							checked={scanType === 'check-out'}
							onChange={(e) => setScanType(e.currentTarget.value)}
						>
							Check-out
						</ToggleButton>
					</ButtonGroup>
				</Card.Header>
				<Card.Body className="p-0">
					<Tabs
						defaultActiveKey="qr"
						id="scanner-tabs"
						className="nav-justified border-bottom-0"
						fill
					>
						{/* TAB: QR Scanner Core Layout */}
						<Tab
							eventKey="qr"
							title={
								<span className="py-2 d-inline-block">
									<Camera size={18} className="me-2 mb-1" /> SCAN QR
								</span>
							}
						>
							<div className="text-center p-4 bg-light">
								<div
									id="qr-reader"
									className="mx-auto rounded-3 border-0 bg-white shadow-sm overflow-hidden"
									style={{ maxWidth: '100%' }}
								></div>
								<p className="text-muted mt-4 small mb-0">
									Arahkan kamera ke QR Code tiket peserta
								</p>
							</div>
						</Tab>

						{/* TAB: Manual Override Layout */}
						<Tab
							eventKey="manual"
							title={
								<span className="py-2 d-inline-block">
									<Search size={18} className="me-2 mb-1" /> INPUT MANUAL
								</span>
							}
						>
							<div className="p-4 bg-light min-vh-50">
								<Form
									onSubmit={handleManualSubmit}
									className="bg-white p-4 rounded-4 shadow-sm"
								>
									<Form.Group className="mb-4">
										<Form.Label className="text-muted fw-semibold small">
											PENCARIAN DATA
										</Form.Label>
										<Form.Control
											type="text"
											size="lg"
											placeholder="Masukkan NIM, Nama, atau ID Tiket..."
											value={manualInput}
											onChange={(e) => setManualInput(e.target.value)}
											style={{ borderRadius: '10px' }}
										/>
									</Form.Group>
									<Button
										type="submit"
										variant="primary"
										size="lg"
										className="w-100 rounded-pill fw-semibold shadow-sm"
									>
										Cek Validitas Tiket
									</Button>
								</Form>
							</div>
						</Tab>

						{/* TAB: Self Check-in QR Layout */}
						<Tab
							eventKey="self-checkin"
							title={
								<span className="py-2 d-inline-block">
									<QrCode size={18} className="me-2 mb-1" /> PRESENSI MANDIRI
								</span>
							}
						>
							<div className="text-center p-4 bg-light d-flex flex-column align-items-center">
								{selfCheckinToken ? (
									<>
										<p className="text-muted small mb-3">
											Tampilkan layar ini agar peserta bisa melakukan scan menggunakan kamera HP mereka sendiri.
										</p>
										<div className="bg-white p-4 rounded-4 shadow-sm mb-4 d-inline-block border">
											<QRCodeSVG 
												value={`${window.location.origin}/event/${eventIdRef.current}/self-checkin?token=${selfCheckinToken}&type=${scanType}`} 
												size={250} 
												level={"H"}
												includeMargin={true}
											/>
										</div>
										<Button 
											variant="outline-secondary" 
											onClick={generateSelfCheckinToken}
											disabled={isGenerating}
											className="d-flex align-items-center rounded-pill"
										>
											{isGenerating ? <Spinner size="sm" className="me-2"/> : <RefreshCw size={16} className="me-2" />}
											Perbarui QR Code
										</Button>
									</>
								) : (
									<div className="bg-white p-5 rounded-4 shadow-sm mb-4 w-100">
										<QrCode size={48} className="text-muted mb-3 opacity-50" />
										<p className="text-muted mb-4">
											Belum ada QR Code untuk presensi mandiri.
										</p>
										<Button 
											variant="primary" 
											onClick={generateSelfCheckinToken}
											disabled={isGenerating}
											className="rounded-pill px-4 shadow"
										>
											{isGenerating ? <Spinner size="sm" className="me-2"/> : null}
											Generate QR Presensi
										</Button>
									</div>
								)}
							</div>
						</Tab>
					</Tabs>
				</Card.Body>
			</Card>

			{/* UI Engagement Checkpoint (Modal Pop-up) */}
			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}
				centered
				backdrop="static"
				contentClassName="border-0 rounded-4 shadow-lg"
			>
				<Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
				<Modal.Body className="text-center px-4 pb-5 pt-0">
					<div className="mb-4">
						<div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 shadow-sm">
							<UserCheck size={56} className="text-success" />
						</div>
					</div>
					<h4 className="fw-bold mb-2">Identitas Ditemukan</h4>
					<div className="bg-light rounded-3 p-3 my-4 text-start border">
						<p className="mb-1 text-muted small">ID / Referensi Token:</p>
						<p className="mb-2 fw-semibold">{scannedData?.data}</p>

						<p className="mb-1 text-muted small mt-2">Metode Entri:</p>
						<p className="mb-0 text-uppercase badge bg-secondary">
							{scannedData?.method}
						</p>
					</div>

					<Button
						variant={scanType === 'check-in' ? 'success' : 'warning'}
						size="lg"
						className="w-100 rounded-pill fw-bold py-3 shadow"
						onClick={handleClaimAttendance}
					>
						<CheckCircle size={20} className="me-2 mb-1" />
						Klaim {scanType === 'check-in' ? 'Check-in' : 'Check-out'}
					</Button>
				</Modal.Body>
			</Modal>
		</Container>
	);
};

export default ScannerPage;
