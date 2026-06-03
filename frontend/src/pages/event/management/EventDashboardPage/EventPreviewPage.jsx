import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../api/axios';

// Import Modular Sections from Public Event Detail
import EventHeader from '../../public/EventDetail/sections/EventHeader';
import EventAbout from '../../public/EventDetail/sections/EventAbout';
import EventAgenda from '../../public/EventDetail/sections/EventAgenda';
import EventTicketCard from '../../public/EventDetail/sections/EventTicketCard';
import EventLocationCard from '../../public/EventDetail/sections/EventLocationCard';
import EventOrganizerCard from '../../public/EventDetail/sections/EventOrganizerCard';

export default function EventPreviewPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [eventDetails, setEventDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishErrors, setPublishErrors] = useState(null);

	const [selectedTicket, setSelectedTicket] = useState('day1');
	// In preview mode, user is not actually registered
	const registration = { registered: false, status: null, order_id: null };

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
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				alert(errData?.message || 'Terjadi kesalahan saat mempublikasikan event.');
			}
		} finally {
			setIsPublishing(false);
		}
	};

	if (isLoading) {
		return (
			<div
				className="d-flex flex-column justify-content-center align-items-center"
				style={{ minHeight: '80vh' }}
			>
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
				<Button
					variant="outline-dark"
					className="rounded-0 border-2 fw-semibold"
					onClick={() => navigate(-1)}
				>
					Kembali ke Dashboard
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
			WIB: 'WIB',
			WITA: 'WITA',
			WIT: 'WIT',
		};
		return mapping[tz] || tz;
	};

	return (
		<div
			style={{
				backgroundColor: 'var(--color-bg, #f4f5f7)',
				minHeight: '100vh',
				paddingBottom: '80px',
			}}
		>
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
						<strong>Mode Preview:</strong> Ini adalah pratinjau halaman detail acara
						Anda. Peserta tidak dapat membeli tiket dalam mode ini.
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
					<Alert
						variant="danger"
						className="rounded-0 border-2 shadow-none mb-0 d-flex flex-column gap-2"
						onClose={() => setPublishErrors(null)}
						dismissible
					>
						<div className="fw-bold fs-6">Tidak Dapat Mempublikasikan Event</div>
						<div style={{ fontSize: '13px' }}>
							Silakan lengkapi data wajib berikut terlebih dahulu sebelum melakukan
							publikasi acara:
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

			<div style={{ pointerEvents: 'none' }} className="mt-4">
				{/* --- HEADER BANNER --- */}
				<EventHeader
					eventDetails={eventDetails}
					isBookmarked={false}
					handleShare={() => {}}
					handleToggleBookmark={() => {}}
				/>

				<Container>
					<Row className="g-4">
						{/* KOLOM KIRI: KONTEN UTAMA */}
						<Col lg={8}>
							<EventAbout eventDetails={eventDetails} />
							<EventAgenda eventDetails={eventDetails} />
						</Col>

						{/* KOLOM KANAN: STICKY TICKET CARD */}
						<Col lg={4}>
							<div className="" style={{ top: '90px' }}>
								<EventTicketCard
									eventDetails={eventDetails}
									selectedTicket={selectedTicket}
									setSelectedTicket={setSelectedTicket}
									registration={registration}
									handleLanjutPembayaran={() => {}}
								/>

								<EventLocationCard
									eventDetails={eventDetails}
									eventLocation={eventLocation}
									getTzLabel={getTzLabel}
								/>

								<EventOrganizerCard eventDetails={eventDetails} />
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
}
