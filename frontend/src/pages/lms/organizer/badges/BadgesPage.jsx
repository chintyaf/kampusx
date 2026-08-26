import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import { Award, Compass, Edit, Trash2, ArrowLeft, RefreshCw, Eye, Sparkles, Save, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const OrganizerBadgesPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Certificate template state variables
  const [certTitle, setCertTitle] = useState('SERTIFIKAT KELULUSAN');
  const [signatoryName, setSignatoryName] = useState('Pratama Yusuf, M.Ds.');
  const [signatoryTitle, setSignatoryTitle] = useState('Head of KampusX LMS');
  const [credentialPrefix, setCredentialPrefix] = useState('KX-DTF');

  // Badges state list
  const [badges, setBadges] = useState([
    { id: 1, title: 'Goal Setter', desc: 'Menyelesaikan 3 perencanaan target di Forethought.', icon: '🎯', points: 50 },
    { id: 2, title: 'Consistency King', desc: 'Mempertahankan streak belajar harian selama 5 hari.', icon: '🔥', points: 75 },
    { id: 3, title: 'Micro-Learner', desc: 'Menyelesaikan 5 materi pembelajaran mikro.', icon: '⚡', points: 100 },
    { id: 4, title: 'Master Strategist', desc: 'Menerapkan 5 teknik fokus belajar berbeda.', icon: '🧠', points: 120 }
  ]);

  const handleEditBadge = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const handleSaveBadge = () => {
    toast.success('Informasi lencana berhasil diperbarui!');
    setShowModal(false);
  };

  const handleCreateBadge = () => {
    const newId = badges.length + 1;
    const newBadge = { id: newId, title: 'Lencana Baru', desc: 'Deskripsi lencana baru.', icon: '🏆', points: 50 };
    setBadges(prev => [...prev, newBadge]);
    setSelectedBadge(newBadge);
    setShowModal(true);
  };

  const handleDeleteBadge = (id) => {
    setBadges(prev => prev.filter(b => b.id !== id));
    toast.success('Lencana berhasil dihapus!');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => navigate('/organizer/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="badge bg-primary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                  LMS Studio
                </span>
                <h2 className="fw-extrabold mb-1">Badges & Sertifikat Builder</h2>
                <p className="text-white-50 mb-0 small">
                  Rancang lencana gamifikasi pembelajar dan rancang template sertifikat digital secara interaktif.
                </p>
              </div>
            </div>
            <Button 
              style={{ background: '#005a87', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13 }}
              onClick={handleCreateBadge}
            >
              + Buat Lencana Baru
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: Badges editor list */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3">Daftar Lencana Gamifikasi</h5>
              <div className="d-flex flex-column gap-3">
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center border"
                    style={{ borderColor: '#cbd5e1' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="fs-3">{badge.icon}</div>
                      <div>
                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: 13 }}>{badge.title}</h6>
                        <p className="text-muted small mb-0" style={{ fontSize: 11 }}>{badge.desc}</p>
                        <Badge bg="success" className="mt-1">+{badge.points} Poin</Badge>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditBadge(badge)} style={{ borderRadius: 8 }}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBadge(badge.id)} style={{ borderRadius: 8 }}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Right panel: Template Certificate Designer */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Certificate Template Designer
              </h5>

              {/* Form settings */}
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">Judul Utama Sertifikat</Form.Label>
                <Form.Control 
                  type="text" 
                  value={certTitle} 
                  onChange={(e) => setCertTitle(e.target.value)} 
                  style={{ borderRadius: 8, fontSize: 12.5 }}
                />
              </Form.Group>

              <Row className="g-2 mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">Nama Penandatangan</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={signatoryName} 
                      onChange={(e) => setSignatoryName(e.target.value)} 
                      style={{ borderRadius: 8, fontSize: 12.5 }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">Jabatan Penandatangan</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={signatoryTitle} 
                      onChange={(e) => setSignatoryTitle(e.target.value)} 
                      style={{ borderRadius: 8, fontSize: 12.5 }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">Prefix Kode Kredensial</Form.Label>
                <Form.Control 
                  type="text" 
                  value={credentialPrefix} 
                  onChange={(e) => setCredentialPrefix(e.target.value)} 
                  style={{ borderRadius: 8, fontSize: 12.5 }}
                />
              </Form.Group>

              {/* Live Preview canvas */}
              <h6 className="fw-bold text-secondary mb-2 small">LIVE PREVIEW TEMPLATE</h6>
              <div 
                style={{
                  border: '4px double #005a87',
                  borderRadius: 6,
                  padding: '24px 16px',
                  background: '#fff',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <Award size={28} className="text-warning mb-1" />
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 12, letterSpacing: '0.5px' }}>{certTitle}</h6>
                <span className="text-muted" style={{ fontSize: 8 }}>KX-CREDENTIAL-CERTIFICATE</span>
                
                <p className="text-muted my-2" style={{ fontSize: 9 }}>Diberikan secara terhormat kepada <strong>[Nama Peserta]</strong> atas kelulusannya pada modul micro-learning.</p>
                
                <div className="d-flex justify-content-between align-items-end mt-4 px-2" style={{ fontSize: 8 }}>
                  <div className="text-start">
                    <p className="fw-bold text-dark mb-0">{signatoryName}</p>
                    <span className="text-muted">{signatoryTitle}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-muted">Kode: {credentialPrefix}-XXXX</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => toast.success('Desain template sertifikat berhasil disimpan!')}
                className="w-100 mt-3 py-2 fw-bold"
                style={{ background: '#005a87', border: 'none', borderRadius: 10, fontSize: 12 }}
              >
                <Save size={14} /> Simpan Template Sertifikat
              </Button>
            </Card>
          </Col>

        </Row>
      </Container>

      {/* Editor Modal for Badge Creator */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg rounded-4">
        <Modal.Header closeButton className="bg-light px-4 py-3">
          <Modal.Title className="fw-bold text-dark" style={{ fontSize: 15 }}>
            Edit Kriteria Lencana: {selectedBadge?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Nama Lencana (Badge Name)</Form.Label>
            <Form.Control 
              type="text" 
              value={selectedBadge?.title || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBadge(prev => ({ ...prev, title: val }));
              }}
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Pilih Ikon Lencana</Form.Label>
            <Form.Select 
              value={selectedBadge?.icon || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBadge(prev => ({ ...prev, icon: val }));
              }}
              style={{ borderRadius: 8, fontSize: 13 }}
            >
              <option value="🎯">Target / Goal</option>
              <option value="🔥">Streak / Api</option>
              <option value="⚡">Petir / Micro</option>
              <option value="🧠">Otak / Strategi</option>
              <option value="🏆">Piala / Juara</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Aturan Syarat Memperoleh (Description)</Form.Label>
            <Form.Control 
              as="textarea"
              rows={2}
              value={selectedBadge?.desc || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBadge(prev => ({ ...prev, desc: val }));
              }}
              style={{ borderRadius: 8, fontSize: 12.5 }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Tambahan Hadiah Poin</Form.Label>
            <Form.Control 
              type="number"
              value={selectedBadge?.points || 0} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedBadge(prev => ({ ...prev, points: val }));
              }}
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="border-0 bg-light px-4 py-3">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 8, fontSize: 12.5 }}>
            Batal
          </Button>
          <Button onClick={handleSaveBadge} style={{ background: '#005a87', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrganizerBadgesPage;
