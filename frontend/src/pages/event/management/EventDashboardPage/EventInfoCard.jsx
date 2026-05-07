import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { CalendarDays, Pencil, FileText, Upload, Ticket } from 'lucide-react';

/**
 * EventInfoCard
 * Props:
 *   event {Object} - event detail fields
 *   onEdit, onFormulir, onExport, onTiket {Function}
 */

export default function EventInfoCard({
  event = {
    name: 'Webinar Tech Summit 2025',
    startDate: '20 Juli 2025, 09:00',
    endDate: '21 Juli 2025, 17:00',
    location: 'Online (Zoom)',
    organizer: 'Himpunan Informatika ITB',
    categories: ['Technology', 'Education'],
    institution: 'Institut Teknologi Bandung',
  },
  onEdit,
  onFormulir,
  onExport,
  onTiket,
}) {
  const fields = [
    { label: 'Nama Event',      value: event.name },
    { label: 'Tanggal Mulai',   value: event.startDate },
    { label: 'Tanggal Selesai', value: event.endDate },
    { label: 'Lokasi',          value: event.location },
    { label: 'Organizer',       value: event.organizer },
    {
      label: 'Kategori',
      value: (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {event.categories.map((c) => (
            <span key={c} className="tag tag-primary">{c}</span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="card mb-4">
      <div className="card-title" style={{ marginBottom: 16 }}>
        <CalendarDays size={15} />
        Info Event
      </div>

      <Row className="g-3">
        {fields.map((f, i) => (
          <Col key={i} xs={12} sm={6} lg={4}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
              {f.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{f.value}</div>
          </Col>
        ))}
      </Row>

      <div className="divider" />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={onEdit}>
          <Pencil size={13} />
          Edit Info
        </button>
        <button className="btn" onClick={onFormulir}>
          <FileText size={13} />
          Lihat Formulir
        </button>
        <button className="btn" onClick={onExport}>
          <Upload size={13} />
          Export Peserta
        </button>
        <button className="btn btn-primary" onClick={onTiket}>
          <Ticket size={13} />
          Kelola Tiket
        </button>
      </div>
    </div>
  );
}
