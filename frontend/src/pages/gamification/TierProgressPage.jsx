import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft, CheckCircle2, TrendingUp, ShieldCheck, Star, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

const TierProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTierProgress();
  }, []);

  const fetchTierProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gamification/tier-progress');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tier progress:', err);
      setError('Gagal memuat status tier. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat data jenjang multi-tier...</p>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-5">
        <Button
          variant="light"
          className="mb-4 d-flex align-items-center gap-2 border shadow-sm rounded-pill px-3 py-1 text-muted small"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Kembali
        </Button>
        <Alert variant="danger">
          {error || 'Gagal memuat status tier. Pastikan backend Laravel sedang berjalan.'}
          <Button size="sm" variant="outline-danger" className="ms-3" onClick={fetchTierProgress}>
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  const currentTier = data.current_tier;
  const currentPoints = data.current_points ?? 0;
  const nextTier = data.next_tier;
  const pointsNeeded = data.points_needed ?? 0;
  const progressPercent = data.progress_percent ?? 0;
  const allTiers = data.all_tiers || [];

  return (
    <Container className="py-4 py-md-5">
      <Button
        variant="light"
        className="mb-4 d-flex align-items-center gap-2 border shadow-sm rounded-pill px-3 py-1 text-muted small"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Kembali ke Dasbor
      </Button>

      {/* Hero Tier Status */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <Row className="align-items-center g-4">
          <Col md={7}>
            
            <h2 className="fw-bold text-dark mb-1">
              Status Tier Anda: <span className="text-primary">{currentTier}</span>
            </h2>
            <p className="text-muted mb-3">
              Total Poin Terkumpul: <strong>{currentPoints} Poin</strong>.
              {pointsNeeded > 0
                ? ` Kumpulkan ${pointsNeeded} poin lagi untuk naik ke status ${nextTier}!`
                : ' Anda berada pada tingkat tier tertinggi!'}
            </p>
            <ProgressBar
              now={progressPercent}
              label={`${progressPercent}%`}
              className="rounded-pill mb-2"
              style={{ height: '18px' }}
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>{currentTier} ({data?.tier_min || 0} Poin)</span>
              <span>{nextTier}</span>
            </div>
          </Col>
          <Col md={5} className="text-md-end">
            <div className="p-3 bg-light rounded-4 border text-start">
              <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
                <Zap size={18} /> Mekanisme Kenaikan Tier Otomatis
              </div>
              <p className="text-muted small mb-0">
                Setiap aktivitas yang diselesaikan (event, microlearning, kuis) akan menambahkan poin ke database. Backend mengevaluasi rentang poin secara real-time dan memperbarui tier secara otomatis.
              </p>
            </div>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {/* 3 Tier Cards Comparison */}
      <h4 className="fw-bold text-dark mb-3">Perbandingan Jenjang & Benefit Tier</h4>
      <Row className="g-4 mb-4">
        {allTiers.map((tier, idx) => (
          <Col md={4} key={idx}>
            <Card
              className={`h-100 rounded-4 transition border ${
                tier.is_current ? 'border-primary shadow-sm bg-primary-subtle' : 'bg-white'
              }`}
            >
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-0 text-dark">{tier.name}</h4>
                  <span className="text-muted small">{tier.range}</span>
                </div>
                {tier.is_current && (
                  <Badge bg="primary" className="rounded-pill px-3 py-1">
                    Tier Anda Saat Ini
                  </Badge>
                )}
              </Card.Header>
              <Card.Body className="p-4">
                <div className="text-muted small fw-bold text-uppercase mb-3">Benefit Yang Didapat:</div>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {tier.benefits && tier.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="d-flex align-items-start gap-2 small text-dark">
                      <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TierProgressPage;
