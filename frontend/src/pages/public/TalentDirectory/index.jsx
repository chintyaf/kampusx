import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Badge, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Award,
  BookOpen,
  Calendar,
  Users,
  Brain,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Check,
  Lock,
  User,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './TalentDirectory.css';

// === DUMMY DATA KANDIDAT MAHASISWA & SKILL MATRIX ===
const MOCK_TALENTS = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    initials: 'AH',
    headline: 'Data Scientist & AI Enthusiast | UGM Computer Science',
    campus: 'Universitas Gadjah Mada',
    major: 'Ilmu Komputer',
    tier: 'Diamond',
    avatarBg: '#fef3c7',
    avatarColor: '#92400e',
    bio: 'Fokus pada riset NLP, Machine Learning, dan Big Data. Telah menyelesaikan kurikulum microlearning SRL Python & AI di KampusX.',
    skills: [
      { name: 'Python', level: 94 },
      { name: 'Machine Learning', level: 90 },
      { name: 'Data Analysis', level: 88 },
      { name: 'SQL', level: 85 }
    ],
    modulesCompleted: 8,
    eventsAttended: 21,
    sbtCount: 5,
    walletAddress: '0x3a4b...89fc',
    latestSbt: {
      tokenId: '#SBT-2026-0041',
      title: 'Advanced Data Science & Machine Learning Specialist',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
      date: '28 Sep 2026',
      block: '58,219,044'
    }
  },
  {
    id: 2,
    name: 'Rian Hidayat',
    initials: 'RI',
    headline: 'Fullstack Software Engineer & Cloud Architect | ITB Informatics',
    campus: 'Institut Teknologi Bandung',
    major: 'Teknik Informatika',
    tier: 'Platinum',
    avatarBg: '#e0f2fe',
    avatarColor: '#0369a1',
    bio: 'Membangun aplikasi web performa tinggi menggunakan React, Node.js, dan arsitektur microservices.',
    skills: [
      { name: 'React', level: 92 },
      { name: 'Node.js', level: 88 },
      { name: 'TypeScript', level: 85 },
      { name: 'Docker', level: 80 }
    ],
    modulesCompleted: 7,
    eventsAttended: 15,
    sbtCount: 4,
    walletAddress: '0x7b12...44d9',
    latestSbt: {
      tokenId: '#SBT-2026-0082',
      title: 'Fullstack Microservices & Cloud Engineering',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
      date: '22 Sep 2026',
      block: '58,190,412'
    }
  },
  {
    id: 3,
    name: 'Dian Sastro',
    initials: 'DI',
    headline: 'Product Designer (UI/UX) & Design System Enthusiast | UI Information Systems',
    campus: 'Universitas Indonesia',
    major: 'Sistem Informasi',
    tier: 'Gold',
    avatarBg: '#fce7f3',
    avatarColor: '#9d174d',
    bio: 'Mendesain antarmuka berbasis riset pengguna (UX Research), wireframing, prototipe Figma berstandar enterprise.',
    skills: [
      { name: 'Figma', level: 96 },
      { name: 'UI/UX Design', level: 92 },
      { name: 'UX Research', level: 85 },
      { name: 'Design System', level: 90 }
    ],
    modulesCompleted: 6,
    eventsAttended: 12,
    sbtCount: 3,
    walletAddress: '0x99c4...71ab',
    latestSbt: {
      tokenId: '#SBT-2026-0105',
      title: 'Human-Centered UI/UX Master Credentials',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
      date: '15 Sep 2026',
      block: '58,124,500'
    }
  },
  {
    id: 4,
    name: 'Siti Rahma',
    initials: 'SI',
    headline: 'AI Engineer & Deep Learning Researcher | Universitas Brawijaya',
    campus: 'Universitas Brawijaya',
    major: 'Teknik Informatika',
    tier: 'Gold',
    avatarBg: '#fef3c7',
    avatarColor: '#b45309',
    bio: 'Tertarik pada Computer Vision, generative models, dan RAG retrieval optimization.',
    skills: [
      { name: 'Python', level: 91 },
      { name: 'Machine Learning', level: 89 },
      { name: 'TensorFlow', level: 84 },
      { name: 'Data Analysis', level: 86 }
    ],
    modulesCompleted: 6,
    eventsAttended: 13,
    sbtCount: 3,
    walletAddress: '0x44d1...88ec',
    latestSbt: {
      tokenId: '#SBT-2026-0118',
      title: 'Deep Learning & Neural Networks Practitioner',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
      date: '10 Sep 2026',
      block: '58,091,230'
    }
  },
  {
    id: 5,
    name: 'Budi Santoso',
    initials: 'BU',
    headline: 'Backend Engineer (Golang & Kubernetes) | ITS Informatics',
    campus: 'Institut Teknologi Sepuluh Nopember',
    major: 'Teknik Informatika',
    tier: 'Gold',
    avatarBg: '#ede9fe',
    avatarColor: '#6d28d9',
    bio: 'Spesialis sistem terdistribusi, database concurrency, Redis caching, dan event-driven microservices.',
    skills: [
      { name: 'Go', level: 93 },
      { name: 'SQL', level: 89 },
      { name: 'Docker', level: 84 },
      { name: 'Redis', level: 86 }
    ],
    modulesCompleted: 5,
    eventsAttended: 9,
    sbtCount: 3,
    walletAddress: '0x81ee...99a0',
    latestSbt: {
      tokenId: '#SBT-2026-0130',
      title: 'High-Throughput Backend Architecture',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x38471928a471029c8714019a82740192847bca8271039de629a81234b981e74a',
      date: '05 Sep 2026',
      block: '58,014,921'
    }
  },
  {
    id: 6,
    name: 'Citra Kirana',
    initials: 'CI',
    headline: 'Product Manager & Tech Strategist | Universitas Padjadjaran',
    campus: 'Universitas Padjadjaran',
    major: 'Manajemen Bisnis & IT',
    tier: 'Gold',
    avatarBg: '#dcfce7',
    avatarColor: '#166534',
    bio: 'Menghubungkan strategi bisnis dengan eksekusi rekayasa perangkat lunak melalui metodologi Scrum/Agile.',
    skills: [
      { name: 'Product Management', level: 92 },
      { name: 'Data Analysis', level: 86 },
      { name: 'Scrum Agile', level: 90 },
      { name: 'UI/UX Design', level: 78 }
    ],
    modulesCompleted: 5,
    eventsAttended: 11,
    sbtCount: 2,
    walletAddress: '0x12a8...55c1',
    latestSbt: {
      tokenId: '#SBT-2026-0144',
      title: 'Digital Product Management Excellence',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x9918274a1029c8714019a82740192847bca8271039de629a81234b981e74a384',
      date: '01 Sep 2026',
      block: '57,984,110'
    }
  }
];

// === DUMMY SOCIAL FEED POSTS (LINKEDIN STYLE) ===
const MOCK_SOCIAL_POSTS = [
  {
    id: 'p1',
    authorName: 'Ahmad Fauzi',
    authorInitials: 'AH',
    authorHeadline: 'Data Scientist & AI Enthusiast • UGM',
    timeAgo: '2 jam yang lalu',
    content:
      'Sangat bersyukur baru saja menyelesaikan modul SRL Microlearning "Python & Deep Learning Foundations" dengan passing grade 98%! Kredensial sertifikat otomatis tercetak sebagai Soulbound Token (SBT) permanen di Blockchain Polygon 🎓🚀 Terima kasih KampusX!',
    badgeHighlight: {
      title: 'Advanced AI & Deep Learning Specialist',
      tokenId: '#SBT-2026-0041',
      issuer: 'KampusX Verified Credentials'
    },
    likesCount: 34,
    commentsCount: 6,
    sbtModalTarget: MOCK_TALENTS[0]
  },
  {
    id: 'p2',
    authorName: 'Rian Hidayat',
    authorInitials: 'RI',
    authorHeadline: 'Fullstack Software Engineer • ITB',
    timeAgo: '5 jam yang lalu',
    content:
      'Tim kami berhasil mengimplementasikan arsitektur Smart Contract Soulbound Token ERC-5192 untuk portofolio digital mahasiswa. Dengan verifikasi Zero-Trust on-chain, rekruter dapat langsung membuktikan keabsahan sertifikat tanpa pihak ketiga! Cek kredensial saya di bawah:',
    badgeHighlight: {
      title: 'Fullstack Cloud & Web3 Architecture',
      tokenId: '#SBT-2026-0082',
      issuer: 'KampusX Verified Credentials'
    },
    likesCount: 52,
    commentsCount: 11,
    sbtModalTarget: MOCK_TALENTS[1]
  },
  {
    id: 'p3',
    authorName: 'Dian Sastro',
    authorInitials: 'DI',
    authorHeadline: 'Product Designer (UI/UX) • Universitas Indonesia',
    timeAgo: '1 hari yang lalu',
    content:
      'Desain yang baik selalu berlandaskan data dan kebutuhan riil pengguna. Senang sekali bisa berbagi materi seputar Design System & UX Research di workshop KampusX kemarin! Kredensial pembicara sudah terverifikasi di Polygon Ledger.',
    badgeHighlight: {
      title: 'Human-Centered UI/UX Master Credentials',
      tokenId: '#SBT-2026-0105',
      issuer: 'KampusX Verified Credentials'
    },
    likesCount: 41,
    commentsCount: 4,
    sbtModalTarget: MOCK_TALENTS[2]
  }
];

const AVAILABLE_SKILLS_FOR_MATCH = [
  'Python',
  'Data Analysis',
  'Machine Learning',
  'React',
  'Node.js',
  'SQL',
  'Figma',
  'UI/UX Design',
  'Go',
  'Docker'
];

const TalentDirectory = () => {
  const { user } = useAuth();

  // Tab Switcher: 'talents' vs 'feed'
  const [activeTab, setActiveTab] = useState('talents');

  // Search Input
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Specialization / Role Filter
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Selected Criteria for Vector Job-Match Simulator
  const [selectedSkillsForMatch, setSelectedSkillsForMatch] = useState([
    'Python',
    'Data Analysis'
  ]);

  // Modal State for Zero-Trust Blockchain Verification
  const [selectedSbtTalent, setSelectedSbtTalent] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Modal State for Restricted Access (LinkedIn Style Guest Wall)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');

  const promptLoginRequired = (message) => {
    setLoginModalMessage(
      message ||
        'Untuk menjaga privasi data akademik mahasiswa serta integritas verifikasi blockchain kredensial Soulbound Token, silakan masuk ke akun KampusX Anda terlebih dahulu.'
    );
    setShowLoginModal(true);
  };

  // Social feed likes state
  const [likedPosts, setLikedPosts] = useState({});

  const toggleSkillSelection = (skillName) => {
    if (selectedSkillsForMatch.includes(skillName)) {
      setSelectedSkillsForMatch(selectedSkillsForMatch.filter((s) => s !== skillName));
    } else {
      setSelectedSkillsForMatch([...selectedSkillsForMatch, skillName]);
    }
  };

  const handleOpenVerifyModal = (talent) => {
    setSelectedSbtTalent(talent);
    setShowVerifyModal(true);
  };

  const toggleLike = (postId) => {
    if (!user) {
      promptLoginRequired('Masuk ke akun KampusX Anda untuk memberikan apresiasi dan berinteraksi di Social Feed.');
      return;
    }
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Hitung Match Score (%) berbasis kemiripan kriteria keahlian (Simulasi Cosine Similarity)
  const calculateMatchScore = (talentSkills, requiredSkills) => {
    if (requiredSkills.length === 0) return null;
    let matchCount = 0;
    let totalScore = 0;

    requiredSkills.forEach((reqSkill) => {
      const found = talentSkills.find(
        (s) => s.name.toLowerCase() === reqSkill.toLowerCase()
      );
      if (found) {
        matchCount++;
        totalScore += found.level;
      }
    });

    if (matchCount === 0) return 0;
    // Rata-rata bobot kecocokan
    const averageProficiency = totalScore / requiredSkills.length;
    return Math.round(averageProficiency);
  };

  // Filter dan sort talent
  const processedTalents = useMemo(() => {
    return MOCK_TALENTS.map((talent) => {
      const matchScore = calculateMatchScore(
        talent.skills,
        selectedSkillsForMatch
      );
      return {
        ...talent,
        matchScore
      };
    })
      .filter((talent) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          talent.name.toLowerCase().includes(query) ||
          talent.campus.toLowerCase().includes(query) ||
          talent.headline.toLowerCase().includes(query) ||
          talent.skills.some((s) => s.name.toLowerCase().includes(query));

        let matchesRole = true;
        if (selectedRole === 'DATA') {
          matchesRole = talent.skills.some((s) =>
            ['Python', 'Machine Learning', 'Data Analysis'].includes(s.name)
          );
        } else if (selectedRole === 'ENGINEERING') {
          matchesRole = talent.skills.some((s) =>
            ['React', 'Node.js', 'Go', 'Docker'].includes(s.name)
          );
        } else if (selectedRole === 'DESIGN') {
          matchesRole = talent.skills.some((s) =>
            ['Figma', 'UI/UX Design', 'Design System'].includes(s.name)
          );
        }

        return matchesQuery && matchesRole;
      })
      .sort((a, b) => {
        // Jika ada filter kriteria, urutkan berdasarkan Match Score tertinggi
        if (selectedSkillsForMatch.length > 0) {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        return b.sbtCount - a.sbtCount;
      });
  }, [searchQuery, selectedRole, selectedSkillsForMatch]);

  return (
    <div className="talent-page-wrapper">
      <Container className="pt-4 pt-md-5">
        {/* ==================== HERO BANNER ==================== */}
        <div className="talent-header-banner">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Badge bg="light" text="dark" className="px-3 py-1-5 fw-bold" style={{ fontSize: '11px' }}>
              <ShieldCheck size={13} className="text-primary me-1" /> KAMPUSX TALENT & SOCIAL HUB
            </Badge>
          </div>
          <h1 className="talent-banner-title">Direktori Talent & Portofolio Mahasiswa</h1>
          <p className="talent-banner-subtitle">
            Jelajahi rekam jejak capaian belajar, keahlian riil hasil evaluasi SRL, dan sertifikat
            kredensial Soulbound Token (SBT) berbasis Blockchain Polygon.
          </p>
        </div>

        {/* ==================== 3-COLUMN LINKEDIN STYLE LAYOUT ==================== */}
        <div className="linkedin-container">
          {/* ==================== LEFT COLUMN: MINI PROFILE & FILTERS ==================== */}
          <div className="linkedin-left-col">
            {/* User Mini Profile (LinkedIn Style) */}
            {user ? (
              <div className="clean-card">
                <div className="user-mini-profile-banner" />
                <div className="user-mini-avatar">
                  {user.name
                    ? user.name
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'KM'}
                </div>
                <div className="user-mini-name">Kamu ({user.name || 'Budi Pratama'})</div>
                <div className="user-mini-headline">
                  Mahasiswa Teknik Informatika • Universitas Indonesia
                </div>
                <div className="text-center mb-3">
                  <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
                    🥈 Silver Tier
                  </span>
                </div>

                <div className="user-mini-stats-row">
                  <span>Total Poin Global</span>
                  <span className="user-mini-stats-val">2,450 pts</span>
                </div>
                <div className="user-mini-stats-row">
                  <span>SBT Terverifikasi</span>
                  <span className="user-mini-stats-val">2 Kredensial</span>
                </div>
                <div className="p-3 text-center border-top">
                  <Link
                    to="/profile/current-user"
                    className="btn btn-outline-primary btn-sm w-100 rounded-pill fw-bold"
                    style={{ fontSize: '12px' }}
                  >
                    Lihat Profil Saya
                  </Link>
                </div>
              </div>
            ) : (
              <div className="clean-card">
                <div className="user-mini-profile-banner guest-profile-banner" />
                <div className="user-mini-avatar guest-mini-avatar">
                  <User size={26} />
                </div>
                <div className="user-mini-name">Tamu / Pengunjung</div>
                <div className="user-mini-headline">
                  Eksplorasi Profil & Direktori Talenta KampusX
                </div>
                <div className="text-center mb-3">
                  <span className="badge bg-light text-muted border px-2 py-1" style={{ fontSize: '11px' }}>
                    Mode Tamu Publik
                  </span>
                </div>

                <div className="px-3 pb-3 text-center">
                  <p className="text-muted small mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    Masuk untuk membangun profil talenta digital Anda, klaim kredensial Soulbound Token, dan membuka akses komunikasi dengan rekruter.
                  </p>
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm w-100 rounded-pill fw-bold mb-2"
                    style={{ fontSize: '12px' }}
                  >
                    Masuk Sekarang
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline-secondary btn-sm w-100 rounded-pill fw-bold"
                    style={{ fontSize: '12px' }}
                  >
                    Daftar Akun Baru
                  </Link>
                </div>
              </div>
            )}

            {/* Specialization Filter Card */}
            <div className="clean-card">
              <div className="filter-section-title">Bidang Spesialisasi</div>
              <div>
                <button
                  type="button"
                  className={`filter-pill-item ${selectedRole === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('ALL')}
                >
                  <span>Semua Bidang</span>
                  <span className="badge bg-light text-muted">6</span>
                </button>
                <button
                  type="button"
                  className={`filter-pill-item ${selectedRole === 'DATA' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('DATA')}
                >
                  <span>Data Science & AI</span>
                  <span className="badge bg-light text-muted">2</span>
                </button>
                <button
                  type="button"
                  className={`filter-pill-item ${selectedRole === 'ENGINEERING' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('ENGINEERING')}
                >
                  <span>Software Engineering</span>
                  <span className="badge bg-light text-muted">2</span>
                </button>
                <button
                  type="button"
                  className={`filter-pill-item ${selectedRole === 'DESIGN' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('DESIGN')}
                >
                  <span>UI/UX Product Design</span>
                  <span className="badge bg-light text-muted">2</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================== CENTER COLUMN: FEED & TALENT CARDS ==================== */}
          <div className="linkedin-center-col">
            {/* Tab Navigation: Talent Directory vs Social Activity Feed */}
            <div className="feed-tab-bar">
              <button
                type="button"
                className={`feed-tab-btn ${activeTab === 'talents' ? 'active' : ''}`}
                onClick={() => setActiveTab('talents')}
              >
                <Users size={16} /> Direktori Talent ({processedTalents.length})
              </button>
              <button
                type="button"
                className={`feed-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                <Sparkles size={16} /> Feed Prestasi & Pembelajaran
              </button>
            </div>

            {/* ==================== TAB 1: TALENTS DIRECTORY ==================== */}
            {activeTab === 'talents' && (
              <>
                {/* Guest Preview Notice Banner */}
                {!user && (
                  <div className="guest-preview-notice mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={18} className="text-primary flex-shrink-0" />
                      <span className="small text-dark">
                        <strong>Mode Pratinjau Publik:</strong> Menampilkan 2 profil kandidat sampel. <Link to="/login" className="text-primary fw-bold text-decoration-none">Masuk ke KampusX</Link> untuk melihat seluruh 1.200+ talenta, kontak langsung, dan verifikasi on-chain.
                      </span>
                    </div>
                  </div>
                )}

                {/* Search Bar */}
                <div className="position-relative mb-3">
                  <Search
                    size={16}
                    className="position-absolute text-muted"
                    style={{ top: '12px', left: '16px' }}
                  />
                  <input
                    type="text"
                    className="form-control ps-5 py-2 border rounded-pill bg-white shadow-sm"
                    placeholder="Cari talenta berdasarkan nama, kampus, jurusan, atau skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '13.5px' }}
                  />
                </div>

                {/* Skill-Match Simulator Box (Chintya + Brigitta Cosine Similarity Simulation) */}
                <div className="match-simulator-box">
                  <div className="match-simulator-header">
                    <div>
                      <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>
                        ⚡ Job-Skill Match Simulator
                      </h6>
                      <p className="small text-muted mb-0">
                        Pilih skill yang Anda cari untuk menghitung skor kecocokan kandidat secara otomatis.
                      </p>
                    </div>
                    {selectedSkillsForMatch.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                        style={{ fontSize: '12px' }}
                        onClick={() => setSelectedSkillsForMatch([])}
                      >
                        Reset Pilihan
                      </button>
                    )}
                  </div>

                  <div>
                    {AVAILABLE_SKILLS_FOR_MATCH.map((skill) => {
                      const isSelected = selectedSkillsForMatch.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          className={`match-skill-tag-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSkillSelection(skill)}
                        >
                          {isSelected && <Check size={12} />} {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Talent Cards List */}
                {processedTalents.length > 0 ? (
                  <>
                    {(user ? processedTalents : processedTalents.slice(0, 2)).map((talent) => (
                      <div key={talent.id} className="talent-card">
                        <div className="talent-card-banner" />
                        <div className="talent-card-body">
                          {/* Avatar & Match Score */}
                          <div className="talent-avatar-row">
                            <div
                              className="talent-card-avatar"
                              style={{
                                backgroundColor: talent.avatarBg,
                                color: talent.avatarColor
                              }}
                            >
                              {talent.initials}
                            </div>
                            <div>
                              {talent.matchScore !== null && talent.matchScore > 0 ? (
                                <div className="match-score-pill">
                                  <Sparkles size={12} /> {talent.matchScore}% Match
                                </div>
                              ) : (
                                <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
                                  {talent.tier} Tier
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Name & Headline */}
                          <Link to={`/profile/${talent.id}`} className="talent-name-link">
                            {talent.name}
                          </Link>
                          <div className="talent-campus-major">
                            {talent.campus} • {talent.major}
                          </div>
                          <p className="talent-bio-text">{talent.bio}</p>

                          {/* Skills Matrix */}
                          <div className="talent-skill-pills">
                            {talent.skills.map((s, idx) => (
                              <span key={idx} className="talent-skill-badge">
                                {s.name} <span className="talent-skill-pct">{s.level}%</span>
                              </span>
                            ))}
                          </div>

                          {/* Metrics Grid */}
                          <div className="talent-metrics-grid">
                            <div>
                              <div className="talent-metric-val">{talent.modulesCompleted}</div>
                              <div className="talent-metric-lbl">Modul SRL</div>
                            </div>
                            <div>
                              <div className="talent-metric-val">{talent.eventsAttended}</div>
                              <div className="talent-metric-lbl">Event Dihadiri</div>
                            </div>
                            <div>
                              <div className="talent-metric-val" style={{ color: '#059669' }}>
                                {talent.sbtCount} SBT
                              </div>
                              <div className="talent-metric-lbl">On-Chain</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="talent-card-actions">
                            <button
                              type="button"
                              className="btn-verify-sbt"
                              onClick={() => handleOpenVerifyModal(talent)}
                            >
                              <ShieldCheck size={15} /> Verify SBT On-Chain
                            </button>
                            <Link to={`/profile/${talent.id}`} className="btn-view-profile">
                              Lihat Profil <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Guest Locked Gateway Card & Blurred Preview (LinkedIn Style) */}
                    {!user && (
                      <>
                        <div className="talent-locked-gateway-card">
                          <div className="gateway-icon-badge">
                            <Lock size={26} className="text-primary" />
                          </div>
                          <h4 className="fw-bold text-dark mb-2">
                            Masuk ke KampusX untuk Melihat 1.200+ Profil Talenta Lainnya
                          </h4>
                          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px', fontSize: '13.5px' }}>
                            Dapatkan akses penuh ke direktori talenta terverifikasi, verifikasi kredensial Soulbound Token (SBT) Polygon, evaluasi SRL mandiri, dan hubungi kandidat unggulan dari kampus-kampus ternama di Indonesia.
                          </p>
                          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                            <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
                              Masuk dengan Akun KampusX
                            </Link>
                            <Link to="/register" className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold">
                              Daftar Sebagai Pengguna Baru
                            </Link>
                          </div>
                          <div className="gateway-benefits-row">
                            <span>✓ 100% On-Chain Polygon Verified</span>
                            <span>✓ Asesmen SRL & Skill Matrix Riil</span>
                            <span>✓ Hubungi Talenta Langsung</span>
                          </div>
                        </div>

                        {processedTalents[2] && (
                          <div className="talent-card-blurred-preview position-relative">
                            <div className="blurred-content-mask" />
                            <div
                              className="talent-card"
                              style={{
                                filter: 'blur(5px)',
                                pointerEvents: 'none',
                                userSelect: 'none',
                                opacity: 0.45
                              }}
                            >
                              <div className="talent-card-banner" />
                              <div className="talent-card-body">
                                <div className="talent-avatar-row">
                                  <div
                                    className="talent-card-avatar"
                                    style={{
                                      backgroundColor: processedTalents[2].avatarBg,
                                      color: processedTalents[2].avatarColor
                                    }}
                                  >
                                    {processedTalents[2].initials}
                                  </div>
                                  <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
                                    {processedTalents[2].tier} Tier
                                  </span>
                                </div>
                                <h5 className="fw-bold mt-2 mb-1">{processedTalents[2].name}</h5>
                                <div className="text-muted small">
                                  {processedTalents[2].campus} • {processedTalents[2].major}
                                </div>
                                <p className="small text-muted mt-2">{processedTalents[2].bio}</p>
                                <div className="talent-card-actions mt-3">
                                  <button type="button" className="btn-verify-sbt">
                                    <ShieldCheck size={15} /> Verify SBT On-Chain
                                  </button>
                                  <button type="button" className="btn-view-profile">
                                    Lihat Profil <ArrowRight size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="clean-card p-5 text-center text-muted">
                    <Users size={32} className="mb-2 text-secondary" />
                    <h6 className="fw-bold text-dark">Tidak ada kandidat ditemukan</h6>
                    <p className="small mb-0">Coba ubah kata kunci pencarian atau reset filter kriteria.</p>
                  </div>
                )}
              </>
            )}

            {/* ==================== TAB 2: SOCIAL ACTIVITY FEED ==================== */}
            {activeTab === 'feed' && (
              <div>
                {(user ? MOCK_SOCIAL_POSTS : MOCK_SOCIAL_POSTS.slice(0, 1)).map((post) => (
                  <div key={post.id} className="social-post-card">
                    {/* Author Row */}
                    <div className="post-header">
                      <div className="d-flex align-items-center gap-3">
                        <div className="post-author-avatar">{post.authorInitials}</div>
                        <div>
                          <div className="post-author-name">{post.authorName}</div>
                          <div className="post-author-meta">
                            {post.authorHeadline} • {post.timeAgo}
                          </div>
                        </div>
                      </div>
                      <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1" style={{ fontSize: '10px' }}>
                        <ShieldCheck size={11} className="me-1" /> On-Chain Verified
                      </Badge>
                    </div>

                    {/* Post Content */}
                    <div className="post-content-text">{post.content}</div>

                    {/* Verified Certificate Card Attachment */}
                    <div className="post-cert-attachment">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: '#ffffff',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          <Award size={22} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                            {post.badgeHighlight.title}
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            Token ID: {post.badgeHighlight.tokenId} • {post.badgeHighlight.issuer}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success rounded-pill fw-bold"
                        style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                        onClick={() => handleOpenVerifyModal(post.sbtModalTarget)}
                      >
                        Verifikasi On-Chain
                      </button>
                    </div>

                    {/* Action Bar: Like & Comment */}
                    <div className="post-actions-bar">
                      <button
                        type="button"
                        className={`post-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <ThumbsUp size={15} />
                        <span>
                          {post.likesCount + (likedPosts[post.id] ? 1 : 0)} Dukungan
                        </span>
                      </button>
                      <button
                        type="button"
                        className="post-action-btn"
                        onClick={() => {
                          if (!user) promptLoginRequired('Masuk ke akun KampusX Anda untuk memberikan komentar dan berdiskusi di feed.');
                        }}
                      >
                        <MessageCircle size={15} />
                        <span>{post.commentsCount} Komentar</span>
                      </button>
                      <button
                        type="button"
                        className="post-action-btn"
                        onClick={() => {
                          if (!user) promptLoginRequired('Masuk ke akun KampusX Anda untuk membagikan postingan.');
                        }}
                      >
                        <Share2 size={15} />
                        <span>Bagikan</span>
                      </button>
                    </div>
                  </div>
                ))}

                {!user && (
                  <div className="feed-locked-gateway-card">
                    <div className="gateway-icon-badge mb-3">
                      <Sparkles size={24} className="text-primary" />
                    </div>
                    <h5 className="fw-bold text-dark mb-2">
                      Ingin Mengikuti Diskursus & Prestasi Mahasiswa Lainnya?
                    </h5>
                    <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '480px' }}>
                      Bergabunglah dengan komunitas KampusX untuk memberikan dukungan, berdiskusi mengenai capaian microlearning, dan berjejaring dengan ribuan talenta muda berbakat.
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold">
                        Masuk Sekarang
                      </Link>
                      <Link to="/register" className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-bold">
                        Daftar Akun
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN: TRENDING SKILLS & LIVE TICKER ==================== */}
          <div className="linkedin-right-col">
            {/* Live On-Chain SBT Ticker */}
            <div className="clean-card p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success text-white p-1 rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block' }} />
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>
                  Live SBT Minting Ticker
                </h6>
              </div>
              <p className="text-muted small mb-3">
                Pencatatan sertifikat real-time di ledger Polygon:
              </p>

              <div className="d-flex flex-column gap-2 small">
                <div className="p-2 rounded bg-light border-start border-3 border-success">
                  <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                    Ahmad Fauzi (UGM)
                  </div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>
                    Minted: Data Science Specialist • Block #58,219,044
                  </div>
                </div>
                <div className="p-2 rounded bg-light border-start border-3 border-primary">
                  <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                    Rian Hidayat (ITB)
                  </div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>
                    Minted: Cloud & Microservices • Block #58,190,412
                  </div>
                </div>
                <div className="p-2 rounded bg-light border-start border-3 border-warning">
                  <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                    Dian Sastro (UI)
                  </div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>
                    Minted: UI/UX Master • Block #58,124,500
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Skills Widget */}
            <div className="clean-card p-3">
              <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '13px' }}>
                🔥 Keahlian Paling Dicari
              </h6>
              <div className="d-flex flex-wrap gap-1">
                <span className="badge bg-light text-dark border p-1-5">Python (94% demand)</span>
                <span className="badge bg-light text-dark border p-1-5">React.js</span>
                <span className="badge bg-light text-dark border p-1-5">Machine Learning</span>
                <span className="badge bg-light text-dark border p-1-5">Figma UI/UX</span>
                <span className="badge bg-light text-dark border p-1-5">Smart Contract (Solidity)</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ==================== ZERO-TRUST BLOCKCHAIN VERIFICATION MODAL ==================== */}
      <Modal
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="modal-trust-badge">
            <CheckCircle2 size={36} />
          </div>

          <h5 className="fw-bold text-dark mb-1">Zero-Trust Blockchain Verification</h5>
          <p className="text-muted small mb-4">
            Keaslian sertifikat kredensial ini tervalidasi sah on-chain di Polygon Ledger.
          </p>

          {selectedSbtTalent && selectedSbtTalent.latestSbt && (
            <div className="text-start bg-light rounded-3 p-3 mb-4">
              <div className="chain-info-row">
                <span className="chain-info-label">Nama Pemilik:</span>
                <span className="fw-bold text-dark">{selectedSbtTalent.name}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Kredensial:</span>
                <span className="fw-bold text-primary">{selectedSbtTalent.latestSbt.title}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Standar Token:</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  ERC-5192 (Soulbound / Non-Transferable)
                </span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Token ID:</span>
                <span className="chain-info-val">{selectedSbtTalent.latestSbt.tokenId}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Smart Contract:</span>
                <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>
                  {selectedSbtTalent.latestSbt.contractAddress}
                </span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Wallet Pemilik:</span>
                <span className="chain-info-val">{selectedSbtTalent.walletAddress}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Transaction Hash:</span>
                <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>
                  {selectedSbtTalent.latestSbt.txHash}
                </span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Block Height:</span>
                <span className="chain-info-val">#{selectedSbtTalent.latestSbt.block}</span>
              </div>
            </div>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="w-100 rounded-pill py-2"
              onClick={() => setShowVerifyModal(false)}
            >
              Tutup
            </Button>
            <Button
              variant="dark"
              className="w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                window.open('https://polygonscan.com', '_blank');
              }}
            >
              Cek di Polygonscan <ExternalLink size={14} />
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ==================== LOGIN REQUIRED MODAL (LINKEDIN STYLE) ==================== */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="modal-lock-badge mb-3">
            <Lock size={30} className="text-primary" />
          </div>

          <h5 className="fw-bold text-dark mb-2">Akses Khusus Pengguna Terdaftar</h5>
          <p className="text-muted small mb-4">
            {loginModalMessage ||
              'Untuk menjaga privasi data akademik mahasiswa serta integritas verifikasi blockchain kredensial Soulbound Token, silakan masuk ke akun KampusX Anda terlebih dahulu.'}
          </p>

          <div className="d-flex flex-column gap-2 mb-3">
            <Link to="/login" className="btn btn-primary rounded-pill py-2 fw-bold">
              Masuk ke Akun Anda
            </Link>
            <Link to="/register" className="btn btn-outline-secondary rounded-pill py-2 fw-bold">
              Daftar Akun Baru (Gratis)
            </Link>
          </div>

          <button
            type="button"
            className="btn btn-link text-muted small text-decoration-none"
            onClick={() => setShowLoginModal(false)}
          >
            Tutup
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TalentDirectory;
