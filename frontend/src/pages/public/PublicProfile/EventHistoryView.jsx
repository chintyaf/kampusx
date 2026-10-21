import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventHistoryView = ({ events = [] }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <Calendar size={36} className="text-muted mb-2" />
        <h6 className="fw-bold text-dark">Belum Mengikuti Event</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum terdaftar pada event apa pun.</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {events.map((event) => (
        <Col md={6} key={event.id}>
          <div
            className="d-flex align-items-center p-3 border bg-white rounded-4 shadow-sm"
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
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border"
              style={{ width: '40px', height: '40px' }}
              title="Lihat Detail Event"
            >
              <ExternalLink size={16} className="text-secondary" />
            </Link>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default EventHistoryView;
