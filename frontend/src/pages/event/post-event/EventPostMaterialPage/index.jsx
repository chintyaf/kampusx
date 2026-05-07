import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Container, Button } from 'react-bootstrap';
import SessionCard from './SessionCard';

const EventPostMaterialPage = () => {
  const [sessions, setSessions] = useState([
    {
      id: '1',
      title: 'Sesi 1 - UI/UX Basic',
      date: '15 Maret 2026, 09:00 - 12:00',
      speaker: 'Budi Santoso',
      videoType: 'url',
      videoUrl: 'https://youtube.com/watch?v=example',
      materials: [
        { id: 'm1', name: 'Slide Presentasi.pdf', type: 'PDF', size: '2.5 MB' },
        { id: 'm2', name: 'Cheat Sheet.pdf', type: 'PDF', size: '1.2 MB' },
      ],
      published: true,
      stats: {
        totalAccess: 156,
        completionRate: 68,
        downloadCount: 142,
      },
    },
    {
      id: '2',
      title: 'Sesi 2 - Advanced Prototyping',
      date: '15 Maret 2026, 13:00 - 16:00',
      speaker: 'Sarah Wijaya',
      videoType: 'none',
      materials: [],
      published: false,
      stats: {
        totalAccess: 0,
        completionRate: 0,
        downloadCount: 0,
      },
    },
  ]);

  const addSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: `Sesi ${sessions.length + 1} - Judul Baru`,
      date: 'Belum dijadwalkan',
      speaker: '',
      videoType: 'none',
      materials: [],
      published: false,
      stats: {
        totalAccess: 0,
        completionRate: 0,
        downloadCount: 0,
      },
    };
    setSessions([...sessions, newSession]);
  };

  const updateSession = (id, updates) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <Container fluid className="py-4 px-4" style={{ maxWidth: '1140px' }}>
      <div className="mb-4">
        <h3 className="text-dark mb-1">Manajemen Konten Pasca-Acara</h3>
        <p className="text-muted small">
          Atur materi, video replay, dan syarat akses untuk setiap sesi
        </p>
      </div>

      <div className="d-flex flex-column gap-3">
        {sessions.map((session, index) => (
          <SessionCard
            key={session.id}
            session={session}
            sessionNumber={index + 1}
            onUpdate={(updates) => updateSession(session.id, updates)}
            onDelete={() => deleteSession(session.id)}
            hasPreviousSession={index > 0}
          />
        ))}
      </div>

      <Button
        variant="light"
        onClick={addSession}
        className="mt-4 w-100 d-flex align-items-center justify-content-center gap-2 py-3 text-secondary"
        style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0d6efd'; e.currentTarget.classList.replace('text-secondary', 'text-primary'); }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.classList.replace('text-primary', 'text-secondary'); }}
      >
        <Plus size={20} />
        Tambah Sesi Baru
      </Button>
    </Container>
  );
};

export default EventPostMaterialPage;
