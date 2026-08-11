import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge } from 'react-bootstrap';
import { ChevronLeft, Play, FileText, CheckCircle, ArrowRight, BookOpen, Volume2, Award } from 'lucide-react';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Helper info about module
  const mockModuleData = {
    1: { 
      title: 'Pengenalan Design Thinking untuk Pemula', 
      tag: 'Design Thinking',
      lessonTitle: 'Konsep Dasar Empati & Ideasi',
      desc: 'Dalam modul ini, kita akan membahas cara berempati dengan masalah pengguna (user problem empathy) menggunakan empathy map dan menterjemahkannya ke dalam ide solusi konkret.',
      videoTitle: 'Video Materi: Pengenalan Design Thinking'
    },
    2: { 
      title: 'Teknik Presentasi yang Memukau Audiens', 
      tag: 'Public Speaking',
      lessonTitle: 'Struktur Hook & Storytelling',
      desc: 'Pelajari formula presentasi 3 babak untuk menangkap atensi audiens di 30 detik pertama dan mempertahankan interaksi sepanjang sesi.',
      videoTitle: 'Video Materi: Hook & Storytelling'
    },
    3: { 
      title: 'Dasar-dasar Kepemimpinan Tim Efektif', 
      tag: 'Leadership',
      lessonTitle: 'Situational Leadership Model',
      desc: 'Bagaimana menyesuaikan gaya kepemimpinan Anda berdasarkan tingkat kompetensi dan komitmen anggota tim Anda.',
      videoTitle: 'Video Materi: Situational Leadership'
    },
    4: { 
      title: 'Deep Work: Fokus Tanpa Distraksi Digital', 
      tag: 'Produktivitas',
      lessonTitle: 'Membangun Ritual Deep Work',
      desc: 'Praktikkan penyusunan jadwal blok waktu (time blocking) dan cara memitigasi distraksi internal maupun eksternal di lingkungan belajar Anda.',
      videoTitle: 'Video Materi: Membangun Ritual Deep Work'
    },
  };

  const moduleInfo = mockModuleData[moduleId] || { 
    title: 'LMS Micro-Learning Modul', 
    tag: 'Umum', 
    lessonTitle: 'Materi Pembelajaran',
    desc: 'Pelajari materi micro-learning ini dengan saksama.',
    videoTitle: 'Materi Video Belajar'
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navigation */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => navigate(`/learner/modules/${moduleId}/forethought`)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 14, fontWeight: 600, padding: 0 }}
            >
              <ChevronLeft size={18} /> Kembali ke Planning
            </button>
            <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{moduleInfo.title}</span>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="g-4">
          
          {/* Sidebar Navigation Phases */}
          <Col lg={3}>
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
              <h6 style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alur Pembelajaran
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  <span>1. Forethought (Selesai)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0f9ff', color: '#0369a1', fontSize: 12, fontWeight: 700 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #0369a1' }} />
                  <span>2. Materi (Aktif)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                  <span>3. Kuis Evaluasi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                  <span>4. Refleksi Diri</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            {/* Progress indicator */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Progres Belajar</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00699e' }}>50% Selesai</span>
              </div>
              <ProgressBar now={50} style={{ height: 6, borderRadius: 999 }} />
            </Card>

            {/* Video Player Box */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ 
                height: 320, 
                background: '#0f172a', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                color: '#fff'
              }}>
                <button style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 4,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={28} color="#005a87" fill="#005a87" />
                </button>
                <span style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {moduleInfo.videoTitle} (04:12 / 12:30)
                </span>
              </div>
              
              {/* Material Detail */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Badge bg="primary" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: 10 }}>
                    {moduleInfo.tag}
                  </Badge>
                  <Badge bg="secondary" style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: 10 }}>
                    Materi Inti
                  </Badge>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                  {moduleInfo.lessonTitle}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {moduleInfo.desc}
                </p>
              </div>
            </Card>

            {/* Back & Next Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/learner/modules/${moduleId}/forethought`)}
                style={{ borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 13 }}
              >
                &larr; Perencanaan
              </Button>
              <Button
                onClick={() => navigate(`/learner/modules/${moduleId}/quiz`)}
                style={{ background: '#005a87', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Lanjut ke Kuis <ArrowRight size={16} />
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ModuleDetailPage;
