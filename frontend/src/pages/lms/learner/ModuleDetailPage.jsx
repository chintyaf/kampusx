import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Badge,
  Alert,
} from 'react-bootstrap';
import {
  ChevronLeft,
  Play,
  PlayCircle,
  FileText,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  Lock,
  RotateCcw,
  Target,
  Brain,
  Bookmark,
  Share2,
  Zap,
  ArrowRight,
  HelpCircle,
  Layers,
  Code,
  ShieldCheck,
  Check,
  Flame,
  Star,
} from 'lucide-react';

// ============================================================================
// MOCK DATA: Curated Modules with SRL Forethought and Multi-Unit Lessons
// ============================================================================
const MODULE_DATA_REGISTRY = {
  'mod-arch-101': {
    id: 'mod-arch-101',
    title: 'Web Application Architecture & REST API Design',
    learningPath: 'Full-Stack AI-Powered Web Architecture',
    learningPathId: 'lp-1',
    category: 'System Architecture',
    level: 'Menengah',
    duration: '45 Menit',
    totalLessons: 6,
    completedLessons: 3,
    progressPercent: 50,
    currentLessonId: 'les-4',
    currentLessonTitle: 'Lesson 4: Scalable Endpoints, Idempotency & Rate Limiting',
    xpReward: 150,
    description:
      'Pelajari prinsip perancangan endpoint RESTful yang skalabel, penanganan idempotent request methods, strategi HTTP caching headers, serta teknik rate limiting untuk sistem backend berkinerja tinggi.',
    instructor: {
      name: 'Ir. Hendra Pratama, M.T.',
      title: 'Principal Software Architect @ TechCorp',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      rating: 4.95,
      totalStudents: '3,820',
      bio: '12+ tahun pengalaman membangun arsitektur backend berskala terdistribusi di fintech dan platform edutech.',
    },
    learningOutcomes: [
      'Memahami semantik HTTP methods (GET, POST, PUT, PATCH, DELETE) & HTTP status codes standar industri.',
      'Menerapkan prinsip Idempotency pada payment endpoints dan transfer data kritikal.',
      'Mengkonfigurasi strategi rate-limiting menggunakan algoritma Token Bucket dan Redis.',
      'Membangun API documentation terstruktur menggunakan OpenAPI (Swagger) v3.1.',
    ],
    prerequisites: ['Dasar pemrograman backend (Node.js/Python/Go)', 'Pemahaman protokol dasar HTTP/1.1 & HTTP/2'],
    badgeEarned: {
      title: 'API Architect Apprentice',
      description: 'Menyelesaikan implementasi RESTful API best practices.',
    },
    lessons: [
      {
        id: 'les-1',
        number: 1,
        title: 'Fondasi RESTful Semantic & URI Naming Convention',
        format: 'video',
        duration: '10 min',
        status: 'completed', // completed | current | locked
        xp: 25,
        summary: 'Aturan penamaan URI RESTful, resource plural vs singular, dan anti-patterns.',
      },
      {
        id: 'les-2',
        number: 2,
        title: 'HTTP Status Codes, Error Handling & RFC 7807',
        format: 'article',
        duration: '8 min',
        status: 'completed',
        xp: 20,
        summary: 'Standardisasi format pesan galat JSON menggunakan standar Problem Details (RFC 7807).',
      },
      {
        id: 'les-3',
        number: 3,
        title: 'Diagnostic Checkpoint: REST Principles Assessment',
        format: 'quiz',
        duration: '7 min',
        status: 'completed',
        score: '92/100',
        xp: 30,
        summary: 'Kuis evaluasi pemahaman HTTP contracts dan payload serialization.',
      },
      {
        id: 'les-4',
        number: 4,
        title: 'Scalable Endpoints, Idempotency & Rate Limiting',
        format: 'video',
        duration: '12 min',
        status: 'current',
        xp: 35,
        summary: 'Kunci idempotency key dengan Redis dan konfigurasi sliding window rate limiter.',
      },
      {
        id: 'les-5',
        number: 5,
        title: 'Interactive Code Lab: Implementing Idempotency Middleware',
        format: 'code',
        duration: '10 min',
        status: 'locked',
        xp: 30,
        summary: 'Tulis middleware Express/FastAPI untuk validasi idempotency token pada transaksi.',
      },
      {
        id: 'les-6',
        number: 6,
        title: 'Refleksi Diri SRL & Ringkasan Modul REST API',
        format: 'reflection',
        duration: '8 min',
        status: 'locked',
        xp: 30,
        summary: 'Evaluasi metakognisi, pencatatan insight utama, dan penyesuaian strategi belajar.',
      },
    ],
  },
};

// Fallback module generator if non-registered ID is visited
const getModuleData = (moduleId) => {
  if (MODULE_DATA_REGISTRY[moduleId]) {
    return MODULE_DATA_REGISTRY[moduleId];
  }
  // Generic template for other IDs
  return {
    id: moduleId || 'mod-default',
    title: 'Microlearning Mastery & Technical Foundations',
    learningPath: 'Web Development & Modern Engineering',
    learningPathId: 'lp-1',
    category: 'Software Engineering',
    level: 'Menengah',
    duration: '40 Menit',
    totalLessons: 5,
    completedLessons: 2,
    progressPercent: 40,
    currentLessonId: 'les-3',
    currentLessonTitle: 'Lesson 3: Core Implementation & Best Practices',
    xpReward: 120,
    description:
      'Modul pembelajaran modular microlearning untuk mempercepat akselerasi keahlian teknis secara mandiri melalui kurikulum bertahap.',
    instructor: {
      name: 'Dr. Reza Fauzi',
      title: 'Principal AI Researcher & Tech Mentor',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      rating: 4.9,
      totalStudents: '2,400',
      bio: 'Spesialis dalam arsitektur pembelajaran adaptif mandiri dan teknologi web terdistribusi.',
    },
    learningOutcomes: [
      'Memahami alur implementasi teknis dari level dasar hingga production-ready.',
      'Menerapkan self-regulation dan deliberate practice dalam pemecahan masalah coding.',
      'Membangun portofolio implementasi nyata yang dapat diverifikasi.',
    ],
    prerequisites: ['Pemahaman dasar web programming', 'Kemauan untuk belajar aktif mandiri'],
    badgeEarned: {
      title: 'Active Tech Scholar',
      description: 'Menyelesaikan modul dengan konsistensi belajar tinggi.',
    },
    lessons: [
      {
        id: 'les-1',
        number: 1,
        title: 'Pengantar Konsep & Prinsip Dasar',
        format: 'video',
        duration: '10 min',
        status: 'completed',
        xp: 25,
        summary: 'Dasar pemahaman arsitektur dan framework yang digunakan.',
      },
      {
        id: 'les-2',
        number: 2,
        title: 'Deep Dive: Komponen Utama & Praktik Nyata',
        format: 'article',
        duration: '8 min',
        status: 'completed',
        xp: 20,
        summary: 'Ulasan mendalam dengan studi kasus riil industri.',
      },
      {
        id: 'les-3',
        number: 3,
        title: 'Core Implementation & Best Practices',
        format: 'video',
        duration: '12 min',
        status: 'current',
        xp: 35,
        summary: 'Sesi praktik langsung dan penulisan kode terstruktur.',
      },
      {
        id: 'les-4',
        number: 4,
        title: 'Checkpoint Evaluasi & Diagnostic Quiz',
        format: 'quiz',
        duration: '8 min',
        status: 'locked',
        xp: 25,
        summary: 'Uji pemahaman mandiri dengan soal diagnostik adaptif.',
      },
      {
        id: 'les-5',
        number: 5,
        title: 'Refleksi Diri SRL & Metakognisi Belajar',
        format: 'reflection',
        duration: '7 min',
        status: 'locked',
        xp: 25,
        summary: 'Refleksi evaluasi capaian belajar dan rencana aplikasi nyata.',
      },
    ],
  };
};

/**
 * ModuleDetailPage
 * Halaman Akses & Overview Modul Microlearning
 * Mengintegrasikan prinsip SRL Fase 1: Forethought & Planning,
 * Daftar Unit Responsif, dan CTA Lanjutkan Belajar.
 */
const ModuleDetailPage = () => {
  const { moduleId = 'mod-arch-101' } = useParams();
  const navigate = useNavigate();

  const moduleData = getModuleData(moduleId);

  // --- STATE SRL FASE 1: FORETHOUGHT & PLANNING ---
  const [sessionTime, setSessionTime] = useState('15'); // '15' | '30' | '45'
  const [selectedStrategy, setSelectedStrategy] = useState('note_taking'); // 'note_taking' | 'video_quiz' | 'direct_lab'
  const [commitmentCheck, setCommitmentCheck] = useState(true);
  const [forethoughtSaved, setForethoughtSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Filter lessons
  const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'uncompleted'

  const handleSaveForethought = () => {
    setForethoughtSaved(true);
    setTimeout(() => {
      setForethoughtSaved(false);
    }, 4000);
  };

  const handleNavigateToLesson = (lessonId) => {
    navigate(`/learner/modules/${moduleId}/lesson/${lessonId}`);
  };

  const filteredLessons = moduleData.lessons.filter((les) => {
    if (lessonFilter === 'uncompleted') {
      return les.status !== 'completed';
    }
    return true;
  });

  const getFormatBadge = (format) => {
    switch (format) {
      case 'video':
        return {
          icon: <PlayCircle size={14} className="text-primary" />,
          label: 'Video',
          bg: '#E0F2FE',
          color: '#028090',
        };
      case 'article':
        return {
          icon: <FileText size={14} className="text-info" />,
          label: 'Artikel',
          bg: '#E0F7FA',
          color: '#00838F',
        };
      case 'quiz':
        return {
          icon: <HelpCircle size={14} className="text-warning" />,
          label: 'Kuis',
          bg: '#FEF3C7',
          color: '#B45309',
        };
      case 'code':
        return {
          icon: <Code size={14} style={{ color: '#6366F1' }} />,
          label: 'Code Lab',
          bg: '#EEF2FF',
          color: '#4F46E5',
        };
      case 'reflection':
        return {
          icon: <Brain size={14} style={{ color: '#8B5CF6' }} />,
          label: 'Refleksi SRL',
          bg: '#F5F3FF',
          color: '#7C3AED',
        };
      default:
        return {
          icon: <BookOpen size={14} />,
          label: 'Materi',
          bg: '#F1F5F9',
          color: '#475569',
        };
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* ====================================================================
          1. HERO BANNER (Dark Navy #0B2545 Theme)
         ==================================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 0 3.25rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container>
          {/* Breadcrumb Navigation */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
              <li className="breadcrumb-item">
                <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/learning" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Learning Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/explore-microlearning" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Eksplorasi
                </Link>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">
                {moduleData.title}
              </li>
            </ol>
          </nav>

          <Row className="align-items-center g-4">
            <Col lg={9}>
              {/* Category Badges & AI Tag */}
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span
                  className="badge px-3 py-1 fw-bold d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: 'rgba(2, 128, 144, 0.25)',
                    color: '#E0F2FE',
                    border: '1px solid rgba(0, 168, 232, 0.4)',
                    fontSize: '0.78rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Layers size={13} />
                  <span>MODUL MICROLEARNING</span>
                </span>

                <span
                  className="badge px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: '0.78rem',
                    borderRadius: '9999px',
                  }}
                >
                  <span>{moduleData.level}</span>
                </span>

                <span
                  className="badge px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#FEF3C7',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontSize: '0.78rem',
                    borderRadius: '9999px',
                  }}
                >
                  <Sparkles size={12} className="text-warning" />
                  <span>AI Recommended</span>
                </span>
              </div>

              {/* Module Title */}
              <h1
                className="fw-bold mb-2 text-white"
                style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', letterSpacing: '-0.02em', lineHeight: 1.28 }}
              >
                {moduleData.title}
              </h1>

              {/* Description */}
              <p
                className="text-white-50 mb-3"
                style={{ fontSize: '0.94rem', lineHeight: 1.6, maxWidth: '840px' }}
              >
                {moduleData.description}
              </p>

              {/* Metrics & Progress Bar */}
              <div className="d-flex align-items-center gap-3 text-white-50 flex-wrap small mb-3">
                <span className="d-flex align-items-center gap-2 text-white fw-semibold">
                  <Clock size={15} style={{ color: '#00A8E8' }} />
                  {moduleData.duration} Estimasi
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-2 text-white fw-semibold">
                  <BookOpen size={15} style={{ color: '#00A8E8' }} />
                  {moduleData.totalLessons} Lesson Units
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-2 text-warning fw-semibold">
                  <Zap size={15} />
                  +{moduleData.xpReward} XP Reward
                </span>
                <span>•</span>
                <span className="text-white-50">Jalur: {moduleData.learningPath}</span>
              </div>

              {/* Visual Progress Bar */}
              <div className="mb-4" style={{ maxWidth: '680px' }}>
                <div className="d-flex align-items-center justify-content-between mb-1 small">
                  <span className="text-white-50">
                    Progres Modul: <strong className="text-white">{moduleData.completedLessons} dari {moduleData.totalLessons} Lesson Selesai</strong>
                  </span>
                  <span className="fw-bold text-white" style={{ color: '#00cec9' }}>
                    {moduleData.progressPercent}% Selesai
                  </span>
                </div>
                <div
                  className="progress"
                  style={{
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${moduleData.progressPercent}%`,
                      background: 'linear-gradient(90deg, #028090 0%, #00cec9 100%)',
                      borderRadius: '9999px',
                    }}
                    aria-valuenow={moduleData.progressPercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              {/* Primary CTA Buttons */}
              <div className="d-flex align-items-center gap-2 flex-column flex-sm-row">
                <Button
                  variant="primary"
                  className="fw-bold px-4 py-2 rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: '#028090',
                    borderColor: '#028090',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 14px rgba(2, 128, 144, 0.4)',
                  }}
                  onClick={() => handleNavigateToLesson(moduleData.currentLessonId)}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Lanjutkan ke Lesson {moduleData.currentLessonId.replace('les-', '')}</span>
                </Button>

                <Button
                  variant="outline-light"
                  className="fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.92rem',
                  }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <Bookmark
                    size={16}
                    color={isBookmarked ? '#f59e0b' : '#FFFFFF'}
                    fill={isBookmarked ? '#f59e0b' : 'transparent'}
                  />
                  <span>{isBookmarked ? 'Modul Disimpan' : 'Bookmark Modul'}</span>
                </Button>

                <Button
                  variant="link"
                  className="text-white-50 text-decoration-none small d-inline-flex align-items-center gap-2 p-2 justify-content-center"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Tautan modul berhasil disalin ke clipboard!');
                    }
                  }}
                >
                  <Share2 size={15} />
                  <span>Bagikan</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ====================================================================
          2. MAIN CONTENT & SIDEBAR SECTION (col-lg-8 & col-lg-4)
         ==================================================================== */}
      <Container className="mt-n4" style={{ marginTop: '-1.5rem' }}>
        <Row className="g-4">
          {/* ================================================================
              A. MAIN CONTENT AREA (col-lg-8)
             ================================================================ */}
          <Col lg={8}>
            {/* 1. WIDGET SRL: FASE 1 - FORETHOUGHT & PLANNING */}
            <Card
              className="border shadow-sm rounded-3 p-3 p-md-4 mb-4 bg-white"
              style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '38px', height: '38px', backgroundColor: '#E0F2FE', color: '#028090' }}
                  >
                    <Brain size={20} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ fontSize: '1.12rem', color: '#0B2545' }}>
                      Rencanakan Sesi Belajarmu (SRL Forethought Phase)
                    </h4>
                    <span className="text-muted small">
                      Tetapkan niat, alokasi waktu, dan strategi belajar sebelum mulai membuka materi.
                    </span>
                  </div>
                </div>
                <Badge bg="light" text="dark" className="border px-3 py-1 text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                  Self-Regulated Learning
                </Badge>
              </div>

              {/* Time Budget Selector */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold text-dark small">Target Waktu Sesi Ini:</span>
                  <span className="text-muted small fw-bold" style={{ color: '#028090' }}>
                    {sessionTime} Menit Terpilih
                  </span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    { val: '15', label: '15 Menit (Quick Bite)', icon: '⚡' },
                    { val: '30', label: '30 Menit (Standar)', icon: '🎯' },
                    { val: '45', label: '45 Menit (Deep Focus)', icon: '🔥' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className={`btn btn-sm rounded-3 px-3 py-1 fw-semibold ${
                        sessionTime === item.val
                          ? 'btn-primary text-white shadow-sm'
                          : 'btn-outline-secondary border bg-light text-dark'
                      }`}
                      style={
                        sessionTime === item.val
                          ? { backgroundColor: '#028090', borderColor: '#028090', transition: 'all 0.2s ease' }
                          : { borderColor: '#E2E8F0', transition: 'all 0.2s ease' }
                      }
                      onClick={() => setSessionTime(item.val)}
                    >
                      <span className="me-1">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Strategy Selector */}
              <div className="mb-3">
                <span className="fw-semibold text-dark small d-block mb-2">Pilih Strategi Belajar Hari Ini:</span>
                <div className="d-flex flex-column gap-2">
                  {[
                    {
                      id: 'note_taking',
                      title: 'Active Note-Taking (Catat Poin Kunci)',
                      desc: 'Mencatat insight pada tab Catatan di samping materi video/teks.',
                    },
                    {
                      id: 'video_quiz',
                      title: 'Watch & Checkpoint Diagnostic',
                      desc: 'Fokus menonton video dengan seksama lalu langsung uji pemahaman kuis.',
                    },
                    {
                      id: 'direct_lab',
                      title: 'Direct Code Lab & Hands-On',
                      desc: 'Langsung praktikkan contoh kode API dan verifikasi respon endpoint.',
                    },
                  ].map((strat) => (
                    <div
                      key={strat.id}
                      className={`p-2 rounded-3 border d-flex align-items-start gap-2 ${
                        selectedStrategy === strat.id ? 'bg-light border-primary' : 'bg-white'
                      }`}
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedStrategy === strat.id ? '#028090' : '#E2E8F0',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setSelectedStrategy(strat.id)}
                    >
                      <input
                        type="radio"
                        id={strat.id}
                        name="learning_strategy"
                        checked={selectedStrategy === strat.id}
                        onChange={() => setSelectedStrategy(strat.id)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor={strat.id} className="fw-bold text-dark small mb-0 d-block" style={{ cursor: 'pointer' }}>
                          {strat.title}
                        </label>
                        <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                          {strat.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commitment Checkbox */}
              <div className="p-2 rounded-3 mb-3 bg-light border d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="srl-commitment"
                  checked={commitmentCheck}
                  onChange={(e) => setCommitmentCheck(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="srl-commitment" className="small text-dark mb-0 fw-medium" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                  Saya berkomitmen fokus penuh selama <strong>{sessionTime} menit</strong> tanpa distraksi media sosial.
                </label>
              </div>

              {/* Save Plan Button & Feedback */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="fw-bold px-3 py-2 rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#028090', borderColor: '#028090' }}
                  onClick={handleSaveForethought}
                >
                  <Target size={15} />
                  <span>Kunci Rencana Belajar (+15 XP)</span>
                </Button>

                {forethoughtSaved && (
                  <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1">
                    <CheckCircle2 size={15} />
                    Target sesi {sessionTime} menit & strategi berhasil disimpan!
                  </span>
                )}
              </div>
            </Card>

            {/* 2. DAFTAR UNIT PEMBELAJARAN (LESSON ROADMAP) */}
            <Card
              className="border shadow-sm rounded-3 p-3 p-md-4 mb-4 bg-white"
              style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: '1.25rem', color: '#0B2545' }}>
                    Daftar Unit Pembelajaran
                  </h3>
                  <p className="text-muted small mb-0">
                    Selesaikan unit secara berurutan untuk memaksimalkan retensi materi microlearning.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="btn-group btn-group-sm p-1 bg-light rounded-3 border">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-2 py-1 px-3 fw-medium ${
                      lessonFilter === 'all' ? 'bg-white shadow-sm text-primary fw-bold' : 'text-muted'
                    }`}
                    onClick={() => setLessonFilter('all')}
                  >
                    Semua ({moduleData.lessons.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-2 py-1 px-3 fw-medium ${
                      lessonFilter === 'uncompleted' ? 'bg-white shadow-sm text-primary fw-bold' : 'text-muted'
                    }`}
                    onClick={() => setLessonFilter('uncompleted')}
                  >
                    Belum Selesai ({moduleData.lessons.filter((l) => l.status !== 'completed').length})
                  </button>
                </div>
              </div>

              {/* Units List */}
              <div className="d-flex flex-column gap-2">
                {filteredLessons.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const isCurrent = item.status === 'current';
                  const isLocked = item.status === 'locked';
                  const formatInfo = getFormatBadge(item.format);

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-3 border"
                      style={{
                        backgroundColor: isCurrent ? '#F0F9FF' : isLocked ? '#F8FAFC' : '#FFFFFF',
                        borderColor: isCurrent ? '#00A8E8' : '#E2E8F0',
                        boxShadow: isCurrent ? '0 3px 12px rgba(0, 168, 232, 0.12)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                        {/* Left: Number, Status, Info */}
                        <div className="d-flex align-items-start gap-2 min-w-0">
                          {/* Status Icon Indicator */}
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: isCompleted
                                ? '#ECFDF5'
                                : isCurrent
                                ? '#E0F2FE'
                                : '#F1F5F9',
                              color: isCompleted
                                ? '#059669'
                                : isCurrent
                                ? '#028090'
                                : '#94A3B8',
                              border: `1.5px solid ${
                                isCompleted
                                  ? '#A7F3D0'
                                  : isCurrent
                                  ? '#BAE6FD'
                                  : '#CBD5E1'
                              }`,
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={17} className="text-success" />
                            ) : isCurrent ? (
                              <RotateCcw size={16} style={{ color: '#028090' }} />
                            ) : (
                              <Lock size={15} />
                            )}
                          </div>

                          <div className="min-w-0">
                            {/* Meta Badges */}
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span
                                className="badge px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-pill"
                                style={{
                                  backgroundColor: formatInfo.bg,
                                  color: formatInfo.color,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {formatInfo.icon}
                                <span>{formatInfo.label}</span>
                              </span>

                              <span className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                <Clock size={11} />
                                <span>{item.duration}</span>
                              </span>

                              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                +{item.xp} XP
                              </span>

                              {isCompleted && (
                                <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.68rem' }}>
                                  ✓ Selesai {item.score && `(${item.score})`}
                                </span>
                              )}

                              {isCurrent && (
                                <span className="badge text-white fw-bold px-2 py-1 rounded-pill" style={{ backgroundColor: '#028090', fontSize: '0.68rem' }}>
                                  🔄 Sedang Dipelajari
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h5
                              className="fw-bold mb-1 text-dark"
                              style={{
                                fontSize: '0.98rem',
                                lineHeight: 1.35,
                                color: isLocked ? '#64748B' : '#0B2545',
                              }}
                            >
                              Unit {item.number}: {item.title}
                            </h5>

                            {/* Summary description */}
                            <p className="text-muted mb-0 small" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        {/* Right: Action Button */}
                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0 flex-shrink-0 align-self-end align-self-sm-center">
                          {isCompleted ? (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="rounded-3 px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.8rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToLesson(item.id);
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Ulangi</span>
                            </Button>
                          ) : isCurrent ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-3 px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                              style={{ backgroundColor: '#028090', borderColor: '#028090', fontSize: '0.82rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToLesson(item.id);
                              }}
                            >
                              <Play size={13} fill="currentColor" />
                              <span>Buka Lesson</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-3 px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                              style={{ borderColor: '#028090', color: '#028090', fontSize: '0.8rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToLesson(item.id);
                              }}
                            >
                              <Play size={12} />
                              <span>Buka Unit</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 3. CAPAIAN PEMBELAJARAN (LEARNING OUTCOMES) */}
            <Card className="border shadow-sm rounded-3 p-3 p-md-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <h4 className="fw-bold mb-3" style={{ fontSize: '1.15rem', color: '#0B2545' }}>
                Apa yang Akan Kamu Kuasai
              </h4>

              <div className="d-flex flex-column gap-2 mb-4">
                {moduleData.learningOutcomes.map((out, idx) => (
                  <div key={idx} className="d-flex align-items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-1 text-success" />
                    <span className="text-dark small" style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                      {out}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-top">
                <h6 className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.03em', fontSize: '0.75rem' }}>
                  Prasyarat Pengetahuan (Prerequisites):
                </h6>
                <div className="d-flex gap-2 flex-wrap">
                  {moduleData.prerequisites.map((pre, i) => (
                    <span key={i} className="badge bg-light text-muted border px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                      • {pre}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Col>

          {/* ================================================================
              B. SIDEBAR AREA (col-lg-4)
             ================================================================ */}
          <Col lg={4}>
            {/* 1. INSTRUKTUR KELAS */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="fw-bold text-muted small text-uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                Instruktur Pengampu
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={moduleData.instructor.avatar}
                  alt={moduleData.instructor.name}
                  className="rounded-circle border"
                  style={{ width: '54px', height: '54px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.98rem' }}>
                    {moduleData.instructor.name}
                  </h6>
                  <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    {moduleData.instructor.title}
                  </div>
                  <div className="d-flex align-items-center gap-2 text-warning small mt-1">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span className="fw-bold text-dark">{moduleData.instructor.rating}</span>
                    <span className="text-muted">• {moduleData.instructor.totalStudents} Siswa</span>
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                {moduleData.instructor.bio}
              </p>
            </Card>

            {/* 2. DIGITAL BADGE & SERTIFIKASI CHECKPOINT */}
            <Card
              className="border shadow-sm rounded-3 p-4 mb-4"
              style={{
                borderColor: '#BAE6FD',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <Award size={18} style={{ color: '#028090' }} />
                <h6 className="fw-bold mb-0" style={{ color: '#0B2545', fontSize: '0.95rem' }}>
                  Badge Modul: {moduleData.badgeEarned.title}
                </h6>
              </div>

              <p className="text-muted small mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                Selesaikan seluruh 6 unit pembelajaran dan checkpoint refleksi SRL untuk mengklaim badge kredensial digital ini.
              </p>

              <div className="p-3 rounded-3 bg-white border text-center shadow-sm" style={{ borderColor: '#BAE6FD' }}>
                <div
                  className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{ width: '48px', height: '48px', backgroundColor: '#028090', color: '#FFFFFF' }}
                >
                  <Award size={26} />
                </div>
                <div className="fw-bold text-dark small">{moduleData.badgeEarned.title}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Verified Micro-Credential
                </div>
              </div>
            </Card>

            {/* 3. SRL TIPS & HABIT BOOSTER */}
            <Card className="border shadow-sm rounded-3 p-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Sparkles size={16} className="text-warning" />
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.92rem' }}>
                  Tips Metakognisi Belajar (SRL)
                </h6>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                "Riset membuktikan bahwa mahasiswa yang menentukan alokasi waktu dan mencatat poin kunci secara mandiri memiliki retensi ingatan 40% lebih tinggi dibandingkan menonton pasif."
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ModuleDetailPage;
