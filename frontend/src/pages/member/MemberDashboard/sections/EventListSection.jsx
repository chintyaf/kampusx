import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../SectionHeader';
import EventCard from '../../../../components/event/EventCard';

const EventListSection = ({ title, events, seeAllUrl, style }) => {
  const navigate = useNavigate();

  return (
    <section style={style}>
      <SectionHeader
        title={title}
        onSeeAll={() => navigate(seeAllUrl)}
      />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ width: '280px', flexShrink: 0 }}>
            <EventCard
              ev={ev}
              onClick={() => navigate(`/event/${ev.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventListSection;
