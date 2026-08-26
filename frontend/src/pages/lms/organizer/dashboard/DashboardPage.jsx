import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Award, BookOpen, Clock, Activity, BarChart2, TrendingUp, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import { MOCK_ANALYTICS } from '@/data/mockMicrolearningData';

const DashboardPage = () => {
  const navigate = useNavigate();

  const { learning_paths, drop_offs, quiz_effectiveness } = MOCK_ANALYTICS;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-primary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                LMS Control Panel
              </span>
              <h2 className="fw-extrabold mb-1">LMS Organizer Dashboard</h2>
              <p className="text-white-50 mb-0 small">
                Analisis real-time performa peserta, visualisasi titik drop-off, dan statistik efektivitas kuis berbasis AI.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={() => navigate('/organizer/ai-studio/upload')}
                style={{ background: '#005a87', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13 }}
              >
                + AI Studio Content Creator
              </Button>
              <Button 
                variant="outline-light"
                onClick={() => navigate('/organizer/learning-paths')}
                style={{ borderRadius: 10, fontWeight: 700, fontSize: 13 }}
              >
                Atur Prasyarat Path
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        {/* Quick Stats Grid */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#fff' }}>
              <span className="text-muted small fw-bold">TINGKAT PENYELESAIAN</span>
              <h3 className="fw-extrabold text-success mt-1 mb-0">71.2%</h3>
              <small className="text-muted">Rata-rata modul selesai</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#fff' }}>
              <span className="text-muted small fw-bold">TOTAL AKTIF BELAJAR</span>
              <h3 className="fw-extrabold text-primary mt-1 mb-0">456</h3>
              <small className="text-muted">Siswa dalam 30 hari terakhir</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#fff' }}>
              <span className="text-muted small fw-bold">DROP-OFF TERBANYAK</span>
              <h3 className="fw-extrabold text-danger mt-1 mb-0">Kuis Bab 1</h3>
              <small className="text-muted">Titik konsentrasi drop-off siswa</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#fff' }}>
              <span className="text-muted small fw-bold">EFISIENSI KUIS AI</span>
              <h3 className="fw-extrabold text-purple mt-1 mb-0">High</h3>
              <small className="text-muted">Indeks keandalan evaluasi kognitif</small>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {/* Chart Performa Peserta per Learning Path */}
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff', minHeight: 350 }}>
              <h6 className="fw-extrabold text-dark mb-3">Tingkat Kelulusan & Siswa Aktif per Jalur Belajar</h6>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={learning_paths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar name="Siswa Aktif" dataKey="active_students" fill="#005a87" radius={[4, 4, 0, 0]} />
                    <Bar name="Tingkat Kelulusan (%)" dataKey="completion_rate" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Visualisasi Drop-off Point (Funnel Chart) */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff', minHeight: 350 }}>
              <h6 className="fw-extrabold text-dark mb-3">Funnel Analisis Titik Drop-off (Penyusutan Siswa)</h6>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart 
                    layout="vertical" 
                    data={drop_offs} 
                    margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar name="Jumlah Siswa" dataKey="students" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* AI Quiz Effectiveness Analytics table */}
        <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Efektivitas Soal Kuis Chintya AI
          </h5>
          
          <Table responsive hover className="align-middle">
            <thead>
              <tr className="table-light">
                <th>Kode Soal</th>
                <th>Konteks Pertanyaan</th>
                <th className="text-center">Tingkat Jawaban Benar (%)</th>
                <th className="text-center">Indeks Kesulitan AI</th>
                <th className="text-end">Rekomendasi Konten</th>
              </tr>
            </thead>
            <tbody>
              {quiz_effectiveness.map(quiz => (
                <tr key={quiz.id}>
                  <td className="fw-bold text-secondary">{quiz.id}</td>
                  <td className="fw-bold text-dark" style={{ fontSize: 13 }}>{quiz.question}</td>
                  <td className="text-center fw-bold" style={{ fontSize: 13, color: quiz.correct_rate < 50 ? '#dc2626' : '#16a34a' }}>
                    {quiz.correct_rate}%
                  </td>
                  <td className="text-center">
                    <Badge 
                      bg={quiz.difficulty === 'Mudah' ? 'success' : quiz.difficulty === 'Sedang' ? 'warning' : 'danger'} 
                      text={quiz.difficulty === 'Sedang' ? 'dark' : 'light'}
                    >
                      {quiz.difficulty}
                    </Badge>
                  </td>
                  <td className="text-end small text-muted">
                    {quiz.correct_rate < 50 
                      ? 'Redesain materi / ulas bab terkait di webinar' 
                      : 'Kualitas soal ideal'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

      </Container>
    </div>
  );
};

export default DashboardPage;
