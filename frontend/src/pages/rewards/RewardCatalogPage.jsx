import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table, Modal, Tab, Tabs } from 'react-bootstrap';
import {
  Gift,
  Sparkles,
  Cpu,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const RewardCatalogPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [recommending, setRecommending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [decisionLogs, setDecisionLogs] = useState([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCatalog();
    fetchLogs();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rewards');
      if (res.data?.success) {
        setCatalog(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching rewards catalog:', err);
      setError('Gagal memuat katalog reward dari backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/rewards/decision-logs');
      if (res.data?.success) {
        setDecisionLogs(res.data.data || []);
      }
    } catch (err) {
      console.warn('Gagal memuat log keputusan:', err);
    }
  };

  const handleGetRecommendation = async () => {
    try {
      setRecommending(true);
      setFeedbackSuccess(null);
      setError(null);
      const res = await api.post('/rewards/recommend', {
        base_price: 50000,
      });
      if (res.data?.success) {
        setRecommendation(res.data.data);
        fetchLogs();
      }
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Gagal mengeksekusi Reward Decision Engine.');
    } finally {
      setRecommending(false);
    }
  };

  const handleClaimReward = async () => {
    if (!recommendation?.decision_log_id) return;

    try {
      setClaiming(true);
      const res = await api.post('/rewards/claim', {
        decision_log_id: recommendation.decision_log_id,
        action: 'claimed',
      });
      if (res.data?.success) {
        setFeedbackSuccess('Reward berhasil diklaim! Respons telah dicatat ke Feedback Loop dan kuota telah diperbarui.');
        fetchCatalog();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError(err.response?.data?.message || 'Gagal mengklaim reward.');
    } finally {
      setClaiming(false);
    }
  };

  const formatRewardType = (type) => {
    switch (type) {
      case 'ticket_discount':
        return 'Diskon Tiket Event';
      case 'bonus_points':
        return 'Bonus Poin Gamifikasi';
      case 'exclusive_access':
        return 'Akses Eksklusif VIP';
      default:
        return type;
    }
  };

  return (
    <Container className="py-4 py-md-5">
      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <Row className="align-items-center g-4">
          <Col md={8}>
            
            <h2 className="fw-bold text-dark mb-1">Katalog & Rekomendasi Reward</h2>
            <p className="text-muted mb-0">
              Sistem rekomendasi adaptif yang menentukan insentif terbaik bagi mahasiswa berdasarkan konteks belajar, histori konversi, serta kendala kuota dan anggaran (Integer Programming).
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <Button
              variant="primary"
              size="lg"
              className="rounded-pill px-4 py-2 shadow-sm d-inline-flex align-items-center gap-2 fw-bold"
              onClick={handleGetRecommendation}
              disabled={recommending}
            >
              {recommending ? (
                <>
                  <Spinner animation="border" size="sm" /> Memproses AI Sampling...
                </>
              ) : (
                <>
                  <Cpu size={20} /> Jalankan AI Recommendation
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {feedbackSuccess && <Alert variant="success" dismissible onClose={() => setFeedbackSuccess(null)}>{feedbackSuccess}</Alert>}

      {/* RECOMMENDED REWARD CARD (Jika sudah dijalankan) */}
      {recommendation && (
        <Card className="border-primary border-2 rounded-4 shadow-sm mb-4 bg-white">
          <Card.Header className="bg-primary-subtle border-bottom border-primary-subtle p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              {/* <div className="p-2 bg-primary text-white rounded-3"> */}
                {/* <Sparkles size={20} /> */}
              {/* </div> */}
              <div>
                <h5 className="fw-bold text-primary mb-0">Hasil Rekomendasi Reward (Recommended Reward)</h5>
                {/* <span className="text-muted small">Algoritma: Thompson Sampling Beta-Bernoulli + DISCO Integer Programming</span> */}
              </div>
            </div>
            {/* <Badge bg="primary" className="px-3 py-1 rounded-pill">
              STATUS: {recommendation.allocation_status.toUpperCase()}
            </Badge> */}
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              <Col md={6}>
                <div className="text-muted small fw-bold text-uppercase mb-2">Profil & Konteks Mahasiswa:</div>
                <div className="p-3 bg-light rounded-4 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Nama Mahasiswa:</span>
                    <strong className="text-dark small">{recommendation.user?.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Tier Gamifikasi:</span>
                    <Badge bg="warning" text="dark" className="rounded-pill small">{recommendation.user?.tier}</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Total Poin:</span>
                    <strong className="text-primary small">{recommendation.user?.points} Poin</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Partisipasi Event:</span>
                    <span className="text-dark small">{recommendation.context?.events_attended} Seminar</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Microlearning Selesai:</span>
                    <span className="text-dark small">{recommendation.context?.microlearning_completed} Modul</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-muted small fw-bold text-uppercase mb-2">Thompson Sampling Score:</div>
                  <div className="p-3 bg-light rounded-4 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-bold">Skor Sampling Terpilih:</span>
                      <span className="badge bg-success fs-6">{recommendation.sampling_score}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Distribusi sampel Beta-Bernoulli per Arm:
                    </div>
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {recommendation.thompson_samples && Object.entries(recommendation.thompson_samples).map(([arm, score]) => (
                        <Badge key={arm} bg={arm === recommendation.selected_arm ? 'primary' : 'light'} text={arm === recommendation.selected_arm ? 'white' : 'dark'} className="border px-2 py-1">
                          {arm.replace('REWARD_', '')}: {score}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="text-muted small fw-bold text-uppercase mb-2">Reward Terpilih:</div>
                <div className="p-4 bg-success-subtle rounded-4 border border-success-subtle text-dark">
                  <h4 className="fw-bold mb-1 text-success">{recommendation.reward?.name}</h4>
                  <p className="small text-muted mb-3">{recommendation.reward?.description}</p>
                  
                  <div className="d-flex justify-content-between align-items-center border-top border-success-subtle pt-2 mb-3">
                    <span className="small">Sisa Kuota Tersedia:</span>
                    <strong className="text-dark">{recommendation.reward?.remaining_quota} Kuota</strong>
                  </div>

                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="text-muted small fw-bold mb-1 d-flex align-items-center gap-1">
                      <Info size={14} /> Alasan Keputusan Analitis (Rule & Context Generated):
                    </div>
                    <p className="text-dark small mb-0 font-monospace">
                      "{recommendation.decision_reason}"
                    </p>
                  </div>

                  <Button
                    variant="success"
                    className="w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={handleClaimReward}
                    disabled={claiming}
                  >
                    {claiming ? <Spinner animation="border" size="sm" /> : <Gift size={18} />}
                    Klaim Reward Ini (Trigger Feedback Loop)
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Tabs Katalog vs Log Keputusan */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-tabs"
      >
        <Tab eventKey="catalog" title="Katalog Reward (Kapasitas & Anggaran)">
          <Row className="g-4">
            {catalog.map((item, idx) => (
              <Col md={6} lg={4} key={idx}>
                <Card className="h-100 rounded-4 border shadow-sm">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="light" className="text-dark border px-2 py-1 rounded-pill small">
                          {formatRewardType(item.reward_type)}
                        </Badge>
                        <Badge bg={item.remaining_quota > 0 ? 'success' : 'danger'} className="rounded-pill">
                          Sisa: {item.remaining_quota} / {item.quota}
                        </Badge>
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{item.name}</h5>
                      <p className="text-muted small mb-3">{item.description}</p>
                    </div>

                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Nilai Reward</span>
                        <div className="fw-bold text-primary">
                          {item.reward_type === 'ticket_discount' ? `${item.reward_value}% Diskon` : (item.reward_type === 'bonus_points' ? `+${item.reward_value} Poin` : 'Akses VIP')}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-muted" style={{ fontSize: '11px' }}>Biaya Finansial</span>
                        <div className="text-dark fw-bold small">
                          Rp {Number(item.cost_budget).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab eventKey="logs" title={`Audit Log Keputusan AI Bandit (${decisionLogs.length})`}>
          <Card className="border rounded-4 shadow-sm">
            <Card.Header className="bg-white p-4 border-bottom">
              <h5 className="fw-bold text-dark mb-1">Riwayat Pengambilan Keputusan (Decision Logs)</h5>
              <p className="text-muted small mb-0">Tabel pembuktian ilmiah untuk kebutuhan Seminar Tugas Akhir (STA).</p>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Waktu Keputusan</th>
                      <th className="py-3">Arm Terpilih</th>
                      <th className="py-3">Konteks & Alasan</th>
                      <th className="py-3 text-center">Status Alokasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisionLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          Belum ada decision log. Tekan tombol "Jalankan AI Recommendation" untuk memicu keputusan baru.
                        </td>
                      </tr>
                    ) : (
                      decisionLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-muted small">
                            {new Date(log.created_at || log.decided_at).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3">
                            <Badge bg="primary" className="px-2 py-1 rounded-pill">
                              {log.selected_arm}
                            </Badge>
                          </td>
                          <td className="py-3 small text-dark" style={{ maxWidth: '400px' }}>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              Tier: {log.context_used?.tier || 'Silver'} | Poin: {log.context_used?.points || 0}
                            </div>
                            <div className="mt-1">{log.decision_reason}</div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge bg={log.allocation_status === 'claimed' ? 'success' : 'warning'} className="rounded-pill">
                              {log.allocation_status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default RewardCatalogPage;
