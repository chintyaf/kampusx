import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {
  Coins,
  ArrowRight,
  Calendar,
  CheckSquare,
  Users,
  Image as ImageIcon,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Copy,
  Gift,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import './RewardsCenter.css';

// === DUMMY DATA LENGKAP & REALISTIS UNTUK KATALOG GLOBAL & LOKAL ===
const MOCK_GLOBAL_REWARDS = [
  {
    id: 1,
    title: 'Voucher Pulsa 20.000',
    points_cost: 2,
    stock: 9,
    reward_type: 'digital',
    description: 'Voucher pulsa all operator senilai Rp 20.000 langsung masuk ke nomor HP terdaftar.'
  },
  {
    id: 2,
    title: 'Voucher GoPay 50.000',
    points_cost: 5,
    stock: 14,
    reward_type: 'digital',
    description: 'Saldo GoPay sebesar Rp 50.000 untuk transaksi transportasi dan GoFood.'
  },
  {
    id: 3,
    title: 'Merchandise KampusX',
    points_cost: 10,
    stock: 3,
    reward_type: 'physical',
    description: 'Paket merchandise eksklusif KampusX (Tote bag kanvas, tumbler stainless, dan sticker pack).'
  },
  {
    id: 4,
    title: 'Diskon Event 30%',
    points_cost: 3,
    stock: 25,
    reward_type: 'digital',
    description: 'Potongan harga tiket pendaftaran workshop dan seminar berbayar di KampusX sebesar 30%.'
  },
  {
    id: 5,
    title: 'Spotify Premium 1 Bulan',
    points_cost: 8,
    stock: 12,
    reward_type: 'digital',
    description: 'Akun kode voucher Spotify Premium Individual aktif selama 30 hari tanpa iklan.'
  },
  {
    id: 6,
    title: 'Kaos Eksklusif KampusX',
    points_cost: 12,
    stock: 5,
    reward_type: 'physical',
    description: 'Kaos cotton combed 24s edisi terbatas dengan sablon logo reflektif KampusX.'
  }
];

const MOCK_LOCAL_REWARDS = [
  {
    id: 101,
    title: 'Voucher Kantin Kampus Rp 15.000',
    points_cost: 50,
    stock: 20,
    reward_type: 'physical',
    description: 'Voucher makan di area food court kampus yang berpartisipasi.'
  },
  {
    id: 102,
    title: 'Free Co-Working Pass 1 Hari',
    points_cost: 75,
    stock: 15,
    reward_type: 'service',
    description: 'Akses penuh seharian ke student hub & co-working space mitra kampus.'
  },
  {
    id: 103,
    title: 'Merchandise BEM / Himpunan',
    points_cost: 100,
    stock: 8,
    reward_type: 'physical',
    description: 'Lanyard dan pin enamel resmi kepengurusan mahasiswa kampus.'
  },
  {
    id: 104,
    title: 'Tiket Seminar Jurusan Gratis',
    points_cost: 120,
    stock: 10,
    reward_type: 'digital',
    description: 'Tiket akses prioritas seminar teknologi dan karir fakultas.'
  }
];

const INITIAL_RECENT_HISTORY = [
  { id: 'h1', title: 'Menghadiri Workshop AI', date: '25 Agu 2026', amount: 10, type: 'plus' },
  { id: 'h2', title: 'Tukar Voucher GoPay', date: '12 Jan 2026', amount: 5, type: 'minus' },
  { id: 'h3', title: 'Juara 1 Hackathon Kampus', date: '08 Jan 2026', amount: 25, type: 'plus' },
  { id: 'h4', title: 'Registrasi Event UI/UX', date: '05 Jan 2026', amount: 2, type: 'plus' },
  { id: 'h5', title: 'Kuis Mingguan KampusX', date: '01 Jan 2026', amount: 5, type: 'plus' }
];

const GlobalRewardCatalog = () => {
  const navigate = useNavigate();

  // Active Catalog Tab: 'global' (default sesuai wireframe) vs 'local'
  const [activeTab, setActiveTab] = useState('global');

  // Balances
  const [localBalance, setLocalBalance] = useState(150);
  const [globalBalance, setGlobalBalance] = useState(3);

  // Rewards list state
  const [globalRewards, setGlobalRewards] = useState(MOCK_GLOBAL_REWARDS);
  const [localRewards, setLocalRewards] = useState(MOCK_LOCAL_REWARDS);

  // History state
  const [recentHistory, setRecentHistory] = useState(INITIAL_RECENT_HISTORY);

  // Quests state
  const [quests] = useState([
    { id: 'q1', title: 'Hadiri 3 Event Bulan Ini', reward: '+15 Poin', current: 1, target: 3 },
    { id: 'q2', title: 'Ajak 2 Teman', reward: '+20 Poin', current: 0, target: 2 },
    { id: 'q3', title: 'Lulus 1 Modul SRL Microlearning', reward: '+20 Poin', current: 1, target: 1 }
  ]);

  // Modal States
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemNotes, setRedeemNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successVoucherCode, setSuccessVoucherCode] = useState('');

  // Referral Modal State
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  // Coba sinkronisasi saldo jika backend tersedia
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profile/ledger').catch(() => null);
        if (res?.data?.success && res.data.data) {
          if (res.data.data.global_balance !== undefined) {
            setGlobalBalance(res.data.data.global_balance);
          }
        }
        const rewardRes = await api.get('/global-rewards').catch(() => null);
        if (rewardRes?.data?.success && Array.isArray(rewardRes.data.data) && rewardRes.data.data.length > 0) {
          setGlobalRewards(rewardRes.data.data);
        }
      } catch (err) {
        console.warn('Menggunakan fallback data reward:', err);
      }
    })();
  }, []);

  const currentRewardsList = activeTab === 'global' ? globalRewards : localRewards;
  const currentBalance = activeTab === 'global' ? globalBalance : localBalance;

  // Handle Buka Modal Tukar Reward
  const handleOpenRedeemModal = (reward) => {
    setSelectedReward(reward);
    setRedeemNotes('');
    setShowRedeemModal(true);
  };

  // Eksekusi Penukaran Reward
  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

    if (currentBalance < selectedReward.points_cost) {
      alert('Poin Anda belum mencukupi untuk menukarkan reward ini.');
      return;
    }

    setSubmitting(true);
    try {
      // Coba kirim ke API backend jika endpoint tersedia
      if (activeTab === 'global') {
        await api.post('/global-rewards/redeem', {
          reward_id: selectedReward.id,
          notes: redeemNotes
        }).catch(() => null);
      }

      // Generate random claim code
      const generatedCode = `KX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setSuccessVoucherCode(generatedCode);

      // Deduct balance
      if (activeTab === 'global') {
        setGlobalBalance((prev) => Math.max(0, prev - selectedReward.points_cost));
        setGlobalRewards((prev) =>
          prev.map((item) =>
            item.id === selectedReward.id
              ? { ...item, stock: Math.max(0, item.stock - 1) }
              : item
          )
        );
      } else {
        setLocalBalance((prev) => Math.max(0, prev - selectedReward.points_cost));
        setLocalRewards((prev) =>
          prev.map((item) =>
            item.id === selectedReward.id
              ? { ...item, stock: Math.max(0, item.stock - 1) }
              : item
          )
        );
      }

      // Tambahkan ke riwayat terbaru
      const newHistoryItem = {
        id: `h-${Date.now()}`,
        title: `Tukar ${selectedReward.title}`,
        date: 'Hari ini',
        amount: selectedReward.points_cost,
        type: 'minus'
      };
      setRecentHistory((prev) => [newHistoryItem, ...prev.slice(0, 4)]);

      setShowRedeemModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Gagal menukarkan reward:', err);
      alert('Gagal memproses penukaran reward.');
    } finally {
      setSubmitting(false);
    }
  };

  // Referral Copy Link
  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://kampusx.id/r/BUDI2026');
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <div className="rewards-page-wrapper">
      <Container className="pt-4 pt-md-5">
        {/* ==================== 1. PAGE HEADER ==================== */}
        <div className="mb-4">
          <h1 className="rewards-header-title">Pusat Reward & Loyalty</h1>
          <p className="rewards-header-subtitle">
            Tukarkan poin loyalty KampusX Anda dengan merchandise eksklusif dan penawaran menarik.
          </p>
        </div>

        {/* ==================== 2. MAIN 2-COLUMN LAYOUT ==================== */}
        <Row className="g-4">
          {/* ==================== LEFT COLUMN (CATALOG & BALANCES) ==================== */}
          <Col lg={8}>
            {/* ROW 1: BALANCE CARDS */}
            <Row className="g-3 mb-4">
              {/* Card Poin Lokal */}
              <Col sm={6}>
                <div className="balance-card">
                  <div className="balance-card-header">
                    <span className="balance-tag-pill">Poin Lokal</span>
                    <button
                      type="button"
                      className="balance-link-btn"
                      onClick={() => navigate('/member/points/history?type=local')}
                      title="Lihat Mutasi Poin Lokal"
                    >
                      <span>Lihat Riwayat</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="balance-body-row">
                    <div className="balance-coin-circle local">
                      <Coins size={24} />
                    </div>
                    <div>
                      <div className="balance-number-display">{localBalance}</div>
                      <div className="balance-unit-label">Poin Lokal</div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Card Poin Global */}
              <Col sm={6}>
                <div className="balance-card">
                  <div className="balance-card-header">
                    <span className="balance-tag-pill">Poin Global</span>
                    <button
                      type="button"
                      className="balance-link-btn"
                      onClick={() => navigate('/member/points/history?type=global')}
                      title="Lihat Mutasi Poin Global"
                    >
                      <span>Lihat Riwayat</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="balance-body-row">
                    <div className="balance-coin-circle global">
                      <Coins size={24} />
                    </div>
                    <div>
                      <div className="balance-number-display">{globalBalance}</div>
                      <div className="balance-unit-label">Poin Global</div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* ROW 2: CARA MENDAPATKAN POIN (3 INTERACTIVE ACTION CARDS) */}
            <div className="mb-4">
              <h5 className="earn-points-title">Cara Mendapatkan Poin</h5>
              <Row className="g-3">
                {/* 1. Hadiri Event -> Navigate to /explore-events */}
                <Col sm={4}>
                  <div
                    className="earn-step-card"
                    onClick={() => navigate('/explore-events')}
                    title="Jelajahi event dan kumpulkan poin"
                  >
                    <div className="earn-step-icon">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="earn-step-headline">Hadiri Event</div>
                      <p className="earn-step-desc">
                        Dapatkan poin setiap menghadiri event kampus
                      </p>
                    </div>
                  </div>
                </Col>

                {/* 2. Selesaikan Quest -> Scroll to Quests */}
                <Col sm={4}>
                  <div
                    className="earn-step-card"
                    onClick={() => {
                      const questElement = document.getElementById('quests-section');
                      if (questElement) {
                        questElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    title="Cek tantangan aktif di samping"
                  >
                    <div className="earn-step-icon">
                      <CheckSquare size={20} />
                    </div>
                    <div>
                      <div className="earn-step-headline">Selesaikan Quest</div>
                      <p className="earn-step-desc">
                        Selesaikan tantangan mingguan untuk bonus poin
                      </p>
                    </div>
                  </div>
                </Col>

                {/* 3. Referral Teman -> Open Referral Modal */}
                <Col sm={4}>
                  <div
                    className="earn-step-card"
                    onClick={() => setShowReferralModal(true)}
                    title="Bagikan link referral ke teman"
                  >
                    <div className="earn-step-icon">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="earn-step-headline">Referral Teman</div>
                      <p className="earn-step-desc">
                        Ajak teman bergabung dan dapatkan poin tambahan
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* ROW 3: CATALOG TABS NAVIGATION (KATALOG LOKAL VS GLOBAL) */}
            <div className="reward-catalog-tabs">
              <button
                type="button"
                className={`reward-tab-btn ${activeTab === 'local' ? 'active' : ''}`}
                onClick={() => setActiveTab('local')}
              >
                Katalog Lokal
              </button>
              <button
                type="button"
                className={`reward-tab-btn ${activeTab === 'global' ? 'active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                Katalog Global
              </button>
            </div>

            {/* ROW 4: REWARD ITEMS GRID (2-COLUMN GRID MATCHING WIREFRAME) */}
            <Row className="g-4">
              {currentRewardsList.map((reward) => {
                const isOutOfStock = reward.stock <= 0;
                const isInsufficient = currentBalance < reward.points_cost;

                return (
                  <Col sm={6} key={reward.id}>
                    <div className="reward-item-card">
                      {/* Image Box */}
                      <div className="reward-image-container">
                        <div className="reward-image-placeholder">
                          <ImageIcon size={38} strokeWidth={1.5} />
                          <span>PLACEHOLDER</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="reward-card-body">
                        <h6 className="reward-title-text" title={reward.title}>
                          {reward.title}
                        </h6>

                        {/* Price & Stock */}
                        <div className="reward-price-stock-row">
                          <div className="reward-points-badge">
                            <Ticket size={15} className="text-secondary" />
                            <span>
                              {reward.points_cost} {activeTab === 'global' ? 'Poin' : 'Poin Lokal'}
                            </span>
                          </div>
                          <span className="reward-stock-pill">
                            Stok: {reward.stock}
                          </span>
                        </div>

                        {/* Tukar Reward Action Button */}
                        <button
                          type="button"
                          className="btn-tukar-reward"
                          onClick={() => handleOpenRedeemModal(reward)}
                          disabled={isOutOfStock || isInsufficient}
                          title={
                            isOutOfStock
                              ? 'Stok reward telah habis'
                              : isInsufficient
                              ? 'Poin Anda belum mencukupi'
                              : 'Klik untuk menukar reward ini'
                          }
                        >
                          {isOutOfStock
                            ? 'Stok Habis'
                            : isInsufficient
                            ? 'Poin Kurang'
                            : 'Tukar Reward'}
                        </button>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>

          {/* ==================== RIGHT COLUMN (SIDEBAR) ==================== */}
          <Col lg={4}>
            {/* CARD 1: RIWAYAT POIN TERBARU */}
            <div className="rewards-sidebar-card">
              <h5 className="sidebar-title-header">Riwayat Poin Terbaru</h5>

              <div className="mb-2">
                {recentHistory.map((item) => (
                  <div key={item.id} className="point-history-item">
                    <div className="d-flex align-items-center">
                      <div className={`point-history-icon ${item.type}`}>
                        {item.type === 'plus' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="point-history-title">{item.title}</div>
                        <div className="point-history-date">{item.date}</div>
                      </div>
                    </div>
                    <div className={`point-history-amount ${item.type}`}>
                      {item.type === 'plus' ? `+${item.amount}` : `-${item.amount}`}
                    </div>
                  </div>
                ))}
              </div>

              {/* View All History Link */}
              <button
                type="button"
                className="btn-sidebar-view-all"
                onClick={() => navigate('/member/points/history')}
                title="Lihat seluruh mutasi riwayat poin"
              >
                <span>Lihat Semua</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* CARD 2: DAPATKAN POIN TAMBAHAN (ACTIVE QUESTS) */}
            <div className="rewards-sidebar-card" id="quests-section">
              <h5 className="sidebar-title-header">Dapatkan Poin Tambahan</h5>

              <div>
                {quests.map((quest) => {
                  const progressPct = Math.min(
                    100,
                    Math.round((quest.current / quest.target) * 100)
                  );
                  return (
                    <div key={quest.id} className="quest-item-box">
                      <div className="quest-header-row">
                        <span className="quest-title-text">{quest.title}</span>
                        <span className="quest-points-reward">{quest.reward}</span>
                      </div>
                      <div className="quest-progress-track">
                        <div
                          className="quest-progress-bar"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: progressPct === 100 ? '#10b981' : '#64748b'
                          }}
                        />
                      </div>
                      <div className="quest-fraction-text">
                        {quest.current} / {quest.target}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ==================== MODAL: KONFIRMASI TUKAR REWARD ==================== */}
      <Modal
        show={showRedeemModal}
        onHide={() => setShowRedeemModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '20px' }}
      >
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0 text-dark">Konfirmasi Penukaran</h5>
            <span className="badge bg-light text-dark border">
              {activeTab === 'global' ? 'Katalog Global' : 'Katalog Lokal'}
            </span>
          </div>

          {selectedReward && (
            <div>
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="fw-bold text-dark fs-6 mb-1">{selectedReward.title}</div>
                <div className="small text-muted mb-2">{selectedReward.description}</div>
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="small text-muted">Biaya Poin:</span>
                  <span className="fw-bold text-primary fs-6">
                    {selectedReward.points_cost} Poin
                  </span>
                </div>
              </div>

              {/* Rincian Saldo */}
              <div className="small text-muted mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Saldo Anda Saat Ini:</span>
                  <span className="fw-bold text-dark">{currentBalance} Poin</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Sisa Saldo Setelah Ditukar:</span>
                  <span className="fw-bold text-success">
                    {currentBalance - selectedReward.points_cost} Poin
                  </span>
                </div>
              </div>

              {/* Input Catatan / No HP */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">
                  Catatan / Nomor HP Pengiriman Voucher (Opsional):
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: 08123456789 atau catatan pengiriman"
                  value={redeemNotes}
                  onChange={(e) => setRedeemNotes(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </Form.Group>
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="outline-secondary"
              className="w-100 rounded-pill py-2"
              onClick={() => setShowRedeemModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="dark"
              className="w-100 rounded-pill py-2 fw-bold"
              onClick={handleConfirmRedeem}
              disabled={submitting}
            >
              {submitting ? 'Memproses...' : 'Konfirmasi Tukar'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ==================== MODAL: SUKSES PENUKARAN REWARD ==================== */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 68, height: 68, backgroundColor: '#dcfce7', color: '#16a34a' }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h5 className="fw-bold text-dark mb-1">Penukaran Berhasil!</h5>
          <p className="text-muted small mb-3">
            Reward Anda telah berhasil diproses. Simpan kode klaim voucher berikut:
          </p>

          <div className="p-3 bg-light rounded-3 border mb-3">
            <div className="small text-muted mb-1">Kode Klaim Voucher:</div>
            <div className="fw-bold fs-5 text-dark font-monospace">{successVoucherCode}</div>
          </div>

          <Button
            variant="dark"
            className="w-100 rounded-pill py-2 fw-bold"
            onClick={() => setShowSuccessModal(false)}
          >
            Selesai
          </Button>
        </Modal.Body>
      </Modal>

      {/* ==================== MODAL: REFERRAL TEMAN ==================== */}
      <Modal
        show={showReferralModal}
        onHide={() => setShowReferralModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 68, height: 68, backgroundColor: '#e0f2fe', color: '#0284c7' }}
          >
            <Users size={32} />
          </div>

          <h5 className="fw-bold text-dark mb-1">Ajak Teman & Dapatkan Poin</h5>
          <p className="text-muted small mb-4">
            Bagikan tautan referral Anda. Setiap teman yang mendaftar dan memverifikasi profil, Anda
            akan mendapatkan <strong className="text-dark">+200 Poin</strong>!
          </p>

          <div className="d-flex align-items-center gap-2 p-2 border rounded-pill bg-light mb-4">
            <span className="small text-truncate ps-3 text-dark fw-mono flex-fill">
              https://kampusx.id/r/BUDI2026
            </span>
            <Button
              variant="dark"
              size="sm"
              className="rounded-pill px-3 py-1-5 fw-bold"
              onClick={handleCopyReferral}
            >
              {referralCopied ? <CheckCircle2 size={14} className="me-1" /> : <Copy size={14} className="me-1" />}
              {referralCopied ? 'Tersalin!' : 'Salin'}
            </Button>
          </div>

          <Button
            variant="outline-secondary"
            className="w-100 rounded-pill py-2"
            onClick={() => setShowReferralModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GlobalRewardCatalog;