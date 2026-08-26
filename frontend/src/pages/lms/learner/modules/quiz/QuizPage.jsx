import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge, Modal } from 'react-bootstrap';
import { ChevronLeft, HelpCircle, Check, ArrowRight, CheckCircle, Wifi, AlertTriangle, Sparkles, Award, RotateCcw, MessageCircle } from 'lucide-react';
import { MOCK_QUIZZES, MOCK_LEARNING_PATHS } from '@/data/mockMicrolearningData';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Load quizzes and path data
  const quizList = MOCK_QUIZZES[Number(moduleId)] || MOCK_QUIZZES[101];
  const learningPath = MOCK_LEARNING_PATHS.find(p => p.id === Number(moduleId)) || MOCK_LEARNING_PATHS[0];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Score calculation states
  const [score, setScore] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const handleOptionSelect = (key) => {
    setSelectedOption(key);
  };

  const handleNext = () => {
    // Save answer
    const currentQuiz = quizList[currentQuestion];
    const isCorrect = selectedOption === currentQuiz.correct;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        selected: selectedOption,
        isCorrect
      }
    }));

    if (currentQuestion < quizList.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Calculate final score
      const totalQuestions = quizList.length;
      const correctAnswers = Object.values({
        ...answers,
        [currentQuestion]: { selected: selectedOption, isCorrect }
      }).filter(a => a.isCorrect).length;
      
      const scorePct = Math.round((correctAnswers / totalQuestions) * 100);
      setScore(scorePct);
      
      const readyThreshold = 70;
      const readyState = scorePct >= readyThreshold;
      setIsReady(readyState);
      setIsFinished(true);

      // Trigger Badge Unlock animation modal if they pass!
      if (readyState) {
        setTimeout(() => {
          setShowBadgeModal(true);
        }, 600);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswers({});
    setIsFinished(false);
    setShowBadgeModal(false);
  };

  const handleProceedToReflection = () => {
    navigate(`/learner/modules/${moduleId}/assessment`, {
      state: {
        score,
        isReady,
        pointsAwarded: isReady ? learningPath.points_reward : 0
      }
    });
  };

  if (isFinished) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
        {/* Top Navbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
          <Container>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark" style={{ fontSize: 13 }}>
                Hasil Evaluasi Kuis Kesiapan: {learningPath.title}
              </span>
            </div>
          </Container>
        </div>

        <Container className="mt-4">
          <Row className="justify-content-center">
            <Col lg={8}>
              {/* Readiness Score Card */}
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 text-center" style={{ background: '#fff' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Skor Kesiapan Belajar (Readiness Score)</h5>
                
                <div className="d-inline-flex flex-column align-items-center justify-content-center my-3" style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: isReady ? '#f0fdf4' : '#fef2f2',
                  border: isReady ? '5px solid #16a34a' : '5px solid #dc2626'
                }}>
                  <h1 className="fw-extrabold mb-0" style={{ color: isReady ? '#16a34a' : '#dc2626', fontSize: 36 }}>
                    {score}%
                  </h1>
                  <span className="small fw-bold text-muted">Kesiapan</span>
                </div>

                <div className="mt-2">
                  <Badge bg={isReady ? 'success' : 'danger'} className="py-2 px-4 rounded-pill" style={{ fontSize: 12, fontWeight: 700 }}>
                    {isReady ? 'SIAP / SIAP LANJUT' : 'PERLU REMEDIAL'}
                  </Badge>
                </div>

                <p className="text-muted small mt-3 mx-auto" style={{ maxWidth: 450 }}>
                  {isReady 
                    ? 'Luar biasa! Pemahaman konsep materi Anda dinilai sangat siap untuk menerapkan keahlian ini di lingkup tugas nyata.'
                    : 'Skor kesiapan Anda masih di bawah standar minimal 70%. Silakan ulas kembali materi yang direkomendasikan AI.'
                  }
                </p>
              </Card>

              {/* AI Feedback Recommendations Banner */}
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ 
                background: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)',
                border: '1px solid #e9d5ff'
              }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-purple-600" />
                  <h6 className="fw-extrabold text-purple-800 mb-0" style={{ fontSize: 13, letterSpacing: '0.5px' }}>
                    Saran & Umpan Balik Chintya AI
                  </h6>
                </div>
                <p className="text-purple-900 small mb-3" style={{ lineHeight: 1.6, fontWeight: 500 }}>
                  {isReady 
                    ? `Selamat! Anda berhasil menguasai topik kuis ini. Kami menyarankan Anda untuk mengikuti event terdekat "${learningPath.title}" untuk mengasah kemampuan praktis Anda.`
                    : 'Kami mendeteksi kelemahan pemahaman pada materi Empathy mapping. Kami sarankan Anda membaca kembali "Lesson 2: Membuat Empathy Map" sebelum mencoba ulang.'
                  }
                </p>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-purple" 
                    size="sm" 
                    onClick={() => navigate('/learner/catalog')}
                    style={{ fontSize: 11, fontWeight: 700, borderRadius: 8, color: '#7e22ce', borderColor: '#d8b4fe' }}
                  >
                    Buka Rekomendasi Event
                  </Button>
                </div>
              </Card>

              {/* Bottom Actions */}
              <div className="d-flex flex-column gap-2 w-100">
                {isReady ? (
                  <div className="d-flex gap-3">
                    <Button
                      variant="outline-secondary"
                      onClick={handleRestart}
                      style={{ flex: 1, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <RotateCcw size={16} /> Coba Lagi
                    </Button>
                    <Button
                      onClick={handleProceedToReflection}
                      style={{
                        flex: 2,
                        background: '#005a87',
                        border: 'none',
                        borderRadius: 10,
                        padding: '12px',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      Lanjut ke Refleksi SRL <ArrowRight size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-3">
                      <Button
                        variant="outline-danger"
                        onClick={() => navigate(`/learner/modules/${moduleId}`)}
                        style={{ flex: 1, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        Tinjau Materi Remedial
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleRestart}
                        style={{ flex: 1, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <RotateCcw size={14} /> Coba Kuis Lagi
                      </Button>
                    </div>
                    <Button
                      onClick={handleProceedToReflection}
                      variant="link"
                      className="text-danger small mt-1 fw-bold text-center"
                      style={{ textDecoration: 'none' }}
                    >
                      Lanjut ke Refleksi Tanpa Lulus &rarr;
                    </Button>
                  </div>
                )}
              </div>

            </Col>
          </Row>
        </Container>

        {/* Gamification Badge Modal */}
        <Modal 
          show={showBadgeModal} 
          onHide={() => setShowBadgeModal(false)}
          centered
          contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            padding: '40px 24px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3 p-3" style={{ width: 80, height: 80, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <Award size={42} className="text-purple-600" />
            </div>
            <h3 className="fw-extrabold mb-1">Badge Baru Terbuka!</h3>
            <p className="text-white-50 small mb-4">Pencapaian belajar micro-learning Anda di KampusX</p>
            
            <div className="bg-white rounded-3 p-3 text-dark mb-4 mx-auto" style={{ maxWidth: '280px' }}>
              <h6 className="fw-bold mb-1" style={{ color: '#7c3aed' }}>
                {learningPath.category === 'Design' ? 'Thinker Master' : 'Unstoppable Focus'}
              </h6>
              <p className="text-muted mb-0" style={{ fontSize: 11 }}>
                Menyelesaikan modul dengan skor kuis {score}% (+{learningPath.points_reward} Poin Reward)
              </p>
            </div>

            <Button variant="light" onClick={() => setShowBadgeModal(false)} className="fw-bold px-4 rounded-pill" style={{ color: '#7c3aed' }}>
              Hebat!
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <button 
                onClick={() => navigate(`/learner/modules/${moduleId}`)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 13, fontWeight: 600, padding: 0 }}
              >
                <ChevronLeft size={16} /> Kembali ke Materi
              </button>
              <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
              <span className="fw-bold text-dark" style={{ fontSize: 13 }}>Kuis: {learningPath.title}</span>
            </div>
            <Badge bg="success" className="py-2 px-3 rounded-pill" style={{ fontSize: 9 }}>
              Evaluasi Mandiri
            </Badge>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Progress Tracker Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>

              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: 11 }}>PROGRES SOAL</h6>
              <div className="d-flex gap-2">
                {quizList.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: 8,
                      border: currentQuestion === index ? '2px solid #00699e' : '1px solid #cbd5e1',
                      background: currentQuestion > index ? '#16a34a' : currentQuestion === index ? '#f0f9ff' : '#fff',
                      color: currentQuestion > index ? '#fff' : currentQuestion === index ? '#00699e' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12
                    }}
                  >
                    {currentQuestion > index ? <Check size={14} /> : index + 1}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Quiz Container */}
          <Col lg={8}>
            
            {/* Header info */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-secondary" style={{ fontSize: 12 }}>Pertanyaan Kuis</span>
                <span className="fw-bold text-primary" style={{ fontSize: 12 }}>
                  Soal {currentQuestion + 1} dari {quizList.length}
                </span>
              </div>
              <ProgressBar now={((currentQuestion + 1) / quizList.length) * 100} variant="primary" style={{ height: 6, borderRadius: 999 }} />
            </Card>

            {/* Question */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-3" style={{ background: '#fff' }}>
              <div className="d-flex gap-3 align-items-start">
                <HelpCircle size={22} className="text-primary flex-shrink-0 mt-1" />
                <h5 className="fw-bold text-dark mb-0" style={{ lineHeight: 1.5, fontSize: 14.5 }}>
                  {quizList[currentQuestion].question}
                </h5>
              </div>
            </Card>

            {/* Answer Options */}
            <div className="d-flex flex-column gap-3 mb-4">
              {quizList[currentQuestion].options.map((option) => {
                const optKey = option.key || option.split(':')[0].trim();
                const optText = option.text || option.split(':').slice(1).join(':').trim();
                const isSelected = selectedOption === optKey;
                return (
                  <div
                    key={optKey}
                    onClick={() => handleOptionSelect(optKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: isSelected ? '#f0f9ff' : '#fff',
                      border: isSelected ? '2px solid #00699e' : '1px solid #cbd5e1',
                      borderRadius: 14,
                      padding: 16,
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 105, 158, 0.04)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%',
                      background: isSelected ? '#00699e' : '#f1f5f9',
                      color: isSelected ? '#fff' : '#64748b',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 700, 
                      fontSize: 12, 
                      flexShrink: 0
                    }}>
                      {optKey}
                    </div>
                    <span className="fw-semibold" style={{ fontSize: 13, color: isSelected ? '#004e78' : '#334155' }}>
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="d-flex justify-content-end">
              <Button
                disabled={selectedOption === null}
                onClick={handleNext}
                style={{ 
                  background: '#005a87', 
                  border: 'none', 
                  borderRadius: 10, 
                  padding: '12px 28px', 
                  fontWeight: 700, 
                  fontSize: 13, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6 
                }}
              >
                {currentQuestion === quizList.length - 1 ? 'Selesai & Lihat Skor Kesiapan' : 'Pertanyaan Selanjutnya'} <ArrowRight size={16} />
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default QuizPage;
