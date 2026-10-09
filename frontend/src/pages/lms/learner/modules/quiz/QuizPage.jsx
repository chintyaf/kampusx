import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge, Modal } from 'react-bootstrap';
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Check,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bookmark,
  Sparkles,
  Brain,
  Send,
  RotateCcw,
} from 'lucide-react';

// Import Mock Data
import {
  mockModulesData,
  mockModuleQuizzes,
  mockContinueLearning,
} from '@/data/learningMockData';

const QuizPage = () => {
  const { moduleId = 'mod-arch-101' } = useParams();
  const navigate = useNavigate();

  // Find module data or fallback to mod-arch-101
  const moduleData =
    mockModulesData[moduleId] ||
    (moduleId === 'mod-arch-101' ? mockContinueLearning : mockModulesData['mod-arch-101']) ||
    mockModulesData['1'];

  const moduleTitle = moduleData?.title || 'Web Application Architecture & REST API Design';
  const quizQuestions =
    moduleData?.moduleQuiz?.length > 0
      ? moduleData.moduleQuiz
      : mockModuleQuizzes[moduleId] || mockModuleQuizzes['mod-arch-101'];

  const passingScore = moduleData?.passingScore || 75;

  // Active question index (0 to length - 1)
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // User answers map: { [questionIndex]: optionKey }
  const [userAnswers, setUserAnswers] = useState({});

  // Marked for review map: { [questionIndex]: boolean }
  const [markedForReview, setMarkedForReview] = useState({});

  // Timer countdown: 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Modal confirmation
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Countdown interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          // Auto submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Format time mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = quizQuestions[currentQuestion] || quizQuestions[0];
  const selectedOption = userAnswers[currentQuestion] || null;
  const isCurrentFlagged = markedForReview[currentQuestion] || false;

  const handleOptionSelect = (key) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: key,
    }));
  };

  const handleToggleFlag = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion]: !prev[currentQuestion],
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit quiz and calculate percentage score
  const handleSubmitQuiz = () => {
    setShowSubmitModal(false);
    setIsTimerRunning(false);

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      const userChoice = userAnswers[idx];
      const correctKey =
        q.correct ||
        (q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer]?.key : null);
      if (userChoice && userChoice === correctKey) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
    const isPassed = scorePercentage >= passingScore;

    const quizResult = {
      moduleId,
      moduleTitle,
      score: scorePercentage,
      correctCount,
      totalQuestions: quizQuestions.length,
      passingScore,
      isPassed,
      userAnswers,
      completedAt: new Date().toISOString(),
    };

    // Store in localStorage for persistence across reloads
    try {
      localStorage.setItem(`kampusx_quiz_result_${moduleId}`, JSON.stringify(quizResult));
    } catch (e) {
      console.error('Error saving quiz result', e);
    }

    // Forward result to reflection page
    navigate(`/learner/modules/${moduleId}/reflection`, {
      state: quizResult,
    });
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / quizQuestions.length) * 100);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 0, zIndex: 1020 }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate(`/learner/modules/${moduleId}`)}
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
                <ChevronLeft size={18} /> Silabus
              </button>
              <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
              <div>
                <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase me-2" style={{ fontSize: '0.7rem' }}>
                  Summative Quiz
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{moduleTitle}</span>
              </div>
            </div>

            {/* Timer & Quick Actions */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border fw-bold font-monospace"
                style={{
                  backgroundColor: timeLeft <= 120 ? '#FEF2F2' : '#F1F5F9',
                  borderColor: timeLeft <= 120 ? '#FECACA' : '#E2E8F0',
                  color: timeLeft <= 120 ? '#DC2626' : '#0F172A',
                  fontSize: '0.88rem',
                }}
                title="Waktu Tersisa"
              >
                <Clock size={16} className={timeLeft <= 120 ? 'text-danger' : 'text-primary'} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="rounded-3 px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: '#028090', borderColor: '#028090', fontSize: '0.84rem' }}
                onClick={() => setShowSubmitModal(true)}
              >
                <Send size={14} />
                <span>Kirim Jawaban</span>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 28 }}>
        <Row className="g-4">
          {/* =================================================================
              LEFT COLUMN: Progress & Question Navigation Matrix
             ================================================================= */}
          <Col lg={3}>
            <div className="d-flex flex-column gap-3 position-sticky" style={{ top: 88 }}>
              {/* SRL 4-Phase Step Card */}
              <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <h6 style={{ fontWeight: 800, fontSize: 11, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alur Belajar Mandiri (SRL)
                </h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={14} />
                    <span>1. Forethought</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={14} />
                    <span>2. Materi Lesson</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#e0f2fe', color: '#028090', fontSize: 12, fontWeight: 700 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #028090' }} />
                    <span>3. Kuis Evaluasi (Aktif)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                    <span>4. Refleksi Diri</span>
                  </div>
                </div>
              </Card>

              {/* Question Number Matrix Card */}
              <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 style={{ fontWeight: 800, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Navigasi Soal
                  </h6>
                  <span className="badge rounded-pill bg-light text-dark border small fw-bold">
                    {answeredCount} / {quizQuestions.length}
                  </span>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  now={progressPercent}
                  className="mb-3"
                  style={{ height: 6, borderRadius: 999 }}
                  variant="success"
                />

                {/* Grid of Question Numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {quizQuestions.map((_, index) => {
                    const isAnswered = userAnswers[index] !== undefined;
                    const isCurrent = currentQuestion === index;
                    const isFlagged = markedForReview[index] === true;

                    let bg = '#FFFFFF';
                    let borderColor = '#E2E8F0';
                    let color = '#475569';

                    if (isCurrent) {
                      borderColor = '#028090';
                      bg = '#E0F2FE';
                      color = '#028090';
                    } else if (isFlagged) {
                      bg = '#FEF3C7';
                      borderColor = '#F59E0B';
                      color = '#D97706';
                    } else if (isAnswered) {
                      bg = '#10B981';
                      borderColor = '#10B981';
                      color = '#FFFFFF';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        style={{
                          height: 38,
                          borderRadius: 8,
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                        title={`Soal ${index + 1}`}
                      >
                        {isAnswered && !isCurrent ? (
                          <Check size={14} />
                        ) : (
                          index + 1
                        )}
                        {isFlagged && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#F59E0B',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend indicator */}
                <div className="mt-3 pt-3 border-top d-flex flex-column gap-1.5" style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10B981' }} />
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#E0F2FE', border: '1px solid #028090' }} />
                    <span>Sedang Dibuka</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }} />
                    <span>Ragu-Ragu / Review</span>
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          {/* =================================================================
              RIGHT COLUMN: Question Card & Interactive Options
             ================================================================= */}
          <Col lg={9}>
            {/* Top Question Meta Card */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge rounded-pill px-3 py-1 fw-bold text-white" style={{ backgroundColor: '#028090', fontSize: '0.78rem' }}>
                    Soal No. {currentQuestion + 1}
                  </span>
                  <span className="text-muted small">dari {quizQuestions.length} pertanyaan</span>
                  <span className="badge bg-light text-muted border small ms-1">
                    Ambang Lulus: {passingScore}%
                  </span>
                </div>

                <Button
                  variant={isCurrentFlagged ? 'warning' : 'outline-secondary'}
                  size="sm"
                  className="rounded-3 px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5 text-nowrap"
                  style={{ fontSize: '0.8rem' }}
                  onClick={handleToggleFlag}
                >
                  <Bookmark size={13} fill={isCurrentFlagged ? 'currentColor' : 'none'} />
                  <span>{isCurrentFlagged ? 'Ditandai Ragu-Ragu' : 'Tandai Ragu-Ragu'}</span>
                </Button>
              </div>
            </Card>

            {/* Question Text Card */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <div className="d-flex gap-3 align-items-start">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                  style={{ width: 34, height: 34, backgroundColor: '#E0F2FE', color: '#028090' }}
                >
                  <HelpCircle size={18} />
                </div>
                <div className="flex-grow-1">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.55, margin: 0 }}>
                    {currentQ.q || currentQ.question}
                  </h4>
                </div>
              </div>
            </Card>

            {/* Multiple Choice Options List */}
            <div className="d-flex flex-column gap-2.5 mb-4">
              {currentQ.options.map((option, idx) => {
                const optKey = typeof option === 'string' ? String.fromCharCode(65 + idx) : option.key || String.fromCharCode(65 + idx);
                const optText = typeof option === 'string' ? option : option.text;
                const isSelected = selectedOption === optKey;

                return (
                  <div
                    key={optKey}
                    onClick={() => handleOptionSelect(optKey)}
                    className="p-3.5 rounded-3 border d-flex align-items-center gap-3"
                    style={{
                      background: isSelected ? '#F0F9FF' : '#FFFFFF',
                      borderColor: isSelected ? '#028090' : '#E2E8F0',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(2, 128, 144, 0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isSelected ? '#028090' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {optKey}
                    </div>

                    <span
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? '#034E7B' : '#1E293B',
                        lineHeight: 1.5,
                      }}
                    >
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation Bottom Action Bar */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 18, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  disabled={currentQuestion === 0}
                  onClick={handlePrev}
                  className="rounded-3 px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} />
                  <span>Sebelumnya</span>
                </Button>

                <div className="d-flex align-items-center gap-2">
                  {currentQuestion < quizQuestions.length - 1 ? (
                    <Button
                      variant="dark"
                      onClick={handleNext}
                      className="rounded-3 px-4 py-2 fw-bold d-inline-flex align-items-center gap-1.5 text-white"
                      style={{ backgroundColor: '#0F172A', borderColor: '#0F172A', fontSize: '0.88rem' }}
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight size={16} />
                    </Button>
                  ) : null}

                  <Button
                    variant="primary"
                    onClick={() => setShowSubmitModal(true)}
                    className="rounded-3 px-4 py-2 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: '#028090', borderColor: '#028090', fontSize: '0.88rem' }}
                  >
                    <span>Kirim Jawaban & Lanjut ke Refleksi</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            Konfirmasi Pengiriman Jawaban
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Apakah Anda yakin ingin menyelesaikan kuis evaluasi ini sekarang?
          </p>

          <div className="p-3 rounded-3 bg-light border mb-3">
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Total Soal:</span>
              <strong className="text-dark">{quizQuestions.length} Soal</strong>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Soal Terjawab:</span>
              <strong className="text-success">{answeredCount} Soal</strong>
            </div>
            {quizQuestions.length - answeredCount > 0 && (
              <div className="d-flex justify-content-between small text-danger">
                <span>Belum Terjawab:</span>
                <strong>{quizQuestions.length - answeredCount} Soal</strong>
              </div>
            )}
          </div>

          {quizQuestions.length - answeredCount > 0 && (
            <div className="p-2.5 rounded-3 bg-warning-subtle text-dark border border-warning-subtle small d-flex align-items-start gap-2">
              <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <span>
                Masih ada soal yang belum Anda jawab. Soal yang belum terjawab akan dihitung bernilai 0.
              </span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowSubmitModal(false)}>
            Periksa Kembali
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ backgroundColor: '#028090', borderColor: '#028090' }}
            onClick={handleSubmitQuiz}
          >
            Ya, Kirim Sekarang
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QuizPage;
