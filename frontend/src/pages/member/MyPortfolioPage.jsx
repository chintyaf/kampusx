import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Lock,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const MyPortfolioPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-portfolio');
      if (res.data?.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching digital portfolio:', err);
      setError('Gagal memuat portofolio digital. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (ticketCode) => {
    const url = `${window.location.origin}/certificate/verify/${ticketCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(ticketCode);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat Portofolio Digital Mahasiswa...</p>
      </Container>
    );
  }

  const certificates = portfolio?.certificates || [];

  return (
    <Container className="py-4 py-md-5">
      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            
            <h2 className="fw-bold text-dark mb-1">Portofolio Kredensial Digital</h2>
            <p className="text-muted mb-0">
              Koleksi sertifikat akademik dan kelulusan modul berbasis Soulbound Token (SBT) yang tidak dapat dipindahtangankan dan dapat diverifikasi secara independen oleh industri.
            </p>
          </div>
          <div className="p-3 bg-light rounded-4 border text-md-end">
            <span className="text-muted small fw-medium">Kredensial Terverifikasi</span>
            <div className="h3 fw-bold text-primary mb-0 mt-1">
              {certificates.length} Sertifikat
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {certificates.length === 0 ? (
        <Card className="text-center py-5 border rounded-4 bg-white shadow-sm">
          <Card.Body>
            <Award size={48} className="text-muted mb-3" />
            <h5 className="fw-bold text-dark">Belum Ada Sertifikat SBT yang Diterbitkan</h5>
            <p className="text-muted small mb-3">
              Selesaikan modul microlearning atau evaluasi akademik untuk mendapatkan kredensial Soulbound Token resmi.
            </p>
            <Link to="/gamification" className="btn btn-primary rounded-pill px-4">
              Buka Dasbor Gamifikasi
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {certificates.map((cert) => (
            <Col md={6} lg={4} key={cert.id}>
              <Card className="h-100 rounded-4 border shadow-sm transition hover-shadow bg-white">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <Badge bg="success" className="px-3 py-1 rounded-pill d-flex align-items-center gap-1">
                    <ShieldCheck size={14} /> ON-CHAIN VERIFIED
                  </Badge>
                  <Badge bg="light" text="dark" className="border rounded-pill px-2 py-1 small">
                    <Lock size={12} className="me-1" /> Non-Transferable
                  </Badge>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">{cert.title}</h5>
                    <div className="text-muted small mb-3">Penerbit: {cert.issuer}</div>

                    <div className="p-3 bg-light rounded-3 border mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Token ID:</span>
                        <strong className="font-monospace text-primary">{cert.token_id}</strong>
                      </div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Tanggal Terbit:</span>
                        <span className="text-dark">{cert.minted_at_formatted || cert.minted_at}</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">Nilai Refleksi:</span>
                        <span className="text-success fw-bold">{cert.cognitive_score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-top d-flex flex-column gap-2">
                    <Link
                      to={`/certificate/verify/${cert.ticket_code}`}
                      className="btn btn-primary btn-sm rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1 shadow-sm"
                    >
                      <Eye size={16} /> Buka Public Verifier
                    </Link>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/blockchain/explorer/tx/${cert.tx_hash}`}
                        className="btn btn-outline-success btn-sm rounded-pill flex-fill py-1 d-flex align-items-center justify-content-center gap-1"
                      >
                        <ExternalLink size={14} /> PolygonScan
                      </Link>

                      <Button
                        variant="light"
                        size="sm"
                        className="border rounded-pill flex-fill py-1 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleCopyLink(cert.ticket_code)}
                      >
                        {copiedId === cert.ticket_code ? (
                          <>
                            <Check size={14} className="text-success" /> Disalin!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Salin Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyPortfolioPage;
