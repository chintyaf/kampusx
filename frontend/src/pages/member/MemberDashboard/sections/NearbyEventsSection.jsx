import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Calendar } from 'lucide-react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import SectionHeader from '../SectionHeader';
import { clr } from '../constants';

const NearbyEventsSection = ({ locationStatus, nearbyEvents, requestLocation }) => {
  const navigate = useNavigate();

  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader title="📍 Event Terdekat" />

      {locationStatus === 'idle' && (
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 12,
            padding: '22px 16px',
            textAlign: 'center',
            boxShadow: clr.shadow,
          }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--bahama-blue-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
            <Navigation size={22} style={{ color: '#00699e' }} />
          </div>
          <p
            style={{
              margin: '0 0 4px',
              fontWeight: 700,
              color: 'var(--color-text)',
              fontSize: 'var(--font-sm)',
            }}>
            Temukan Event di Sekitarmu
          </p>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-xs)',
            }}>
            Aktifkan lokasi untuk melihat event paling dekat denganmu
          </p>
          <button
            onClick={requestLocation}
            style={{
              background: '#00699e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 22px',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Aktifkan Lokasi
          </button>
        </div>
      )}

      {locationStatus === 'loading' && (
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 12,
            padding: '28px 16px',
            textAlign: 'center',
            boxShadow: clr.shadow,
          }}>
          <BootstrapSpinner animation="border" size="sm" style={{ color: '#00699e' }} />
          <p
            style={{
              marginTop: 8,
              fontSize: 'var(--font-sm)',
              color: 'var(--color-secondary)',
              marginBottom: 0,
            }}>
            Mendeteksi lokasimu…
          </p>
        </div>
      )}

      {locationStatus === 'denied' && (
        <div
          style={{
            background: 'var(--error-bg)',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid var(--error-border)',
            boxShadow: clr.shadow,
          }}>
          <p
            style={{
              margin: '0 0 4px',
              fontSize: 'var(--font-sm)',
              fontWeight: 700,
              color: 'var(--error-heading)',
            }}>
            Akses lokasi ditolak
          </p>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-secondary)',
            }}>
            Izinkan akses lokasi di pengaturan browser untuk fitur ini.
          </p>
          <button
            onClick={requestLocation}
            style={{
              background: 'none',
              border: '1px solid var(--error-text)',
              color: 'var(--error-text)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Coba Lagi
          </button>
        </div>
      )}

      {locationStatus === 'granted' && nearbyEvents.length === 0 && (
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
          Tidak ada event di sekitar lokasimu saat ini.
        </div>
      )}

      {locationStatus === 'granted' && nearbyEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearbyEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => navigate(`/event/${ev.id}`)}
              style={{
                background: 'var(--color-white)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                boxShadow: clr.shadow,
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--bahama-blue-50)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'var(--color-white)')
              }>
              <img
                src={ev.image}
                alt={ev.title}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontWeight: 700,
                    fontSize: 'var(--font-sm)',
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                  {ev.title}
                </p>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: 'var(--color-secondary)',
                  }}>
                  <Calendar size={10} />
                  {ev.date}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--font-sm)',
                    fontWeight: 700,
                    color: '#00699e',
                  }}>
                  {ev.distance} km
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-secondary)',
                  }}>
                  dari lokasimu
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NearbyEventsSection;
