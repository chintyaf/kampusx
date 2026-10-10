import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  Alert,
} from 'react-bootstrap';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Flame,
  Calendar,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Play,
  RotateCcw,
  Video,
  FileText,
  HelpCircle,
  Brain,
  Layers,
  Star,
  UserCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// ============================================================================
// MOCK DATA: Curriculum, Modules, Badges, & Instructor Information
// ============================================================================
const mockPathData = {
  id: 'lp-rag-ai',
  title: 'AI Engineering & RAG Masterclass',
  badge: 'LEARNING PATH',
  description:
    'Kurikulum end-to-end terstruktur untuk merancang, mengoptimalkan, dan mengoperasikan sistem Generative AI berbasis Retrieval-Augmented Generation (RAG) kelas enterprise dari nol hingga production deployment.',
  metrics: {
    moduleCount: 6,
    totalHours: '4.0 Hours Total',
    enrolledCount: '2,540 Enrolled',
    rating: 4.9,
    reviewsCount: 382,
    updatedAt: 'Sep 2026',
    completedModules: 2,
    progressPercent: 33,
    averageQuizScore: 91,
    currentStreakDays: 5,
  },
  instructor: {
    name: 'Dr. Reza Fauzi',
    title: 'AI Engineering Lead @ Google',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    rating: 4.9,
    coursesCount: 12,
    bio: 'Ex-DeepMind Researcher with 10+ years specializing in Distributed Systems, LLMs, and Vector Retrieval Architectures.',
  },
  learningObjectives: [
    'Merancang arsitektur Retrieval-Augmented Generation (RAG) tangguh & scalable.',
    'Menguasai strategi semantic chunking dan hybrid search (BM25 + Dense Vectors).',
    'Mengintegrasikan Vector Databases (Qdrant, Pinecone, pgvector) dengan latensi sub-100ms.',
    'Menerapkan Guardrails, hallucination detection, dan metrik RAG Triad evaluation.',
    'Optimasi Fine-Tuning LoRA/QLoRA untuk model embedding dan open-source LLM.',
    'Men-deploy pipeline AI ke cloud Kubernetes dengan CI/CD otomatis & smart contract certification.',
  ],
  modules: [
    {
      id: 'mod-1',
      number: 1,
      title: 'LLM Fundamentals & Modern Prompt Engineering',
      duration: '45 min',
      lessonCount: 4,
      status: 'completed', // completed | in_progress | locked
      description:
        'Konsep dasar arsitektur Transformer, attention mechanism, Chain-of-Thought, ReAct framework, dan zero-shot in-context learning.',
      lessons: [
        { type: 'video', title: 'Transformer Core & Attention Mechanism', duration: '12 min', completed: true },
        { type: 'article', title: 'Structured Prompting Strategies', duration: '10 min', completed: true },
        { type: 'quiz', title: 'Checkpoint 1: In-Context Learning Quiz', duration: '8 min', completed: true },
        { type: 'reflection', title: 'SRL Reflection: Prompt Design Habit', duration: '5 min', completed: true },
      ],
    },
    {
      id: 'mod-2',
      number: 2,
      title: 'Vector Databases, Embeddings & Semantic Indexing',
      duration: '50 min',
      lessonCount: 4,
      status: 'completed',
      description:
        'Embedding model embeddings, similarity distance metrics (Cosine vs Dot Product), HNSW graphs, dan konfigurasi vector indexing.',
      lessons: [
        { type: 'video', title: 'Embedding Models & Vector Spaces', duration: '15 min', completed: true },
        { type: 'article', title: 'Comparing HNSW, IVFFlat, & ScaNN', duration: '12 min', completed: true },
        { type: 'quiz', title: 'Vector Indexing Assessment (Score: 92/100)', duration: '10 min', completed: true },
        { type: 'reflection', title: 'SRL Reflection: Knowledge Representation', duration: '5 min', completed: true },
      ],
    },
    {
      id: 'mod-3',
      number: 3,
      title: 'Advanced RAG System Architecture & Hybrid Retrieval',
      duration: '60 min',
      lessonCount: 4,
      status: 'in_progress',
      description:
        'Arsitektur RAG modern: recursive character chunking, parent document retrieval, hybrid search (Sparse BM25 + Dense Vectors), dan cross-encoder re-ranking.',
      lessons: [
        { type: 'video', title: 'Chunking Strategies: Semantic vs Sliding Window', duration: '5 min', completed: true },
        { type: 'article', title: 'Hybrid Retrieval & Cross-Encoder Re-Ranking', duration: '12 min', completed: false },
        { type: 'quiz', title: 'Quiz: Production RAG Diagnostic Assessment', duration: '10 min', completed: false },
        { type: 'reflection', title: 'Reflection Session: Self-Regulated Learning Review', duration: '5 min', completed: false },
      ],
    },
    {
      id: 'mod-4',
      number: 4,
      title: 'Fine-Tuning Domain LLMs with LoRA & QLoRA',
      duration: '45 min',
      lessonCount: 4,
      status: 'locked',
      description:
        'Teknik parameter-efficient fine-tuning (PEFT), kuantisasi 4-bit, unsloth acceleration, dan dataset curation untuk downstream tasks.',
      lessons: [
        { type: 'video', title: 'PEFT, LoRA & Quantization Fundamentals', duration: '15 min', completed: false },
        { type: 'article', title: 'Data Cleaning & Instruction Dataset Formatting', duration: '12 min', completed: false },
        { type: 'quiz', title: 'Model Adaptation Evaluation', duration: '10 min', completed: false },
        { type: 'reflection', title: 'SRL Reflection: Technical Mastery', duration: '5 min', completed: false },
      ],
    },
    {
      id: 'mod-5',
      number: 5,
      title: 'LLM Evaluation, RAG Triad & Guardrails Security',
      duration: '40 min',
      lessonCount: 4,
      status: 'locked',
      description:
        'Evaluasi otomatis dengan Ragas dan TruLens (Context Relevance, Groundedness, Answer Relevance), serta deteksi prompt injection & PII leaks.',
      lessons: [
        { type: 'video', title: 'RAG Triad Metrics & Benchmark Curation', duration: '12 min', completed: false },
        { type: 'article', title: 'Implementing NeMo Guardrails & Llama Guard', duration: '10 min', completed: false },
        { type: 'quiz', title: 'Security & Robustness Assessment', duration: '10 min', completed: false },
        { type: 'reflection', title: 'SRL Reflection: Ethical AI & Safety', duration: '5 min', completed: false },
      ],
    },
    {
      id: 'mod-6',
      number: 6,
      title: 'Production Deployment, CI/CD & Observability',
      duration: '50 min',
      lessonCount: 4,
      status: 'locked',
      description:
        'Containerization dengan Docker, serving throughput tinggi via vLLM / Ollama, OpenTelemetry tracing, dan smart contract blockchain graduation.',
      lessons: [
        { type: 'video', title: 'vLLM Architecture & High-Throughput Serving', duration: '15 min', completed: false },
        { type: 'article', title: 'Kubernetes Helm Deployment & Tracing Setup', duration: '15 min', completed: false },
        { type: 'quiz', title: 'Final Comprehensive Exam', duration: '15 min', completed: false },
        { type: 'reflection', title: 'Final SRL Capstone & Smart Contract Issuance', duration: '5 min', completed: false },
      ],
    },
  ],
  badges: [
    { name: 'LLM Core', color: '#028090', bg: '#e0f2fe', icon: 'Brain', unlocked: true },
    { name: 'RAG Expert', color: '#6c5ce7', bg: '#f5f3ff', icon: 'Layers', unlocked: true },
    { name: 'Fast Learner', color: '#f59e0b', bg: '#fef3c7', icon: 'Flame', unlocked: true },
    { name: 'AI Builder', color: '#10b981', bg: '#ecfdf5', icon: 'Sparkles', unlocked: false },
    { name: 'Deployed ML', color: '#3b82f6', bg: '#eff6ff', icon: 'ShieldCheck', unlocked: false },
    { name: 'Path Completer', color: '#ec4899', bg: '#fdf2f8', icon: 'Award', unlocked: false },
  ],
};

const LearningPathDetail = () => {
  const navigate = useNavigate();

  // --- SRL Forethought State ---
  const [selectedHours, setSelectedHours] = useState('3');
  const [selectedWeeks, setSelectedWeeks] = useState('6');
  const [goalSaved, setGoalSaved] = useState(false);

  // --- Module Accordion State (Modul 3 is expanded by default) ---
  const [expandedModules, setExpandedModules] = useState({ 3: true });

  // --- Bookmark State ---
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleModuleExpand = (moduleNum) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleNum]: !prev[moduleNum],
    }));
  };

  const handleSaveGoal = () => {
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 3500);
  };

  // Helper date projection based on selected hours and weeks
  const getProjectedDate = (weeks) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(weeks, 10) * 7);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(targetDate);
  };

  // SVG Radial Gauge Calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (mockPathData.metrics.progressPercent / 100) * circumference;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* ====================================================================
          1. HERO BANNER (Dark Navy Theme #0B2545)
         ==================================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 0 3.5rem 0',
          position: 'relative',
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
                <Link to="/explore-microlearning" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Explore
                </Link>
              </li>
              <li className="breadcrumb-item">
                <span style={{ color: '#94A3B8' }}>Learning Paths</span>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: '#E2E8F0' }}>
                AI Engineering & RAG Masterclass
              </li>
            </ol>
          </nav>

          <Row className="align-items-center g-4">
            <Col lg={9}>
              {/* Badge Topik */}
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span
                  className="badge px-3 py-1 fw-bold d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#00A8E8',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0, 168, 232, 0.35)',
                    fontSize: '0.78rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Layers size={13} />
                  <span>🗺️ LEARNING PATH</span>
                </span>

                <span
                  className="badge px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: 'rgba(2, 128, 144, 0.25)',
                    color: '#E0F2FE',
                    border: '1px solid rgba(2, 128, 144, 0.4)',
                    fontSize: '0.78rem',
                    borderRadius: '9999px',
                  }}
                >
                  <Sparkles size={12} className="text-warning" />
                  <span>AI Recommended Path</span>
                </span>
              </div>

              {/* Judul Utama */}
              <h1 className="fw-bold mb-2 text-white" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.35rem)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {mockPathData.title}
              </h1>

              {/* Sub-deskripsi */}
              <p className="text-white-50 mb-3" style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '820px' }}>
                {mockPathData.description}
              </p>

              {/* Metrics Bar */}
              <div className="d-flex align-items-center gap-2 gap-sm-3 text-white-50 flex-wrap small mb-3">
                <span className="d-flex align-items-center gap-2 text-white fw-semibold">
                  <BookOpen size={15} style={{ color: '#00A8E8' }} />
                  {mockPathData.metrics.moduleCount} Modules
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-2 text-white fw-semibold">
                  <Clock size={15} style={{ color: '#00A8E8' }} />
                  {mockPathData.metrics.totalHours}
                </span>
                <span>•</span>
                <span>{mockPathData.metrics.enrolledCount}</span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1 text-warning fw-bold">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{mockPathData.metrics.rating}</span>
                  <span className="text-white-50 fw-normal">({mockPathData.metrics.reviewsCount})</span>
                </span>
                <span>•</span>
                <span>Updated {mockPathData.metrics.updatedAt}</span>
              </div>

              {/* Smart Contract Verification Pill */}
              <div className="mb-4">
                <span
                  className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-wrap text-start"
                  style={{
                    backgroundColor: 'rgba(11, 37, 69, 0.65)',
                    border: '1px solid rgba(0, 168, 232, 0.4)',
                    color: '#E0F2FE',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                  }}
                >
                  <ShieldCheck size={16} className="flex-shrink-0" style={{ color: '#00A8E8' }} />
                  <span>🛡️ 7 Certificates & Blockchain Smart Contract Verified</span>
                </span>
              </div>

              {/* CTA Action Buttons */}
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
                  onClick={() => navigate('/learner/modules/mod-1')}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Continue Path / Start Learning</span>
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
                  <span>{isBookmarked ? 'Bookmarked' : 'Preview Path / Bookmark'}</span>
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
              A. KOLOM UTAMA (col-lg-8)
             ================================================================ */}
          <Col lg={8}>
            {/* 1. WIDGET SRL: "Set Your Learning Goals" (Forethought Phase) */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: '38px', height: '38px', backgroundColor: '#E0F2FE', color: '#028090' }}
                  >
                    <Brain size={20} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ fontSize: '1.15rem', color: '#0B2545' }}>
                      Set Your Learning Goals (SRL Forethought Phase)
                    </h4>
                    <span className="text-muted small">
                      Rencanakan komitmen mingguanmu untuk menjaga retensi & disiplin belajar mandiri.
                    </span>
                  </div>
                </div>
                <span className="badge rounded-pill bg-light text-muted border px-3 py-1 text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                  Self-Regulation
                </span>
              </div>

              {/* Weekly Study Commitment Selector */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold text-dark small">Weekly Study Commitment:</span>
                  <span className="text-muted small fw-bold" style={{ color: '#028090' }}>
                    {selectedHours} Hours / Week
                  </span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {['1', '2', '3', '4', '5+'].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      className={`btn btn-sm rounded-3 px-3 py-1 fw-semibold ${selectedHours === hrs
                          ? 'btn-primary text-white shadow-sm'
                          : 'btn-outline-secondary border bg-light text-dark'
                        }`}
                      style={
                        selectedHours === hrs
                          ? { backgroundColor: '#028090', borderColor: '#028090', transition: 'all 0.2s ease' }
                          : { borderColor: '#E2E8F0', transition: 'all 0.2s ease' }
                      }
                      onClick={() => setSelectedHours(hrs)}
                    >
                      {hrs} {hrs === '5+' ? 'hours/week' : 'hours/week'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Completion Weeks Selector */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold text-dark small">Target Completion Timeline:</span>
                  <span className="text-muted small fw-bold" style={{ color: '#028090' }}>
                    {selectedWeeks} Weeks Target
                  </span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {['2', '4', '6', '8'].map((wks) => (
                    <button
                      key={wks}
                      type="button"
                      className={`btn btn-sm rounded-3 px-3 py-1 fw-semibold ${selectedWeeks === wks
                          ? 'btn-primary text-white shadow-sm'
                          : 'btn-outline-secondary border bg-light text-dark'
                        }`}
                      style={
                        selectedWeeks === wks
                          ? { backgroundColor: '#028090', borderColor: '#028090', transition: 'all 0.2s ease' }
                          : { borderColor: '#E2E8F0', transition: 'all 0.2s ease' }
                      }
                      onClick={() => setSelectedWeeks(wks)}
                    >
                      {wks} weeks
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Projection Alert Banner */}
              <div
                className="p-3 rounded-3 mb-3 d-flex align-items-start gap-2 border"
                style={{ backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}
              >
                <Sparkles size={18} className="flex-shrink-0 mt-1" style={{ color: '#028090' }} />
                <div className="small" style={{ color: '#0B2545', lineHeight: 1.5 }}>
                  <strong>💡 AI Projection:</strong> At <strong>{selectedHours} hours/week</strong>, you'll complete this Masterclass by{' '}
                  <strong>{getProjectedDate(selectedWeeks)}</strong> — on track with 2 modules already completed!
                </div>
              </div>

              {/* Action Button & Confirmation */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="fw-bold px-4 py-2 rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#028090', borderColor: '#028090' }}
                  onClick={handleSaveGoal}
                >
                  <Check size={15} />
                  <span>Save Learning Plan</span>
                </Button>

                {goalSaved && (
                  <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1">
                    <CheckCircle2 size={15} />
                    Target belajar berhasil disimpan ke profil SRL!
                  </span>
                )}
              </div>
            </Card>

            {/* 2. WIDGET ROADMAP: "Module Roadmap" (Timeline Interactive) */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: '1.35rem', color: '#0B2545' }}>
                    Module Roadmap
                  </h3>
                  <p className="text-muted small mb-0">
                    6 Modul berurutan yang dirancang untuk membangun pemahaman AI Engineering bertahap.
                  </p>
                </div>
                <span className="badge px-3 py-1 rounded-pill bg-light text-dark border fw-semibold small">
                  2 of 6 Completed (33%)
                </span>
              </div>

              {/* Interactive Vertical Timeline Roadmap */}
              <div className="d-flex flex-column gap-3">
                {mockPathData.modules.map((mod, index) => {
                  const isCompleted = mod.status === 'completed';
                  const isInProgress = mod.status === 'in_progress';
                  const isLocked = mod.status === 'locked';
                  const isExpanded = !!expandedModules[mod.number];

                  return (
                    <div
                      key={mod.id}
                      className="rounded-3 border overflow-hidden"
                      style={{
                        borderColor: isInProgress ? '#00A8E8' : '#E2E8F0',
                        boxShadow: isInProgress ? '0 4px 14px rgba(0, 168, 232, 0.12)' : 'none',
                        backgroundColor: isLocked ? '#F8FAFC' : '#FFFFFF',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Timeline Card Header */}
                      <div
                        className="d-flex align-items-center justify-content-between gap-3"
                        style={{ cursor: 'pointer', padding: '1rem 1.25rem' }}
                        onClick={() => toggleModuleExpand(mod.number)}
                      >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                          {/* Module Number / Status Badge */}
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{
                              width: '38px',
                              height: '38px',
                              backgroundColor: isCompleted
                                ? '#ECFDF5'
                                : isInProgress
                                  ? '#E0F2FE'
                                  : '#F1F5F9',
                              color: isCompleted
                                ? '#059669'
                                : isInProgress
                                  ? '#028090'
                                  : '#94A3B8',
                              border: `1.5px solid ${isCompleted
                                  ? '#A7F3D0'
                                  : isInProgress
                                    ? '#BAE6FD'
                                    : '#E2E8F0'
                                }`,
                              fontSize: '0.9rem',
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={20} className="text-success" />
                            ) : isInProgress ? (
                              <RotateCcw size={18} style={{ color: '#028090' }} />
                            ) : (
                              <Lock size={16} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
                                Module {mod.number}
                              </span>

                              {isCompleted && (
                                <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                  ✓ Completed
                                </span>
                              )}

                              {isInProgress && (
                                <span className="badge text-white fw-bold px-2 py-1 rounded-pill" style={{ backgroundColor: '#028090', fontSize: '0.7rem' }}>
                                  🔄 In Progress
                                </span>
                              )}

                              {isLocked && (
                                <span className="badge bg-light text-muted border fw-medium px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                  🔒 Locked
                                </span>
                              )}
                            </div>

                            <h5
                              className="fw-bold mb-1 text-truncate"
                              style={{ fontSize: '1.05rem', color: isLocked ? '#64748B' : '#0B2545' }}
                            >
                              {mod.title}
                            </h5>

                            <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.78rem' }}>
                              <span>{mod.lessonCount} Lessons</span>
                              <span>•</span>
                              <span className="d-flex align-items-center gap-1">
                                <Clock size={12} />
                                {mod.duration}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Chevron Collapse Indicator */}
                        <div className="text-muted d-flex align-items-center">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Expanded Accordion Lessons Content */}
                      {isExpanded && (
                        <div className="border-top bg-light" style={{ borderColor: '#E2E8F0', padding: '1rem 1.25rem' }}>
                          <p className="text-muted small mb-3 pt-2" style={{ lineHeight: 1.5 }}>
                            {mod.description}
                          </p>

                          {/* Lessons Checklist */}
                          <div className="d-flex flex-column gap-2 mb-3">
                            {mod.lessons.map((les, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-2"
                                style={{ borderColor: '#E2E8F0', fontSize: '0.83rem' }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  {les.type === 'video' && <Video size={16} className="text-primary flex-shrink-0" />}
                                  {les.type === 'article' && <FileText size={16} className="text-info flex-shrink-0" />}
                                  {les.type === 'quiz' && <HelpCircle size={16} className="text-warning flex-shrink-0" />}
                                  {les.type === 'reflection' && <Brain size={16} className="text-purple flex-shrink-0" style={{ color: '#8b5cf6' }} />}

                                  <span className={`fw-medium ${les.completed ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                                    {les.title}
                                  </span>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <span className="text-muted small">{les.duration}</span>
                                  {les.completed && <CheckCircle2 size={15} className="text-success" />}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action Button for Module */}
                          {!isLocked && (
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="primary"
                                size="sm"
                                className="fw-semibold px-3 py-1 rounded-3 d-inline-flex align-items-center gap-2"
                                style={{ backgroundColor: '#028090', borderColor: '#028090' }}
                                onClick={() => navigate(`/learner/modules/${mod.id}`)}
                              >
                                <span>{isCompleted ? 'Review Module' : 'Open Module'}</span>
                                <ArrowRight size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>

          {/* ================================================================
              B. KOLOM SIDEBAR (col-lg-4)
             ================================================================ */}
          <Col lg={4}>
            {/* 1. LEARNING ANALYTICS & PROGRESS WIDGET */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
                  Learning Analytics & Progress
                </h5>
                <span className="badge bg-light text-muted border small">Live</span>
              </div>

              {/* Radial Progress Gauge */}
              <div className="d-flex align-items-center justify-content-center my-3">
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#028090"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <div className="fw-bold text-dark" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                      {mockPathData.metrics.progressPercent}%
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                      COMPLETED
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="fw-semibold text-dark small">
                  {mockPathData.metrics.completedModules} of {mockPathData.metrics.moduleCount} Modules Finished
                </div>
                <div className="text-muted small">Average Quiz Score: <strong>{mockPathData.metrics.averageQuizScore}/100</strong></div>
              </div>

              {/* Learning Streak Card */}
              <div
                className="p-3 rounded-3 d-flex align-items-center gap-3 border"
                style={{
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                  borderColor: '#FED7AA',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '40px', height: '40px', backgroundColor: '#EA580C', color: '#FFF' }}
                >
                  <Flame size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="fw-bold text-dark small" style={{ color: '#C2410C' }}>
                    🔥 5-Day Learning Streak!
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Keep going — next milestone unlocked at 7 days.
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. INSTRUCTOR CARD */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="fw-bold text-muted small text-uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                Course Instructor
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={mockPathData.instructor.avatar}
                  alt={mockPathData.instructor.name}
                  className="rounded-circle border"
                  style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                    {mockPathData.instructor.name}
                  </h6>
                  <div className="text-muted small">{mockPathData.instructor.title}</div>
                  <div className="d-flex align-items-center gap-2 text-warning small mt-1">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span className="fw-bold text-dark">{mockPathData.instructor.rating}</span>
                    <span className="text-muted">• {mockPathData.instructor.coursesCount} Courses</span>
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                {mockPathData.instructor.bio}
              </p>
            </Card>

            {/* 3. EARNABLE BADGES GRID */}
            <Card className="border shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
                  Earnable Badges
                </h5>
                <span className="badge bg-light text-muted border small">3 Unlocked</span>
              </div>

              {/* 2x3 Grid Badges */}
              <Row className="g-2">
                {mockPathData.badges.map((b, idx) => (
                  <Col key={idx} xs={6}>
                    <div
                      className="p-2 rounded-3 border text-center d-flex flex-column align-items-center justify-content-center h-100"
                      style={{
                        backgroundColor: b.unlocked ? b.bg : '#F8FAFC',
                        borderColor: b.unlocked ? b.color : '#E2E8F0',
                        opacity: b.unlocked ? 1 : 0.65,
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: b.unlocked ? b.color : '#CBD5E1',
                          color: '#FFFFFF',
                        }}
                      >
                        <Award size={18} />
                      </div>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                        {b.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                        {b.unlocked ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 4. KAMPUSX CERTIFICATE PREVIEW CARD */}
            <Card
              className="border shadow-sm rounded-3 p-4 mb-4 overflow-hidden position-relative"
              style={{
                borderColor: '#BAE6FD',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <ShieldCheck size={18} style={{ color: '#028090' }} />
                <h6 className="fw-bold mb-0" style={{ color: '#0B2545', fontSize: '0.95rem' }}>
                  KampusX Certificate of Completion
                </h6>
              </div>

              <p className="text-muted small mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                Selesaikan seluruh 6 modul untuk mengklaim sertifikat digital yang tercatat di Blockchain Smart Contract dengan hash unik anti-pemalsuan.
              </p>

              <div
                className="p-3 rounded-3 bg-white border text-center shadow-sm mb-3"
                style={{ borderColor: '#BAE6FD' }}
              >
                <div className="fw-bold text-dark small mb-1">CERTIFICATE PREVIEW</div>
                <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                  ID: KX-AI-RAG-2026-9921
                </div>
                <div className="badge bg-success-subtle text-success mt-2 px-3 py-1" style={{ fontSize: '0.7rem' }}>
                  ✓ Smart Contract Verified
                </div>
              </div>
            </Card>

            {/* 5. "WHAT YOU'LL LEARN" CHECKLIST */}
            <Card className="border shadow-sm rounded-3 p-4 bg-white" style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}>
              <h5 className="fw-bold mb-3" style={{ fontSize: '1.05rem', color: '#0B2545' }}>
                What You'll Learn
              </h5>

              <div className="d-flex flex-column gap-2">
                {mockPathData.learningObjectives.map((obj, i) => (
                  <div key={i} className="d-flex align-items-start gap-2 small">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-1" style={{ color: '#028090' }} />
                    <span className="text-dark" style={{ lineHeight: 1.45, fontSize: '0.82rem' }}>
                      {obj}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LearningPathDetail;
