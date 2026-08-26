import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge, ListGroup } from 'react-bootstrap';
import { ChevronLeft, Play, FileText, CheckCircle, ArrowRight, BookOpen, Volume2, Shield, AlertCircle, Wifi } from 'lucide-react';
import { MOCK_LEARNING_PATHS } from '@/data/mockMicrolearningData';
import toast from 'react-hot-toast';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Find the learning path or set fallback default data
  const learningPath = MOCK_LEARNING_PATHS.find(path => path.id === Number(moduleId)) || MOCK_LEARNING_PATHS[0];
  const moduleInfo = learningPath.modules[0]; // Active Module
  const lessons = moduleInfo.lessons;

  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedMicroGoal, setSelectedMicroGoal] = useState({});
  const activeLesson = lessons[activeLessonIdx];
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Reset video play state when changing lessons
  useEffect(() => {
    setIsVideoPlaying(false);
  }, [activeLessonIdx]);

  // Set the first lesson as completed when viewed
  useEffect(() => {
    if (!completedLessons.includes(activeLesson.id)) {
      setCompletedLessons(prev => [...prev, activeLesson.id]);
    }
  }, [activeLessonIdx, activeLesson.id, completedLessons]);

  const progressPercentage = Math.round((completedLessons.length / lessons.length) * 100);

  const handleNextLesson = () => {
    if (activeLessonIdx < lessons.length - 1) {
      setActiveLessonIdx(prev => prev + 1);
      toast.success('Pelajaran selesai! Melanjutkan ke materi berikutnya.');
    } else {
      // Completed all lessons, navigate to quiz
      toast.success('Anda telah membaca semua materi! Bersiaplah untuk Kuis.');
      navigate(`/learner/modules/${moduleId}/quiz`);
    }
  };



  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navigation */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <button 
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 13, fontWeight: 600, padding: 0 }}
              >
                <ChevronLeft size={16} /> Kembali ke Home
              </button>
              <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
              <span className="fw-bold text-dark text-truncate" style={{ fontSize: 13, maxWidth: 300 }}>
                {learningPath.title}
              </span>
            </div>
            
            {/* Offline Ready Indicator */}
            <Badge bg="success" className="d-flex align-items-center gap-1 py-2 px-3" style={{ borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
              <Wifi size={12} /> Offline Ready
            </Badge>
          </div>
        </Container>
      </div>



      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left Panel: Lessons Selector List */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h6 className="fw-extrabold text-uppercase text-secondary mb-3" style={{ fontSize: 11, letterSpacing: '0.5px' }}>
                Materi Modul
              </h6>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lessons.map((les, index) => {
                  const isActive = index === activeLessonIdx;
                  const isCompleted = completedLessons.includes(les.id);
                  return (
                    <div
                      key={les.id}
                      onClick={() => setActiveLessonIdx(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: isActive ? '#f0f9ff' : '#f8fafc',
                        border: isActive ? '1px solid #0369a1' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ flexShrink: 0 }}>
                        {isCompleted && !isActive ? (
                          <CheckCircle size={16} color="#16a34a" fill="#d1fae5" />
                        ) : (
                          <div style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            border: isActive ? '3px solid #0369a1' : '2px solid #cbd5e1',
                            background: isActive ? '#fff' : 'transparent'
                          }} />
                        )}
                      </div>
                      
                      <div className="flex-grow-1 min-w-0">
                        <p className="mb-0 text-truncate fw-bold" style={{ fontSize: 12, color: isActive ? '#0369a1' : '#334155' }}>
                          {les.title}
                        </p>
                        <span className="text-muted" style={{ fontSize: 10 }}>
                          {les.content_type === 'video' ? 'Video' : 'Artikel'} • {les.estimated_duration_minutes} mnt
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </Card>
          </Col>

          {/* Right Panel: Active Lesson Content Reader / Video Player */}
          <Col lg={8}>
            {/* Content Display Card */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ background: '#fff' }}>
              {activeLesson.content_type === 'video' ? (
                /* Video Player Interface */
                <div style={{ position: 'relative', width: '100%', height: 350, background: '#090d16' }} className="d-flex align-items-center justify-content-center">
                  <video 
                    src={activeLesson.video_url} 
                    controls 
                    className="w-100 h-100" 
                    poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
                    style={{ objectFit: 'cover' }}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => setIsVideoPlaying(false)}
                  />
                  {!isVideoPlaying && (
                    <div 
                      className="bg-dark text-white rounded-3 py-1 px-2 small fw-bold opacity-75"
                      style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, pointerEvents: 'none' }}
                    >
                      Materi Video • {activeLesson.estimated_duration_minutes} Mnt
                    </div>
                  )}
                </div>
              ) : (
                /* Image Header for Article */
                <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" 
                    alt="Article Header" 
                    className="w-100 h-100" 
                    style={{ objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))' }} />
                  <div className="position-absolute bottom-3 left-3 text-white">
                    <span className="badge bg-primary mb-1">Artikel Bacaan</span>
                    <h5 className="fw-bold mb-0">{activeLesson.title}</h5>
                  </div>
                </div>
              )}

              {/* Text Body */}
              <div className="p-4">
                <h4 className="fw-extrabold text-dark mb-3">{activeLesson.title}</h4>



                <p className="text-secondary mb-0" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                  {activeLesson.content_body || (
                    <>
                      Pembelajaran mikro (micro-learning) membantu menyerap konsep secara bertahap tanpa membebani memori kerja (working memory). 
                      Dalam materi ini, kita mengulas langkah-langkah praktis dan implementatif untuk menerapkan strategi penyelesaian masalah 
                      dalam rentang waktu singkat. 
                      <br /><br />
                      Fokus pada inti bahasan, buat catatan kecil di buku catatan Anda untuk mempercepat penyerapan informasi (Performance strategy), 
                      dan silakan tekan tombol di bawah jika Anda merasa sudah cukup memahami sub-topik ini.
                    </>
                  )}
                </p>
              </div>
            </Card>

            {/* Navigation Actions */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  if (activeLessonIdx > 0) {
                    setActiveLessonIdx(prev => prev - 1);
                  } else {
                    navigate('/');
                  }
                }}
                style={{ borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 13 }}
              >
                {activeLessonIdx > 0 ? '← Kembali' : '← Kembali ke Home'}
              </Button>

              <Button
                onClick={handleNextLesson}
                style={{
                  background: '#005a87',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 24px',
                  fontWeight: 750,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {activeLessonIdx === lessons.length - 1 ? 'Lanjut ke Kuis Kesiapan' : 'Materi Selanjutnya'} <ArrowRight size={16} />
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ModuleDetailPage;
