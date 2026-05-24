import React from 'react';
import EventCard from '@/components/event/EventCard';

const EventPreview = () => {
	return (
		<div className="bg-white" style={{ width: '300px' }}>
			<div className="p-4">
				<p
					className="text-uppercase text-muted fw-bold mb-3"
					style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
				>
					Ringkasan
				</p>

				<div>
					<EventCard />
				</div>
			</div>
		</div>
	);
};

export default EventPreview;
