import React, { useState } from 'react';
import { Modal, Button, Badge, Spinner, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ThesisPrototypeFloatingBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [resultData, setResultData] = useState(null);

  // 1. Action: Simulasi Selesai Modul AI SRL Chintya (Flow 6 & 7)
  const handleSimulateSrlCompletion = async () => {
    setLoadingAction('srl');
    setResultData(null);
    try {
      const activeUserId = user?.id || 9; // Fallback ke akun Brigitta (ID: 9) atau demo user
      const res = await api.post('/webhook/srl-graduated', {
        user_id: activeUserId,
        modul_id: 'MOD-AI-201',
        score: 95,
        status_lulus: true,
        student_name: user?.name || 'Brigitta Caitlin Surya Adiwangsa',
        skill_category: 'Deep Learning & Neural Networks'
      });

      if (res.data?.success) {
        setResultData({
          type: 'srl_success',
          title: 'Payload AI SRL (Chintya) Diterima!',
          points: res.data.data.points_awarded,
          totalPoints: res.data.data.total_points,
          tier: res.data.data.current_tier,
          tierUpgraded: res.data.data.tier_upgraded,
          rank: res.data.data.current_rank,
          sbt: res.data.data.sbt
        });
      }
    } catch (err) {
      console.error('Error saat simulasi AI SRL:', err);
      alert('Gagal memproses webhook AI SRL: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Action: Tambah Poin Instan Tanpa Menunggu Event (Quick Points)
  const handleAddInstantPoints = async () => {
    setLoadingAction('points');
    setResultData(null);
    try {
      const activeUserId = user?.id || 9;
      const res = await api.post('/webhook/add-instant-points', {
        user_id: activeUserId,
        points: 300,
        reason: 'Simulasi Poin Interaktif Live Demo'
      });

      if (res.data?.success) {
        setResultData({
          type: 'points_success',
          title: 'Poin Instan Berhasil Ditambahkan!',
          points: res.data.data.points_added,
          totalPoints: res.data.data.total_points,
          tier: res.data.data.current_tier,
          tierUpgraded: res.data.data.tier_upgraded,
          rank: res.data.data.rank
        });
      }
    } catch (err) {
      console.error('Error saat tambah poin instan:', err);
      alert('Gagal menambah poin instan: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Action: Reset Demo State ke Silver (2450 Pts) untuk Presentasi Ulang
  const handleResetDemo = async () => {
    setLoadingAction('reset');
    setResultData(null);
    try {
      const res = await api.post('/webhook/reset-demo');
      if (res.data?.success) {
        setResultData({
          type: 'reset_success',
          title: 'Status Demo Berhasil Di-Reset!',
          points: 0,
          totalPoints: res.data.data.points,
          tier: res.data.data.initial_tier,
          tierUpgraded: false,
          rank: '13 (Silver)',
        });
      }
    } catch (err) {
      console.error('Error saat reset demo:', err);
      alert('Gagal reset demo: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  const flowSteps = [
    { num: 1, label: 'Login Member', path: '/login', desc: 'part@kampusx.com / kampusx123' },
    { num: 2, label: 'Dashboard Student Hub', path: '/dashboard', desc: 'Profil mahasiswa & poin awal' },
    { num: 3, label: 'Gamifikasi Multi-Tier', path: '/leaderboard', desc: 'Papan peringkat real-time DB' },
    { num: 4, label: 'Reward Decision Engine', path: '/events/1', desc: 'Diskon adaptif Thompson Sampling' },
    { num: 5, label: 'Interactive Commerce', path: '/checkout/1', desc: 'Redis Seat-Locking 15m & Bayar' },
    { num: 6, label: 'Integrasi AI dan SRL', action: 'trigger_srl', desc: 'Menerima payload modul Chintya' },
    { num: 7, label: 'Minting Soulbound Token', action: 'trigger_sbt', desc: 'Smart Contract Polygon ERC-5192' },
    { num: 8, label: 'Public Verifier & Recruiter', path: '/talents', desc: 'Match Score & Verifikasi On-Chain' },
  ];

  return (
    <>
      {/* Floating Action Pill Button (Discrete & Non-Intrusive) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '1.5px solid #38bdf8',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
        >
          <Zap size={16} color="#38bdf8" />
          <span>Demo Alur</span>
        </button>
      </div>

      {/* Simulator Control Center Modal */}
      <Modal
        show={isOpen}
        onHide={() => setIsOpen(false)}
        size="lg"
        centered
        contentClassName="border-0 shadow-2xl rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4 bg-light rounded-top-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge bg="primary" className="px-2.5 py-1 rounded-pill">
                PROTOTYPE CONTROL CENTER
              </Badge>
              
            </div>
            <h5 className="fw-bold text-dark mb-0">Simulasi Alur Tugas Akhir Brigitta & Chintya</h5>
          </div>
        </Modal.Header>

        <Modal.Body className="p-4 bg-light">
          {/* Quick Action Simulation Buttons */}
          <div className="bg-white rounded-3 p-3 border mb-4 shadow-sm">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <Sparkles size={16} className="text-warning" />
              <span>Simulasi Cepat (Tanpa Menunggu Event / Modul)</span>
            </h6>
            <p className="text-muted small mb-3">
              Gunakan tombol di bawah saat mempresentasikan Flow 6 & 7 di depan dosen pembimbing/penguji:
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2">
              <Button
                variant="primary"
                className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 rounded-3 fw-semibold shadow-sm"
                onClick={handleSimulateSrlCompletion}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'srl' ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Award size={17} />
                )}
                <span>Simulasi Lulus AI SRL Chintya (+500 Pts & Minting SBT)</span>
              </Button>

              <Button
                variant="outline-dark"
                className="d-flex align-items-center justify-content-center gap-2 py-2.5 rounded-3 fw-semibold"
                onClick={handleAddInstantPoints}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'points' ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Zap size={16} />
                )}
                <span>+300 Poin Instan</span>
              </Button>
            </div>
          </div>

          {/* Feedback Hasil Simulasi */}
          {resultData && (
            <div className="alert alert-success border-success-subtle rounded-3 p-3 mb-4 shadow-sm">
              <div className="d-flex align-items-center gap-2 mb-2">
                <CheckCircle2 size={20} className="text-success" />
                <h6 className="fw-bold text-success mb-0">{resultData.title}</h6>
              </div>
              <div className="small mb-3 text-dark">
                Poin diperoleh: <strong className="text-success">+{resultData.points} Global Points</strong>. 
                Total Poin Saat Ini: <strong>{resultData.totalPoints}</strong> (Tier: <strong>{resultData.tier}</strong>).
                {resultData.tierUpgraded && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    🎉 TIER UPGRADED!
                  </Badge>
                )}
              </div>

              {resultData.sbt && (
                <div className="p-3 bg-white rounded-3 border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      ERC-5192 Soulbound Token Minted On-Chain
                    </span>
                    <span className="small text-muted font-monospace">{resultData.sbt.network}</span>
                  </div>
                  <div className="fw-bold text-primary small mb-1">{resultData.sbt.title}</div>
                  <div className="small text-muted font-monospace text-truncate">
                    TxHash: {resultData.sbt.tx_hash}
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/leaderboard');
                  }}
                >
                  Lihat Posisi di Leaderboard ➔
                </Button>
                <Button
                  size="sm"
                  variant="outline-success"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/talents');
                  }}
                >
                  Cek di Recruiter View (Step 8) ➔
                </Button>
              </div>
            </div>
          )}

          {/* Step-by-Step Navigator according to Slide 20 */}
          <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <Layers size={16} className="text-primary" />
            <span>Navigasi Langsung 8 Langkah Alur (Slide 20)</span>
          </h6>

          <div className="row g-2">
            {flowSteps.map((step) => {
              const isCurrent = step.path && location.pathname.startsWith(step.path);
              return (
                <div key={step.num} className="col-md-6">
                  <div
                    className={`p-2.5 rounded-3 border bg-white d-flex align-items-center justify-content-between ${
                      isCurrent ? 'border-primary shadow-sm bg-primary-subtle' : ''
                    }`}
                    style={{ cursor: step.path ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (step.path) {
                        setIsOpen(false);
                        navigate(step.path);
                      } else if (step.action === 'trigger_srl' || step.action === 'trigger_sbt') {
                        handleSimulateSrlCompletion();
                      }
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{
                          width: '26px',
                          height: '26px',
                          fontSize: '11px',
                          background: isCurrent ? '#0d6efd' : '#64748b'
                        }}
                      >
                        {step.num}
                      </div>
                      <div className="overflow-hidden">
                        <div className="fw-bold text-dark small text-truncate" style={{ fontSize: '13px' }}>
                          {step.label}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                    {step.path ? (
                      <ChevronRight size={15} className="text-muted flex-shrink-0 ms-2" />
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border flex-shrink-0 ms-2" style={{ fontSize: '10px' }}>
                        Auto Trigger
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 px-4 pb-4 bg-light rounded-bottom-4 d-flex justify-content-between align-items-center">
          <Button
            variant="outline-danger"
            size="sm"
            className="rounded-pill px-3 d-flex align-items-center gap-1.5"
            onClick={handleResetDemo}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'reset' ? <Spinner animation="border" size="sm" /> : <RotateCcw size={14} />}
            <span>Reset State Presentasi (2.450 Pts / Silver)</span>
          </Button>

          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setIsOpen(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ThesisPrototypeFloatingBar;
