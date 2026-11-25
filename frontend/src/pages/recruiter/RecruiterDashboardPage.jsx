import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import {
  Search,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  Lock,
  ArrowRight,
  Filter
} from 'lucide-react';
import api from '@/api/axios';

const RecruiterDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_candidates: 0, total_verified_credentials: 0 });
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [sbtOnly, setSbtOnly] = useState(false);

  // Skill Matching States
  const [requiredSkills, setRequiredSkills] = useState(['Laravel', 'React', 'MySQL', 'Software Testing']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [matchResults, setMatchResults] = useState(null);
  const [matching, setMatching] = useState(false);

  // Candidate Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchCandidates();
  }, [tierFilter, sbtOnly]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/recruiter/dashboard');
      if (res.data?.success) {
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.warn('Gagal memuat stats recruiter:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (tierFilter) params.tier = tierFilter;
      if (sbtOnly) params.has_sbt = 'true';

      const res = await api.get('/recruiter/candidates', { params });
      if (res.data?.success) {
        setCandidates(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleRunSkillMatch = async () => {
    try {
      setMatching(true);
      const res = await api.post('/recruiter/skill-match', {
        job_title: 'Fullstack Software Engineer',
        required_skills: requiredSkills,
      });
      if (res.data?.success) {
        setMatchResults(res.data.data);
      }
    } catch (err) {
      console.error('Error running skill match:', err);
    } finally {
      setMatching(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleViewCandidate = async (candidateId) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const res = await api.get(`/recruiter/candidates/${candidateId}`);
      if (res.data?.success) {
        setSelectedCandidate(res.data.data);
      }
    } catch (err) {
      console.error('Error loading candidate detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Container className="py-4 py-md-5">
      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <Row className="align-items-center g-4">
          <Col md={8}>
            
            <h2 className="fw-bold text-dark mb-1">Dasbor Rekruter & Penelusuran Talenta</h2>
            <p className="text-muted mb-0">
              Temukan kandidat mahasiswa terbaik dengan keahlian terverifikasi secara on-chain berbasis Soulbound Token (SBT) dan pencocokan kompetensi Vector Skill-Matrix.
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <div className="p-3 bg-light rounded-4 border text-start">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Total Kandidat:</span>
                <strong className="text-dark">{stats.total_candidates} Mahasiswa</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Kredensial SBT Terverifikasi:</span>
                <strong className="text-success">{stats.total_verified_credentials} Kredensial</strong>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* VECTOR SKILL-MATRIX MATCHING PANEL */}
      <Card className="border rounded-4 shadow-sm mb-4 bg-white">
        <Card.Header className="bg-light p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              Vector Skill-Matrix & Cosine Similarity Matcher
            </h5>
            <span className="text-muted small">Simulasi pencocokan kualifikasi pekerjaan terhadap matriks keahlian mahasiswa.</span>
          </div>
          <Badge bg="info" className="text-white px-3 py-1 rounded-pill">
            SIMULATED MATCH RESULT
          </Badge>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            <Col md={6}>
              <div className="text-muted small fw-bold text-uppercase mb-2">Kualifikasi Keahlian Yang Dibutuhkan (Job Requirements):</div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {requiredSkills.map((skill, idx) => (
                  <Badge key={idx} bg="primary" className="px-3 py-2 rounded-pill fs-6 d-flex align-items-center gap-2">
                    {skill}
                    <span
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </span>
                  </Badge>
                ))}
              </div>

              <Form onSubmit={handleAddSkill} className="d-flex gap-2 mb-3">
                <Form.Control
                  type="text"
                  placeholder="Tambah skill (misal: Docker, Solidity)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="rounded-pill"
                />
                <Button type="submit" variant="light" className="border rounded-pill px-3">
                  + Tambah
                </Button>
              </Form>

              <Button
                variant="primary"
                className="w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={handleRunSkillMatch}
                disabled={matching || requiredSkills.length === 0}
              >
                {matching ? <Spinner animation="border" size="sm" /> : <ArrowRight size={16} />}
                Hitung Skor Kecocokan Kandidat (Cosine Similarity)
              </Button>
            </Col>

            <Col md={6}>
              <div className="text-muted small fw-bold text-uppercase mb-2">Hasil Evaluasi Kecocokan Teratas:</div>
              {matchResults ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {matchResults.candidates.map((cand, idx) => (
                    <div key={idx} className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark">{cand.name}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          Skill Cocok: {cand.matched_skills.map(m => m.skill).join(', ') || 'Belum ada'}
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge bg={cand.match_score_pct >= 75 ? 'success' : 'warning'} className="rounded-pill fs-6 px-3 py-1">
                          {cand.match_score_pct}% Match
                        </Badge>
                        <div className="text-muted" style={{ fontSize: '10px' }}>{cand.competency_verdict}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-light rounded-4 border text-center text-muted small">
                  Klik tombol "Hitung Skor Kecocokan" untuk menjalankan algoritma Cosine Similarity terhadap profil mahasiswa.
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* FILTER & CANDIDATE SEARCH */}
      <Card className="border rounded-4 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0 rounded-start-pill">
                    <Search size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cari kandidat berdasarkan nama atau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 rounded-end-pill"
                  />
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="rounded-pill"
              >
                <option value="">Semua Tier</option>
                <option value="Silver">Tier Silver (0-499)</option>
                <option value="Gold">Tier Gold (500-999)</option>
                <option value="Platinum">Tier Platinum (&gt;= 1000)</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                id="sbt-switch"
                label="Hanya yang punya SBT"
                checked={sbtOnly}
                onChange={(e) => setSbtOnly(e.target.checked)}
                className="fw-medium text-dark"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CANDIDATES TABLE */}
      <Card className="border rounded-4 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Nama Kandidat</th>
                  <th className="py-3">Universitas</th>
                  <th className="py-3">Tier & Poin</th>
                  <th className="py-3">Top Keahlian</th>
                  <th className="py-3 text-center">Status SBT</th>
                  <th className="px-4 py-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted small mt-2">Memuat data kandidat...</div>
                    </td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Tidak ada kandidat mahasiswa yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  candidates.map((cand) => (
                    <tr key={cand.id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark">{cand.name}</div>
                        <div className="text-muted small">{cand.email}</div>
                      </td>
                      <td className="py-3 text-muted small">{cand.campus}</td>
                      <td className="py-3">
                        <Badge bg="primary" className="rounded-pill px-2 py-1 me-1">
                          {cand.tier}
                        </Badge>
                        <span className="small text-muted">{cand.points} Pts</span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex gap-1 flex-wrap">
                          {cand.skills && cand.skills.map((s, idx) => (
                            <Badge key={idx} bg="light" className="text-dark border" style={{ fontSize: '10px' }}>
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {cand.has_sbt ? (
                          <Badge bg="success" className="px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                            <ShieldCheck size={12} /> {cand.verified_sbt_count} SBT
                          </Badge>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill px-3 py-1"
                          onClick={() => handleViewCandidate(cand.id)}
                        >
                          Lihat Profil
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL PROFIL LENGKAP KANDIDAT (READ-ONLY FOR RECRUITER) */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">Profil Portofolio Talenta Mahasiswa</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {detailLoading || !selectedCandidate ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Memuat profil lengkap...</p>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">{selectedCandidate.name}</h3>
                  <div className="text-muted small">{selectedCandidate.campus} • {selectedCandidate.major}</div>
                  <div className="text-muted small">{selectedCandidate.email} • {selectedCandidate.phone}</div>
                </div>
                <div className="text-end">
                  <Badge bg="primary" className="px-3 py-1 rounded-pill fs-6 mb-1">
                    Tier {selectedCandidate.tier}
                  </Badge>
                  <div className="small text-muted">{selectedCandidate.points} Total Poin</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-muted small fw-bold text-uppercase mb-1">Ringkasan Profil & Kompetensi:</div>
                <p className="small text-dark">{selectedCandidate.bio}</p>
                <div className="d-flex flex-wrap gap-2">
                  {selectedCandidate.skills && Object.entries(selectedCandidate.skills).map(([k, v]) => (
                    <Badge key={k} bg="light" className="text-dark border px-3 py-1">
                      {k}: <span className="text-primary fw-bold">{v}/5.0</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Portofolio Sertifikat SBT */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="text-muted small fw-bold text-uppercase">
                    Kredensial Soulbound Token (ERC-5192) Terverifikasi:
                  </div>
                  <Badge bg="success" className="px-2 py-1 rounded-pill">
                    READ-ONLY VERIFIED
                  </Badge>
                </div>

                {selectedCandidate.sbt_certificates && selectedCandidate.sbt_certificates.length === 0 ? (
                  <div className="p-3 bg-light rounded-3 text-center text-muted small">
                    Mahasiswa ini belum memiliki sertifikat on-chain.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {selectedCandidate.sbt_certificates.map((cert) => (
                      <div key={cert.id} className="p-3 bg-white rounded-3 border shadow-sm">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold text-dark">{cert.title}</div>
                            <div className="text-muted small">Penerbit: {cert.issuer}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              Token ID: <span className="font-monospace text-primary">{cert.token_id}</span> • {cert.minted_at_formatted}
                            </div>
                          </div>
                          <Badge bg="light" className="text-success border d-flex align-items-center gap-1">
                            <ShieldCheck size={14} /> Terkunci (ERC-5192)
                          </Badge>
                        </div>
                        <div className="mt-3 pt-2 border-top d-flex justify-content-end gap-2">
                          <a
                            href={`/certificate/verify/${cert.ticket_code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                          >
                            <ExternalLink size={14} /> Buka Public Verifier
                          </a>
                          <a
                            href={cert.polygonscan_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-success btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                          >
                            <ExternalLink size={14} /> PolygonScan
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="light" className="rounded-pill border" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecruiterDashboardPage;
