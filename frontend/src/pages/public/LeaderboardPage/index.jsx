import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Ticket,
  MessageSquare,
  Users,
  Sparkles,
  Gift,
  Award,
  Clock,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Brain,
  Info
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './LeaderboardPage.css';

// === DUMMY DATA LENGKAP & REALISTIS UNTUK BERBAGAI PERIODE ===
const MOCK_LEADERBOARD_DATA = {
  bulanan: {
    periodLabel: 'Bulanan (Oktober 2026)',
    daysRemaining: '12 hari 08 jam',
    currentUser: {
      id: 'current-user',
      name: 'Kamu (Budi Pratama)',
      initials: 'KM',
      rank: 12,
      points: 2450,
      nextRankPoints: 2500,
      nextRank: 11,
      tier: 'Silver',
      campus: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      eventsAttended: 5,
      trend: 'up',
      trendCount: '+3 peringkat'
    },
    topThree: [
      {
        id: 2,
        rank: 2,
        name: 'Rian Hidayat',
        initials: 'RI',
        points: 4820,
        tier: 'Platinum',
        campus: 'Institut Teknologi Bandung',
        eventsAttended: 15,
        sbtVerified: true
      },
      {
        id: 1,
        rank: 1,
        name: 'Ahmad Fauzi',
        initials: 'AH',
        points: 5450,
        tier: 'Diamond',
        campus: 'Universitas Gadjah Mada',
        eventsAttended: 21,
        sbtVerified: true
      },
      {
        id: 4,
        rank: 3,
        name: 'Siti Rahma',
        initials: 'SI',
        points: 4100,
        tier: 'Gold',
        campus: 'Universitas Brawijaya',
        eventsAttended: 13,
        sbtVerified: true
      }
    ],
    tableRanks: [
      { id: 3, rank: 4, name: 'Dian Sastro', initials: 'DI', points: 3920, eventsAttended: 12, trend: 'up', tier: 'Gold', campus: 'Universitas Indonesia' },
      { id: 5, rank: 5, name: 'Budi Santoso', initials: 'BU', points: 3680, eventsAttended: 9, trend: 'up', tier: 'Gold', campus: 'Institut Teknologi Sepuluh Nopember' },
      { id: 6, rank: 6, name: 'Citra Kirana', initials: 'CI', points: 3410, eventsAttended: 11, trend: 'down', tier: 'Gold', campus: 'Universitas Padjadjaran' },
      { id: 7, rank: 7, name: 'Eko Prasetyo', initials: 'EK', points: 3150, eventsAttended: 8, trend: 'up', tier: 'Gold', campus: 'Universitas Diponegoro' },
      { id: 8, rank: 8, name: 'Fahri Alamsyah', initials: 'FA', points: 2990, eventsAttended: 7, trend: 'down', tier: 'Gold', campus: 'Universitas Airlangga' },
      { id: 9, rank: 9, name: 'Gita Gutawa', initials: 'GI', points: 2750, eventsAttended: 6, trend: 'up', tier: 'Gold', campus: 'Universitas Sebelas Maret' },
      { id: 10, rank: 10, name: 'Hendra Wijaya', initials: 'HE', points: 2560, eventsAttended: 7, trend: 'down', tier: 'Gold', campus: 'Binus University' },
      { id: 11, rank: 11, name: 'Kevin Anggara', initials: 'KA', points: 2500, eventsAttended: 6, trend: 'neutral', tier: 'Silver', campus: 'Universitas Telkom' },
      { id: 'current-user', rank: 12, name: 'Budi Pratama', initials: 'BP', points: 2450, eventsAttended: 5, trend: 'up', tier: 'Silver', campus: 'Universitas Indonesia', isCurrentUser: true },
      { id: 13, rank: 13, name: 'Nadin Amizah', initials: 'ND', points: 2380, eventsAttended: 5, trend: 'down', tier: 'Silver', campus: 'Universitas Pelita Harapan' },
      { id: 14, rank: 14, name: 'Raditya Dika', initials: 'RA', points: 2210, eventsAttended: 4, trend: 'up', tier: 'Silver', campus: 'Universitas Prasetya Mulya' },
      { id: 15, rank: 15, name: 'Tara Basro', initials: 'TA', points: 2090, eventsAttended: 4, trend: 'neutral', tier: 'Silver', campus: 'Universitas Bina Nusantara' }
    ]
  },
  mingguan: {
    periodLabel: 'Mingguan (Minggu Ke-2 Oktober)',
    daysRemaining: '3 hari 14 jam',
    currentUser: {
      id: 'current-user',
      name: 'Kamu (Budi Pratama)',
      initials: 'KM',
      rank: 8,
      points: 750,
      nextRankPoints: 820,
      nextRank: 7,
      tier: 'Silver',
      campus: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      eventsAttended: 2,
      trend: 'up',
      trendCount: '+5 peringkat'
    },
    topThree: [
      {
        id: 1,
        rank: 2,
        name: 'Ahmad Fauzi',
        initials: 'AH',
        points: 1250,
        tier: 'Diamond',
        campus: 'Universitas Gadjah Mada',
        eventsAttended: 4,
        sbtVerified: true
      },
      {
        id: 3,
        rank: 1,
        name: 'Dian Sastro',
        initials: 'DI',
        points: 1420,
        tier: 'Gold',
        campus: 'Universitas Indonesia',
        eventsAttended: 5,
        sbtVerified: true
      },
      {
        id: 2,
        rank: 3,
        name: 'Rian Hidayat',
        initials: 'RI',
        points: 1100,
        tier: 'Platinum',
        campus: 'Institut Teknologi Bandung',
        eventsAttended: 3,
        sbtVerified: true
      }
    ],
    tableRanks: [
      { id: 4, rank: 4, name: 'Siti Rahma', initials: 'SI', points: 980, eventsAttended: 3, trend: 'down', tier: 'Gold', campus: 'Universitas Brawijaya' },
      { id: 7, rank: 5, name: 'Eko Prasetyo', initials: 'EK', points: 910, eventsAttended: 3, trend: 'up', tier: 'Gold', campus: 'Universitas Diponegoro' },
      { id: 6, rank: 6, name: 'Citra Kirana', initials: 'CI', points: 870, eventsAttended: 2, trend: 'up', tier: 'Gold', campus: 'Universitas Padjadjaran' },
      { id: 5, rank: 7, name: 'Budi Santoso', initials: 'BU', points: 820, eventsAttended: 2, trend: 'down', tier: 'Gold', campus: 'Institut Teknologi Sepuluh Nopember' },
      { id: 'current-user', rank: 8, name: 'Budi Pratama', initials: 'BP', points: 750, eventsAttended: 2, trend: 'up', tier: 'Silver', campus: 'Universitas Indonesia', isCurrentUser: true },
      { id: 9, rank: 9, name: 'Gita Gutawa', initials: 'GI', points: 710, eventsAttended: 2, trend: 'up', tier: 'Gold', campus: 'Universitas Sebelas Maret' },
      { id: 8, rank: 10, name: 'Fahri Alamsyah', initials: 'FA', points: 680, eventsAttended: 2, trend: 'down', tier: 'Gold', campus: 'Universitas Airlangga' },
      { id: 11, rank: 11, name: 'Kevin Anggara', initials: 'KA', points: 620, eventsAttended: 1, trend: 'neutral', tier: 'Silver', campus: 'Universitas Telkom' }
    ]
  },
  semua_waktu: {
    periodLabel: 'Semua Waktu (All Time High)',
    daysRemaining: 'Akumulasi Permanen',
    currentUser: {
      id: 'current-user',
      name: 'Kamu (Budi Pratama)',
      initials: 'KM',
      rank: 18,
      points: 8900,
      nextRankPoints: 9100,
      nextRank: 17,
      tier: 'Gold',
      campus: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      eventsAttended: 24,
      trend: 'up',
      trendCount: '+2 peringkat'
    },
    topThree: [
      {
        id: 4,
        rank: 2,
        name: 'Siti Rahma',
        initials: 'SI',
        points: 22400,
        tier: 'Diamond',
        campus: 'Universitas Brawijaya',
        eventsAttended: 64,
        sbtVerified: true
      },
      {
        id: 1,
        rank: 1,
        name: 'Ahmad Fauzi',
        initials: 'AH',
        points: 25800,
        tier: 'Diamond',
        campus: 'Universitas Gadjah Mada',
        eventsAttended: 78,
        sbtVerified: true
      },
      {
        id: 2,
        rank: 3,
        name: 'Rian Hidayat',
        initials: 'RI',
        points: 20950,
        tier: 'Diamond',
        campus: 'Institut Teknologi Bandung',
        eventsAttended: 58,
        sbtVerified: true
      }
    ],
    tableRanks: [
      { id: 5, rank: 4, name: 'Budi Santoso', initials: 'BU', points: 18200, eventsAttended: 49, trend: 'up', tier: 'Platinum', campus: 'Institut Teknologi Sepuluh Nopember' },
      { id: 3, rank: 5, name: 'Dian Sastro', initials: 'DI', points: 17450, eventsAttended: 46, trend: 'up', tier: 'Platinum', campus: 'Universitas Indonesia' },
      { id: 6, rank: 6, name: 'Citra Kirana', initials: 'CI', points: 15300, eventsAttended: 41, trend: 'down', tier: 'Platinum', campus: 'Universitas Padjadjaran' },
      { id: 7, rank: 7, name: 'Eko Prasetyo', initials: 'EK', points: 14100, eventsAttended: 38, trend: 'neutral', tier: 'Platinum', campus: 'Universitas Diponegoro' },
      { id: 10, rank: 8, name: 'Hendra Wijaya', initials: 'HE', points: 13200, eventsAttended: 35, trend: 'down', tier: 'Platinum', campus: 'Binus University' },
      { id: 9, rank: 9, name: 'Gita Gutawa', initials: 'GI', points: 12500, eventsAttended: 32, trend: 'up', tier: 'Gold', campus: 'Universitas Sebelas Maret' },
      { id: 8, rank: 10, name: 'Fahri Alamsyah', initials: 'FA', points: 11900, eventsAttended: 30, trend: 'down', tier: 'Gold', campus: 'Universitas Airlangga' },
      { id: 'current-user', rank: 18, name: 'Budi Pratama', initials: 'BP', points: 8900, eventsAttended: 24, trend: 'up', tier: 'Gold', campus: 'Universitas Indonesia', isCurrentUser: true }
    ]
  }
};

const LeaderboardPage = () => {
  const { user } = useAuth();

  // State filter timeframe: 'mingguan', 'bulanan', 'semua_waktu'
  const [timeframe, setTimeframe] = useState('bulanan');
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  // Filter Tier state
  const [selectedTier, setSelectedTier] = useState('ALL');

  // Ambil data aktif berdasarkan timeframe terpilih
  const currentData = MOCK_LEADERBOARD_DATA[timeframe];
  const { currentUser, topThree, tableRanks, periodLabel, daysRemaining } = currentData;

  const currentUserName = user?.name ? `Kamu (${user.name})` : currentUser.name;
  const currentUserInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : currentUser.initials;

  // Hitung persentase progress user menuju peringkat di atasnya
  const pointsRemaining = Math.max(0, currentUser.nextRankPoints - currentUser.points);
  const progressPercent = Math.min(
    100,
    Math.round((currentUser.points / currentUser.nextRankPoints) * 100)
  );

  // Helper render Tier Badge
  const renderTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'diamond':
        return <span className="tier-tag tier-diamond">💎 Diamond</span>;
      case 'platinum':
        return <span className="tier-tag tier-platinum">⭐ Platinum</span>;
      case 'gold':
        return <span className="tier-tag tier-gold">🥇 Gold</span>;
      case 'silver':
        return <span className="tier-tag tier-silver">🥈 Silver</span>;
      case 'bronze':
      default:
        return <span className="tier-tag tier-bronze">🥉 Bronze</span>;
    }
  };

  // Filter daftar tabel berdasarkan pencarian nama dan tier
  const filteredTableRanks = useMemo(() => {
    return tableRanks.filter((item) => {
      const matchName = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.campus?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = selectedTier === 'ALL' || item.tier?.toUpperCase() === selectedTier;
      return matchName && matchTier;
    });
  }, [tableRanks, searchQuery, selectedTier]);

  return (
    <div className="leaderboard-page-wrapper">
      <Container className="pt-4 pt-md-5">
        {/* ==================== 1. HEADER SECTION ==================== */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="leaderboard-title mb-1">Leaderboard</h1>
            <p className="leaderboard-subtitle mb-0">
              Kumpulkan poin dari setiap event dan microlearning untuk naik peringkat!
            </p>
          </div>

          {/* Timeframe Pill Switcher */}
          <div className="timeframe-pill-container align-self-start align-self-md-center">
            <button
              type="button"
              className={`timeframe-pill-btn ${timeframe === 'mingguan' ? 'active' : ''}`}
              onClick={() => setTimeframe('mingguan')}
            >
              Mingguan
            </button>
            <button
              type="button"
              className={`timeframe-pill-btn ${timeframe === 'bulanan' ? 'active' : ''}`}
              onClick={() => setTimeframe('bulanan')}
            >
              Bulanan
            </button>
            <button
              type="button"
              className={`timeframe-pill-btn ${timeframe === 'semua_waktu' ? 'active' : ''}`}
              onClick={() => setTimeframe('semua_waktu')}
            >
              Semua Waktu
            </button>
          </div>
        </div>

        {/* ==================== 2. CURRENT USER HIGHLIGHT CARD ("KAMU") OR GUEST BANNER ==================== */}
        {user ? (
          <div className="user-rank-highlight-card">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
              {/* User Info */}
              <div className="d-flex align-items-center gap-3">
                <Link to="/profile/current-user" className="text-decoration-none">
                  <div className="user-avatar-circle" style={{ cursor: 'pointer' }}>
                    {currentUserInitials}
                  </div>
                </Link>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <Link
                      to="/profile/current-user"
                      className="fw-bold text-dark text-decoration-none user-table-link mb-0"
                      style={{ fontSize: '1.25rem' }}
                    >
                      {currentUserName}
                    </Link>
                    {renderTierBadge(currentUser.tier)}
                  </div>
                  <p className="text-muted small mb-0 mt-1">
                    Peringkat saat ini di tingkat <span className="fw-semibold text-dark">{periodLabel}</span>
                  </p>
                </div>
              </div>

              {/* Rank & Points Stats */}
              <div className="d-flex align-items-center gap-4">
                <div className="rank-stat-box">
                  <div className="rank-stat-label">RANK</div>
                  <div className="rank-stat-value">#{currentUser.rank}</div>
                </div>
                <div className="rank-stat-box">
                  <div className="rank-stat-label">TOTAL POIN</div>
                  <div className="rank-stat-value primary-highlight">
                    {currentUser.points.toLocaleString('id-ID')} pts
                  </div>
                </div>
              </div>
            </div>

            {/* Progress to Next Rank */}
            <div className="pt-2 border-top" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex justify-content-between align-items-center mb-1-5">
                <span className="small fw-semibold text-secondary">
                  Peringkat Selanjutnya: <strong className="text-dark">#{currentUser.nextRank}</strong>
                </span>
                <span className="small text-muted fw-semibold">
                  {pointsRemaining > 0 ? `${pointsRemaining} pts lagi` : 'Peringkat Teratas!'}
                </span>
              </div>
              <div className="progress-track-wrapper">
                <div
                  className="progress-fill-bar"
                  style={{ width: `${progressPercent}%` }}
                  title={`${progressPercent}% tercapai`}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="leaderboard-guest-card mb-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="guest-trophy-icon">
                  <Trophy size={26} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Ingin Melihat Posisi Peringkatmu?</h5>
                  <p className="text-muted small mb-0">
                    Masuk dengan akun KampusX Anda untuk melacak poin, melihat posisi peringkat personal, dan bersaing memperebutkan reward bulanan!
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <Link to="/login" className="btn btn-primary btn-sm px-3 py-2 rounded-pill fw-bold">
                  Masuk Sekarang
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-pill fw-bold">
                  Daftar Akun
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. TOP 3 PODIUM CARDS (2 - 1 - 3) ==================== */}
        <div className="podium-container">
          {/* RANK #2 (Silver) */}
          <div className="podium-card rank-2">
            <div className="podium-rank-tag">
              <span style={{ fontSize: '10px' }}>●</span> RANK #2
            </div>
            <Link to={`/profile/${topThree[0].id || 2}`} className="text-decoration-none d-block">
              <div className="podium-avatar-large">
                {topThree[0].initials}
              </div>
            </Link>
            <Link
              to={`/profile/${topThree[0].id || 2}`}
              className="podium-user-name text-truncate px-2 d-block text-decoration-none user-table-link"
              title={topThree[0].name}
            >
              {topThree[0].name}
            </Link>
            <div className="podium-user-points">
              {topThree[0].points.toLocaleString('id-ID')} pts
            </div>
            <div className="mt-2">
              {renderTierBadge(topThree[0].tier)}
            </div>
          </div>

          {/* RANK #1 (Gold - Elevated / Featured Card) */}
          <div className="podium-card rank-1">
            <div className="podium-rank-tag rank-1-tag">
              <Crown size={14} className="text-warning" /> RANK #1
            </div>
            <Link to={`/profile/${topThree[1].id || 1}`} className="text-decoration-none d-block">
              <div className="podium-avatar-large">
                {topThree[1].initials}
              </div>
            </Link>
            <Link
              to={`/profile/${topThree[1].id || 1}`}
              className="podium-user-name text-truncate px-2 d-block text-decoration-none user-table-link"
              title={topThree[1].name}
            >
              {topThree[1].name}
            </Link>
            <div className="podium-user-points">
              {topThree[1].points.toLocaleString('id-ID')} pts
            </div>
            <div className="mt-2">
              {renderTierBadge(topThree[1].tier)}
            </div>
          </div>

          {/* RANK #3 (Bronze) */}
          <div className="podium-card rank-3">
            <div className="podium-rank-tag">
              <span style={{ fontSize: '10px' }}>●</span> RANK #3
            </div>
            <Link to={`/profile/${topThree[2].id || 4}`} className="text-decoration-none d-block">
              <div className="podium-avatar-large">
                {topThree[2].initials}
              </div>
            </Link>
            <Link
              to={`/profile/${topThree[2].id || 4}`}
              className="podium-user-name text-truncate px-2 d-block text-decoration-none user-table-link"
              title={topThree[2].name}
            >
              {topThree[2].name}
            </Link>
            <div className="podium-user-points">
              {topThree[2].points.toLocaleString('id-ID')} pts
            </div>
            <div className="mt-2">
              {renderTierBadge(topThree[2].tier)}
            </div>
          </div>
        </div>

        {/* ==================== 4. MAIN CONTENT (LEFT: TABLE, RIGHT: SIDEBAR) ==================== */}
        <Row className="g-4">
          {/* LEFT COLUMN: TABLE #4 - #10+ */}
          <Col lg={8}>
            <div className="leaderboard-table-card">
              {/* Table Toolbar / Search & Filter */}
              <div className="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                <div className="position-relative" style={{ maxWidth: '320px', width: '100%' }}>
                  <Search size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-5 border rounded-pill"
                    placeholder="Cari mahasiswa atau kampus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '13px', background: '#f8fafc' }}
                  />
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-semibold">Tier:</span>
                  <select
                    className="form-select form-select-sm rounded-pill border px-3"
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    style={{ fontSize: '12px', width: 'auto', background: '#f8fafc', fontWeight: 600 }}
                  >
                    <option value="ALL">Semua Tier</option>
                    <option value="DIAMOND">Diamond</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                  </select>
                </div>
              </div>

              {/* Table Data */}
              <div className="table-responsive">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>RANK</th>
                      <th>PENGGUNA</th>
                      <th style={{ textAlign: 'right' }}>POIN</th>
                      <th style={{ textAlign: 'center' }}>KEHADIRAN</th>
                      <th style={{ textAlign: 'right', width: '100px' }}>TREN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableRanks.length > 0 ? (
                      filteredTableRanks.map((row) => {
                        const isMe = !!user && row.isCurrentUser;
                        const displayName = isMe
                          ? (user?.name ? `Kamu (${user.name})` : 'Kamu (Budi Pratama)')
                          : row.name;

                        return (
                          <tr
                            key={row.rank}
                            className={`leaderboard-row ${isMe ? 'current-user-row' : ''}`}
                          >
                            {/* RANK */}
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                              #{row.rank}
                            </td>

                            {/* USER */}
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <Link
                                  to={`/profile/${isMe ? 'current-user' : (row.id || row.rank)}`}
                                  className="text-decoration-none"
                                >
                                  <div
                                    className="table-user-avatar"
                                    style={
                                      isMe
                                        ? { backgroundColor: '#00699e', color: '#fff' }
                                        : {}
                                    }
                                  >
                                    {isMe ? currentUserInitials : row.initials}
                                  </div>
                                </Link>
                                <div>
                                  <div className="d-flex align-items-center gap-2">
                                    <Link
                                      to={`/profile/${isMe ? 'current-user' : (row.id || row.rank)}`}
                                      className="fw-bold text-dark text-decoration-none user-table-link"
                                      style={{ fontSize: '14px' }}
                                    >
                                      {displayName}
                                    </Link>
                                    {isMe && (
                                      <Badge bg="primary" style={{ fontSize: '10px', fontWeight: 600 }}>
                                        Kamu
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted d-flex align-items-center gap-1 mt-0-5" style={{ fontSize: '12px' }}>
                                  <span className="text-truncate" style={{ maxWidth: '220px' }}>
                                    {row.campus}
                                  </span>
                                  <span>•</span>
                                  <span>{row.tier}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* POINTS */}
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {row.points.toLocaleString('id-ID')} pts
                          </td>

                          {/* EVENTS ATTENDED */}
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            {row.eventsAttended} Event
                          </td>

                          {/* TREND */}
                          <td style={{ textAlign: 'right' }}>
                            {row.trend === 'up' && (
                              <span className="trend-indicator trend-up">
                                <TrendingUp size={15} /> Up
                              </span>
                            )}
                            {row.trend === 'down' && (
                              <span className="trend-indicator trend-down">
                                <TrendingDown size={15} /> Down
                              </span>
                            )}
                            {row.trend === 'neutral' && (
                              <span className="trend-indicator trend-neutral">
                                <Minus size={15} /> -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          <Info size={28} className="mb-2 text-secondary" />
                          <p className="mb-0 fw-semibold">Tidak ada peserta yang cocok dengan pencarian.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="p-3 text-center border-top bg-light" style={{ borderColor: '#f1f5f9' }}>
                <span className="small text-muted">
                  Menampilkan peringkat teratas KampusX • Data diperbarui setiap 15 menit
                </span>
              </div>
            </div>
          </Col>

          {/* RIGHT COLUMN: SIDEBAR */}
          <Col lg={4}>
            {/* CARD 1: CARA MENDAPATKAN POIN */}
            <div className="sidebar-info-card">
              <h5 className="sidebar-card-title">Cara Mendapatkan Poin</h5>
              <p className="sidebar-card-desc">
                Aktivitas Anda akan dikonversi menjadi poin leaderboard secara otomatis.
              </p>

              <div>
                {/* 1. Hadiri Event */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box primary-tint">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Hadiri Event</div>
                    <div className="sidebar-item-subtitle">+100 Poin per kehadiran</div>
                  </div>
                </div>

                {/* 2. Review Event */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Review Event</div>
                    <div className="sidebar-item-subtitle">+50 Poin setelah event selesai</div>
                  </div>
                </div>

                {/* 3. Referral Teman */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Referral Teman</div>
                    <div className="sidebar-item-subtitle">+200 Poin per pendaftaran sukses</div>
                  </div>
                </div>

                {/* 4. Selesaikan Microlearning (SRL Engine) - Integrasi Modul Chintya */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box gold-tint">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Lulus Microlearning (SRL)</div>
                    <div className="sidebar-item-subtitle">+200 Poin per modul tervalidasi</div>
                  </div>
                </div>

                {/* 5. Kuis Refleksi Gen-AI */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box purple-tint">
                    <Brain size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Kuis Refleksi Gen-AI</div>
                    <div className="sidebar-item-subtitle">+50 Poin untuk nilai passing grade</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: HADIAH PERINGKAT */}
            <div className="sidebar-info-card">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <h5 className="sidebar-card-title mb-0">Hadiah Peringkat</h5>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1" style={{ fontSize: '11px' }}>
                  <Clock size={11} className="me-1" /> {daysRemaining}
                </span>
              </div>
              <p className="sidebar-card-desc">
                Diberikan setiap akhir periode penutupan {timeframe}.
              </p>

              <div>
                {/* Juara 1 */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box gold-tint">
                    <Gift size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Peringkat 1</div>
                    <div className="sidebar-item-subtitle">Voucher Tiket Rp 500.000 + Golden SBT</div>
                  </div>
                </div>

                {/* Juara 2 - 3 */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box primary-tint">
                    <Gift size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Peringkat 2 - 3</div>
                    <div className="sidebar-item-subtitle">Voucher Tiket Rp 250.000 + Silver SBT</div>
                  </div>
                </div>

                {/* Top 10 Besar */}
                <div className="sidebar-item-row">
                  <div className="sidebar-item-icon-box purple-tint">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-title">Top 10 Besar</div>
                    <div className="sidebar-item-subtitle">Badge Profil Eksklusif On-Chain Polygon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: TIER LEVELS & ON-CHAIN BENEFIT (GAMIFIKASI MULTI-TIER) */}
            <div className="sidebar-info-card" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-primary" />
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>Tingkatan Multi-Tier</h6>
              </div>
              <p className="text-muted small mb-3">
                Kumpulkan poin untuk menaikkan status tier Anda dan dapatkan kredensial on-chain terverifikasi:
              </p>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between align-items-center pb-1 border-bottom">
                  <span>💎 <strong>Diamond</strong></span>
                  <span className="text-muted">&gt; 5.000 pts</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-1 border-bottom">
                  <span>⭐ <strong>Platinum</strong></span>
                  <span className="text-muted">3.501 - 5.000 pts</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-1 border-bottom">
                  <span>🥇 <strong>Gold</strong></span>
                  <span className="text-muted">2.001 - 3.500 pts</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-1 border-bottom">
                  <span>🥈 <strong>Silver</strong></span>
                  <span className="text-muted">1.001 - 2.000 pts</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>🥉 <strong>Bronze</strong></span>
                  <span className="text-muted">0 - 1.000 pts</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LeaderboardPage;
