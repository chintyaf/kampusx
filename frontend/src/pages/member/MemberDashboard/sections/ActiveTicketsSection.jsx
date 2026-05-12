import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import StatusPill from '../StatusPill';
import { clr } from '../constants';
import { STORAGE_URL } from '@/api/storage';

const ActiveTicketsSection = ({ activeTickets }) => {
  const navigate = useNavigate();

  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader
        title="🎟️ Event Aktif Saya"
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
            onClick={() => navigate('/explore')}>
            Cari event →
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}>
          {activeTickets.map((t) => {
            const ev = t.order_item?.order?.event;
            if (!ev) return null;
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/event-space/${ev.id}`)}
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
                      {ev.start_date}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <MapPin size={10} />
                      {ev.location}
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
