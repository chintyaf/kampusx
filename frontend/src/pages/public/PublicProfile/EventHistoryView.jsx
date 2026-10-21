import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Calendar, ExternalLink, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventHistoryView = ({
  events = [],
  isGuest = false,
  promptLoginRequired = () => {}
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <Calendar size={36} className="text-muted mb-2" />
        <h6 className="fw-bold text-dark">Belum Mengikuti Event</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum terdaftar pada event apa pun.</p>
      </div>
    );
  }

  const displayedEvents = isGuest ? events.slice(0, 1) : events;
  const lockedCount = isGuest ? Math.max(events.length - 1, 1) : 0;

  return (
    <div>
      <Row className="g-3">
        {displayedEvents.map((event) => (
          <Col md={6} key={event.id}>
            <div
              className="d-flex align-items-center p-3 border bg-white rounded-4 shadow-sm h-100"
              style={{
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div className="flex-grow-1">
                <Badge
                  bg={event.status === 'attended' || event.status === 'published' ? 'success-subtle' : 'secondary-subtle'}
                  text={event.status === 'attended' || event.status === 'published' ? 'success' : 'secondary'}
                  className="border mb-2 text-capitalize"
                  style={{ fontSize: '10px' }}
                >
                  {event.status === 'attended' || event.status === 'published' ? 'Kehadiran Tervalidasi' : 'Terdaftar'}
                </Badge>
                <h6 className="fw-bold mb-1 text-truncate text-dark" style={{ maxWidth: '90%' }}>
                  {event.title}
                </h6>
                <small className="text-muted">
                  {event.start_date
                    ? new Date(event.start_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : event.date || 'Event KampusX'}
                </small>
              </div>
              <Link
                to={`/event/${event.slug || event.id}`}
                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
                title="Lihat Detail Event"
              >
                <ExternalLink size={16} className="text-secondary" />
              </Link>
            </div>
          </Col>
        ))}
      </Row>

      {/* LinkedIn-style Gated Lock Card untuk Riwayat Event Lainnya */}
      {isGuest && (
        <div className="srl-locked-gateway-box p-4 rounded-4 mt-3 text-center border">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#00699e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Lock size={20} />
          </div>
          <h6 className="fw-bold text-dark mb-1">
            Riwayat Partisipasi Event Lengkap Terkunci (+{lockedCount} Event Lainnya)
          </h6>
          <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '460px', fontSize: '12.5px' }}>
            Masuk ke KampusX untuk melihat seluruh riwayat partisipasi hackathon, seminar, dan workshop teknologi mahasiswa ini.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
            onClick={() =>
              promptLoginRequired(
                'Buka Seluruh Riwayat Event',
                'Masuk ke akun KampusX untuk melihat daftar lengkap event, tiket kehadiran terverifikasi, dan materi workshop.'
              )
            }
          >
            <LogIn size={14} /> Masuk untuk Melihat Semua Event
          </button>
        </div>
      )}
    </div>
  );
};

export default EventHistoryView;
