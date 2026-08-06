import React, { useState, useEffect } from 'react';
import { Container, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

import { clr } from './constants';
import { haversine } from './utils';

import HeroSection from './sections/HeroSection';
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
	const [personalizedEvents, setPersonalizedEvents] = useState([]);
	const [nearbyEvents, setNearbyEvents] = useState([]);
	const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPersonalized, setLoadingPersonalized] = useState(true);
	const [pointsData, setPointsData] = useState({ current_local_points: 0, current_global_points: 0 });
	const [searchKeyword, setSearchKeyword] = useState('');

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchKeyword.trim()) {
			navigate('/explore-events?search=' + encodeURIComponent(searchKeyword.trim()));
		}
	};

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

	// Fetch all dashboard data concurrently to prevent layout shifts and sequential flashing
	useEffect(() => {
		let isMounted = true;

		const fetchDashboardData = async () => {
			setIsLoading(true);
			setLoadingPersonalized(true);

			try {
				// 1. Fetch public events (always fetched)
				const eventsPromise = api.get('events');

				// 2. Fetch authenticated data if token exists
				const ticketsPromise = token ? api.get('my-tickets', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null);
				const pointsPromise = token ? api.get('/member/points/balance') : Promise.resolve(null);
				const personalizedPromise = token ? api.get('events/personalized') : Promise.resolve(null);

				// Resolve all in parallel
				const [eventsRes, ticketsRes, pointsRes, personalizedRes] = await Promise.all([
					eventsPromise,
					ticketsPromise,
					pointsPromise,
					personalizedPromise
				]);

				if (!isMounted) return;

				// Process Events
				if (eventsRes) {
					const evData = eventsRes.data?.data ?? eventsRes.data ?? [];
					setAllEvents(
						evData.map((ev) => {
							const loc = ev.location_detail || ev.locationDetail || {};
							const eventType = loc.type || ev.location_type || "offline";
							const display = eventType === "online"
								? (loc.platform ? `Online (${loc.platform})` : "Online Meeting")
								: (loc.location_name || loc.city || "Offline Venue");
							const rawLat = eventType !== "online" ? parseFloat(loc.latitude) : NaN;
							const rawLng = eventType !== "online" ? parseFloat(loc.longitude) : NaN;
							return {
								...ev,
								id: ev.id,
								slug: ev.slug,
								title: ev.title,
								org: ev.organizer?.name ?? "Unknown",
								image: ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id}.jpg`,
								date: ev.start_date
									? new Date(ev.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
									: "Tanggal Belum Ditentukan",
								price: ev.price,
								location: display,
								isOnline: ["online", "hybrid"].includes(eventType),
								isInPerson: ["offline", "hybrid"].includes(eventType),
								isFeatured: ev.id % 2 === 0,
								lat: isNaN(rawLat) ? null : rawLat,
								lng: isNaN(rawLng) ? null : rawLng,
							};
						})
					);
				}

				// Process Tickets
				if (ticketsRes) {
					setTickets(ticketsRes.data.data);
				} else {
					setTickets([]);
				}

				// Process Points
				if (pointsRes && pointsRes.data && pointsRes.data.data) {
					setPointsData(pointsRes.data.data);
				}

				// Process Personalized Events
				if (personalizedRes) {
					const persData = personalizedRes.data?.data ?? personalizedRes.data ?? [];
					setPersonalizedEvents(
						persData.map((ev) => {
							const loc = ev.location_detail || ev.locationDetail || {};
							const eventType = loc.type || ev.location_type || "offline";
							const display = eventType === "online"
								? (loc.platform ? `Online (${loc.platform})` : "Online Meeting")
								: (loc.location_name || loc.city || "Offline Venue");
							const rawLat = eventType !== "online" ? parseFloat(loc.latitude) : NaN;
							const rawLng = eventType !== "online" ? parseFloat(loc.longitude) : NaN;
							return {
								...ev,
								id: ev.id,
								slug: ev.slug,
								title: ev.title,
								org: ev.organizer?.name ?? "Unknown",
								image: ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id}.jpg`,
								date: ev.start_date
									? new Date(ev.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
									: "Tanggal Belum Ditentukan",
								price: ev.price,
								location: display,
								isOnline: ["online", "hybrid"].includes(eventType),
								isInPerson: ["offline", "hybrid"].includes(eventType),
								isFeatured: ev.id % 2 === 0,
								lat: isNaN(rawLat) ? null : rawLat,
								lng: isNaN(rawLng) ? null : rawLng,
							};
						})
					);
				}
			} catch (err) {
				console.error('Error fetching dashboard data:', err);
				// If tickets request fails, set demo fallback
				if (token) {
					setTickets([
						{
							id: 1,
							ticket_code: 'TKT-001',
							status: 'active',
							order_item: {
								order: {
									status: 'paid',
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
									status: 'paid',
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
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
					setLoadingPersonalized(false);
				}
			}
		};

		fetchDashboardData();

		return () => {
			isMounted = false;
		};
	}, [token]);

	// Request geolocation
	const requestLocation = () => {
		setLocationStatus('loading');
		navigator.geolocation.getCurrentPosition(
			({ coords: { latitude, longitude } }) => {
				setLocationStatus('granted');
				const withDist = allEvents
					.filter((ev) => typeof ev.lat === 'number' && !isNaN(ev.lat) && typeof ev.lng === 'number' && !isNaN(ev.lng))
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
							.filter((ev) => ev.isInPerson)
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

	const activeTickets = tickets.filter((t) => {
		const order = t.order_item?.order;
		const event = order?.event;
		if (!order || !event) return false;
		if (order.status !== 'paid') return false;
		if (!['active', 'checked_in', 'used'].includes(t.status)) return false;

		const eventDate = event.end_date ? new Date(event.end_date) : (event.start_date ? new Date(event.start_date) : null);
		if (!eventDate) return true;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return eventDate >= today;
	});

	const totalPaidTicketsCount = tickets.filter((t) => {
		const order = t.order_item?.order;
		if (!order) return false;
		return order.status === 'paid';
	}).length;

	const eventTerbaru = [...allEvents].sort((a, b) => b.id - a.id).slice(0, 8);
	// const eventTerpopuler = allEvents.filter((ev) => ev.isFeatured).slice(0, 8);

	return (
		<div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
			<HeroSection
				userName={user?.name}
				searchKeyword={searchKeyword}
				onSearchChange={(e) => setSearchKeyword(e.target.value)}
				onSearchSubmit={handleSearch}
			/>

			<Container style={{ paddingTop: 24 }}>

				<QuickStatsSection
					activeTicketsCount={activeTickets.length}
					totalTicketsCount={totalPaidTicketsCount}
					pointsData={pointsData}
					isLoading={isLoading}
				/>

				<ActiveTicketsSection activeTickets={activeTickets} isLoading={isLoading} />

				<NearbyEventsSection
					locationStatus={locationStatus}
					nearbyEvents={nearbyEvents}
					requestLocation={requestLocation}
				/>

				<EventListSection
					title="Untuk Kamu"
					events={personalizedEvents}
					seeAllUrl="/explore-events"
					style={{ marginBottom: 36 }}
					isLoading={loadingPersonalized}
				/>

				<EventListSection
					title="Event Terbaru"
					events={eventTerbaru}
					seeAllUrl="/explore-events?sort=newest"
					isLoading={isLoading}
				/>
			</Container>
		</div>
	);
};

export default MemberDashboard;