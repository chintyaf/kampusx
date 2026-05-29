import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Toast } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

// Import Modular Sections
import EventHeader from './sections/EventHeader';
import EventAbout from './sections/EventAbout';
import EventAgenda from './sections/EventAgenda';
import EventTicketCard from './sections/EventTicketCard';
import EventLocationCard from './sections/EventLocationCard';
import EventOrganizerCard from './sections/EventOrganizerCard';

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

	const eventLocation = eventDetails.location_detail || eventDetails.locationDetail;

	const getTzLabel = (tz) => {
		if (!tz) return 'WIB';
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

	return (
		<div
			style={{
				backgroundColor: 'var(--color-bg)',
				minHeight: '100vh',
				paddingBottom: '80px',
			}}
		>
			{/* --- HEADER BANNER --- */}
			<EventHeader
				eventDetails={eventDetails}
				isBookmarked={isBookmarked}
				handleShare={handleShare}
				handleToggleBookmark={handleToggleBookmark}
			/>

			<Container>
				<Row className="g-4">
					{/* ========================================== */}
					{/* KOLOM KIRI: KONTEN UTAMA */}
					{/* ========================================== */}
					<Col lg={8}>
						{/* Poster & About */}
						<EventAbout eventDetails={eventDetails} />

						{/* Jadwal & Agenda */}
						<EventAgenda eventDetails={eventDetails} />
					</Col>

					{/* ========================================== */}
					{/* KOLOM KANAN: STICKY TICKET CARD */}
					{/* ========================================== */}
					<Col lg={4}>
						<div className="" style={{ top: '90px' }}>
							{/* Beli Tiket */}
							<EventTicketCard
								eventDetails={eventDetails}
								selectedTicket={selectedTicket}
								setSelectedTicket={setSelectedTicket}
								registration={registration}
								handleLanjutPembayaran={handleLanjutPembayaran}
							/>

							{/* Waktu & Lokasi */}
							<EventLocationCard
								eventDetails={eventDetails}
								eventLocation={eventLocation}
								getTzLabel={getTzLabel}
							/>

							{/* Penyelenggara */}
							<EventOrganizerCard eventDetails={eventDetails} />
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
