import React, { useState, useEffect } from 'react';
// 1. TAMBAHKAN Alert DI SINI
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import {
	Users,
	Wifi,
	Calendar,
	Ticket,
	MapPin,
	User,
	Filter,
	RotateCcw,
	Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
// import axios from 'axios';
import LocationPopup from '../../components/event/LocationPopup';

import api from '../../api/axios';

const NearestEventTest = () => {
	// 1. Ubah inisialisasi awal menjadi null agar if (coords) tidak langsung trigger
	const [coords, setCoords] = useState(null);
	const [range, setRange] = useState(10); // dalam meter / km
	const [events, setEvents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const handleDataLocation = (coordsData) => {
		console.log('Dapat lokasi nih:', coordsData);
		setCoords(coordsData);
	};

	// 2. HELPER UNTUK FORMAT HARGA
	const formatPrice = (price) => {
		if (!price || price === 0 || price === '0') return 'Free';
		// Jika dari API sudah berbentuk string "Rp xxx"
		if (typeof price === 'string' && price.toLowerCase().includes('rp')) return price;

		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(price);
	};

	// 3. HELPER UNTUK FORMAT TANGGAL
	const formatDate = (dateString) => {
		if (!dateString) return 'TBA';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};
	// 4. HELPER UNTUK FORMAT JARAK
	const formatDistance = (dist) => {
		if (dist === undefined || dist === null) return '';

		const numericDist = Number(dist);
		if (numericDist < 1) {
			// Jika kurang dari 1 km, ubah ke meter (contoh: 0.7 km -> 700 m)
			return `${Math.round(numericDist * 1000)} m`;
		}
		// Jika 1 km atau lebih, beri 1 angka di belakang koma (contoh: 2.4 km)
		return `${numericDist.toFixed(1)} km`;
	};

	useEffect(() => {
		const fetchEvents = async () => {
			setIsLoading(true); // Set loading true saat fetch ulang
			try {
				const response = await api.get('/events/nearest', {
					params: {
						latitude: coords.latitude,
						longitude: coords.longitude,
						range: range, // Mengirim range ke backend
					},
				});

				const result = response.data;

				if (result.success === true || result.data) {
					const eventData = result.data;
					setEvents(eventData);
					console.log(eventData);
				}
			} catch (err) {
				console.error('Gagal mengambil data event:', err);
				setError('Terjadi kesalahan saat memuat data.');
			} finally {
				setIsLoading(false);
			}
		};

		if (coords) {
			setEvents([]);
			fetchEvents();
		}
		// UPDATE: Tambahkan 'range' ke dependency array agar otomatis re-fetch saat digeser
	}, [coords, range]);

	return (
		<>
			<LocationPopup onLocationSuccess={handleDataLocation} />

			{/* TAMBAHKAN UI SLIDER RANGE DI SINI (Hanya muncul jika lokasi sudah didapat) */}
			{coords && (
				<div className="px-5 mt-4">
					<Form.Label className="fw-bold">
						Filter Jarak: <span className="text-primary">{range} km</span>
					</Form.Label>
					<Form.Range
						min={1}
						max={50} // Batas maksimal misal 50 km
						value={range}
						onChange={(e) => setRange(Number(e.target.value))}
						className="w-100"
						style={{ maxWidth: '400px', display: 'block' }}
					/>
				</div>
			)}

			<div className="g-4 d-flex gap-5 w-100 flex-wrap p-5 m-5">
				{isLoading && events.length === 0 ? (
					<Spinner animation="border" variant="primary" />
				) : events.length === 0 ? (
					<p>Tidak ada event dalam jarak {range} km.</p>
				) : (
					events.map((ev) => (
						<Col xs={12} md={6} xl={4} key={ev.id}>
							<Link to={`/event/${ev.id}`} className="text-decoration-none text-dark">
								<Card
									className="p-2 h-100 shadow-sm border-0 hover-lift overflow-hidden"
									style={{
										borderRadius: '12px',
										backgroundColor: 'var(--color-white)',
									}}>
									<div
										className="d-flex justify-content-between align-items-center mb-3"
										style={{ minHeight: '28px' }}>
										<div
											className="d-flex px-2 py-1 gap-2"
											style={{ fontSize: 'var(--font-xs)' }}>
											{ev.is_in_person ? (
												<div
													className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white"
													style={{
														fontSize: 'var(--font-xs)',
														color: 'var(--color-primary)',
														border: '1px solid var(--color-primary)',
													}}>
													<Users size={14} className="me-2" /> In-Person
												</div>
											) : null}
											{ev.is_online ? (
												<div
													className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white"
													style={{
														fontSize: 'var(--font-xs)',
														color: 'var(--color-primary)',
														border: '1px solid var(--color-primary)',
													}}>
													<Wifi size={14} className="me-2" /> Online
												</div>
											) : null}
										</div>
										{ev.is_featured ? (
											<div
												className="rounded-pill px-2 py-1 fw-medium"
												style={{
													fontSize: 'var(--font-xs)',
													backgroundColor: 'var(--bahama-blue-500)',
													color: 'var(--color-white)',
												}}>
												Featured
											</div>
										) : null}
									</div>

									<img
										// Jika API mu mereturn null untuk image, gunakan placehold.co sebagai default
										src={
											ev.image ||
											`https://placehold.co/600x300/e2e8f0/64748b?text=Event+${ev.id}`
										}
										alt={ev.title}
										className="w-100 object-fit-cover rounded mb-3"
										style={{ height: '180px' }}
									/>

									<Card.Body className="p-0 d-flex flex-column">
										<div
											className="d-flex justify-content-between mb-3 fw-medium"
											style={{
												color: 'var(--color-primary)',
												fontSize: 'var(--font-sm)',
											}}>
											<div className="d-flex align-items-center">
												{/* Gunakan helper formatDate */}
												<Calendar size={18} className="me-2" />{' '}
												{formatDate(ev.date || ev.start_date)}
											</div>
											<div className="d-flex align-items-center">
												{/* Gunakan helper formatPrice */}
												<Ticket size={18} className="me-2" />{' '}
												{formatPrice(ev.price)}
											</div>
										</div>

										<Card.Title
											className="fw-bold mb-auto"
											style={{
												color: 'var(--color-text)',
												fontSize: 'var(--font-lg)',
												lineHeight: '1.4',
											}}>
											{ev.title}
										</Card.Title>

										<hr
											className="opacity-100 my-3"
											style={{ color: 'var(--color-border)' }}
										/>

										<div
											className="d-flex justify-content-between fw-medium"
											style={{
												color: 'var(--color-primary)',
												fontSize: 'var(--font-sm)',
											}}>
											<div
												className="d-flex align-items-center text-truncate"
												style={{ maxWidth: '60%' }}>
												{/* Fallback ke "TBA" jika location kosong */}
												<MapPin
													size={18}
													className="me-2 flex-shrink-0"
												/>{' '}
												<span className="text-truncate">
													{ev.location || 'TBA'}

													{/* TAMBAHKAN KODE JARAK DI SINI */}
													{ev.distance !== undefined && (
														<span
															className="ms-1"
															style={{
																opacity: 0.8,
																fontSize: '0.9em',
															}}>
															({formatDistance(ev.distance)})
														</span>
													)}
												</span>
											</div>
											<div
												className="d-flex align-items-center text-truncate ms-2"
												style={{ maxWidth: '40%' }}>
												{/* Fallback ke "KampusX" jika org kosong */}
												<User
													size={18}
													className="me-2 flex-shrink-0"
												/>{' '}
												<span className="text-truncate">
													{ev.org || ev.institution?.name || 'KampusX'}
												</span>
											</div>
										</div>
									</Card.Body>
								</Card>
							</Link>
						</Col>
					))
				)}
			</div>
		</>
	);
};

export default NearestEventTest;
