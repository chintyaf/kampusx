import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Gift,
  ChevronRight,
  Star
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const GamificationDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/gamification/dashboard');
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching gamification dashboard:', err);
      setError('Gagal memuat data gamifikasi. Pastikan backend Laravel sedang berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return '#0284c7';
      case 'Gold':
        return '#d97706';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat Dasbor Gamifikasi Mahasiswa...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button size="sm" variant="outline-danger" className="ms-3" onClick={fetchDashboard}>
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!summary) return null;

  const student      = summary.student;
  const tierProgress = summary.tier_progress;
  const badges       = summary.badges || { unlocked_count: 0, total_count: 0, list: [] };
  const history      = summary.recent_history || [];

  return (
    <Container className="py-4 py-md-5">
      {/* Header Banner */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <Row className="align-items-center g-4">
          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Badge
                bg="primary"
                className="px-3 py-1 rounded-pill"
                style={{ backgroundColor: getTierColor(student.tier) }}
              >
                Tier {student.tier}
              </Badge>
              <Badge bg="light" className="text-dark border px-3 py-1 rounded-pill">
                Peringkat #{student.rank} Leaderboard
              </Badge>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Hai, {student.name}!
            </h2>
            <p className="text-muted mb-0">
              Selamat datang di Pusat Gamifikasi & Pengembangan Diri Mahasiswa. Tingkatkan aktivitas Anda untuk membuka tier dan benefit eksklusif!
            </p>
          </Col>
          <Col md={5} className="text-md-end">
            <div className="d-flex gap-2">
              <div className="p-3 bg-light rounded-4 border text-start flex-fill">
                <div className="text-muted small fw-medium">Global Points (Tier)</div>
                <div className="d-flex align-items-baseline gap-1 mt-1">
                  <span className="h3 fw-bold text-primary mb-0">{student.points}</span>
                  <span className="text-muted small">Pts</span>
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Akumulasi Permanen</div>
              </div>
              <div className="p-3 bg-light rounded-4 border text-start flex-fill">
                <div className="text-muted small fw-medium">Reward Credits</div>
                <div className="d-flex align-items-baseline gap-1 mt-1">
                  <span className="h3 fw-bold text-success mb-0">{student.reward_credits ?? 0}</span>
                  <span className="text-muted small">Credits</span>
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Saldo Spendable</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="warning" className="rounded-3">{error}</Alert>}

      {/* 3 Quick Action Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="h-100 border rounded-4 shadow-sm hover-shadow transition">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted small fw-bold text-uppercase">Multi-Tier System</span>
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-2">Progres Menuju {tierProgress.next_tier}</h5>
                <p className="text-muted small mb-3">
                  {tierProgress.points_needed > 0
                    ? `Kurang ${tierProgress.points_needed} poin lagi untuk naik ke status ${tierProgress.next_tier}.`
                    : 'Selamat! Anda telah mencapai tingkat pencapaian tertinggi!'}
                </p>
                <ProgressBar
                  now={tierProgress.progress_percent}
                  label={`${tierProgress.progress_percent}%`}
                  className="rounded-pill mb-2"
                  style={{ height: '14px' }}
                />
              </div>
              <Link to="/tier-progress" className="btn btn-outline-primary btn-sm rounded-pill mt-3 d-flex align-items-center justify-content-center gap-1">
                Lihat Syarat & Benefit Tier <ChevronRight size={16} />
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 border rounded-4 shadow-sm hover-shadow transition">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted small fw-bold text-uppercase">Badge & Achievements</span>
                  <div className="p-2 bg-warning-subtle text-warning rounded-3">
                    <Award size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-2">{badges.unlocked_count} / {badges.total_count} Badge Dimiliki</h5>
                <p className="text-muted small mb-3">
                  Kumpulkan lencana pengakuan atas keaktifan akademik, kelulusan kuis kognitif, dan partisipasi seminar industri.
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  {badges.list && badges.list.map((b, i) => (
                    <Badge key={i} bg="success" className="px-2 py-1 rounded-pill">
                      ✓ {b.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Link to="/badges" className="btn btn-outline-warning btn-sm rounded-pill mt-3 d-flex align-items-center justify-content-center gap-1 text-dark">
                Buka Koleksi Badge <ChevronRight size={16} />
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 border rounded-4 shadow-sm hover-shadow transition">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted small fw-bold text-uppercase">Smart Reward Engine</span>
                  <div className="p-2 bg-success-subtle text-success rounded-3">
                    <Gift size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-2">Rekomendasi AI Bandit</h5>
                <p className="text-muted small mb-3">
                  Sistem Contextual Bandit (Thompson Sampling) menentukan diskon dan bonus yang paling sesuai dengan konteks Anda.
                </p>
                <div className="bg-light p-2 rounded-3 text-muted small">
                  Dilengkapi pembatas anggaran & kuota real-time (DISCO constraints)
                </div>
              </div>
              <Link to="/rewards" className="btn btn-outline-success btn-sm rounded-pill mt-3 d-flex align-items-center justify-content-center gap-1">
                Katalog & Rekomendasi Reward <ChevronRight size={16} />
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Riwayat Poin Terbaru */}
      <Card className="border rounded-4 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-1">Riwayat Perolehan Poin Terbaru</h5>
            <p className="text-muted small mb-0">Catatan transaksi mutasi poin transparan dari aktivitas nyata.</p>
          </div>
          <Link to="/member/points/history" className="btn btn-light btn-sm border rounded-pill">
            Lihat Semua Riwayat
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Aktivitas Mahasiswa</th>
                  <th className="py-3">Waktu Transaksi</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-end">Perolehan Poin</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      Belum ada mutasi poin tercatat.
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 fw-medium text-dark">
                        <div className="d-flex align-items-center gap-2">
                          
                          <span>{item.activity}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted small">{item.date}</td>
                      <td className="py-3 text-center">
                        <Badge bg="success" className="px-2 py-1 rounded-pill small">
                          SUCCESS
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end fw-bold text-success">
                        +{item.points} Poin
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GamificationDashboardPage;
