import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import api from '../../../api/axios';
import NoEvent from './NoEvent';
import EventList from './EventList';
import { useLoading } from '../../../context/LoadingContext';

const OrgDashboardPage = () => {
	const [events, setEvents] = useState([]);
	const { setIsPageLoading } = useLoading();
	const [dataLoaded, setDataLoaded] = useState(false);

	useEffect(() => {
		const fetchEvents = async () => {
			setIsPageLoading(true);
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
				setIsPageLoading(false);
				setDataLoaded(true);
			}
		};

		fetchEvents();
	}, []);

	return (
		<div style={{ minHeight: '100vh', fontFamily: 'var(--font)' }}>
			<Container className="py-4">
				{!dataLoaded ? null : events.length === 0 ? (
					<NoEvent />
				) : (
					<EventList events={events} />
				)}
			</Container>
		</div>
	);
};

export default OrgDashboardPage;
