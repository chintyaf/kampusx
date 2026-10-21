import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Offcanvas,
  ProgressBar,
  Form,
  Nav,
  Alert,
  Modal,
} from 'react-bootstrap';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  PlayCircle,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  CheckCircle2,
  CheckSquare,
  Square,
  Bookmark,
  Share2,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  Brain,
  ThumbsUp,
  AlertCircle,
  Star,
  Copy,
  Check,
  Send,
  Clock,
  BookOpen,
  Award,
  Layers,
  Code,
  Flame,
  ArrowRight,
  Zap,
  Lock,
  XCircle,
} from 'lucide-react';

// Import Custom Styles for Clean, Refactored Layout
// import '@/styles/lessonViewer.css';
import '@/pages/lms/lessonViewer.css';

// Import Micro-Quiz mock data and persistence helpers
import {
  mockLessonMicroQuizzes,
  getLearnerXp,
  addLearnerXp,
  getLessonMicroQuizStatus,
  setLessonMicroQuizCompleted,
} from '@/data/learningMockData';

// ============================================================================
// MOCK DATA: Curated Multi-Unit Lessons for Lesson Viewer
// ============================================================================
const MODULE_LESSONS_DATA = [
  {
    id: 'les-1',
    number: 1,
    title: 'Fondasi RESTful Semantic & URI Naming Convention',
    type: 'video',
    duration: '10 min',
    xp: 25,
    videoDuration: '10:00',
    videoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Pelajari prinsip keterbacaan URI dalam arsitektur REST, pemisahan resource koleksi dengan resource singular, dan penggunaan HTTP methods yang tepat.',
    codeSnippet: `// ❌ Bad Practice:
GET /getUsers
POST /deleteUser/123

// ✅ Good RESTful Practice:
GET    /api/v1/users        // Ambil daftar users
POST   /api/v1/users        // Buat user baru
GET    /api/v1/users/:id    // Ambil detail user
DELETE /api/v1/users/:id    // Hapus user`,
    microQuiz: mockLessonMicroQuizzes['les-1'] || [],
  },
  {
    id: 'les-2',
    number: 2,
    title: 'HTTP Status Codes, Error Handling & RFC 7807',
    type: 'article',
    duration: '8 min',
    xp: 20,
    videoDuration: '08:00',
    videoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Standardisasi format pesan error response menggunakan RFC 7807 Problem Details for HTTP APIs.',
    codeSnippet: `// Standard RFC 7807 JSON Error Response
{
  "type": "https://api.kampusx.id/errors/insufficient-credits",
  "title": "Insufficient Balance",
  "status": 403,
  "detail": "Saldo kuota belajar Anda tidak mencukupi untuk request ini.",
  "instance": "/orders/req-99124"
}`,
    microQuiz: mockLessonMicroQuizzes['les-2'] || [],
  },
  {
    id: 'les-3',
    number: 3,
    title: 'Diagnostic Checkpoint: REST Principles Assessment',
    type: 'quiz',
    duration: '7 min',
    xp: 30,
    videoDuration: '07:00',
    videoUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Uji pemahaman mandiri konsep HTTP idempotency, caching headers, dan RESTful URI conventions.',
    codeSnippet: `// Evaluasi Checkpoint:
// GET & DELETE bersifat Idempotent (Multiple identical requests = Same server state)
// POST bersifat Non-Idempotent (Creating multiple resources on repeat)`,
    microQuiz: mockLessonMicroQuizzes['les-3'] || [],
  },
  {
    id: 'les-4',
    number: 4,
    title: 'Scalable Endpoints, Idempotency & Rate Limiting',
    type: 'video',
    duration: '12 min',
    xp: 35,
    videoDuration: '12:30',
    videoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Dalam lesson ini, kita akan membahas teknik mitigasi double-payment dengan Idempotency Keys di Redis dan algoritma Token Bucket untuk rate-limiting endpoint API.',
    codeSnippet: `// Contoh Header Idempotency pada Pembayaran:
POST /api/v1/payments/charge
Host: api.kampusx.id
Idempotency-Key: a48b7762-2df0-4e2b-bfe9-6231d683a31c
Content-Type: application/json

{
  "amount": 250000,
  "currency": "IDR",
  "reference_id": "ORD-2026-X1"
}`,
    microQuiz: mockLessonMicroQuizzes['les-4'] || [],
  },
  {
    id: 'les-5',
    number: 5,
    title: 'Interactive Code Lab: Implementing Idempotency Middleware',
    type: 'code',
    duration: '10 min',
    xp: 30,
    videoDuration: '10:00',
    videoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Implementasikan middleware validasi Idempotency Key dengan fallback database lock and cache response.',
    codeSnippet: `async function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const cached = await redis.get(\`idemp:\${key}\`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }
  // Proceed and cache response
  next();
}`,
    microQuiz: mockLessonMicroQuizzes['les-5'] || [],
  },
  {
    id: 'les-6',
    number: 6,
    title: 'Refleksi Diri SRL & Ringkasan Modul REST API',
    type: 'reflection',
    duration: '8 min',
    xp: 30,
    videoDuration: '08:00',
    videoUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Refleksi komprehensif, evaluasi metakognisi pembelajaran mandiri, dan sertifikasi penyelesaian modul.',
    codeSnippet: `// Metakognisi SRL:
// 1. Apakah strategi Active Note-Taking berhasil meningkatkan pemahamanmu?
// 2. Bagaimana kamu akan menerapkan prinsip Idempotency pada proyekmu selanjutnya?`,
    microQuiz: mockLessonMicroQuizzes['les-6'] || [],
  },
];

/**
 * LessonViewerPage (Refactored UI/UX)
 * Standar KampusX:
 * 1. Fixed-width Sidebar (320px) dengan scroll independen & text-clamping
 * 2. Main content fleksibel dengan 16x9 player berlatar dark navy (#0B2545)
 * 3. Modern tabs bergaris aksen Cyan (#028090) dengan padding lega 24px
 * 4. Widget SRL terstruktur proporsional
 * 5. Sticky Bottom Action Bar sesuai wireframe
 */
const LessonViewerPage = () => {
  const { moduleId = 'mod-arch-101', lessonId = 'les-4' } = useParams();
  const navigate = useNavigate();

  // Find active lesson
  const activeLessonIndex = MODULE_LESSONS_DATA.findIndex((l) => l.id === lessonId);
  const currentLessonIndex = activeLessonIndex !== -1 ? activeLessonIndex : 3;
  const currentLesson = MODULE_LESSONS_DATA[currentLessonIndex];

  // Track completed lessons set
  const [completedLessonIds, setCompletedLessonIds] = useState(
    new Set(['les-1', 'les-2', 'les-3'])
  );

  // Micro-Quiz data for current lesson
  const activeQuizList = currentLesson?.microQuiz?.length
    ? currentLesson.microQuiz
    : mockLessonMicroQuizzes[currentLesson.id] || mockLessonMicroQuizzes['les-4'] || [];

  // Micro-Quiz interactive state: simultaneous batch evaluation (Pilih Semua Soal -> Konfirmasi Bersamaan)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [q.id]: optionIndex }
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isMicroQuizCompleted, setIsMicroQuizCompleted] = useState(false);
  const [xpToast, setXpToast] = useState({ show: false, xp: 0, text: '' });
  const [awardedXpQuestions, setAwardedXpQuestions] = useState(new Set());

  // Check completion on mount or lesson change
  useEffect(() => {
    const isDone = getLessonMicroQuizStatus(currentLesson.id) || completedLessonIds.has(currentLesson.id);
    setIsMicroQuizCompleted(isDone);

    if (isDone) {
      const initial = {};
      activeQuizList.forEach((q) => {
        initial[q.id] = q.correctAnswer;
      });
      setSelectedAnswers(initial);
      setIsQuizSubmitted(true);
    } else {
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
    }
    setShowQuizModal(false);
  }, [currentLesson.id]);

  // Tahap 1: Pilih Opsi Jawaban (bebas memilih per soal sebelum evaluasi serentak)
  const handleSelectOption = (qId, optionIdx) => {
    if (isQuizSubmitted) return; // opsi terkunci saat evaluasi hasil sudah disubmit
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  // Validasi apakah seluruh soal sudah dijawab
  const totalQuestions = activeQuizList.length;
  const isAllAnswered =
    totalQuestions > 0 &&
    activeQuizList.every(
      (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null
    );

  // Validasi apakah seluruh jawaban benar
  const isQuizAllCorrect =
    isAllAnswered &&
    activeQuizList.every((q) => selectedAnswers[q.id] === q.correctAnswer);

  const isQuizFullyPassed = isMicroQuizCompleted || (isQuizSubmitted && isQuizAllCorrect);

  // Tahap 2: Konfirmasi & Periksa Semua Jawaban Bersamaan (isSubmitted = true)
  const handleConfirmAll = () => {
    if (!isAllAnswered) return;
    setIsQuizSubmitted(true);

    if (isQuizAllCorrect) {
      setIsMicroQuizCompleted(true);
      setLessonMicroQuizCompleted(currentLesson.id);
      setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));

      // Hitung total reward XP kuis
      const totalXp = activeQuizList.reduce((acc, q) => acc + (q.xpReward || 15), 0);

      // Tampilkan toast selebrasi perolehan XP jika belum pernah diperoleh
      const anyUnawarded = activeQuizList.some((q) => !awardedXpQuestions.has(q.id));
      if (anyUnawarded) {
        addLearnerXp(totalXp);
        setAwardedXpQuestions((prev) => {
          const next = new Set(prev);
          activeQuizList.forEach((q) => next.add(q.id));
          return next;
        });
        setXpToast({
          show: true,
          xp: totalXp,
          text: `+${totalXp} XP Diperoleh!`,
        });
        setTimeout(() => {
          setXpToast((prev) => ({ ...prev, show: false }));
        }, 2800);
      }
    }
  };

  // Reset saat Coba Lagi / Ulangi Kuis (Meriset state pilihan jawaban)
  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  };

  // Drawer state for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(45);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'summary' | 'notes'

  const [showCelebration, setShowCelebration] = useState(false);

  // Notes state
  const [notesList, setNotesList] = useState([
    {
      id: 1,
      time: '02:40',
      text: 'Idempotency Key wajib dikirim pada header POST request untuk mencegah duplicate billing.',
    },
    {
      id: 2,
      time: '05:15',
      text: 'Redis setnx atau atomicity key sangat efektif sebagai distributed lock sebelum transaksi dijalankan.',
    },
  ]);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Check if current lesson is last in module
  const isLastLesson = currentLessonIndex === MODULE_LESSONS_DATA.length - 1;
  const isUnlocked = isQuizFullyPassed || completedLessonIds.has(currentLesson.id);

  // Jump freely to any lesson
  const handleSelectLesson = (id) => {
    setIsSidebarOpen(false);
    navigate(`/learner/modules/${moduleId}/lesson/${id}`);
  };

  // Navigate to Next Lesson or Module Quiz if last
  const handleNextLesson = () => {
    setShowQuizModal(false);
    if (!isUnlocked) return;
    if (currentLessonIndex < MODULE_LESSONS_DATA.length - 1) {
      const nextId = MODULE_LESSONS_DATA[currentLessonIndex + 1].id;
      navigate(`/learner/modules/${moduleId}/lesson/${nextId}`);
    } else {
      navigate(`/learner/modules/${moduleId}/quiz`);
    }
  };

  // Navigate to Prev Lesson
  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevId = MODULE_LESSONS_DATA[currentLessonIndex - 1].id;
      navigate(`/learner/modules/${moduleId}/lesson/${prevId}`);
    }
  };

  // Complete and advance
  const handleMarkCompleteAndNext = () => {
    if (!isUnlocked) return;
    setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));
    setLessonMicroQuizCompleted(currentLesson.id);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
      if (currentLessonIndex < MODULE_LESSONS_DATA.length - 1) {
        const nextId = MODULE_LESSONS_DATA[currentLessonIndex + 1].id;
        navigate(`/learner/modules/${moduleId}/lesson/${nextId}`);
      } else {
        navigate(`/learner/modules/${moduleId}/quiz`);
      }
    }, 1200);
  };

  // Save personal note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const newNote = {
      id: Date.now(),
      time: '04:15',
      text: newNoteInput.trim(),
    };
    setNotesList((prev) => [newNote, ...prev]);
    setNewNoteInput('');
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentLesson.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Reading progress percentage
  const readingProgressPercent = Math.min(
    100,
    Math.round(((currentLessonIndex + (completedLessonIds.has(currentLesson.id) ? 1 : 0.5)) / MODULE_LESSONS_DATA.length) * 100)
  );

  // ==========================================================================
  // SIDEBAR CONTENT COMPONENT
  // ==========================================================================
  const LessonsSidebarContent = () => (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Sidebar Header */}
      <div className="lesson-sidebar-header">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <Link
            to={`/learner/modules/${moduleId}`}
            className="text-muted small text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
          >
            <ChevronLeft size={14} />
            <span>Kembali ke Silabus</span>
          </Link>
          <span className="badge rounded-pill bg-light text-muted border px-2 py-1" style={{ fontSize: '0.7rem' }}>
            Unit {currentLesson.number} / {MODULE_LESSONS_DATA.length}
          </span>
        </div>

        <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.94rem', lineHeight: 1.35 }}>
          Web Architecture & REST API Design
        </h6>

        {/* Mini progress tracker */}
        <div className="d-flex align-items-center justify-content-between mb-1 text-muted" style={{ fontSize: '0.75rem' }}>
          <span>Progres Belajar:</span>
          <span className="fw-bold text-dark">{completedLessonIds.size} dari {MODULE_LESSONS_DATA.length} Selesai</span>
        </div>
        <div className="progress" style={{ height: '5px', backgroundColor: '#E2E8F0', borderRadius: '999px' }}>
          <div
            className="progress-bar"
            style={{
              width: `${(completedLessonIds.size / MODULE_LESSONS_DATA.length) * 100}%`,
              backgroundColor: '#028090',
              borderRadius: '999px',
            }}
          />
        </div>
      </div>

      {/* Lesson Units List */}
      <div className="lesson-sidebar-list">
        <div className="fw-bold text-muted small text-uppercase px-3 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
          Daftar Lesson (Klik untuk Loncat)
        </div>

        {MODULE_LESSONS_DATA.map((item) => {
          const isSelected = item.id === currentLesson.id;
          const isDone = completedLessonIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => handleSelectLesson(item.id)}
              className={`lesson-sidebar-item ${isSelected ? 'active' : ''}`}
              title={`Loncat ke Unit ${item.number}: ${item.title}`}
            >
              {/* Status Badge Icon */}
              <div
                className={`lesson-status-badge ${
                  isSelected ? 'active' : isDone ? 'completed' : 'uncompleted'
                }`}
              >
                {isDone ? (
                  <CheckSquare size={18} className="text-success" />
                ) : isSelected ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <Square size={18} className="text-secondary opacity-50" />
                )}
              </div>

              <div className="min-w-0 flex-grow-1">
                <div className="lesson-item-title">
                  {item.number}. {item.title}
                </div>

                <div className="lesson-item-meta">
                  <span className="d-inline-flex align-items-center gap-1">
                    <Clock size={11} />
                    <span>{item.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="text-uppercase">{item.type}</span>
                  {isDone && (
                    <>
                      <span>•</span>
                      <span className="text-success fw-semibold">Selesai</span>
                    </>
                  )}
                  {isSelected && (
                    <>
                      <span>•</span>
                      <span className="fw-bold" style={{ color: '#028090' }}>Sedang Aktif</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SRL Forethought Reminder inside sidebar footer */}
      <div className="p-3 border-top bg-light" style={{ fontSize: '0.8rem' }}>
        <div className="d-flex align-items-center gap-2 text-dark fw-bold mb-1">
          <Brain size={15} style={{ color: '#028090' }} />
          <span>Fokus SRL Sesi Ini</span>
        </div>
        <p className="text-muted small mb-0" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
          Target: Active note-taking & evaluasi kuis pemahaman (+15 XP per kuis terjawab).
        </p>
      </div>
    </div>
  );

  return (
    <div className="lesson-viewer-wrapper">
      {/* ====================================================================
          1. MOBILE TOP BAR (< 992px)
         ==================================================================== */}
      <div className="d-lg-none bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between shadow-sm sticky-top" style={{ zIndex: 1020 }}>
        <Button
          variant="outline-dark"
          size="sm"
          className="d-inline-flex align-items-center gap-2 rounded-3 px-3 py-1 fw-semibold"
          style={{ fontSize: '0.82rem' }}
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={16} />
          <span>Daftar Lesson</span>
          <span className="badge rounded-pill bg-dark text-white ms-1" style={{ fontSize: '0.68rem' }}>
            {currentLesson.number}/{MODULE_LESSONS_DATA.length}
          </span>
        </Button>

        <span className="text-muted small fw-medium text-truncate ms-2" style={{ fontSize: '0.8rem' }}>
          Unit {currentLesson.number}: {currentLesson.title}
        </span>
      </div>

      {/* ====================================================================
          2. MAIN BODY: LEFT SIDEBAR (320px) + RIGHT CONTENT CANVAS
         ==================================================================== */}
      <div className="lesson-viewer-layout">
        {/* ==================================================================
            A. LEFT SIDEBAR (Desktop >= 992px)
           ================================================================== */}
        <aside className="lesson-sidebar d-none d-lg-flex">
          <LessonsSidebarContent />
        </aside>

        {/* ==================================================================
            B. RIGHT / CENTER MAIN CONTENT AREA
           ================================================================== */}
        <main className="lesson-main-content">
          <div className="lesson-content-container">
            {/* Floating Real-time XP Toast */}
            {xpToast.show && (
              <div
                className="position-fixed top-0 end-0 m-3 m-md-4 p-3 rounded-3 shadow-lg d-flex align-items-center gap-3 text-white"
                style={{
                  backgroundColor: '#0F172A',
                  border: '2px solid #10B981',
                  borderRadius: '16px',
                  zIndex: 9999,
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.35)',
                  animation: 'fadeIn 0.25s ease-out',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 40, height: 40, backgroundColor: '#10B981', color: '#FFFFFF' }}
                >
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="fw-bold text-success" style={{ fontSize: '0.92rem' }}>
                    +{xpToast.xp} XP DIPEROLEH!
                  </div>
                  <div className="small text-light" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {xpToast.text}
                  </div>
                </div>
              </div>
            )}

            {/* Celebration Alert Toast */}
            {showCelebration && (
              <Alert variant="success" className="d-flex align-items-center justify-content-between rounded-3 shadow-sm mb-3 py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={18} className="text-warning" />
                  <span className="fw-bold small">
                    Unit {currentLesson.number} Selesai! +{currentLesson.xp} XP ditambahkan ke profil belajarmu.
                  </span>
                </div>
                <CheckCircle2 size={18} className="text-success" />
              </Alert>
            )}

            {/* BLOCK 1: LESSON HEADER */}
            <div className="lesson-header-card">
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
                    style={{ backgroundColor: '#E0F2FE', color: '#028090', fontSize: '0.75rem' }}
                  >
                    Unit {currentLesson.number} of {MODULE_LESSONS_DATA.length}
                  </span>
                  <span className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                    <Clock size={13} />
                    <span>{currentLesson.duration}</span>
                  </span>
                  <span className="badge rounded-pill bg-light text-muted border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                    +{currentLesson.xp} XP
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    className="border p-2 rounded-circle text-muted d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    title={isBookmarked ? 'Hapus Bookmark' : 'Bookmark Lesson'}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark
                      size={15}
                      color={isBookmarked ? '#f59e0b' : '#64748b'}
                      fill={isBookmarked ? '#f59e0b' : 'transparent'}
                    />
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    className="border p-2 rounded-circle text-muted d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    title="Bagikan Tautan"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Tautan lesson berhasil disalin!');
                      }
                    }}
                  >
                    <Share2 size={15} />
                  </Button>
                </div>
              </div>

              <h1 className="lesson-main-title">
                {currentLesson.title}
              </h1>

              <p className="text-muted mb-0" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
                {currentLesson.summary}
              </p>
            </div>

            {/* BLOCK 2: RESPONSIVE 16x9 MEDIA PLAYER */}
            <div className="lesson-video-card">
              <div className="position-relative ratio ratio-16x9" style={{ backgroundColor: '#0B2545' }}>
                <img
                  src={currentLesson.videoUrl}
                  alt={currentLesson.title}
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    opacity: isPlaying ? 0.95 : 0.8,
                    filter: isPlaying ? 'none' : 'brightness(0.85)',
                  }}
                />

                {/* Big Center Play / Pause Overlay Button */}
                <div
                  className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                  style={{ zIndex: 10, cursor: 'pointer' }}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: 'rgba(2, 128, 144, 0.92)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255, 255, 255, 0.35)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ms-1" fill="currentColor" />}
                  </div>
                </div>

                {/* Interactive Player Controls Bar (Bottom of Video) */}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 d-flex flex-column gap-2"
                  style={{
                    background: 'linear-gradient(to top, rgba(11, 37, 69, 0.92) 0%, transparent 100%)',
                    zIndex: 11,
                  }}
                >
                  {/* Timeline Scrubbing Bar */}
                  <div
                    className="position-relative w-100"
                    style={{ height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '999px', cursor: 'pointer' }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newPercent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
                      setVideoProgress(newPercent);
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${videoProgress}%`,
                        backgroundColor: '#028090',
                        borderRadius: '999px',
                      }}
                    />
                  </div>

                  {/* Player Controls Row */}
                  <div className="d-flex align-items-center justify-content-between text-white small">
                    <div className="d-flex align-items-center gap-2 gap-sm-3">
                      <button
                        type="button"
                        className="btn btn-link text-white p-0 text-decoration-none"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                      </button>

                      <button
                        type="button"
                        className="btn btn-link text-white p-0 text-decoration-none"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>

                      <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
                        04:15 / {currentLesson.videoDuration}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-dark text-white border-0 py-1 px-2 rounded-2 fw-semibold"
                        style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        onClick={() => {
                          const speeds = ['1x', '1.25x', '1.5x'];
                          const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                          setPlaybackSpeed(speeds[nextIdx]);
                        }}
                      >
                        {playbackSpeed}
                      </button>

                      <button
                        type="button"
                        className="btn btn-link text-white p-0 text-decoration-none"
                        onClick={() => alert('Mode layar penuh diaktifkan.')}
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 3: MATERIAL TABS (Pill/Underline Style with 24px Padding) */}
            <div className="lesson-material-card">
              <div className="lesson-tabs-nav">
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="video" className="lesson-tab-button">
                      <PlayCircle size={16} />
                      <span>Rangkuman Materi</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="summary" className="lesson-tab-button">
                      <Code size={16} />
                      <span>Contoh Kode & Payload</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notes" className="lesson-tab-button">
                      <FileText size={16} />
                      <span>Catatan Pribadi ({notesList.length})</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>

              <div className="lesson-material-padding">
                {activeTab === 'video' && (
                  <div>
                    <h5 className="fw-bold mb-2 text-dark" style={{ fontSize: '1.08rem' }}>
                      Pokok Bahasan Unit {currentLesson.number}: {currentLesson.title}
                    </h5>
                    <p className="text-muted mb-3" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {currentLesson.summary}
                    </p>

                    {/* Key Concept Highlights inside srl-box-card */}
                    <div className="srl-box-card">
                      <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                        <Sparkles size={15} style={{ color: '#028090' }} />
                        <span>Prinsip Kunci yang Dipelajari:</span>
                      </h6>
                      <ul className="text-muted small mb-0 ps-3 d-flex flex-column gap-2" style={{ fontSize: '0.84rem' }}>
                        <li>
                          <strong>Idempotency:</strong> Permintaan berulang dengan parameter identik harus menghasilkan state server yang sama tanpa efek samping ganda.
                        </li>
                        <li>
                          <strong>Rate Limiting:</strong> Algoritma Sliding Window counter dan Token Bucket memastikan sistem tidak kolaps dari burst traffic atau brute-force attack.
                        </li>
                        <li>
                          <strong>Distributed Cache:</strong> Gunakan Redis TTL (Time-To-Live) pada idempotency key (misal 24 jam) untuk efisiensi penyimpanan memori.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold text-dark small" style={{ fontSize: '0.875rem' }}>Contoh Implementasi REST Endpoint:</span>
                      <Button
                        variant="light"
                        size="sm"
                        className="border px-3 py-1 d-inline-flex align-items-center gap-1 small text-secondary"
                        onClick={handleCopyCode}
                      >
                        {copiedCode ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        <span style={{ fontSize: '0.78rem' }}>{copiedCode ? 'Tersalin' : 'Salin Kode'}</span>
                      </Button>
                    </div>

                    <pre
                      className="p-3 rounded-3 text-white font-monospace overflow-x-auto mb-0"
                      style={{
                        backgroundColor: '#0F172A',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        borderRadius: '10px',
                      }}
                    >
                      {currentLesson.codeSnippet}
                    </pre>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <Form onSubmit={handleAddNote} className="mb-3">
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Ketik catatan penting pada menit ini..."
                          value={newNoteInput}
                          onChange={(e) => setNewNoteInput(e.target.value)}
                          className="rounded-3 shadow-none border"
                          style={{ fontSize: '0.875rem' }}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          className="px-3 rounded-3 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap"
                          style={{ backgroundColor: '#028090', borderColor: '#028090' }}
                        >
                          <Send size={14} />
                          <span className="d-none d-sm-inline">Simpan Catatan</span>
                        </Button>
                      </div>
                    </Form>

                    <div className="d-flex flex-column gap-2">
                      {notesList.map((n) => (
                        <div key={n.id} className="p-2 rounded-3 border bg-light d-flex align-items-start gap-2">
                          <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                            {n.time}
                          </span>
                          <span className="text-dark small flex-grow-1" style={{ fontSize: '0.84rem', lineHeight: 1.45 }}>
                            {n.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BLOCK 4: END OF MATERIAL TRIGGER CTA (Opens Pop-Up Micro-Quiz) */}
            <div
              className="p-4 mb-4 rounded-3 bg-white border d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-sm"
              style={{
                borderColor: '#E2E8F0',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)',
                borderLeft: '4.5px solid #028090',
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                  style={{
                    width: 46,
                    height: 46,
                    backgroundColor: isQuizFullyPassed ? '#DCFCE7' : '#E0F2FE',
                    color: isQuizFullyPassed ? '#16A34A' : '#028090',
                  }}
                >
                  {isQuizFullyPassed ? <CheckCircle2 size={24} /> : <Brain size={24} />}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
                      style={{ backgroundColor: '#E0F2FE', color: '#028090', fontSize: '0.72rem' }}
                    >
                      EVALUASI PEMAHAMAN UNIT
                    </span>
                    <span
                      className="badge px-3 py-1 rounded-pill fw-bold"
                      style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.72rem' }}
                    >
                      <Zap size={12} className="me-1" fill="currentColor" />
                      +15 XP per Soal
                    </span>
                    {isQuizFullyPassed && (
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={12} />
                        Kuis Tuntas
                      </span>
                    )}
                  </div>
                  <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.08rem' }}>
                    {isQuizFullyPassed
                      ? `Micro-Quiz Unit ${currentLesson.number} Telah Tuntas!`
                      : `Selesai Membaca Materi Unit ${currentLesson.number}?`}
                  </h5>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                    {isQuizFullyPassed
                      ? 'Pemahaman materi telah teruji. Anda dapat meninjau kuis kembali atau melanjutkan ke langkah belajar selanjutnya.'
                      : 'Uji pemahaman Anda lewat kuis singkat 1–2 pertanyaan interaktif untuk membuka akses materi berikutnya.'}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm flex-shrink-0"
                style={{
                  backgroundColor: '#028090',
                  borderColor: '#028090',
                  fontSize: '0.92rem',
                }}
                onClick={() => setShowQuizModal(true)}
              >
                <Zap size={16} />
                <span>{isQuizFullyPassed ? 'Buka Ulang Micro-Quiz' : 'Selesai Baca & Cek Pemahaman'}</span>
              </Button>
            </div>

            {/* ====================================================================
                MODAL POP-UP MICRO-QUIZ (SRL COMPREHENSION CHECKPOINT)
               ==================================================================== */}
            <Modal
              show={showQuizModal}
              onHide={() => setShowQuizModal(false)}
              size="lg"
              centered
              backdrop="static"
              keyboard={false}
              animation={false}
              contentClassName="border-0 shadow-lg rounded-3 overflow-hidden"
            >
              {/* Header Modal */}
              <Modal.Header closeButton className="border-bottom px-4 py-3 bg-light">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
                      style={{ backgroundColor: '#E0F2FE', color: '#028090', fontSize: '0.72rem' }}
                    >
                      MICRO-QUIZ CHECKPOINT
                    </span>
                    <span
                      className="badge px-3 py-1 rounded-pill fw-bold"
                      style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.72rem' }}
                    >
                      <Zap size={12} className="me-1" fill="currentColor" />
                      +15 XP per Soal
                    </span>
                    {isQuizFullyPassed && (
                      <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={13} />
                        Lulus Checkpoint
                      </span>
                    )}
                  </div>
                  <Modal.Title className="fw-bold text-dark fs-5 mb-0">
                    Cek Pemahaman Cepat Unit {currentLesson.number}
                  </Modal.Title>
                </div>
              </Modal.Header>

              {/* Body Modal */}
              <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <p className="text-muted small mb-0" style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Pilih jawaban untuk semua pertanyaan di bawah, lalu klik konfirmasi untuk evaluasi serentak.
                  </p>
                  <span
                    className="badge px-3 py-1 rounded-pill fw-semibold text-muted border bg-white"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {Object.keys(selectedAnswers).length} / {totalQuestions} Soal Terpilih
                  </span>
                </div>

                {/* Questions List */}
                <div className="d-flex flex-column gap-3">
                  {activeQuizList.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];
                    const isQCorrect = isQuizSubmitted && selected === q.correctAnswer;

                    // Container styling based on submission state
                    let containerBg = '#F8FAFC';
                    let containerBorder = '#E2E8F0';

                    if (isQuizSubmitted) {
                      if (isQCorrect) {
                        containerBg = '#F0FDF4';
                        containerBorder = '#86EFAC';
                      } else {
                        containerBg = '#FEF2F2';
                        containerBorder = '#FECACA';
                      }
                    }

                    return (
                      <div
                        key={q.id || qIndex}
                        className="p-3 rounded-3 border"
                        style={{
                          backgroundColor: containerBg,
                          borderColor: containerBorder,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Question Text & Number Indicator */}
                        <div className="d-flex align-items-start gap-2 mb-3">
                          <span
                            className="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor:
                                isQuizSubmitted && isQCorrect
                                  ? '#16A34A'
                                  : isQuizSubmitted && !isQCorrect
                                  ? '#EF4444'
                                  : '#0F172A',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                            }}
                          >
                            {isQuizSubmitted && isQCorrect ? (
                              <Check size={14} />
                            ) : isQuizSubmitted && !isQCorrect ? (
                              <X size={14} />
                            ) : (
                              qIndex + 1
                            )}
                          </span>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>
                            {q.question}
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="d-flex flex-column gap-2">
                          {q.options.map((opt, optIndex) => {
                            const isSelected = selected === optIndex;
                            const letterLabels = ['A', 'B', 'C', 'D'];

                            // Default option styling (neutral)
                            let optBg = '#FFFFFF';
                            let optBorder = '1px solid #E2E8F0';
                            let optColor = '#334155';
                            let optFontWeight = 400;
                            let badgeBg = '#F1F5F9';
                            let badgeColor = '#475569';
                            let rightIcon = null;

                            // TAHAP 1: Pemilihan Jawaban Bebas (isSubmitted = false)
                            if (!isQuizSubmitted) {
                              if (isSelected) {
                                optBg = '#F0F9FF';
                                optBorder = '2px solid #028090';
                                optColor = '#0369A1';
                                optFontWeight = 600;
                                badgeBg = '#028090';
                                badgeColor = '#FFFFFF';
                              }
                            }
                            // TAHAP 2: Hasil & Evaluasi Serentak (isSubmitted = true)
                            else {
                              if (optIndex === q.correctAnswer) {
                                // Opsi Benar: Latar/border Hijau + badge 'Kunci Jawaban' / ikon centang
                                if (isSelected) {
                                  optBg = '#DCFCE7';
                                  optBorder = '2px solid #16A34A';
                                  optColor = '#15803D';
                                  optFontWeight = 700;
                                  badgeBg = '#16A34A';
                                  badgeColor = '#FFFFFF';
                                  rightIcon = (
                                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                      <span
                                        className="badge bg-success text-white py-1 px-2 small fw-bold"
                                        style={{ fontSize: '0.7rem' }}
                                      >
                                        Kunci Jawaban
                                      </span>
                                      <CheckCircle2 size={18} className="text-success" />
                                    </div>
                                  );
                                } else {
                                  optBg = '#F0FDF4';
                                  optBorder = '2px dashed #16A34A';
                                  optColor = '#15803D';
                                  optFontWeight = 600;
                                  badgeBg = '#16A34A';
                                  badgeColor = '#FFFFFF';
                                  rightIcon = (
                                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                      <span
                                        className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 small fw-bold"
                                        style={{ fontSize: '0.7rem' }}
                                      >
                                        Kunci Jawaban
                                      </span>
                                      <CheckCircle2 size={16} className="text-success" />
                                    </div>
                                  );
                                }
                              } else if (isSelected) {
                                // Opsi Salah yang dipilih pengguna: Latar/border Merah + ikon silang (X)
                                optBg = '#FEE2E2';
                                optBorder = '2px solid #EF4444';
                                optColor = '#B91C1C';
                                optFontWeight = 600;
                                badgeBg = '#EF4444';
                                badgeColor = '#FFFFFF';
                                rightIcon = <XCircle size={18} className="text-danger flex-shrink-0" />;
                              } else {
                                optBg = '#F8FAFC';
                                optBorder = '1px solid #E2E8F0';
                                optColor = '#94A3B8';
                                badgeBg = '#F1F5F9';
                                badgeColor = '#94A3B8';
                              }
                            }

                            return (
                              <div
                                key={optIndex}
                                onClick={() => !isQuizSubmitted && handleSelectOption(q.id, optIndex)}
                                className="p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                                style={{
                                  backgroundColor: optBg,
                                  border: optBorder,
                                  color: optColor,
                                  fontWeight: optFontWeight,
                                  cursor: isQuizSubmitted ? 'default' : 'pointer',
                                  fontSize: '0.86rem',
                                  lineHeight: 1.4,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span
                                  className="badge rounded-pill fw-bold flex-shrink-0"
                                  style={{
                                    backgroundColor: badgeBg,
                                    color: badgeColor,
                                    fontSize: '0.72rem',
                                    width: 22,
                                    height: 22,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {letterLabels[optIndex] || optIndex + 1}
                                </span>
                                <span className="flex-grow-1">{opt}</span>
                                {rightIcon}
                              </div>
                            );
                          })}
                        </div>

                        {/* Kotak Penjelasan (Explanation Box) - Muncul serentak setelah dikonfirmasi */}
                        {isQuizSubmitted && (
                          <div className="mt-3">
                            {isQCorrect ? (
                              <div className="p-3 rounded-3 bg-white border border-success-subtle text-success small d-flex align-items-start gap-2 shadow-sm">
                                <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-1" />
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <strong className="text-success" style={{ fontSize: '0.88rem' }}>
                                      Sangat Tepat!
                                    </strong>
                                    <span
                                      className="badge bg-success text-white fw-bold px-2 py-1 rounded-pill"
                                      style={{ fontSize: '0.68rem' }}
                                    >
                                      +{q.xpReward || 15} XP
                                    </span>
                                  </div>
                                  <p
                                    className="text-dark mb-0"
                                    style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#334155' }}
                                  >
                                    {q.explanation}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-3 bg-white border border-danger-subtle small d-flex align-items-start gap-2 shadow-sm">
                                <XCircle size={20} className="text-danger flex-shrink-0 mt-1" />
                                <div className="flex-grow-1">
                                  <strong className="d-block mb-1 text-danger" style={{ fontSize: '0.88rem' }}>
                                    Belum Tepat
                                  </strong>
                                  <p
                                    className="text-muted mb-0"
                                    style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#475569' }}
                                  >
                                    {q.explanation}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Micro-Quiz Completion Banner inside Modal */}
                {isQuizSubmitted && isQuizAllCorrect && (
                  <div
                    className="p-3 mt-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                    style={{
                      backgroundColor: '#ECFDF5',
                      border: '1.5px solid #A7F3D0',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Sparkles size={18} className="text-success" />
                      <span className="fw-bold small text-success">
                        Luar biasa! Semua jawaban benar. Akses ke materi berikutnya telah dibuka.
                      </span>
                    </div>
                    <span className="badge bg-success text-white px-3 py-1 rounded-pill small fw-bold">
                      Lulus Checkpoint
                    </span>
                  </div>
                )}

                {/* Banner saat ada jawaban salah */}
                {isQuizSubmitted && !isQuizAllCorrect && (
                  <div
                    className="p-3 mt-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1.5px solid #FECACA',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <AlertCircle size={18} className="text-danger" />
                      <span className="fw-bold small text-danger">
                        Ada jawaban yang belum tepat. Silakan ulangi kuis untuk melanjutkan ke materi berikutnya.
                      </span>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.78rem' }}
                      onClick={handleRetryQuiz}
                    >
                      <RotateCcw size={13} />
                      Ulangi Kuis
                    </Button>
                  </div>
                )}
              </Modal.Body>

              {/* Footer Modal */}
              <Modal.Footer className="border-top px-4 py-3 bg-light d-flex align-items-center justify-content-between">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3 px-3 py-1 fw-semibold"
                  style={{ fontSize: '0.84rem' }}
                  onClick={() => setShowQuizModal(false)}
                >
                  Tutup
                </Button>

                <div>
                  {!isQuizSubmitted ? (
                    // TAHAP 1: Belum Disubmit
                    !isAllAnswered ? (
                      <Button
                        variant="secondary"
                        disabled
                        className="fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 opacity-75 text-white"
                        style={{
                          backgroundColor: '#94A3B8',
                          borderColor: '#94A3B8',
                          fontSize: '0.86rem',
                          cursor: 'not-allowed',
                        }}
                      >
                        <Lock size={15} />
                        <span>Jawab Semua Kuis untuk Melanjutkan</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
                        style={{
                          backgroundColor: '#028090',
                          borderColor: '#028090',
                          fontSize: '0.88rem',
                        }}
                        onClick={handleConfirmAll}
                      >
                        <CheckCircle2 size={16} />
                        <span>Konfirmasi & Periksa Semua Jawaban</span>
                      </Button>
                    )
                  ) : (
                    // TAHAP 2: Pasca-Konfirmasi (isQuizSubmitted = true)
                    isQuizAllCorrect ? (
                      isLastLesson ? (
                        <Button
                          variant="primary"
                          className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
                          style={{
                            backgroundColor: '#028090',
                            borderColor: '#028090',
                            fontSize: '0.88rem',
                          }}
                          onClick={() => {
                            setShowQuizModal(false);
                            navigate(`/learner/modules/${moduleId}/quiz`);
                          }}
                        >
                          <span>Selesai Modul & Ke Evaluasi Modul</span>
                          <Award size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
                          style={{
                            backgroundColor: '#028090',
                            borderColor: '#028090',
                            fontSize: '0.88rem',
                          }}
                          onClick={() => {
                            setShowQuizModal(false);
                            handleNextLesson();
                          }}
                        >
                          <span>Lanjut ke Lesson Berikutnya</span>
                          <ArrowRight size={16} />
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="warning"
                        className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
                        style={{
                          backgroundColor: '#D97706',
                          borderColor: '#D97706',
                          fontSize: '0.88rem',
                        }}
                        onClick={handleRetryQuiz}
                      >
                        <RotateCcw size={15} />
                        <span>Coba Lagi / Ulangi Kuis</span>
                      </Button>
                    )
                  )}
                </div>
              </Modal.Footer>
            </Modal>
          </div>
        </main>
      </div>

      {/* ====================================================================
          3. TABLET & MOBILE OFFCANVAS DRAWER (Sidebar Menu for < 992px)
         ==================================================================== */}
      <Offcanvas
        show={isSidebarOpen}
        onHide={() => setIsSidebarOpen(false)}
        placement="start"
        className="d-lg-none"
        style={{ width: '320px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
            Kurikulum Modul
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <LessonsSidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* ====================================================================
          4. STICKY BOTTOM NAVIGATION BAR (Matches Exact User Wireframe!)
          [ < Previous Lesson ]      Reading progress ──── 50%      [ Mark as Complete & Next Lesson → ]
         ==================================================================== */}
      <footer className="lesson-sticky-footer">
        <div className="lesson-footer-content">
          {/* Left Button: Previous Lesson */}
          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-3 fw-semibold border bg-white"
            style={{
              fontSize: '0.85rem',
              borderColor: '#CBD5E1',
              color: '#334155',
              minHeight: '40px',
            }}
            disabled={currentLessonIndex === 0}
            onClick={handlePrevLesson}
          >
            <ChevronLeft size={16} />
            <span className="d-none d-sm-inline">Previous Lesson</span>
            <span className="d-sm-none">Prev</span>
          </Button>

          {/* Middle: Reading Progress Tracker */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            <span className="text-muted small fw-medium text-nowrap d-none d-md-inline" style={{ fontSize: '0.84rem' }}>
              Reading progress
            </span>
            <div
              style={{
                width: 'clamp(80px, 15vw, 150px)',
                height: '6px',
                backgroundColor: '#E2E8F0',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${readingProgressPercent}%`,
                  backgroundColor: '#028090',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span className="text-muted small fw-bold font-monospace" style={{ fontSize: '0.8rem' }}>
              {readingProgressPercent}%
            </span>
          </div>

          {/* Right Button: Mark as Complete & Next Lesson or Module Quiz */}
          {isUnlocked ? (
            isLastLesson ? (
              <Button
                variant="primary"
                className="d-inline-flex align-items-center gap-2 px-3 px-sm-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                style={{
                  fontSize: '0.88rem',
                  backgroundColor: '#028090',
                  borderColor: '#028090',
                  minHeight: '40px',
                }}
                onClick={handleMarkCompleteAndNext}
              >
                <span className="d-none d-sm-inline">Selesai Modul & Lanjut ke Kuis Modul</span>
                <span className="d-sm-none">Kuis Modul</span>
                <Award size={16} />
              </Button>
            ) : (
              <Button
                variant="dark"
                className="d-inline-flex align-items-center gap-2 px-3 px-sm-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                style={{
                  fontSize: '0.88rem',
                  backgroundColor: '#0F172A',
                  borderColor: '#0F172A',
                  minHeight: '40px',
                }}
                onClick={handleMarkCompleteAndNext}
              >
                <span className="d-none d-sm-inline">Lanjut ke Lesson Berikutnya</span>
                <span className="d-sm-none">Next Lesson</span>
                <ArrowRight size={16} />
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              className="d-inline-flex align-items-center gap-2 px-3 px-sm-4 py-2 rounded-3 fw-bold text-white shadow-sm"
              style={{
                fontSize: '0.88rem',
                backgroundColor: '#028090',
                borderColor: '#028090',
                minHeight: '40px',
              }}
              onClick={() => setShowQuizModal(true)}
            >
              <Zap size={16} />
              <span className="d-none d-sm-inline">Selesai Baca & Cek Pemahaman</span>
              <span className="d-sm-none">Cek Pemahaman</span>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default LessonViewerPage;
