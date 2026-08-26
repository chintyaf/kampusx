import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge, Modal } from 'react-bootstrap';
import { Award, Shield, CheckCircle, Lock, Download, Printer, ExternalLink, Calendar, Briefcase, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [selectedCert, setSelectedCert] = useState(null);

  const stats = {
    totalPoints: 1250,
    rank: 'SRL Gold Master',
    level: 4,
    unlockedBadgesCount: 3,
    totalBadgesCount: 4
  };

  const badges = [
    { id: 1, title: 'Goal Setter', desc: 'Menetapkan 3 target belajar di fase Forethought.', icon: '🎯', status: 'unlocked', date: '12 Agustus 2026' },
    { id: 2, title: 'Self Reflector', desc: 'Menyelesaikan 3 jurnal evaluasi mandiri.', icon: '📝', status: 'unlocked', date: '18 Agustus 2026' },
    { id: 3, title: 'Micro-Learner', desc: 'Menyelesaikan 5 materi pembelajaran mikro.', icon: '⚡', status: 'unlocked', date: '22 Agustus 2026' },
    { id: 4, title: 'Master Strategist', desc: 'Menerapkan 5 teknik fokus belajar berbeda.', icon: '🧠', status: 'locked', date: null }
  ];

  const certificates = [
    {
      id: 'CERT-DT-9921',
      title: 'Sertifikat Kelulusan: Design Thinking Foundations',
      issuedDate: '24 Agustus 2026',
      instructor: 'Pratama Yusuf, M.Ds.',
      credentialId: 'KX-DTF-9021-9921',
      pathId: 1
    }
  ];

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShareCertificate = () => {
    navigator.clipboard.writeText(`http://localhost:5173/certificate/verify/${selectedCert?.credentialId}`);
    toast.success('Link verifikasi sertifikat berhasil disalin!');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-warning text-dark mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                Gamifikasi & Portofolio
              </span>
              <h2 className="fw-extrabold mb-1">Badge & Sertifikasi Saya</h2>
              <p className="text-white-50 mb-0 small">
                Lihat pencapaian lencana SRL (Self-Regulated Learning) Anda dan unduh sertifikat resmi penyelesaian jalur belajar.
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
          
          {/* Left Summary Card */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <div className="d-flex flex-column align-items-center text-center">
                <div className="bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 72, height: 72 }}>
                  <Award size={36} className="text-warning" />
                </div>
                <h5 className="fw-extrabold text-dark mb-1">{stats.rank}</h5>
                <span className="badge bg-light text-secondary border mb-3">Level {stats.level} Pembelajar</span>
                
                <div className="w-100 bg-light rounded-3 p-3 text-start small mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Tabungan Poin:</span>
                    <span className="fw-bold text-dark">{stats.totalPoints} PTS</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Lencana Terbuka:</span>
                    <span className="fw-bold text-dark">{stats.unlockedBadgesCount} dari {stats.totalBadgesCount}</span>
                  </div>
                </div>

                {/* Progress bar towards next badge */}
                <div className="w-100">
                  <div className="d-flex justify-content-between mb-1 small text-muted">
                    <span>Sertifikat Selanjutnya</span>
                    <span>75%</span>
                  </div>
                  <ProgressBar now={75} variant="warning" style={{ height: 6, borderRadius: 10 }} />
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Panel: Badges & Certificates */}
          <Col lg={8}>
            
            {/* Badges Grid */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-extrabold text-dark mb-3">Galeri Lencana SRL</h5>
              <Row className="g-3">
                {badges.map(badge => {
                  const isLocked = badge.status === 'locked';
                  return (
                    <Col xs={6} md={3} key={badge.id}>
                      <div
                        style={{
                          background: isLocked ? '#f8fafc' : '#fff',
                          border: isLocked ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                          borderRadius: 16,
                          padding: '16px 12px',
                          textAlign: 'center',
                          position: 'relative',
                          opacity: isLocked ? 0.65 : 1,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>{badge.icon}</div>
                          <h6 className="fw-extrabold text-dark mb-1" style={{ fontSize: 12 }}>{badge.title}</h6>
                          <p className="text-muted small mb-0" style={{ fontSize: 10, lineHeight: 1.4 }}>{badge.desc}</p>
                        </div>

                        <div className="mt-3">
                          {isLocked ? (
                            <Badge bg="secondary" className="d-flex align-items-center gap-1 justify-content-center py-1">
                              <Lock size={10} /> Terkunci
                            </Badge>
                          ) : (
                            <Badge bg="success" className="d-flex align-items-center gap-1 justify-content-center py-1">
                              <CheckCircle size={10} /> Terbuka
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>

            {/* Certificate List */}
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h5 className="fw-extrabold text-dark mb-3">Sertifikat Kelulusan Jalur Belajar</h5>
              
              {certificates.map(cert => (
                <div 
                  key={cert.id}
                  className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 bg-light rounded-3 mb-2 border"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                      <Award size={22} />
                    </div>
                    <div>
                      <h6 className="fw-extrabold text-dark mb-1" style={{ fontSize: 13 }}>{cert.title}</h6>
                      <small className="text-muted block">Diterbitkan: {cert.issuedDate} • Pengajar: {cert.instructor}</small>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setSelectedCert(cert)}
                    className="d-flex align-items-center gap-1"
                    style={{ background: '#005a87', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
                  >
                    Buka Sertifikat <ExternalLink size={12} />
                  </Button>
                </div>
              ))}
            </Card>

          </Col>
        </Row>
      </Container>

      {/* Certificate Viewer Modal */}
      <Modal
        show={!!selectedCert}
        onHide={() => setSelectedCert(null)}
        centered
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      >
        <Modal.Header closeButton className="border-0 bg-light py-3 px-4">
          <Modal.Title className="fw-bold text-dark" style={{ fontSize: 16 }}>Pratinjau Sertifikat Kelulusan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          {/* Main Certificate Layout mockup */}
          <div 
            id="certificate-print-area"
            style={{
              border: '10px double #005a87',
              borderRadius: 8,
              padding: '40px 30px',
              background: '#fff',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              margin: '10px 0'
            }}
          >
            {/* Watermark Logo */}
            <div style={{ position: 'absolute', top: 20, right: 30, fontSize: 18, fontWeight: 900, color: '#e2e8f0', letterSpacing: '2px' }}>
              KAMPUSX
            </div>

            <div className="mb-4">
              <Award size={48} className="text-warning mb-2" />
              <h2 className="fw-extrabold text-dark" style={{ fontSize: 24, letterSpacing: '1px' }}>SERTIFIKAT KELULUSAN</h2>
              <span className="text-muted small" style={{ letterSpacing: '3px' }}>CREDENTIAL CERTIFICATE</span>
            </div>

            <p className="text-secondary small mb-2">Diberikan secara hormat kepada:</p>
            <h3 className="fw-extrabold text-primary mb-3" style={{ fontSize: 22, textDecoration: 'underline' }}>Peserta KampusX</h3>
            
            <p className="text-muted small mx-auto" style={{ maxWidth: '500px', lineHeight: 1.6 }}>
              Atas keberhasilannya menyelesaikan seluruh rangkaian modul pembelajaran mikro (micro-learning) pada topik:
            </p>
            <h5 className="fw-bold text-dark mb-4">{selectedCert?.title.replace('Sertifikat Kelulusan: ', '')}</h5>

            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mt-5 px-3">
              <div className="text-start" style={{ fontSize: 11 }}>
                <span className="text-muted">DITANDATANGANI OLEH:</span>
                <p className="fw-bold text-dark mb-0 mt-1">{selectedCert?.instructor}</p>
                <span className="text-muted">LMS Instructor</span>
              </div>

              {/* Dynamic QR Code mockup for validation */}
              <div className="text-end" style={{ fontSize: 10 }}>
                <div className="bg-light p-2 d-inline-block border mb-1" style={{ borderRadius: 6 }}>
                  {/* Mock QR Code */}
                  <div style={{ width: 56, height: 56, background: '#000', display: 'flex', flexWrap: 'wrap' }}>
                    <div style={{ width: '50%', height: '50%', background: '#fff', border: '5px solid #000' }} />
                    <div style={{ width: '50%', height: '50%', background: '#000' }} />
                    <div style={{ width: '50%', height: '50%', background: '#000' }} />
                    <div style={{ width: '50%', height: '50%', background: '#fff', border: '5px solid #000' }} />
                  </div>
                </div>
                <p className="text-muted mb-0">ID: {selectedCert?.credentialId}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="outline-secondary" onClick={handleShareCertificate} className="d-flex align-items-center gap-1" style={{ borderRadius: 8 }}>
              <Share2 size={14} /> Salin Tautan
            </Button>
            <Button variant="outline-secondary" onClick={handlePrintCertificate} className="d-flex align-items-center gap-1" style={{ borderRadius: 8 }}>
              <Printer size={14} /> Cetak Sertifikat
            </Button>
            <Button variant="success" onClick={() => toast.success('Mengunduh Sertifikat PDF...')} className="d-flex align-items-center gap-1" style={{ borderRadius: 8 }}>
              <Download size={14} /> Unduh PDF
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AchievementsPage;
