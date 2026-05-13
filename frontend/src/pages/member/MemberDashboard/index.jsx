import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

import { clr } from './constants';
import { haversine } from './utils';

import CarouselSection from './sections/CarouselSection';
import QuickStatsSection from './sections/QuickStatsSection';
import ActiveTicketsSection from './sections/ActiveTicketsSection';
import NearbyEventsSection from './sections/NearbyEventsSection';
import EventListSection from './sections/EventListSection';
import { STORAGE_URL } from '@/api/storage';

const MemberDashboard = () => {
	const { token, user } = useAuth();
	const navigate = useNavigate();

	const [tickets, setTickets] = useState([]);
	const [allEvents, setAllEvents] = useState([]);
	const [nearbyEvents, setNearbyEvents] = useState([]);
	const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
	const [isLoading, setIsLoading] = useState(true);

	const banners = [
		{ id: 1, image: `${STORAGE_URL}/event-banners/1.jpg` },
		{
			id: 2,
			image: `${STORAGE_URL}/event-banners/2.jpg`,
		},
		{
			id: 3,
			image: `${STORAGE_URL}/event-banners/3.jpg`,
		},
	];

	console.log(STORAGE_URL);

	// Fetch all events
	useEffect(() => {
		(async () => {
			try {
				const res = await api.get('events');
				const data = res.data?.data ?? res.data;
				setAllEvents(
					data.map((ev) => ({
						id: ev.id,
						title: ev.title,
						org: ev.organizer?.name ?? 'Unknown',
						image: ev.image_path
							? `${STORAGE_URL}/${ev.image_path}`
							: `${STORAGE_URL}/event-banners/${ev.id}.jpg`,
						date: ev.start_date
							? new Date(ev.start_date).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
								})
							: 'TBD',
						location:
							ev.location_type === 'online' ? 'Online' : (ev.venue ?? 'Offline'),
						lat: ev.latitude ?? null,
						lng: ev.longitude ?? null,
						isOnline: ['online', 'hybrid'].includes(ev.location_type),
						isInPerson: ['offline', 'hybrid'].includes(ev.location_type),
						isFeatured: ev.id % 2 === 0,
						price: ev.price
							? `Rp ${Number(ev.price).toLocaleString('id-ID')}`
							: 'Gratis',
					})),
				);
			} catch (err) {
				console.error('Gagal fetch events:', err);
			}
		})();
	}, []);

	// Fetch my tickets
	useEffect(() => {
		(async () => {
			try {
				if (!token) {
					setIsLoading(false);
					return;
				}
				const res = await api.get('my-tickets', {
					headers: { Authorization: `Bearer ${token}` },
				});
				setTickets(res.data.data);
			} catch {
				setTickets([
					{
						id: 1,
						ticket_code: 'TKT-001',
						status: 'active',
						order_item: {
							order: {
								event: {
									id: 101,
									title: 'Workshop UI/UX Design',
									start_date: '10 April 2026',
									location: 'Bandung, ID',
									image: 'https://placehold.co/600x300/dff3ff/00699e?text=Workshop',
								},
							},
						},
					},
					{
						id: 2,
						ticket_code: 'TKT-002',
						status: 'used',
						order_item: {
							order: {
								event: {
									id: 102,
									title: 'Tech Startup Conference 2026',
									start_date: '15 Mei 2026',
									location: 'Zoom',
									image: 'https://placehold.co/600x300/f1f5f9/64748b?text=Conference',
								},
							},
						},
					},
				]);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [token]);

	// Request geolocation
	const requestLocation = () => {
		setLocationStatus('loading');
		navigator.geolocation.getCurrentPosition(
			({ coords: { latitude, longitude } }) => {
				setLocationStatus('granted');
				const withDist = allEvents
					.filter((ev) => ev.lat && ev.lng)
					.map((ev) => ({
						...ev,
						distance: haversine(latitude, longitude, ev.lat, ev.lng),
					}))
					.sort((a, b) => a.distance - b.distance)
					.slice(0, 6)
					.map((ev) => ({ ...ev, distance: ev.distance.toFixed(1) }));

				// Fallback demo jika API belum kirim koordinat
				if (withDist.length === 0) {
					setNearbyEvents(
						allEvents
							.slice(0, 4)
							.map((ev, i) => ({ ...ev, distance: (0.8 + i * 1.3).toFixed(1) })),
					);
				} else {
					setNearbyEvents(withDist);
				}
			},
			() => setLocationStatus('denied'),
		);
	};

	const activeTickets = tickets.filter((t) => t.status === 'active');
	const eventTerbaru = [...allEvents].sort((a, b) => b.id - a.id).slice(0, 8);
	const eventTerpopuler = allEvents.filter((ev) => ev.isFeatured).slice(0, 8);

	if (isLoading)
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh',
				}}
			>
				<Spinner animation="border" style={{ color: clr.primaryHex }} />
			</div>
		);

	return (
		<div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
			<CarouselSection banners={banners} />

			<Container style={{ paddingTop: 24 }}>
				<div style={{ marginBottom: 24 }}>
					<p
						style={{
							margin: 0,
							fontSize: 'var(--font-xs)',
							color: 'var(--color-secondary)',
						}}
					>
						Selamat datang kembali 👋
					</p>
					<h1
						style={{
							margin: 0,
							fontSize: 'var(--font-xl)',
							fontWeight: 800,
							color: 'var(--color-text)',
						}}
					>
						{user?.name ?? 'Member'}
					</h1>
				</div>

				<QuickStatsSection
					activeTicketsCount={activeTickets.length}
					points={user?.points ?? 0}
					totalTicketsCount={tickets.length}
				/>

				<ActiveTicketsSection activeTickets={activeTickets} />

				<NearbyEventsSection
					locationStatus={locationStatus}
					nearbyEvents={nearbyEvents}
					requestLocation={requestLocation}
				/>

				<EventListSection
					title="🔥 Event Terpopuler"
					events={eventTerpopuler}
					seeAllUrl="/explore?sort=popular"
					style={{ marginBottom: 36 }}
				/>

				<EventListSection
					title="✨ Event Terbaru"
					events={eventTerbaru}
					seeAllUrl="/explore?sort=newest"
				/>
			</Container>
		</div>
	);
};

export default MemberDashboard;
