import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Settings, Save, Clock, Brain, Tag, Bell, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [dailyReminder, setDailyReminder] = useState('09:00');
  const [reflectionMode, setReflectionMode] = useState('detailed');
  const [interests, setInterests] = useState([
    'Design Thinking',
    'Public Speaking',
    'Leadership',
    'Produktivitas'
  ]);
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) {
      toast.error('Topik minat ini sudah terdaftar!');
      return;
    }
    setInterests(prev => [...prev, newInterest.trim()]);
    setNewInterest('');
    toast.success('Topik minat berhasil ditambahkan!');
  };

  const handleRemoveInterest = (topic) => {
    setInterests(prev => prev.filter(t => t !== topic));
    toast.success('Topik minat dihapus!');
  };

  const handleSaveSettings = () => {
    toast.success('Pengaturan preferensi belajar SRL berhasil diperbarui!');
    navigate('/learner/catalog');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <button 
                onClick={() => navigate('/learner/catalog')}
                style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="badge bg-secondary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                  Konfigurasi SRL
                </span>
                <h2 className="fw-extrabold mb-1">Pengaturan Preferensi Belajar</h2>
                <p className="text-white-50 mb-0 small">
                  Atur pengingat belajar harian, tingkat kedalaman refleksi mandiri, dan kelola preferensi bidang minat Anda.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: Config groups */}
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <Bell size={20} className="text-primary" /> Pengingat & Notifikasi Belajar
              </h5>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                  <Clock size={14} /> Jam Pengingat Belajar Harian (Daily Study Reminder)
                </Form.Label>
                <Form.Control
                  type="time"
                  value={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.value)}
                  style={{ borderRadius: 10, padding: '12px 16px', fontSize: 14, maxWidth: 200 }}
                />
                <Form.Text className="text-muted small">
                  Sistem akan mengirimkan email / push notifikasi pengingat belajar harian sesuai jam yang Anda tetapkan.
                </Form.Text>
              </Form.Group>

              <hr className="my-4" />

              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <Brain size={20} className="text-primary" /> Mode Refleksi Mandiri (SRL Reflection)
              </h5>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Kedalaman Refleksi Diri</Form.Label>
                <Form.Select
                  value={reflectionMode}
                  onChange={(e) => setReflectionMode(e.target.value)}
                  style={{ borderRadius: 10, padding: '12px 16px', fontSize: 14 }}
                >
                  <option value="detailed">Refleksi Mendalam (Isian kuesioner kualitatif penuh)</option>
                  <option value="quick">Refleksi Ringkas (Hanya rating bintang keyakinan & feedback ringkas)</option>
                </Form.Select>
                <Form.Text className="text-muted small">
                  Tingkat kedalaman reflects memengaruhi ketelitian kalkulasi performa SRL Chintya AI Anda.
                </Form.Text>
              </Form.Group>
            </Card>
          </Col>

          {/* Right panel: interest topic editor */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <Tag size={20} className="text-primary" /> Kelola Topik Minat
              </h5>

              <Form onSubmit={handleAddInterest} className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Tambah Topik Minat Baru</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Contoh: Machine Learning"
                    style={{ borderRadius: 10, fontSize: 13 }}
                  />
                  <Button type="submit" style={{ background: '#005a87', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                    Tambah
                  </Button>
                </div>
              </Form>

              <div className="d-flex flex-wrap gap-2 mb-2">
                {interests.map(topic => (
                  <span 
                    key={topic}
                    onClick={() => handleRemoveInterest(topic)}
                    className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2"
                    style={{ borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    {topic} <span className="text-danger fw-bold">✕</span>
                  </span>
                ))}
              </div>
              <small className="text-muted block mt-2">Klik tag di atas jika ingin menghapus minat belajar.</small>
            </Card>

            <Button
              onClick={handleSaveSettings}
              className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              style={{ background: '#005a87', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13 }}
            >
              <Save size={16} /> Simpan Semua Pengaturan Preferensi
            </Button>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
