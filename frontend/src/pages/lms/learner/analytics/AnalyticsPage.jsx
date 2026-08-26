import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge } from 'react-bootstrap';
import { Flame, Calendar, Award, BookOpen, Clock, Activity, BarChart2, ChevronRight, Zap } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_ANALYTICS } from '@/data/mockMicrolearningData';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('weekly');

  const { streak, skills, weekly_study_hours } = MOCK_ANALYTICS.member_progress;

  // Format Radar data
  const radarData = skills.labels.map((lbl, idx) => ({
    subject: lbl,
    A: skills.values[idx],
    fullMark: 100
  }));

  const mockCalendarDays = [
    { date: 20, active: true },
    { date: 21, active: true },
    { date: 22, active: true },
    { date: 23, active: true },
    { date: 24, active: true },
    { date: 25, active: false },
    { date: 26, active: false }
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-light text-primary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                Statistik Belajar Anda
              </span>
              <h2 className="fw-extrabold mb-1">Analisis SRL Pembelajar</h2>
              <p className="text-white-50 mb-0 small">
                Pantau perkembangan tingkat kemandirian belajar (Self-Regulated Learning) dan pemetaan keahlian Anda secara berkala.
              </p>
            </div>
            <Button variant="outline-light" onClick={() => navigate('/learner/catalog')} style={{ borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
              Kembali ke Katalog
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: Streak details & stats cards */}
          <Col lg={4}>
            {/* Daily Streak Card */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <Flame size={24} className="text-danger" />
                </div>
                <div>
                  <h4 className="fw-extrabold text-dark mb-0">{streak} Hari Streak</h4>
                  <small className="text-muted">Aktivitas belajar berturut-turut</small>
                </div>
              </div>

              {/* Mini calendar block */}
              <div className="d-flex justify-content-between gap-1 mb-3 bg-light p-2 rounded-3">
                {mockCalendarDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className="text-center p-2 rounded-2"
                    style={{
                      flex: 1,
                      background: day.active ? 'linear-gradient(to bottom, #ef4444, #dc2626)' : 'transparent',
                      color: day.active ? '#fff' : '#64748b'
                    }}
                  >
                    <span style={{ fontSize: 9, display: 'block', fontWeight: 700 }}>{['S', 'S', 'R', 'K', 'J', 'S', 'M'][idx]}</span>
                    <span style={{ fontSize: 12, display: 'block', fontWeight: 800 }}>{day.date}</span>
                  </div>
                ))}
              </div>

              <div className="alert alert-warning border-0 p-3 mb-0" style={{ borderRadius: 10, fontSize: 11 }}>
                <Zap size={14} className="me-1" />
                <strong>Rekomendasi SRL:</strong> Pertahankan streak belajar Anda untuk meraih predikat lencana <strong>Unstoppable Focus</strong>!
              </div>
            </Card>

            {/* Quick Metrics */}
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h6 className="fw-extrabold text-secondary mb-3" style={{ fontSize: 11 }}>RINGKASAN METRIK</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <span className="small">Modul Dipelajari</span>
                  </div>
                  <span className="fw-bold text-dark">4 Modul</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span className="small">Rata-rata Waktu Belajar</span>
                  </div>
                  <span className="fw-bold text-dark">15 mnt / sesi</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <span className="small">Skor Akurasi Kuis</span>
                  </div>
                  <span className="fw-bold text-success">84%</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Panel: Charts */}
          <Col lg={8}>
            <Row className="g-4">
              
              {/* Skill Radar Mapping */}
              <Col md={6}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: '#fff' }}>
                  <h6 className="fw-extrabold text-dark mb-3">Skill Map Per Kategori</h6>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                        <Radar name="Skor Keahlian" dataKey="A" stroke="#0284c7" fill="#0284c7" fillOpacity={0.35} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* Weekly study hours Line Chart */}
              <Col md={6}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: '#fff' }}>
                  <h6 className="fw-extrabold text-dark mb-3">Waktu Belajar Mingguan (Jam)</h6>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={weekly_study_hours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="hours" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* History list */}
              <Col xs={12}>
                <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
                  <h6 className="fw-extrabold text-dark mb-3">Aktivitas SRL Terbaru</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2 border-light">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success">SELESAI</span>
                        <span className="text-dark fw-bold" style={{ fontSize: 12.5 }}>Modul: Dasar-dasar Kepemimpinan Tim Efektif</span>
                      </div>
                      <small className="text-muted">Kemarin</small>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2 border-light">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary">PERENCANAAN</span>
                        <span className="text-dark fw-bold" style={{ fontSize: 12.5 }}>Menyusun target belajar baru: Teknik Presentasi</span>
                      </div>
                      <small className="text-muted">2 hari yang lalu</small>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2 border-0">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-info">MULA</span>
                        <span className="text-dark fw-bold" style={{ fontSize: 12.5 }}>Menyelesaikan personalisasi minat belajar</span>
                      </div>
                      <small className="text-muted">5 hari yang lalu</small>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>

            </Row>
          </Col>
          
        </Row>
      </Container>
    </div>
  );
};

export default AnalyticsPage;
