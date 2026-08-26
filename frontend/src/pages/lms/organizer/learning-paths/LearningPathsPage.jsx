import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';
import { Settings, Save, AlertCircle, Compass, HelpCircle, ArrowLeft, RefreshCw, GitCommit } from 'lucide-react';
import toast from 'react-hot-toast';

const LearningPathsPage = () => {
  const navigate = useNavigate();

  // Prerequisite settings configuration
  const [passingGrade, setPassingGrade] = useState(80);
  const [minConfidenceStars, setMinConfidenceStars] = useState(3);
  
  const [rules, setRules] = useState([
    { id: 1, targetModule: 'Teknik Presentasi yang Memukau Audiens', prerequisiteModule: 'Pengenalan Design Thinking untuk Pemula', requiredStatus: 'completed' },
    { id: 2, targetModule: 'Dasar-dasar Kepemimpinan Tim Efektif', prerequisiteModule: 'Teknik Presentasi yang Memukau Audiens', requiredStatus: 'completed' },
    { id: 3, targetModule: 'Deep Work: Fokus Tanpa Distraksi Digital', prerequisiteModule: 'None', requiredStatus: 'Any' }
  ]);

  const [targetModule, setTargetModule] = useState('');
  const [prereqModule, setPrereqModule] = useState('');

  const mockModules = [
    'Pengenalan Design Thinking untuk Pemula',
    'Teknik Presentasi yang Memukau Audiens',
    'Dasar-dasar Kepemimpinan Tim Efektif',
    'Deep Work: Fokus Tanpa Distraksi Digital'
  ];

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!targetModule || !prereqModule) {
      toast.error('Harap pilih modul target dan modul prasyarat!');
      return;
    }
    if (targetModule === prereqModule) {
      toast.error('Modul prasyarat tidak boleh sama dengan modul target!');
      return;
    }

    const newId = rules.length + 1;
    setRules(prev => [...prev, {
      id: newId,
      targetModule,
      prerequisiteModule: prereqModule,
      requiredStatus: 'completed'
    }]);

    setTargetModule('');
    setPrereqModule('');
    toast.success('Aturan prasyarat baru ditambahkan!');
  };

  const handleRemoveRule = (ruleId) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('Aturan prasyarat dihapus!');
  };

  const handleSaveAll = () => {
    toast.success('Konfigurasi Prasyarat Jalur Belajar Berhasil Disimpan!');
    navigate('/organizer/dashboard');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 0' }}>
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
                <h2 className="fw-extrabold mb-1">Pengaturan Prasyarat Modul (Prerequisites)</h2>
                <p className="text-white-50 mb-0 small">
                  Tentukan syarat kelulusan sekuensial modul agar peserta mengikuti alur belajar yang direkomendasikan.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSaveAll}
              style={{ background: '#005a87', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13 }}
            >
              Simpan Konfigurasi
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: configure rules */}
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <GitCommit size={20} className="text-primary" /> Aturan Prasyarat Alur Belajar
              </h5>

              <Table responsive hover className="align-middle mb-4">
                <thead>
                  <tr className="table-light">
                    <th>Target Modul Belajar</th>
                    <th>Modul Prasyarat (Prerequisite)</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id}>
                      <td className="fw-bold text-dark" style={{ fontSize: 12.5 }}>{rule.targetModule}</td>
                      <td>
                        {rule.prerequisiteModule === 'None' ? (
                          <Badge bg="light" text="secondary" className="border">Bebas Akses (Tanpa Syarat)</Badge>
                        ) : (
                          <Badge bg="purple-subtle" className="text-purple-700" style={{ fontSize: 11.5 }}>
                            Harus Lulus: {rule.prerequisiteModule}
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        {rule.prerequisiteModule !== 'None' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleRemoveRule(rule.id)}
                            style={{ borderRadius: 8 }}
                          >
                            Hapus
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <hr className="my-4" />

              <h6 className="fw-bold mb-3 small text-secondary">TAMBAH PRASYARAT BARU</h6>
              <Form onSubmit={handleAddRule}>
                <Row className="g-3 align-items-end">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Pilih Modul Target</Form.Label>
                      <Form.Select 
                        value={targetModule} 
                        onChange={(e) => setTargetModule(e.target.value)}
                        style={{ borderRadius: 8, fontSize: 12.5 }}
                      >
                        <option value="">-- Modul Belajar --</option>
                        {mockModules.map((m, idx) => (
                          <option key={idx} value={m}>{m}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Pilih Modul Prasyarat</Form.Label>
                      <Form.Select 
                        value={prereqModule} 
                        onChange={(e) => setPrereqModule(e.target.value)}
                        style={{ borderRadius: 8, fontSize: 12.5 }}
                      >
                        <option value="">-- Modul Prasyarat --</option>
                        {mockModules.map((m, idx) => (
                          <option key={idx} value={m}>{m}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Button 
                      type="submit" 
                      className="w-100 py-2 fw-bold"
                      style={{ background: '#005a87', border: 'none', borderRadius: 8, fontSize: 12 }}
                    >
                      Tambah
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Right panel: criteria configuration */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Settings size={20} className="text-primary" /> Kriteria Kelulusan Sistem (SRL)
              </h5>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Nilai Minimum Kuis Kesiapan (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(Number(e.target.value))}
                  style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13 }}
                />
                <Form.Text className="text-muted small">
                  Peserta harus mencapai persentase jawaban benar ini agar kuis dinyatakan lulus dan modul terhitung selesai.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-secondary">Persyaratan Rating Keyakinan SRL</Form.Label>
                <Form.Select
                  value={minConfidenceStars}
                  onChange={(e) => setMinConfidenceStars(Number(e.target.value))}
                  style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13 }}
                >
                  <option value={1}>Tanpa batasan bintang keyakinan</option>
                  <option value={3}>Minimal rating keyakinan belajar 3 Bintang</option>
                  <option value={4}>Minimal rating keyakinan belajar 4 Bintang</option>
                </Form.Select>
                <Form.Text className="text-muted small">
                  Tingkat keyakinan diri (Self-efficacy) minimum yang harus dilaporkan pembelajar di fase refleksi.
                </Form.Text>
              </Form.Group>

              <div className="alert alert-info border-0 p-3 mb-0" style={{ borderRadius: 10, fontSize: 11 }}>
                <AlertCircle size={14} className="me-1" />
                <strong>Catatan Integrasi:</strong> Aturan ini diaplikasikan secara global ke seluruh katalog micro-learning. Anggota dengan status bypass <strong>Manual Unlock Switch</strong> dapat mengabaikan syarat-syarat di atas.
              </div>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default LearningPathsPage;
