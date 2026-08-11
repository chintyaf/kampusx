import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatusPill from '../components/StatusPill';
import { clr } from '../constants';
import { STORAGE_URL } from '@/api/storage';
import { formatDate } from '@/utils/dateUtils';

const ActiveTicketsSection = ({ activeTickets, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section style={{ marginBottom: 36 }}>
        <SectionHeader
          title="Event Aktif Saya"
          onSeeAll={() => navigate('/my-tickets')}
        />
        <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            paddingLeft: 16,
            paddingRight: 16,
            marginLeft: -16,
            marginRight: -16,
          }} className="placeholder-glow no-scrollbar">
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 236,
                background: 'var(--color-white)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: clr.shadow,
                paddingBottom: 12
              }}
            >
              <div className="placeholder" style={{ width: '100%', height: 108, display: 'block', backgroundColor: '#e2e8f0' }} />
              <div style={{ padding: '10px 12px 0' }}>
                <span className="placeholder col-4" style={{ height: 16, borderRadius: 4, display: 'block', marginBottom: 8 }} />
                <span className="placeholder col-10" style={{ height: 18, borderRadius: 4, display: 'block', marginBottom: 6 }} />
                <span className="placeholder col-6" style={{ height: 12, borderRadius: 4, display: 'block' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader
        title="Event Aktif Saya"
        onSeeAll={() => navigate('/my-tickets')}
      />

      {activeTickets.length === 0 ? (
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 12,
            padding: '20px 16px',
            textAlign: 'center',
            color: 'var(--color-secondary)',
            fontSize: 'var(--font-sm)',
            boxShadow: clr.shadow,
          }}>
          Belum ada event aktif.{' '}
          <span
            style={{ color: clr.primary, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/explore-events')}>
            Cari event →
          </span>
        </div>
      ) : (
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            paddingLeft: 16,
            paddingRight: 16,
            marginLeft: -16,
            marginRight: -16,
          }}>
          {activeTickets.map((t) => {
            const ev = t.order_item?.order?.event;
            if (!ev) return null;

            const locationDetail = ev.location_detail || ev.locationDetail;
            const locationText = locationDetail
              ? locationDetail.type === 'online'
                ? `Online (${locationDetail.platform || 'Platform'})`
                : locationDetail.location_name || locationDetail.city || 'Offline Venue'
              : ev.location_type === 'online'
                ? 'Online'
                : ev.venue || 'Offline Venue';

            return (
              <div
                key={t.id}
                onClick={() => navigate(`/event-space/${ev.slug || ev.id}`)}
                style={{
                  flexShrink: 0,
                  width: 236,
                  background: 'var(--color-white)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: clr.shadow,
                  cursor: 'pointer',
                  transition: 'transform .15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'translateY(-3px)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'translateY(0)')
                }>
                <img
                  src={ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id}.jpg`}
                  alt={ev.title}
                  style={{
                    width: '100%',
                    height: 108,
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '10px 12px 12px' }}>
                  <StatusPill status={t.status} />
                  <p
                    style={{
                      margin: '6px 0 4px',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                    {ev.title}
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <Calendar size={10} />
                      {formatDate(ev.start_date)}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <MapPin size={10} />
                      {locationText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveTicketsSection;
