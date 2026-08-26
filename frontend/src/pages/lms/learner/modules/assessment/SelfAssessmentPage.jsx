import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { ChevronLeft, Star, Sparkles, CheckCircle2, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { MOCK_LEARNING_PATHS } from '@/data/mockMicrolearningData';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const SelfAssessmentPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve routing states
  const { score = 85, isReady = true, pointsAwarded = 50 } = location.state || {};

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [actionText, setActionText] = useState('');

  // Info about module
  const currentPath = MOCK_LEARNING_PATHS.find(p => p.id === Number(moduleId)) || MOCK_LEARNING_PATHS[0];
  
  // Find next path recommended
  const nextPath = MOCK_LEARNING_PATHS.find(p => p.id !== Number(moduleId)) || MOCK_LEARNING_PATHS[1];

  const handleComplete = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Harap isi rating keyakinan belajar Anda!');
      return;
    }
    if (!reflectionText || !actionText) {
      toast.error('Harap lengkapi pertanyaan refleksi diri!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/srl/reflection', {
          moduleId: Number(moduleId),
          reflection_note: `Rintangan: ${reflectionText} | Solusi: ${actionText}`,
          understanding_level: rating,
          points_awarded: isReady ? pointsAwarded : 0
        });
      }
    } catch (err) {
      console.error('Failed to save SRL reflection to backend:', err);
    }

    // Keep localStorage backup triggers
    localStorage.setItem(`lms_planned_${moduleId}`, 'true');
    localStorage.setItem(`lms_reflection_rating_${moduleId}`, rating.toString());
    localStorage.setItem(`lms_reflection_note_${moduleId}`, reflectionText);
    localStorage.setItem(`lms_reflection_action_${moduleId}`, actionText);

    toast.success(`Selamat! Modul "${currentPath.title}" telah terdaftar selesai! (+${isReady ? pointsAwarded : 0} Poin)`);
    navigate('/learner/catalog');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 13, fontWeight: 600, padding: 0 }}
            >
              <ChevronLeft size={16} /> Kembali ke Hasil Kuis
            </button>
            <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Fase 3: Self Assessment & Evaluasi Diri</span>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            
            {/* Header info */}
            <div className="text-center mb-4">
              {isReady ? (
                <>
                  <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h3 className="fw-extrabold mb-1">Kuis Berhasil Diselesaikan!</h3>
                  <p className="text-muted small mb-0">
                    Poin diperoleh: <span className="fw-bold text-success">+{pointsAwarded} Poin Gold</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="d-inline-flex align-items-center justify-content-center bg-warning-subtle rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                    <Sparkles size={32} className="text-warning" />
                  </div>
                  <h3 className="fw-extrabold mb-1" style={{ color: '#d97706' }}>Melanjutkan Tanpa Kelulusan Kuis</h3>
                  <div className="alert alert-warning d-inline-block small py-2 px-3 mb-2 mt-2" style={{ maxWidth: 500, borderRadius: 10, textAlign: 'left' }}>
                    <strong>Perhatian:</strong> Skor kuis Anda ({score}%) di bawah batas minimal 70%. Sangat disarankan untuk meninjau materi kembali. Namun, Anda tetap diperbolehkan mengisi refleksi SRL ini untuk menyelesaikan modul (tanpa Poin Gold tambahan).
                  </div>
                </>
              )}
            </div>

            {/* Self-Reflection Questionnaire Form */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <Form onSubmit={handleComplete}>
                
                {/* Confidence Star Rating */}
                <div className="text-center mb-4">
                  <h6 className="fw-bold mb-2">Seberapa percaya diri Anda dapat menerapkan materi ini di dunia nyata?</h6>
                  <p className="text-muted small mb-3">Evaluasi diri (Self-efficacy rating) dari 1 (kurang percaya diri) sampai 5 (sangat mahir).</p>
                  
                  <div className="d-flex gap-2 justify-content-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
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
                    <span className="small fw-bold text-warning">
                      {rating === 1 ? 'Butuh belajar berulang' : rating === 5 ? 'Sangat menguasai konsep!' : `Skor Keyakinan: ${rating} dari 5`}
                    </span>
                  )}
                </div>

                <hr className="my-4" />

                {/* Qualitative reflection inputs */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">
                    1. Rintangan atau kendala apa yang paling mengganggu fokus belajar Anda tadi?
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    required
                    placeholder="Contoh: Notifikasi chat WhatsApp di laptop..."
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    style={{ borderRadius: 10, fontSize: 13 }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary">
                    2. Apa taktik perbaikan konkrit yang akan Anda lakukan di modul berikutnya?
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    required
                    placeholder="Contoh: Menyalakan mode DND (Jangan Ganggu) sebelum memulai materi..."
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    style={{ borderRadius: 10, fontSize: 13 }}
                  />
                </Form.Group>

                {/* Next Module Dynamic Banner */}
                <Card className="border-0 p-3 mb-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={nextPath.thumbnail} 
                        alt="Next Path" 
                        style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <div>
                        <span className="badge bg-purple-subtle text-purple-700 mb-1" style={{ fontSize: 9 }}>MODUL BERIKUTNYA</span>
                        <h6 className="fw-extrabold text-dark mb-0 text-truncate" style={{ fontSize: 12.5, maxWidth: '280px' }}>
                          {nextPath.title}
                        </h6>
                      </div>
                    </div>
                    <Button 
                      variant="light" 
                      onClick={() => navigate(`/learner/modules/${nextPath.id}/goals`)}
                      className="d-flex align-items-center gap-1 border-0"
                      style={{ fontSize: 11, fontWeight: 700, background: '#e2e8f0', color: '#334155' }}
                    >
                      Buka Modul <ArrowRight size={12} />
                    </Button>
                  </div>
                </Card>

                {/* Submit buttons */}
                <div className="d-flex gap-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/learner/modules/${moduleId}`)}
                    style={{ flex: 1, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 13 }}
                  >
                    Ulangi Pembacaan
                  </Button>
                  <Button
                    type="submit"
                    style={{
                      flex: 2,
                      background: '#005a87',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    Simpan Evaluasi Diri & Selesai
                  </Button>
                </div>

              </Form>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SelfAssessmentPage;
