import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge as BsBadge, Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft, Award, Zap, BookOpen, Sparkles, Trophy, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

const BadgeCollectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ total_badges: 5, unlocked_badges: 0, badges: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gamification/badges');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError('Gagal memuat koleksi badge.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (code, isUnlocked) => {
    const size = 28;
    const color = isUnlocked ? '#0284c7' : '#94a3b8';
    switch (code) {
      case 'FIRST_STEP':
        return <Award size={size} color={color} />;
      case 'ACTIVE_STUDENT':
        return <Zap size={size} color={color} />;
      case 'KNOWLEDGE_SEEKER':
        return <BookOpen size={size} color={color} />;
      case 'PERFECT_SCORE':
        return <Sparkles size={size} color={color} />;
      case 'EVENT_ENTHUSIAST':
        return <Trophy size={size} color={color} />;
      default:
        return <Award size={size} color={color} />;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat Koleksi Badge Achievement...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5">
      <Button
        variant="light"
        className="mb-4 d-flex align-items-center gap-2 border shadow-sm rounded-pill px-3 py-1 text-muted small"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Kembali ke Dasbor
      </Button>

      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <BsBadge bg="warning" text="dark" className="px-3 py-1 rounded-pill">
                Achievement & Gamification
              </BsBadge>
              <BsBadge bg="light" className="text-dark border px-3 py-1 rounded-pill">
                Non-NFT Achievement Badge
              </BsBadge>
            </div>
            <h2 className="fw-bold text-dark mb-1">Koleksi Badge Mahasiswa</h2>
            <p className="text-muted mb-0">
              Badge diterbitkan sebagai pengakuan dedikasi belajar, keaktifan seminar, dan pencapaian kuis kognitif.
            </p>
          </div>
          <div className="text-md-end p-3 bg-light rounded-4 border">
            <span className="text-muted small fw-medium">Badge Terkumpul</span>
            <div className="h3 fw-bold text-primary mb-0 mt-1">
              {data.unlocked_badges} / {data.total_badges}
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {/* Grid Badges */}
      <Row className="g-4">
        {data.badges && data.badges.map((badge, idx) => (
          <Col md={6} lg={4} key={idx}>
            <Card
              className={`h-100 rounded-4 transition border ${
                badge.is_unlocked ? 'border-primary shadow-sm bg-white' : 'bg-light border-dashed'
              }`}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className={`p-3 rounded-4 d-inline-flex align-items-center justify-content-center ${
                        badge.is_unlocked ? 'bg-primary-subtle' : 'bg-secondary-subtle'
                      }`}
                    >
                      {getBadgeIcon(badge.code, badge.is_unlocked)}
                    </div>
                    {badge.is_unlocked ? (
                      <BsBadge bg="success" className="px-3 py-1 rounded-pill d-flex align-items-center gap-1">
                        <CheckCircle2 size={12} /> UNLOCKED
                      </BsBadge>
                    ) : (
                      <BsBadge bg="secondary" className="px-3 py-1 rounded-pill d-flex align-items-center gap-1">
                        <Lock size={12} /> LOCKED
                      </BsBadge>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{badge.name}</h5>
                  <p className="text-muted small mb-3">{badge.description}</p>
                </div>

                <div className="pt-3 border-top">
                  <div className="text-muted small mb-1">
                    <strong>Syarat Membuka:</strong> {badge.criteria}
                  </div>
                  {badge.is_unlocked && badge.unlocked_at && (
                    <div className="text-success small fw-medium">
                      ✓ Diperoleh pada: {badge.unlocked_at}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BadgeCollectionPage;
