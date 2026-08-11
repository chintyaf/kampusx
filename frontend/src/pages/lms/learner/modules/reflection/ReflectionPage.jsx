import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ChevronLeft, Star, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

const ReflectionPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');

  // Helper info about module
  const mockModuleData = {
    1: { title: 'Pengenalan Design Thinking untuk Pemula' },
    2: { title: 'Teknik Presentasi yang Memukau Audiens' },
    3: { title: 'Dasar-dasar Kepemimpinan Tim Efektif' },
    4: { title: 'Deep Work: Fokus Tanpa Distraksi Digital' },
  };

  const moduleTitle = mockModuleData[moduleId]?.title || 'LMS Micro-Learning Modul';

  const handleComplete = () => {
    // Navigate back to catalog
    navigate('/learner/catalog');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 14, fontWeight: 600, padding: 0 }}
            >
              <ChevronLeft size={18} /> Kembali ke Kuis
            </button>
            <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Refleksi: {moduleTitle}</span>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            
            {/* Success Heading */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: '#d1fae5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#047857', background: '#d1fae5', borderRadius: 999, padding: '3px 10px', marginBottom: 8, textTransform: 'uppercase' }}>
                Fase 3: Self-Reflection
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Selamat! Modul Telah Selesai
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0' }}>
                Mari lakukan evaluasi singkat untuk melacak kesiapan pemahamanmu.
              </p>
            </div>

            {/* Star Rating Box */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20, textAlign: 'center' }}>
              <h5 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>
                Bagaimana tingkat keyakinanmu untuk menerapkan materi ini?
              </h5>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Beri penilaian bintang dari 1 (kurang yakin) sampai 5 (sangat mahir).
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', transition: 'transform 0.1s' }}
                  >
                    <Star
                      size={32}
                      color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                      fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                  {rating === 1 ? 'Perlu belajar lagi' : rating === 5 ? 'Sangat menguasai!' : `Skor Keyakinan: ${rating}`}
                </span>
              )}
            </Card>

            {/* Readiness Score Box */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: '#f0f9ff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid #00699e', marginBottom: 8
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#00699e' }}>92%</span>
                  </div>
                  <h6 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Kesiapan Topik</h6>
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>Sangat Siap</span>
                </Card>
              </Col>

              {/* AI Feedback Summary Box */}
              <Col md={8}>
                <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={16} color="#8b5cf6" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>Analisis AI KampusX</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                    "Bagus sekali! Pemahamanmu terhadap materi sangat kuat. Strategi Pomodoro yang kamu pilih di awal sangat membantumu memfokuskan kognitif. Pertahankan cara belajar terstruktur ini di modul berikutnya!"
                  </p>
                </Card>
              </Col>
            </Row>

            {/* Reflection notes input */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24 }}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                  Tuliskan satu hal utama yang ingin kamu perbaiki di sesi belajar berikutnya:
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Contoh: Saya ingin mencatat poin-poin ideasi lebih awal agar tidak lupa..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ borderRadius: 10, padding: 12, fontSize: 13 }}
                />
              </Form.Group>
            </Card>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/learner/modules/${moduleId}`)}
                style={{ flex: 1, borderRadius: 10, padding: '14px', fontWeight: 600, fontSize: 14 }}
              >
                Ulangi Modul
              </Button>
              <Button
                onClick={handleComplete}
                style={{
                  flex: 2,
                  background: '#005a87',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                Selesaikan Modul & Selesai <CheckCircle2 size={16} />
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReflectionPage;
