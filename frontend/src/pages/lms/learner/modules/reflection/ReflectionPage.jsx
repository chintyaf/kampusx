import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import {
  ChevronLeft,
  Star,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Brain,
  Zap,
  Award,
  Layers,
  RotateCcw,
} from 'lucide-react';

// Import helpers and mock data
import {
  mockModulesData,
  addLearnerXp,
  mockContinueLearning,
} from '@/data/learningMockData';

const ReflectionPage = () => {
  const { moduleId = 'mod-arch-101' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve quiz result from navigation state or localStorage fallback
  const savedResult = (() => {
    try {
      return JSON.parse(localStorage.getItem(`kampusx_quiz_result_${moduleId}`) || 'null');
    } catch (e) {
      return null;
    }
  })();

  const quizResult = location.state || savedResult || {
    score: 88,
    passingScore: 75,
    correctCount: 7,
    totalQuestions: 8,
    isPassed: true,
  };

  const moduleData =
    mockModulesData[moduleId] ||
    (moduleId === 'mod-arch-101' ? mockContinueLearning : mockModulesData['mod-arch-101']) ||
    mockModulesData['1'];

  const moduleTitle = moduleData?.title || 'Web Application Architecture & REST API Design';
  const score = quizResult.score ?? 88;
  const passingScore = quizResult.passingScore ?? 75;
  const isPassed = score >= passingScore;

  // Form states: 2 mandatory questions
  const [rating, setRating] = useState(4); // Question 1: 1 - 5 stars
  const [hoverRating, setHoverRating] = useState(0);
  const [reflectionNotes, setReflectionNotes] = useState(''); // Question 2: Obstacles & Strategy notes
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const ratingDescriptions = {
    1: '1/5 - Perlu Bimbingan Ekstra & Belum Yakin',
    2: '2/5 - Masih Bingung di Sebagian Besar Konsep',
    3: '3/5 - Cukup Paham Prinsip Inti',
    4: '4/5 - Paham dengan Baik & Siap Menerapkan',
    5: '5/5 - Menguasai Penuh & Sangat Percaya Diri',
  };

  // Recommended lessons for remediation if failed or needs review
  const remedialLessons = [
    {
      id: 'les-2',
      number: 2,
      title: 'HTTP Status Codes, Error Handling & RFC 7807',
      duration: '8 min',
    },
    {
      id: 'les-4',
      number: 4,
      title: 'Scalable Endpoints, Idempotency & Rate Limiting',
      duration: '12 min',
    },
  ];

  // Save reflection and complete module
  const handleSaveAndComplete = (e) => {
    e.preventDefault();
    if (!reflectionNotes.trim()) {
      setFormSubmitted(true);
      return;
    }

    // Award completion XP (+100 XP)
    addLearnerXp(100);

    // Save completion record
    try {
      localStorage.setItem(`kampusx_module_completed_${moduleId}`, 'true');
      localStorage.setItem(
        `kampusx_reflection_${moduleId}`,
        JSON.stringify({
          rating,
          notes: reflectionNotes,
          score,
          completedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error('Error saving reflection', err);
    }

    setIsSaved(true);

    // Redirect to learning dashboard after brief celebration
    setTimeout(() => {
      navigate('/learning');
    }, 1400);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 64 }}>
      {isSaved && (
        <Modal show={true} onHide={() => navigate('/learning')} centered>
          <Modal.Header closeButton>
            <Modal.Title>🎉 Selamat! Modul selesai</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>Anda telah menyelesaikan modul ini dan mendapatkan <strong>100 XP</strong> serta badge <Badge bg="success">Completed</Badge>!</p>
            <p>Anda akan diarahkan ke dashboard belajar dalam beberapa detik.</p>
          </Modal.Body>
        </Modal>
      )}
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 0, zIndex: 1020 }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={18} /> Kembali ke Kuis
              </button>
              <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
              <div>
                <span className="badge bg-success-subtle text-success fw-bold text-uppercase me-2" style={{ fontSize: '0.7rem' }}>
                  Fase 3: Self-Reflection
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{moduleTitle}</span>
              </div>
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-3 px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.82rem' }}
              onClick={() => navigate('/learning')}
            >
              <span>Ke Dashboard Belajar</span>
            </Button>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="justify-content-center">
          <Col lg={9}>
            {/* Header Status */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: isPassed ? '#DCFCE7' : '#FEF3C7',
                  color: isPassed ? '#16A34A' : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                {isPassed ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
              </div>

              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isPassed ? '#047857' : '#B45309',
                  background: isPassed ? '#D1FAE5' : '#FEF3C7',
                  borderRadius: 999,
                  padding: '3px 12px',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Siklus SRL: Self-Reflection & Evaluation
              </span>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isPassed ? 'Evaluasi Pembelajaran Modul Selesai!' : 'Evaluasi Belum Memenuhi Ambang Lulus'}
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0' }}>
                Refleksikan hasil belajarmu untuk memperkuat retensi kognitif jangka panjang dan menentukan strategi belajar selanjutnya.
              </p>
            </div>

            {/* ===============================================================
                1. KARTU AI LEARNING READINESS PREDICTION (SESUAI SPESIFIKASI)
               =============================================================== */}
            <Card
              className="mb-4"
              style={{
                borderRadius: 18,
                border: isPassed ? '1.5px solid #86EFAC' : '1.5px solid #FCD34D',
                background: isPassed ? '#F0FDF4' : '#FFFBEB',
                padding: 24,
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={20} color={isPassed ? '#16A34A' : '#D97706'} />
                  <span className="fw-bold" style={{ fontSize: '0.92rem', color: isPassed ? '#065F46' : '#92400E' }}>
                    AI Learning Readiness Prediction
                  </span>
                </div>

                {/* Readiness Badge */}
                {isPassed ? (
                  <Badge
                    bg="success"
                    className="px-3 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.82rem', letterSpacing: '0.02em' }}
                  >
                    <CheckCircle2 size={14} />
                    <span>SIAP LANJUT (Readiness Score: {score}%)</span>
                  </Badge>
                ) : (
                  <Badge
                    bg="warning"
                    className="text-dark px-3 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.82rem', letterSpacing: '0.02em', backgroundColor: '#F59E0B' }}
                  >
                    <AlertTriangle size={14} />
                    <span>PERLU REMEDIAL (Readiness Score: {score}%)</span>
                  </Badge>
                )}
              </div>

              {/* Score Metric Row */}
              <Row className="g-3 align-items-center mb-3">
                <Col md={3} className="text-center">
                  <div
                    className="p-3 rounded-3 bg-white border d-flex flex-column align-items-center justify-content-center"
                    style={{ borderColor: isPassed ? '#BBF7D0' : '#FDE68A', borderRadius: 16 }}
                  >
                    <span
                      className="font-monospace fw-bold"
                      style={{ fontSize: '2.2rem', color: isPassed ? '#16A34A' : '#D97706', lineHeight: 1 }}
                    >
                      {score}%
                    </span>
                    <span className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                      Skor Kuis ({quizResult.correctCount ?? 7}/{quizResult.totalQuestions ?? 8} Soal)
                    </span>
                    <span className="badge bg-light text-muted border small mt-1" style={{ fontSize: '0.68rem' }}>
                      Syarat: {passingScore}%
                    </span>
                  </div>
                </Col>

                <Col md={9}>
                  <div className="p-3 rounded-3 bg-white border" style={{ borderColor: isPassed ? '#BBF7D0' : '#FDE68A', borderRadius: 16 }}>
                    <div className="d-flex align-items-center gap-2 mb-1.5">
                      <Brain size={16} color="#028090" />
                      <strong className="text-dark small" style={{ fontSize: '0.85rem' }}>
                        Rekomendasi AI Coach KampusX:
                      </strong>
                    </div>

                    {isPassed ? (
                      <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
                        "Pemahamanmu solid terhadap konsep arsitektur REST, semantik HTTP status code, dan mitigasi duplicate billing dengan Idempotency Key. Kamu menunjukkan konsistensi belajar mandiri yang tinggi dan sangat siap melanjutkan ke modul berjenjang selanjutnya."
                      </p>
                    ) : (
                      <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
                        "Skor evaluasimu ({score}%) berada di bawah standar kelulusan minimum ({passingScore}%). Kami menyarankan untuk membaca ulang unit materi kunci yang berkaitan dengan RFC 7807 dan mekanisme Idempotency middleware sebelum mengulang kuis."
                      </p>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Remedial Lessons List (If score < passingScore) */}
              {!isPassed && (
                <div className="mt-3 pt-3 border-top" style={{ borderColor: '#FDE68A' }}>
                  <h6 className="fw-bold small mb-2 d-flex align-items-center gap-1.5" style={{ color: '#92400E' }}>
                    <BookOpen size={15} />
                    <span>Daftar Lesson yang Disarankan untuk Dibaca Ulang:</span>
                  </h6>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {remedialLessons.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 px-3 rounded-3 bg-white border d-flex align-items-center justify-content-between flex-wrap gap-2"
                        style={{ borderColor: '#FCD34D' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge rounded-pill bg-light text-dark border small fw-bold">
                            Unit {item.number}
                          </span>
                          <span className="fw-semibold text-dark small" style={{ fontSize: '0.86rem' }}>
                            {item.title}
                          </span>
                          <span className="text-muted small">({item.duration})</span>
                        </div>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-3 px-2.5 py-1 small fw-semibold"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => navigate(`/learner/modules/${moduleId}/lesson/${item.id}`)}
                        >
                          Buka Materi Unit {item.number}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="warning"
                      size="sm"
                      className="rounded-3 px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 text-dark"
                      style={{ fontSize: '0.84rem' }}
                      onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}
                    >
                      <RotateCcw size={14} />
                      <span>Ulangi Kuis Modul Sekarang</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ===============================================================
                2. FORM REFLEKSI SRL (SELF-REGULATED LEARNING)
               =============================================================== */}
            <Card
              className="p-4 mb-4 rounded-3 bg-white border"
              style={{
                borderColor: '#E2E8F0',
                borderRadius: 16,
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 border-bottom pb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36, backgroundColor: '#E0F2FE', color: '#028090' }}
                  >
                    <Brain size={18} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                      Form Refleksi Metakognitif (SRL)
                    </h5>
                    <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                      2 Pertanyaan Wajib sebelum Menyelesaikan Modul
                    </span>
                  </div>
                </div>

                <span className="badge px-3 py-1.5 rounded-pill fw-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.78rem' }}>
                  <Zap size={12} className="me-1" fill="currentColor" />
                  +100 XP Kelulusan Modul
                </span>
              </div>

              <Form onSubmit={handleSaveAndComplete}>
                {/* PERTANYAAN WAJIB 1: Tingkat Penguasaan Materi Modul Ini (1 - 5 Bintang) */}
                <div className="mb-4 p-3.5 rounded-3 bg-light border">
                  <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-1">
                    <label className="fw-bold text-dark small mb-0" style={{ fontSize: '0.88rem' }}>
                      1. Tingkat Penguasaan Materi Modul Ini <span className="text-danger">*</span>
                    </label>
                    <span className="text-primary small fw-bold" style={{ fontSize: '0.82rem' }}>
                      {ratingDescriptions[rating]}
                    </span>
                  </div>
                  <p className="text-muted small mb-3" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Sejauh mana Anda merasa mampu menjelaskan dan mempraktikkan materi modul ini pada proyek nyata?
                  </p>

                  <div className="d-flex align-items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 4,
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`Beri rating ${star}`}
                      >
                        <Star
                          size={32}
                          color={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                          fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* PERTANYAAN WAJIB 2: Apa 1 insight atau poin paling bernilai yang kamu peroleh dari modul ini? */}
                <div className="mb-4">
                  <label htmlFor="reflection-notes-input" className="fw-bold text-dark small mb-1.5 d-block" style={{ fontSize: '0.88rem' }}>
                    2. Apa 1 insight atau poin paling bernilai yang kamu peroleh dari modul ini? <span className="text-danger">*</span>
                  </label>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Tuliskan konsep kunci, pemahaman baru, atau strategi teknis yang paling berharga bagi Anda setelah menyelesaikan modul ini.
                  </p>
                  <Form.Control
                    as="textarea"
                    id="reflection-notes-input"
                    rows={4}
                    required
                    placeholder="Contoh: Saya memahami bahwa Idempotency Key pada POST request sangat krusial untuk mencegah double billing, serta RFC 7807 menstandardisasi penanganan error..."
                    value={reflectionNotes}
                    onChange={(e) => setReflectionNotes(e.target.value)}
                    isInvalid={formSubmitted && !reflectionNotes.trim()}
                    className="rounded-3 shadow-none border"
                    style={{ fontSize: '0.88rem', lineHeight: 1.5 }}
                  />
                  {formSubmitted && !reflectionNotes.trim() && (
                    <Form.Control.Feedback type="invalid">
                      Pertanyaan refleksi insight ini wajib diisi sebelum menyelesaikan modul.
                    </Form.Control.Feedback>
                  )}
                </div>

                {/* Success alert message */}
                {isSaved && (
                  <Alert variant="success" className="d-flex align-items-center gap-2 rounded-3 mb-3 py-2 px-3">
                    <Sparkles size={18} className="text-warning" />
                    <span className="fw-bold small">
                      Refleksi berhasil disimpan! +100 XP ditambahkan ke profil belajarmu. Mengalihkan ke Dashboard...
                    </span>
                  </Alert>
                )}

                {/* =============================================================
                    3. AKSI KELULUSAN
                   ============================================================= */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top">
                  <Button
                    variant="outline-secondary"
                    className="rounded-3 px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => navigate(`/learner/modules/${moduleId}`)}
                  >
                    <BookOpen size={16} />
                    <span>Kembali ke Silabus Modul</span>
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSaved}
                    className="rounded-3 px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2 shadow-sm text-white"
                    style={{
                      backgroundColor: '#028090',
                      borderColor: '#028090',
                      fontSize: '0.92rem',
                    }}
                  >
                    <span>Simpan Refleksi & Selesaikan Modul</span>
                    <CheckCircle2 size={18} />
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

export default ReflectionPage;
