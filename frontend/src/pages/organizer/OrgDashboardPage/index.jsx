import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';

import api from '../../../api/axios';
import NoEvent from './NoEvent';
import EventList from './EventList';

const OrgDashboardPage = () => {
	const [events, setEvents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await api.get('/organizer/events-list');
				const result = response.data;

				if (result.status === 'success' && Array.isArray(result.data)) {
					console.log('Fetched events:', result.data);
					setEvents(result.data);
				}
			} catch (error) {
				console.error('Error fetching events:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvents();
	}, []);

	return (
		<div style={{ minHeight: '100vh', fontFamily: 'var(--font)' }}>
			<Container className="py-4">
				{isLoading ? (
					<div className="text-center mt-5">
						<Spinner animation="border" style={{ color: '#00699e' }} />
						<p className="mt-3" style={{ color: '#64748b', fontSize: '14px' }}>
							Memuat data acara...
						</p>
					</div>
				) : events.length === 0 ? (
					<NoEvent />
				) : (
					<EventList events={events} />
				)}
			</Container>
		</div>
	);
};

export default OrgDashboardPage;
