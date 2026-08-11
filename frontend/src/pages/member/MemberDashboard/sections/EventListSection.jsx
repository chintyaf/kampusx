import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import EventCard from '@/components/event/EventCard';

const EventListSection = ({ title, events, seeAllUrl, style, isLoading }) => {
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<section style={style}>
				<SectionHeader title={title} onSeeAll={() => navigate(seeAllUrl)} />
				<div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, paddingLeft: 16, paddingRight: 16, marginLeft: -16, marginRight: -16 }} className="placeholder-glow no-scrollbar">
					{[1, 2].map((i) => (
						<div key={i} style={{ width: '280px', flexShrink: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', paddingBottom: 12 }}>
							<div className="placeholder" style={{ width: '100%', height: 140, display: 'block', backgroundColor: '#e2e8f0' }} />
							<div style={{ padding: '12px' }}>
								<span className="placeholder col-8" style={{ height: 18, borderRadius: 4, display: 'block', marginBottom: 8 }} />
								<span className="placeholder col-5" style={{ height: 14, borderRadius: 4, display: 'block', marginBottom: 6 }} />
								<span className="placeholder col-4" style={{ height: 12, borderRadius: 4, display: 'block' }} />
							</div>
						</div>
					))}
				</div>
			</section>
		);
	}

	return (
		<section style={style}>
			<SectionHeader title={title} onSeeAll={() => navigate(seeAllUrl)} />
			<div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, paddingLeft: 16, paddingRight: 16, marginLeft: -16, marginRight: -16 }}>
				{events.map((ev) => (
					<div key={ev.id} style={{ width: '280px', flexShrink: 0 }}>
						<EventCard
							ev={ev}
							onClick={() => navigate(`/event/${ev.slug || ev.id}`)}
						/>
					</div>
				))}
			</div>
		</section>
	);
};

export default EventListSection;
