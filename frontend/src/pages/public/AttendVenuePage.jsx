import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

export default function AttendVenuePage() {
	const [status, setStatus] = useState('loading'); // loading, success, error, unauthenticated
	const [message, setMessage] = useState('Memproses kehadiran Anda...');
	const [pageType, setPageType] = useState('in');

	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	// useRef digunakan untuk mencegah Double-Render API Call di React 18
	const hasProcessed = useRef(false);

	useEffect(() => {
		// Eksekusi hanya boleh berjalan satu kali
		if (hasProcessed.current) return;

		const params = new URLSearchParams(location.search);
		const eventId = params.get('event_id');
		const signature = params.get('signature');
		const type = params.get('type') || 'in';
		const expiresAt = params.get('expires_at');
		const sessionId = params.get('session_id');

		setPageType(type);

		if (!eventId || !signature) {
			setStatus('error');
			setMessage('Tautan tidak valid atau tidak lengkap.');
			return;
		}

		if (!isAuthenticated) {
			setStatus('unauthenticated');
			setMessage('Silakan login ke akun Anda untuk mencatat kehadiran.');
			return;
		}

		const processScan = async () => {
			// Tandai bahwa API sudah dipanggil agar tidak mengulang
			hasProcessed.current = true;

			try {
				// Mencari atau membuat Device ID di browser peserta
				let deviceId = localStorage.getItem('kampusx_device_id');
				if (!deviceId) {
					deviceId =
						'dev_' +
						Math.random().toString(36).substring(2, 15) +
						Math.random().toString(36).substring(2, 15);
					localStorage.setItem('kampusx_device_id', deviceId);
				}

				// Payload disesuaikan sama persis dengan yang diminta Laravel
				const payload = {
					event_id: eventId,
					type: type,
					signature: signature,
					device_token: deviceId,
					expires_at: expiresAt || null,
					session_id: sessionId || null,
				};

				// Pastikan URL endpoint ini cocok dengan route api.php Laravel kamu
				const response = await api.post('/attendance/process', payload);

				if (response.data?.success) {
					setStatus('success');
					setMessage(
						response.data.message ||
						(type === 'out'
							? 'Check-out berhasil dicatat. Terima kasih!'
							: 'Kehadiran berhasil dicatat! Selamat mengikuti acara.'),
					);
				}
			} catch (err) {
				setStatus('error');
				// Menangkap pesan error spesifik dari 5 Layer backend Laravel
				if (err.response?.status === 400 || err.response?.status === 403) {
					setMessage(err.response?.data?.message || 'Akses presensi ditolak.');
				} else if (err.response?.status === 404) {
					setMessage('Data acara tidak ditemukan.');
				} else {
					setMessage(
						err.response?.data?.message ||
						'Terjadi kesalahan saat memproses data pada server.',
					);
				}
			}
		};

		processScan();
	}, [location.search, isAuthenticated]);

	const handleLogin = () => {
		const returnUrl = encodeURIComponent(location.pathname + location.search);
		navigate(`/login?return_to=${returnUrl}`);
	};

	return (
		<Container
			className="d-flex align-items-center justify-content-center"
			style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
		>
			{/* Mengganti shadow tebal dengan flat border yang lebih clean */}
			<Card
				className="text-center shadow-none border"
				style={{ maxWidth: '400px', width: '100%', borderRadius: '0.5rem' }}
			>
				<Card.Body className="p-5">
					{status === 'loading' && (
						<>
							<Spinner
								animation="border"
								variant="dark"
								style={{ width: '3rem', height: '3rem', borderWidth: '0.2em' }}
								className="mb-4"
							/>
							<h5 className="fw-semibold text-dark">Memproses Kehadiran</h5>
							<p className="text-muted" style={{ fontSize: '0.875rem' }}>
								{message}
							</p>
						</>
					)}

					{status === 'success' && (
						<>
							<div className="text-success mb-4 d-flex justify-content-center">
								<CheckCircle size={64} strokeWidth={1.5} />
							</div>
							<h5 className="fw-semibold text-dark">
								{pageType === 'out' ? 'Check-out Berhasil!' : 'Check-in Berhasil!'}
							</h5>
							<p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
								{message}
							</p>
							<Button
								variant="dark"
								className="w-100 rounded-2 px-4 shadow-none"
								onClick={() => navigate('/my-tickets')}
							>
								Lihat Tiket Saya
							</Button>
						</>
					)}

					{status === 'error' && (
						<>
							<div className="text-danger mb-4 d-flex justify-content-center">
								<XCircle size={64} strokeWidth={1.5} />
							</div>
							<h5 className="fw-semibold text-dark">
								Gagal {pageType === 'out' ? 'Check-out' : 'Check-in'}
							</h5>
							<p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
								{message}
							</p>
							<Button
								variant="outline-dark"
								className="w-100 rounded-2 px-4 shadow-none bg-white"
								onClick={() => navigate('/events')}
							>
								Kembali ke Beranda
							</Button>
						</>
					)}

					{status === 'unauthenticated' && (
						<>
							<div className="text-dark mb-4 d-flex justify-content-center">
								<Info size={64} strokeWidth={1.5} />
							</div>
							<h5 className="fw-semibold text-dark">Login Diperlukan</h5>
							<p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
								{message}
							</p>
							<Button
								variant="dark"
								className="w-100 rounded-2 px-4 shadow-none"
								onClick={handleLogin}
							>
								Login / Daftar
							</Button>
						</>
					)}
				</Card.Body>
			</Card>
		</Container>
	);
}
