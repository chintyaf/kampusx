import React, { useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Offcanvas,
  Pagination,
  ProgressBar,
} from 'react-bootstrap';
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  Video,
  FileText,
  Code,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Star,
  ArrowRight,
  RotateCcw,
  Compass,
  Bookmark,
  ChevronRight,
  Filter,
  Check,
  Zap,
  Target,
  Brain,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// MOCK DATA: 16 Curated Multi-Tier Items (Learning Paths, Modules, Lessons)
// ============================================================================
const MOCK_EXPLORE_ITEMS = [
  // --- 1. LEARNING PATHS (4 items) ---
  {
    id: 'lp-1',
    type: 'learning_path',
    title: 'Full-Stack AI-Powered Web Architecture',
    description:
      'Jalur belajar komprehensif mengintegrasikan Model AI ke dalam arsitektur Full-Stack modern (React, FastAPI, Docker, & Vector DB).',
    category: 'AI & Data',
    level: 'Menengah',
    durationMinutes: 300,
    durationLabel: '5.0 Jam',
    durationRange: '> 3 Jam',
    mediaType: 'Video',
    mediaIcon: Video,
    moduleCount: 4,
    lessonCount: 18,
    rating: 4.95,
    enrolledCount: 1420,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    tags: ['Generative AI', 'Fullstack', 'FastAPI', 'Vector DB'],
    updatedAt: '2026-09-20',
  },
  {
    id: 'lp-2',
    type: 'learning_path',
    title: 'Generative AI & LLM Application Engineering',
    description:
      'Kuasai teknik Prompt Engineering, RAG (Retrieval-Augmented Generation), function calling, dan evaluasi performa model LLM.',
    category: 'AI & Data',
    level: 'Lanjutan',
    durationMinutes: 210,
    durationLabel: '3.5 Jam',
    durationRange: '> 3 Jam',
    mediaType: 'Interactive Coding',
    mediaIcon: Code,
    moduleCount: 3,
    lessonCount: 14,
    rating: 4.98,
    enrolledCount: 1980,
    aiRecommended: true,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    tags: ['LLM', 'RAG', 'LangChain', 'Python'],
    updatedAt: '2026-09-25',
  },
  {
    id: 'lp-3',
    type: 'learning_path',
    title: 'Self-Regulated Learning (SRL) & High-Impact Habits',
    description:
      'Framework ilmiah untuk merancang tujuan belajar, evaluasi performa diri, dan teknik deep work bebas distraksi digital.',
    category: 'Soft Skills & Leadership',
    level: 'Pemula',
    durationMinutes: 150,
    durationLabel: '2.5 Jam',
    durationRange: '1-3 Jam',
    mediaType: 'Artikel',
    mediaIcon: FileText,
    moduleCount: 3,
    lessonCount: 12,
    rating: 4.88,
    enrolledCount: 890,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    tags: ['SRL', 'Productivity', 'Mindset', 'Focus'],
    updatedAt: '2026-09-15',
  },
  {
    id: 'lp-4',
    type: 'learning_path',
    title: 'Cloud DevOps & Container Orchestration Mastery',
    description:
      'Pelajari Docker, Kubernetes, CI/CD pipeline otomatis dengan GitHub Actions, dan monitoring observabilitas sistem.',
    category: 'Cloud & DevOps',
    level: 'Lanjutan',
    durationMinutes: 360,
    durationLabel: '6.0 Jam',
    durationRange: '> 3 Jam',
    mediaType: 'Video',
    mediaIcon: Video,
    moduleCount: 4,
    lessonCount: 20,
    rating: 4.92,
    enrolledCount: 1120,
    aiRecommended: false,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80',
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    updatedAt: '2026-09-10',
  },

  // --- 2. MODULES (6 items) ---
  {
    id: 'mod-1',
    type: 'module',
    title: 'Web Application Architecture & REST API Design',
    description:
      'Prinsip arsitektur REST, idempotensi HTTP verbs, versioning endpoint, dan penanganan status error terstandar.',
    category: 'Web Development',
    level: 'Menengah',
    durationMinutes: 45,
    durationLabel: '45 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Video',
    mediaIcon: Video,
    lessonCount: 5,
    rating: 4.9,
    enrolledCount: 2310,
    isEnrolled: true,
    progressPercent: 65,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    tags: ['REST API', 'Architecture', 'Clean Code'],
    updatedAt: '2026-09-28',
  },
  {
    id: 'mod-2',
    type: 'module',
    title: 'State Management with Modern Redux & Zustand',
    description:
      'Bandingkan pola Redux Toolkit dengan Zustand untuk mengelola state global skala enterprise tanpa re-render berlebihan.',
    category: 'Web Development',
    level: 'Pemula',
    durationMinutes: 35,
    durationLabel: '35 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Interactive Coding',
    mediaIcon: Code,
    lessonCount: 4,
    rating: 4.82,
    enrolledCount: 1450,
    isEnrolled: true,
    progressPercent: 30,
    aiRecommended: false,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Zustand', 'Redux', 'Frontend'],
    updatedAt: '2026-09-22',
  },
  {
    id: 'mod-3',
    type: 'module',
    title: 'Prompt Engineering & Few-Shot In-Context Learning',
    description:
      'Kuasai teknik penulisan prompt sistematis: Chain of Thought, ReAct framework, dan parameter tuning temperature/top-p.',
    category: 'AI & Data',
    level: 'Pemula',
    durationMinutes: 40,
    durationLabel: '40 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Kuis Interaktif',
    mediaIcon: Sparkles,
    lessonCount: 4,
    rating: 4.96,
    enrolledCount: 3100,
    isEnrolled: false,
    progressPercent: 0,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    tags: ['Prompting', 'Gemini', 'Generative AI'],
    updatedAt: '2026-09-26',
  },
  {
    id: 'mod-4',
    type: 'module',
    title: 'PostgreSQL Indexing & High-Performance Query Optimization',
    description:
      'Analisis EXPLAIN ANALYZE, B-Tree vs GIN Index, partitioning tabel jutaan baris, dan query tuning relasional.',
    category: 'Web Development',
    level: 'Menengah',
    durationMinutes: 50,
    durationLabel: '50 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Video',
    mediaIcon: Video,
    lessonCount: 5,
    rating: 4.87,
    enrolledCount: 1680,
    isEnrolled: false,
    progressPercent: 0,
    aiRecommended: false,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    tags: ['PostgreSQL', 'SQL', 'Database', 'Performance'],
    updatedAt: '2026-09-18',
  },
  {
    id: 'mod-5',
    type: 'module',
    title: 'Zero Trust API Security with OAuth 2.1 & JWT Guard',
    description:
      'Implementasikan rotasi refresh token, PKCE flow, proteksi CSRF/XSS, dan pembatasan rate limit berbasis IP.',
    category: 'Cybersecurity',
    level: 'Lanjutan',
    durationMinutes: 35,
    durationLabel: '35 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Interactive Coding',
    mediaIcon: Code,
    lessonCount: 4,
    rating: 4.91,
    enrolledCount: 1820,
    isEnrolled: false,
    progressPercent: 0,
    aiRecommended: true,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    tags: ['Security', 'OAuth2', 'JWT', 'Encryption'],
    updatedAt: '2026-09-24',
  },
  {
    id: 'mod-6',
    type: 'module',
    title: 'Modern UI/UX Design System with Figma Tokens',
    description:
      'Bangun komponen atomik, typography scaling terpadu, varian states, dan auto-layout responsif untuk handover developer.',
    category: 'UI/UX Design',
    level: 'Pemula',
    durationMinutes: 45,
    durationLabel: '45 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Video',
    mediaIcon: Video,
    lessonCount: 5,
    rating: 4.94,
    enrolledCount: 2240,
    isEnrolled: false,
    progressPercent: 0,
    aiRecommended: false,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    tags: ['Figma', 'UI/UX', 'Design System', 'Tokens'],
    updatedAt: '2026-09-19',
  },

  // --- 3. LESSONS / MICROLEARNING (6 items) ---
  {
    id: 'les-1',
    type: 'lesson',
    title: 'Understanding HTTP Idempotency in 5 Minutes',
    description:
      'Penjelasan padat mengapa PUT dan DELETE itu idempoten sedangkan POST tidak, serta penerapan Idempotency-Key header.',
    category: 'Web Development',
    level: 'Pemula',
    durationMinutes: 5,
    durationLabel: '5 Menit',
    durationRange: '< 10 Menit',
    mediaType: 'Video',
    mediaFormatBadge: '🎥 Video Pembelajaran',
    rating: 4.95,
    enrolledCount: 4120,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80',
    tags: ['HTTP', 'Bite-Sized', 'API'],
    updatedAt: '2026-09-27',
  },
  {
    id: 'les-2',
    type: 'lesson',
    title: 'Deep Dive: React 19 Server Actions & Optimistic UI',
    description:
      'Ringkasan esensial useActionState, useOptimistic, dan form action asinkron tanpa boilerplate preventDefault.',
    category: 'Web Development',
    level: 'Lanjutan',
    durationMinutes: 7,
    durationLabel: '7 Menit',
    durationRange: '< 10 Menit',
    mediaType: 'Artikel',
    mediaFormatBadge: '📝 Quick Article',
    rating: 4.91,
    enrolledCount: 3890,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    tags: ['React 19', 'Server Actions', 'Frontend'],
    updatedAt: '2026-09-29',
  },
  {
    id: 'les-3',
    type: 'lesson',
    title: 'Interactive Lab: Securing Cookies Against XSS Attacks',
    description:
      'Praktik langsung konfigurasi flag HttpOnly, SameSite=Strict, dan Secure pada response auth header.',
    category: 'Cybersecurity',
    level: 'Menengah',
    durationMinutes: 10,
    durationLabel: '10 Menit',
    durationRange: '10-30 Menit',
    mediaType: 'Interactive Coding',
    mediaFormatBadge: '🧪 Interactive Lab',
    rating: 4.88,
    enrolledCount: 2010,
    aiRecommended: false,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    tags: ['Security', 'XSS', 'Cookies'],
    updatedAt: '2026-09-21',
  },
  {
    id: 'les-4',
    type: 'lesson',
    title: 'SRL Diagnostic: Overcoming Coding Procrastination',
    description:
      'Kuis diagnostik 4 menit untuk memetakan fase Forethought dan pola distraksi kognitif saat belajar mandiri.',
    category: 'Soft Skills & Leadership',
    level: 'Pemula',
    durationMinutes: 4,
    durationLabel: '4 Menit',
    durationRange: '< 10 Menit',
    mediaType: 'Kuis Interaktif',
    mediaFormatBadge: '🧩 Kuis & Diagnostic',
    rating: 4.99,
    enrolledCount: 5200,
    aiRecommended: true,
    supportsWeeklyGoal: true,
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    tags: ['SRL Diagnostic', 'Psychology', 'Self-Check'],
    updatedAt: '2026-09-28',
  },
  {
    id: 'les-5',
    type: 'lesson',
    title: 'Docker Multi-Stage Build Optimization in 8 Mins',
    description:
      'Pangkas ukuran image Node.js / Go dari 1.2GB menjadi 80MB menggunakan multi-stage build dan distroless base image.',
    category: 'Cloud & DevOps',
    level: 'Menengah',
    durationMinutes: 8,
    durationLabel: '8 Menit',
    durationRange: '< 10 Menit',
    mediaType: 'Video',
    mediaFormatBadge: '🎥 Video Pembelajaran',
    rating: 4.93,
    enrolledCount: 2950,
    aiRecommended: false,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    tags: ['Docker', 'DevOps', 'Optimization'],
    updatedAt: '2026-09-23',
  },
  {
    id: 'les-6',
    type: 'lesson',
    title: 'Vector Indexing Explained: HNSW vs IVFFlat',
    description:
      'Pahami kompromi akurasi vs latency pencarian similarity pada embedding vektor untuk aplikasi AI.',
    category: 'AI & Data',
    level: 'Lanjutan',
    durationMinutes: 9,
    durationLabel: '9 Menit',
    durationRange: '< 10 Menit',
    mediaType: 'Artikel',
    mediaFormatBadge: '📝 Quick Article',
    rating: 4.94,
    enrolledCount: 2470,
    aiRecommended: true,
    supportsWeeklyGoal: false,
    thumbnail:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    tags: ['Vector DB', 'Embeddings', 'AI Algorithms'],
    updatedAt: '2026-09-26',
  },
];

// Available Filter Options
const TOPIC_OPTIONS = [
  'AI & Data',
  'Web Development',
  'Cloud & DevOps',
  'UI/UX Design',
  'Soft Skills & Leadership',
  'Cybersecurity',
];

const LEVEL_OPTIONS = ['Pemula', 'Menengah', 'Lanjutan'];

const DURATION_OPTIONS = [
  { label: '< 10 Menit [Bite-Sized]', value: '< 10 Menit' },
  { label: '10-30 Menit', value: '10-30 Menit' },
  { label: '1-3 Jam', value: '1-3 Jam' },
  { label: '> 3 Jam', value: '> 3 Jam' },
];

const MEDIA_OPTIONS = [
  { label: 'Video Pembelajaran', value: 'Video' },
  { label: 'Artikel Interaktif', value: 'Artikel' },
  { label: 'Kuis & Diagnostic', value: 'Kuis Interaktif' },
  { label: 'Interactive Code Lab', value: 'Interactive Coding' },
];

/**
 * ExploreMicrolearningPage Component
 * Full-featured search and exploratory catalog for KampusX Microlearning
 */
const ExploreMicrolearningPage = () => {
  const navigate = useNavigate();

  // --- Search & Tab States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'learning_path' | 'module' | 'lesson'

  // --- Sidebar Filter States ---
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [aiRecommendedOnly, setAiRecommendedOnly] = useState(false);
  const [weeklyGoalOnly, setWeeklyGoalOnly] = useState(false);

  // --- Display & Pagination States ---
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'newest' | 'popular' | 'rating' | 'duration_asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // --- Mobile Drawer State ---
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // --- Interactive Bookmarks State ---
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set(['mod-1', 'les-1']));

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- Reset All Filters ---
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setSelectedTopics([]);
    setSelectedLevels([]);
    setSelectedDurations([]);
    setSelectedMedia([]);
    setAiRecommendedOnly(false);
    setWeeklyGoalOnly(false);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // --- Toggle Multi-Select Filters ---
  const toggleArrayItem = (setter, item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setCurrentPage(1);
  };

  // --- Filter Logic ---
  const filteredItems = useMemo(() => {
    return MOCK_EXPLORE_ITEMS.filter((item) => {
      // 1. Tab Type Filter
      if (activeTab !== 'all' && item.type !== activeTab) {
        return false;
      }

      // 2. Search Query (Title, Description, Category, Tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchCat && !matchTags) {
          return false;
        }
      }

      // 3. Topics / Category Filter
      if (selectedTopics.length > 0 && !selectedTopics.includes(item.category)) {
        return false;
      }

      // 4. Level Filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(item.level)) {
        return false;
      }

      // 5. Duration Filter
      if (
        selectedDurations.length > 0 &&
        !selectedDurations.includes(item.durationRange)
      ) {
        return false;
      }

      // 6. Media Type Filter
      if (
        selectedMedia.length > 0 &&
        !selectedMedia.includes(item.mediaType)
      ) {
        return false;
      }

      // 7. AI Recommended
      if (aiRecommendedOnly && !item.aiRecommended) {
        return false;
      }

      // 8. Weekly Goal Supported
      if (weeklyGoalOnly && !item.supportsWeeklyGoal) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    activeTab,
    selectedTopics,
    selectedLevels,
    selectedDurations,
    selectedMedia,
    aiRecommendedOnly,
    weeklyGoalOnly,
  ]);

  // --- Sorting Logic ---
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'popular':
        return list.sort((a, b) => b.enrolledCount - a.enrolledCount);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'duration_asc':
        return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
      case 'relevance':
      default:
        // Rank AI recommended first, then rating
        return list.sort((a, b) => {
          if (a.aiRecommended && !b.aiRecommended) return -1;
          if (!a.aiRecommended && b.aiRecommended) return 1;
          return b.rating - a.rating;
        });
    }
  }, [filteredItems, sortBy]);

  // --- Pagination Slice ---
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  }, [sortedItems, currentPage]);

  // --- Tab Counts Calculation ---
  const tabCounts = useMemo(() => {
    const baseList = MOCK_EXPLORE_ITEMS.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchCat;
      }
      return true;
    });

    return {
      all: baseList.length,
      learning_path: baseList.filter((i) => i.type === 'learning_path').length,
      module: baseList.filter((i) => i.type === 'module').length,
      lesson: baseList.filter((i) => i.type === 'lesson').length,
    };
  }, [searchQuery]);

  // --- Active Filter Chips Array ---
  const activeChips = useMemo(() => {
    const chips = [];
    selectedTopics.forEach((t) =>
      chips.push({ key: `topic-${t}`, label: t, onRemove: () => toggleArrayItem(setSelectedTopics, t) })
    );
    selectedLevels.forEach((l) =>
      chips.push({ key: `level-${l}`, label: l, onRemove: () => toggleArrayItem(setSelectedLevels, l) })
    );
    selectedDurations.forEach((d) =>
      chips.push({ key: `dur-${d}`, label: d, onRemove: () => toggleArrayItem(setSelectedDurations, d) })
    );
    selectedMedia.forEach((m) =>
      chips.push({ key: `med-${m}`, label: m, onRemove: () => toggleArrayItem(setSelectedMedia, m) })
    );
    if (aiRecommendedOnly) {
      chips.push({
        key: 'ai-rec',
        label: '✨ Rekomendasi AI',
        onRemove: () => setAiRecommendedOnly(false),
      });
    }
    if (weeklyGoalOnly) {
      chips.push({
        key: 'weekly-goal',
        label: '🎯 Target Mingguan',
        onRemove: () => setWeeklyGoalOnly(false),
      });
    }
    return chips;
  }, [selectedTopics, selectedLevels, selectedDurations, selectedMedia, aiRecommendedOnly, weeklyGoalOnly]);

  // Handle Card Click Navigation
  const handleNavigateItem = (item) => {
    if (item.type === 'learning_path') {
      navigate(`/learning-path/${item.id}`);
    } else if (item.type === 'module') {
      navigate(`/learner/modules/${item.id}`);
    } else {
      navigate(`/learner/modules/${item.id}/forethought`);
    }
  };

  // ==========================================================================
  // SIDEBAR FILTER CONTENT COMPONENT (Reused in Desktop & Mobile Drawer)
  // ==========================================================================
  const FilterSidebarContent = () => (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
            Filter Pencarian
          </h5>
        </div>
        {activeChips.length > 0 && (
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 small fw-semibold text-danger d-inline-flex align-items-center gap-1"
            onClick={handleResetFilters}
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Rekomendasi AI & SRL Feature Switches */}
      <div>
        <div className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
          Rekomendasi Pintar (AI & SRL)
        </div>
        <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
          <Form.Check
            type="switch"
            id="ai-readiness-switch"
            label={
              <span className="small fw-semibold text-dark d-flex align-items-center gap-1">
                <Sparkles size={14} className="text-primary" />
                Sesuai Readiness Level
              </span>
            }
            checked={aiRecommendedOnly}
            onChange={(e) => {
              setAiRecommendedOnly(e.target.checked);
              setCurrentPage(1);
            }}
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="weekly-goal-switch"
            label={
              <span className="small fw-semibold text-dark d-flex align-items-center gap-1">
                <Target size={14} className="text-primary" />
                Mendukung Goal Mingguan
              </span>
            }
            checked={weeklyGoalOnly}
            onChange={(e) => {
              setWeeklyGoalOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 2. Topik / Kategori */}
      <div>
        <div className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
          Topik & Keahlian
        </div>
        <div className="d-flex flex-column gap-2">
          {TOPIC_OPTIONS.map((topic) => (
            <Form.Check
              key={topic}
              type="checkbox"
              id={`filter-topic-${topic}`}
              label={<span className="small text-secondary fw-medium">{topic}</span>}
              checked={selectedTopics.includes(topic)}
              onChange={() => toggleArrayItem(setSelectedTopics, topic)}
            />
          ))}
        </div>
      </div>

      {/* 3. Level Kesulitan */}
      <div className="pt-3 border-top">
        <div className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
          Tingkat Kesulitan
        </div>
        <div className="d-flex flex-column gap-2">
          {LEVEL_OPTIONS.map((lvl) => (
            <Form.Check
              key={lvl}
              type="checkbox"
              id={`filter-lvl-${lvl}`}
              label={<span className="small text-secondary fw-medium">{lvl}</span>}
              checked={selectedLevels.includes(lvl)}
              onChange={() => toggleArrayItem(setSelectedLevels, lvl)}
            />
          ))}
        </div>
      </div>

      {/* 4. Durasi Belajar */}
      <div className="pt-3 border-top">
        <div className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
          Estimasi Durasi
        </div>
        <div className="d-flex flex-column gap-2">
          {DURATION_OPTIONS.map((dur) => (
            <Form.Check
              key={dur.value}
              type="checkbox"
              id={`filter-dur-${dur.value}`}
              label={<span className="small text-secondary fw-medium">{dur.label}</span>}
              checked={selectedDurations.includes(dur.value)}
              onChange={() => toggleArrayItem(setSelectedDurations, dur.value)}
            />
          ))}
        </div>
      </div>

      {/* 5. Tipe Konten / Media */}
      <div className="pt-3 border-top">
        <div className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
          Format Media
        </div>
        <div className="d-flex flex-column gap-2">
          {MEDIA_OPTIONS.map((med) => (
            <Form.Check
              key={med.value}
              type="checkbox"
              id={`filter-med-${med.value}`}
              label={<span className="small text-secondary fw-medium">{med.label}</span>}
              checked={selectedMedia.includes(med.value)}
              onChange={() => toggleArrayItem(setSelectedMedia, med.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-4 py-lg-5" style={{ backgroundColor: '#f8fafc' }}>
      <Container>
        {/* ==================================================================
            1. HEADER & SEARCH SECTION
           ================================================================== */}
        <div className="text-center mx-auto mb-4 px-2" style={{ maxWidth: '720px' }}>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-semibold small mb-2"
               style={{ backgroundColor: '#ede9fe', color: '#6c5ce7', fontSize: '0.8rem' }}>
            <Sparkles size={14} />
            <span>Katalog Pembelajaran Mandiri</span>
          </div>

          <h1 className="fw-bold text-dark mb-2" style={{ fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', letterSpacing: '-0.02em' }}>
            Eksplorasi Microlearning
          </h1>
          <p className="text-muted mb-4 px-1" style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
            Akses materi pembelajaran ringkas, modular, dan terarah. Pelajari keahlian rekayasa teknologi dalam hitungan menit sesuai ritme belajarmu.
          </p>

          {/* Large Search Input Bar */}
          <div className="p-2 bg-white rounded-3 shadow-sm border mb-3 d-flex align-items-center gap-2 flex-nowrap" style={{ borderRadius: '16px' }}>
            <InputGroup className="border-0 flex-grow-1">
              <InputGroup.Text className="bg-transparent border-0 ps-2 ps-sm-3 pe-2 text-muted">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Cari topik, keahlian, teknologi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-0 shadow-none ps-1 py-2 text-dark"
                style={{ fontSize: '0.9rem' }}
              />
              {searchQuery && (
                <Button
                  variant="link"
                  className="text-muted text-decoration-none border-0 p-1"
                  onClick={() => setSearchQuery('')}
                  title="Hapus pencarian"
                >
                  <X size={16} />
                </Button>
              )}
            </InputGroup>

            {/* Mobile Filter Toggle Button */}
            <Button
              variant="outline-primary"
              className="d-lg-none d-flex align-items-center gap-1 px-3 py-2 rounded-3 text-nowrap flex-shrink-0"
              style={{ borderColor: '#6c5ce7', color: '#6c5ce7', fontSize: '0.82rem' }}
              onClick={() => setShowMobileFilter(true)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {activeChips.length > 0 && (
                <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}>
                  {activeChips.length}
                </span>
              )}
            </Button>
          </div>

          {/* Quick Category / Filter Tabs (Swipeable on Mobile) */}
          <div
            className="d-flex align-items-center justify-content-start justify-content-sm-center gap-2 overflow-x-auto pb-2 pb-sm-0 flex-nowrap flex-sm-wrap"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 ${
                activeTab === 'all'
                  ? 'btn-dark text-white shadow-sm'
                  : 'btn-outline-secondary border bg-white text-muted'
              }`}
              style={{ transition: 'all 0.2s ease' }}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
            >
              <span>Semua Konten</span>
              <span className={`badge rounded-pill ${activeTab === 'all' ? 'bg-secondary' : 'bg-light text-muted'}`}>
                {tabCounts.all}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 ${
                activeTab === 'learning_path'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary border bg-white text-muted'
              }`}
              style={{
                transition: 'all 0.2s ease',
                ...(activeTab === 'learning_path' ? { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' } : {}),
              }}
              onClick={() => {
                setActiveTab('learning_path');
                setCurrentPage(1);
              }}
            >
              <Compass size={14} />
              <span>Learning Paths</span>
              <span className={`badge rounded-pill ${activeTab === 'learning_path' ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                {tabCounts.learning_path}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 ${
                activeTab === 'module'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary border bg-white text-muted'
              }`}
              style={{
                transition: 'all 0.2s ease',
                ...(activeTab === 'module' ? { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' } : {}),
              }}
              onClick={() => {
                setActiveTab('module');
                setCurrentPage(1);
              }}
            >
              <Layers size={14} />
              <span>Modul</span>
              <span className={`badge rounded-pill ${activeTab === 'module' ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                {tabCounts.module}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 ${
                activeTab === 'lesson'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary border bg-white text-muted'
              }`}
              style={{
                transition: 'all 0.2s ease',
                ...(activeTab === 'lesson' ? { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' } : {}),
              }}
              onClick={() => {
                setActiveTab('lesson');
                setCurrentPage(1);
              }}
            >
              <Zap size={14} />
              <span>Microlearning / Lesson</span>
              <span className={`badge rounded-pill ${activeTab === 'lesson' ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                {tabCounts.lesson}
              </span>
            </button>
          </div>
        </div>

        {/* ==================================================================
            2. LAYOUT DUA KOLOM (Desktop col-lg-3 & col-lg-9)
           ================================================================== */}
        <Row className="g-4">
          {/* Kolom Kiri: Sidebar Filter (Desktop) */}
          <Col lg={3} className="d-none d-lg-block">
            <Card className="border-0 shadow-sm rounded-3 p-4 sticky-top" style={{ top: '90px', borderRadius: '16px' }}>
              <FilterSidebarContent />
            </Card>
          </Col>

          {/* Kolom Kanan: Top Results Bar & Grid/List Catalog */}
          <Col lg={9}>
            {/* Top Bar: Total Results, Sort, & View Switcher */}
            <div className="bg-white rounded-3 p-3 shadow-sm border mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                  Menampilkan {sortedItems.length} materi
                </span>
                {searchQuery && (
                  <span className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>
                    untuk "<strong>{searchQuery}</strong>"
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-2">
                {/* Sort By Dropdown */}
                <div className="d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0">
                  <span className="text-muted small d-none d-md-inline text-nowrap">Urutkan:</span>
                  <Form.Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border shadow-none rounded-3 fw-medium text-dark w-100"
                    style={{ fontSize: '0.82rem', minWidth: '135px' }}
                  >
                    <option value="relevance">Paling Relevan</option>
                    <option value="newest">Terbaru</option>
                    <option value="popular">Terpopuler</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="duration_asc">Durasi Terpendek</option>
                  </Form.Select>
                </div>

                {/* View Switcher (Grid vs List) */}
                <div className="btn-group border rounded-3 p-1 bg-light flex-shrink-0">
                  <button
                    type="button"
                    className={`btn btn-sm border-0 py-1 px-2 rounded-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm border-0 py-1 px-2 rounded-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {activeChips.length > 0 && (
              <div className="d-flex align-items-center gap-2 flex-wrap mb-3 p-3 bg-white rounded-3 border">
                <span className="text-muted small fw-semibold">Filter Aktif:</span>
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="badge rounded-pill bg-light text-dark border px-3 py-1 d-inline-flex align-items-center gap-2"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <span>{chip.label}</span>
                    <X
                      size={13}
                      className="text-muted"
                      style={{ cursor: 'pointer' }}
                      onClick={chip.onRemove}
                    />
                  </span>
                ))}
                <button
                  type="button"
                  className="btn btn-link text-decoration-none p-0 small fw-bold text-danger ms-auto"
                  onClick={handleResetFilters}
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* ==================================================================
                3. KATALOG HASIL PENCARIAN (Grid / List View)
               ================================================================== */}
            {paginatedItems.length === 0 ? (
              /* 4. EMPTY STATE */
              <Card className="border-0 shadow-sm rounded-3 text-center p-5 my-3 bg-white" style={{ borderRadius: '16px' }}>
                <div className="mx-auto mb-3 p-3 rounded-circle" style={{ backgroundColor: '#f5f3ff', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={32} style={{ color: '#6c5ce7' }} />
                </div>
                <h4 className="fw-bold text-dark mb-2">Tidak ada materi yang cocok</h4>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.9rem' }}>
                  Coba sesuaikan kata kunci pencarian Anda atau hapus beberapa filter untuk menemukan konten pembelajaran lainnya.
                </p>
                <div>
                  <Button
                    variant="primary"
                    className="fw-semibold px-4 py-2 rounded-3 shadow-sm"
                    style={{ backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' }}
                    onClick={handleResetFilters}
                  >
                    Reset Semua Filter
                  </Button>
                </div>
              </Card>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <Row className="row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 mb-4">
                {paginatedItems.map((item) => (
                  <Col key={item.id} className="d-flex">
                    <RenderGridCard
                      item={item}
                      isBookmarked={bookmarkedIds.has(item.id)}
                      onToggleBookmark={toggleBookmark}
                      onNavigate={handleNavigateItem}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              /* LIST VIEW */
              <div className="d-flex flex-column gap-3 mb-4">
                {paginatedItems.map((item) => (
                  <RenderListCard
                    key={item.id}
                    item={item}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onToggleBookmark={toggleBookmark}
                    onNavigate={handleNavigateItem}
                  />
                ))}
              </div>
            )}

            {/* ==================================================================
                4. PAGINATION
               ================================================================== */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2">
                <span className="text-muted small">
                  Halaman {currentPage} dari {totalPages} ({sortedItems.length} total materi)
                </span>
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  />
                </Pagination>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* ==================================================================
          MOBILE OFFCANVAS FILTER DRAWER
         ================================================================== */}
      <Offcanvas
        show={showMobileFilter}
        onHide={() => setShowMobileFilter(false)}
        placement="start"
        style={{ width: '310px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
            <Filter size={18} className="text-primary" />
            <span>Filter Microlearning</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-3" style={{ overflowY: 'auto' }}>
          <FilterSidebarContent />
          <div className="mt-4 pt-3 border-top">
            <Button
              variant="primary"
              className="w-100 fw-bold py-2 rounded-3"
              style={{ backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' }}
              onClick={() => setShowMobileFilter(false)}
            >
              Terapkan Filter ({sortedItems.length})
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: Render Grid Card by Type (Learning Path, Module, Lesson)
// ============================================================================
const RenderGridCard = ({ item, isBookmarked, onToggleBookmark, onNavigate }) => {
  const isLearningPath = item.type === 'learning_path';
  const isModule = item.type === 'module';
  const isLesson = item.type === 'lesson';

  return (
    <Card
      className={`w-100 border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column ${
        isLearningPath ? 'border-top border-4' : ''
      }`}
      style={{
        borderRadius: '16px',
        borderTopColor: isLearningPath ? '#6c5ce7' : undefined,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => onNavigate(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Thumbnail Header with Badges */}
      <div className="position-relative" style={{ height: '145px', overflow: 'hidden' }}>
        <img
          src={item.thumbnail}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1 align-items-start">
          {/* Content Type Badge */}
          {isLearningPath && (
            <span
              className="badge text-white fw-bold shadow-sm d-inline-flex align-items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                fontSize: '0.72rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
              }}
            >
              <Compass size={12} />
              <span>Learning Path</span>
            </span>
          )}

          {isModule && (
            <span
              className="badge bg-dark text-white fw-bold shadow-sm d-inline-flex align-items-center gap-1"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: '6px' }}
            >
              <Layers size={12} />
              <span>Modul</span>
            </span>
          )}

          {isLesson && (
            <span
              className="badge bg-warning text-dark fw-bold shadow-sm d-inline-flex align-items-center gap-1"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: '6px' }}
            >
              <Zap size={12} />
              <span>{item.durationLabel} Micro</span>
            </span>
          )}

          {/* AI Recommended Badge */}
          {item.aiRecommended && (
            <span
              className="badge bg-white text-primary border shadow-sm fw-bold d-inline-flex align-items-center gap-1"
              style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#6c5ce7' }}
            >
              <Sparkles size={11} className="text-warning" />
              <span>AI Recommended</span>
            </span>
          )}
        </div>

        {/* Bookmark Action Button */}
        <button
          type="button"
          className="btn btn-sm bg-white rounded-circle position-absolute top-0 end-0 m-2 shadow-sm p-0 border-0 d-flex align-items-center justify-content-center"
          style={{ width: '32px', height: '32px' }}
          onClick={(e) => onToggleBookmark(e, item.id)}
          title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan bookmark'}
        >
          <Bookmark
            size={16}
            color={isBookmarked ? '#f59e0b' : '#64748b'}
            fill={isBookmarked ? '#f59e0b' : 'transparent'}
          />
        </button>
      </div>

      {/* Card Body */}
      <Card.Body className="p-3 d-flex flex-column justify-content-between flex-grow-1">
        <div>
          {/* Category & Rating */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-light text-secondary border fw-medium" style={{ fontSize: '0.72rem' }}>
              {item.category}
            </span>
            <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '0.78rem' }}>{item.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h5
            className="fw-bold text-dark mb-1"
            style={{
              fontSize: '0.96rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6rem',
            }}
            title={item.title}
          >
            {item.title}
          </h5>

          {/* Description snippet */}
          <p
            className="text-muted small mb-2"
            style={{
              fontSize: '0.8rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        </div>

        <div>
          {/* Type-Specific Meta Section */}
          {isLearningPath && (
            <div className="p-2 rounded-2 mb-3 bg-light d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
              <span>
                <strong>{item.moduleCount}</strong> Modul • <strong>{item.lessonCount}</strong> Lesson
              </span>
              <span className="d-flex align-items-center gap-1">
                <Clock size={12} />
                {item.durationLabel}
              </span>
            </div>
          )}

          {isModule && (
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                <span>{item.lessonCount} Lesson</span>
                <span>{item.level}</span>
              </div>
              {item.isEnrolled ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.7rem' }}>
                    <span className="text-primary fw-semibold">Sedang Dipelajari</span>
                    <span className="fw-bold">{item.progressPercent}%</span>
                  </div>
                  <ProgressBar
                    now={item.progressPercent}
                    style={{ height: '5px', backgroundColor: '#e2e8f0' }}
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  <span>{item.durationLabel} total waktu</span>
                </div>
              )}
            </div>
          )}

          {isLesson && (
            <div className="d-flex align-items-center justify-content-between mb-3 pt-1 border-top" style={{ fontSize: '0.75rem' }}>
              <span className="badge fw-medium" style={{ backgroundColor: '#f5f3ff', color: '#6c5ce7' }}>
                {item.mediaFormatBadge}
              </span>
              <span className="text-muted d-flex align-items-center gap-1">
                <Clock size={12} />
                {item.durationLabel}
              </span>
            </div>
          )}

          {/* CTA Button */}
          {isLearningPath && (
            <Button
              variant="primary"
              size="sm"
              className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
              style={{ backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' }}
            >
              <span>Mulai Path Belajar</span>
              <ArrowRight size={14} />
            </Button>
          )}

          {isModule && (
            <Button
              variant="outline-primary"
              size="sm"
              className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
              style={{ borderColor: '#6c5ce7', color: '#6c5ce7' }}
            >
              <span>{item.isEnrolled ? 'Lanjutkan Modul' : 'Lihat Modul'}</span>
              <ArrowRight size={14} />
            </Button>
          )}

          {isLesson && (
            <Button
              variant="dark"
              size="sm"
              className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
            >
              <Zap size={14} />
              <span>Pelajari Sekarang</span>
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// ============================================================================
// SUB-COMPONENT: Render List Card by Type (Learning Path, Module, Lesson)
// ============================================================================
const RenderListCard = ({ item, isBookmarked, onToggleBookmark, onNavigate }) => {
  const isLearningPath = item.type === 'learning_path';
  const isModule = item.type === 'module';
  const isLesson = item.type === 'lesson';

  return (
    <Card
      className="border-0 shadow-sm rounded-3 p-3 overflow-hidden"
      style={{ cursor: 'pointer', borderRadius: '16px', transition: 'all 0.2s ease' }}
      onClick={() => onNavigate(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <Row className="g-3 align-items-center">
        {/* Left: Thumbnail with Type Badge */}
        <Col xs={12} sm={4} md={3}>
          <div className="position-relative rounded-3 overflow-hidden" style={{ height: '135px' }}>
            <img
              src={item.thumbnail}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span
              className="badge position-absolute top-0 start-0 m-2 fw-bold text-white shadow-sm"
              style={{
                fontSize: '0.68rem',
                backgroundColor: isLearningPath ? '#6c5ce7' : isModule ? '#0f172a' : '#f59e0b',
              }}
            >
              {isLearningPath ? 'Path' : isModule ? 'Modul' : 'Micro'}
            </span>
          </div>
        </Col>

        {/* Center: Details */}
        <Col xs={12} sm={5} md={6}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.72rem' }}>
              {item.category}
            </span>
            <span className="text-muted small">•</span>
            <span className="text-muted small">{item.level}</span>
            {item.aiRecommended && (
              <span className="badge fw-semibold" style={{ fontSize: '0.68rem', backgroundColor: '#f5f3ff', color: '#6c5ce7' }}>
                ✨ AI Recommended
              </span>
            )}
          </div>

          <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
            {item.title}
          </h5>

          <p className="text-muted small mb-2 text-truncate" style={{ fontSize: '0.82rem' }}>
            {item.description}
          </p>

          <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.76rem' }}>
            <span className="d-flex align-items-center gap-1 text-warning fw-bold">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>{item.rating}</span>
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} />
              <span>{item.durationLabel}</span>
            </span>
            {isLearningPath && (
              <>
                <span>•</span>
                <span>{item.moduleCount} Modul</span>
              </>
            )}
            {isModule && (
              <>
                <span>•</span>
                <span>{item.lessonCount} Lesson</span>
              </>
            )}
          </div>
        </Col>

        {/* Right: Actions */}
        <Col xs={12} sm={3} md={3} className="text-sm-end d-flex flex-row flex-sm-column justify-content-between align-items-center align-items-sm-end h-100 gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
            onClick={(e) => onToggleBookmark(e, item.id)}
            title="Bookmark"
          >
            <Bookmark
              size={15}
              color={isBookmarked ? '#f59e0b' : '#64748b'}
              fill={isBookmarked ? '#f59e0b' : 'transparent'}
            />
          </button>

          <div>
            {isLearningPath && (
              <Button
                variant="primary"
                size="sm"
                className="fw-semibold px-3 py-1 rounded-3"
                style={{ backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' }}
              >
                Mulai Path
              </Button>
            )}
            {isModule && (
              <Button
                variant="outline-primary"
                size="sm"
                className="fw-semibold px-3 py-1 rounded-3"
                style={{ borderColor: '#6c5ce7', color: '#6c5ce7' }}
              >
                {item.isEnrolled ? 'Lanjutkan' : 'Buka Modul'}
              </Button>
            )}
            {isLesson && (
              <Button variant="dark" size="sm" className="fw-semibold px-3 py-1 rounded-3">
                Pelajari
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ExploreMicrolearningPage;
