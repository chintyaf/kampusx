import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ProgressBar } from 'react-bootstrap';
import { Brain, ArrowRight, Target, Clock, ShieldAlert, Sparkles, ChevronLeft } from 'lucide-react';

const ForethoughtPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [sessionGoal, setSessionGoal] = useState('');
  const [focusStrategy, setFocusStrategy] = useState('Pomodoro technique (25m study, 5m break)');
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [confidence, setConfidence] = useState(3);

  // Helper info about module
  const mockModuleData = {
    1: { title: 'Pengenalan Design Thinking untuk Pemula', tag: 'Design Thinking' },
    2: { title: 'Teknik Presentasi yang Memukau Audiens', tag: 'Public Speaking' },
    3: { title: 'Dasar-dasar Kepemimpinan Tim Efektif', tag: 'Leadership' },
    4: { title: 'Deep Work: Fokus Tanpa Distraksi Digital', tag: 'Produktivitas' },
  };

  const moduleInfo = mockModuleData[moduleId] || { title: 'LMS Micro-Learning Modul', tag: 'Umum' };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to actual content page
    navigate(`/learner/modules/${moduleId}`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => navigate('/learner/catalog')}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 14, fontWeight: 600, padding: 0 }}
            >
              <ChevronLeft size={18} /> Kembali
            </button>
            <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Self-Regulated Learning (SRL) Cycle</span>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Header info */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', borderRadius: 999, padding: '3px 10px', marginBottom: 8, textTransform: 'uppercase' }}>
                Fase 1: Forethought & Planning
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Persiapkan Sesi Belajarmu
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
                Modul: <strong style={{ color: '#0f172a' }}>{moduleInfo.title}</strong>
              </p>
            </div>

            {/* SRL Intro alert */}
            <Card style={{ 
              background: '#f8fafc', 
              borderRadius: 16, 
              border: '1px dashed #cbd5e1', 
              padding: 16, 
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <Brain size={24} color="#00699e" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h6 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Kenapa merencanakan penting?</h6>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  Menetapkan tujuan (Goal Setting) dan memilih strategi belajar (Strategic Planning) terbukti secara akademis meningkatkan fokus dan daya ingat materi hingga 40%.
                </p>
              </div>
            </Card>

            {/* Goal Setting Form */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: 24 }}>
              <Form onSubmit={handleSubmit}>
                
                {/* Goal input */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                    1. Apa target/sasaran utamamu dalam sesi belajar ini?
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Contoh: Menguasai cara membuat ideasi masalah user"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(e.target.value)}
                    style={{ borderRadius: 10, padding: '12px 16px', fontSize: 14 }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: 11 }}>
                    Tuliskan secara spesifik apa yang ingin kamu ingat atau praktikkan dari modul ini.
                  </Form.Text>
                </Form.Group>

                {/* Focus Strategy selection */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                    2. Strategi apa yang akan kamu gunakan agar tetap fokus?
                  </Form.Label>
                  <Form.Select
                    value={focusStrategy}
                    onChange={(e) => setFocusStrategy(e.target.value)}
                    style={{ borderRadius: 10, padding: '12px 16px', fontSize: 14 }}
                  >
                    <option>Teknik Pomodoro (25 menit belajar, 5 menit istirahat)</option>
                    <option>Matikan notifikasi hp & tutup tab browser lain</option>
                    <option>Membuat catatan poin penting secara berkala</option>
                    <option>Menggunakan earphone / musik fokus instrumental</option>
                  </Form.Select>
                </Form.Group>

                {/* Slider */}
                <Form.Group className="mb-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Label style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: 0 }}>
                      3. Berapa menit estimasi waktu yang kamu siapkan?
                    </Form.Label>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#00699e', background: '#f0f9ff', padding: '4px 10px', borderRadius: 8 }}>
                      {estimatedTime} Menit
                    </span>
                  </div>
                  <Form.Range
                    min={5}
                    max={60}
                    step={5}
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                    <span>5 Menit</span>
                    <span>60 Menit</span>
                  </div>
                </Form.Group>

                {/* Self-efficacy estimation */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                    4. Seberapa yakin kamu bisa menyelesaikan modul ini hari ini?
                  </Form.Label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setConfidence(num)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          border: confidence === num ? '2.5px solid #00699e' : '1px solid #cbd5e1',
                          background: confidence === num ? '#f0f9ff' : '#fff',
                          color: confidence === num ? '#00699e' : '#64748b',
                          fontWeight: 700,
                          fontSize: 13,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {num === 1 ? 'Kurang Yakin' : num === 5 ? 'Sangat Yakin' : num}
                      </button>
                    ))}
                  </div>
                </Form.Group>

                {/* Submit button */}
                <Button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#005a87',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 12
                  }}
                >
                  Simpan & Mulai Belajar <ArrowRight size={16} />
                </Button>

              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForethoughtPage;
