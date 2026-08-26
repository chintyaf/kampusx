import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '@/context/AuthContext';

const MOCK_MODULES = [
  {
    id: 1,
    tag: 'Design Thinking',
    tagColor: '#7c3aed',
    tagBg: '#f5f3ff',
    title: 'Pengenalan Design Thinking untuk Pemula',
    duration: '12 Min',
    lessons: 4,
    progress: 0,
    status: 'not_started',
    thumbColor: '#c4b5fd',
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80',
    instructorName: 'Sarah Wijaya',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    difficulty: 'Beginner',
    difficultyColor: '#16a34a',
    difficultyBg: '#d1fae5',
    points: 50,
    type: 'article',
    category: 'Design',
  },
  {
    id: 2,
    tag: 'Public Speaking',
    tagColor: '#0369a1',
    tagBg: '#e0f2fe',
    title: 'Teknik Presentasi yang Memukau Audiens',
    duration: '18 Min',
    lessons: 6,
    progress: 60,
    status: 'in_progress',
    thumbColor: '#7dd3fc',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
    instructorName: 'Budi Santoso',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    difficulty: 'Intermediate',
    difficultyColor: '#b45309',
    difficultyBg: '#fef3c7',
    points: 75,
    type: 'video',
    category: 'Speaking',
  },
  {
    id: 3,
    tag: 'Leadership',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
    title: 'Dasar-dasar Kepemimpinan Tim Efektif',
    duration: '15 Min',
    lessons: 5,
    progress: 100,
    status: 'completed',
    thumbColor: '#fcd34d',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
    instructorName: 'Adi Pratama',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
    difficulty: 'Beginner',
    difficultyColor: '#16a34a',
    difficultyBg: '#d1fae5',
    points: 100,
    type: 'article',
    category: 'Leadership',
  },
  {
    id: 4,
    tag: 'Produktivitas',
    tagColor: '#047857',
    tagBg: '#d1fae5',
    title: 'Deep Work: Fokus Tanpa Distraksi Digital',
    duration: '10 Min',
    lessons: 3,
    progress: 0,
    status: 'not_started',
    thumbColor: '#6ee7b7',
    coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80',
    instructorName: 'Rina Kartika',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    difficulty: 'Beginner',
    difficultyColor: '#2563eb',
    difficultyBg: '#dbeafe',
    points: 40,
    type: 'article',
    category: 'Productivity',
  },
];

const INTEREST_MAP = {
  'Design Thinking': ['Seni & Desain', 'Teknik & Tech', 'Bisnis & Ekonomi'],
  'Public Speaking': ['Ilmu Sosial', 'Bisnis & Ekonomi', 'Pendidikan', 'Musik & Hiburan'],
  'Leadership': ['Bisnis & Ekonomi', 'Ilmu Sosial', 'Pendidikan'],
  'Produktivitas': ['Pendidikan', 'Bisnis & Ekonomi', 'Teknik & Tech'],
};

const RecommendedModuleCard = ({ mod }) => {
  const navigate = useNavigate();
  
  const getButtonText = () => {
    if (mod.status === 'completed') return 'Ulangi Modul';
    if (mod.status === 'in_progress') return 'Lanjutkan Modul';
    return 'Mulai Modul';
  };

  const getButtonBg = () => {
    if (mod.status === 'completed') return '#16a34a';
    return '#005a87';
  };

  return (
    <div
      onClick={() => navigate(`/learner/modules/${mod.id}/goals`)}
      style={{
        width: 260,
        flexShrink: 0,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 105, 158, 0.03)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 105, 158, 0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 105, 158, 0.03)';
      }}
    >
      {/* Header Gambar (Atas): Cover Image 16:9 */}
      <div style={{ position: 'relative', width: '100%', height: 146, overflow: 'hidden' }}>
        <img
          src={mod.coverImage}
          alt={mod.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Overlay Top-Left: Category badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: mod.tagBg,
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: 9,
          fontWeight: 800,
          color: mod.tagColor,
          textTransform: 'uppercase',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}>
          {mod.category}
        </div>

        {/* Overlay Top-Right: Reward Gamifikasi */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: '#fffbeb',
          borderRadius: 20,
          border: '1px solid #fef3c7',
          padding: '2px 8px',
          fontSize: 9,
          fontWeight: 800,
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}>
          <span>🪙</span>
          +{mod.points} Poin
        </div>
      </div>

      {/* Bodi Kartu (Tengah) */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <h4 style={{
          margin: '0 0 8px',
          fontSize: 13,
          fontWeight: 850,
          color: '#0f172a',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 36,
        }}>
          {mod.title}
        </h4>

        {/* Meta-info ringkas */}
        <div style={{
          fontSize: 10,
          color: '#64748b',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 12,
        }}>
          <span>{mod.difficulty}</span>
          <span>•</span>
          <span>⏱️ Total {mod.duration}</span>
          <span>•</span>
          <span>📚 {mod.lessons} Lesson</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer Kartu (Bawah) */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {/* Avatar & Nama Instructor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={mod.instructorAvatar}
              alt={mod.instructorName}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
              }}
            />
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              {mod.instructorName}
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/learner/modules/${mod.id}/goals`);
            }}
            style={{
              width: '100%',
              background: getButtonBg(),
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 0',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

const RecommendedMicrolearningSection = ({ style }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user selected categories/interests
  const userCategories = user?.categories || [];
  const userCategoryNames = userCategories.map(cat => (typeof cat === 'string' ? cat : cat.name));

  // Filter out completed and in-progress modules, only showing not started (0% progress) modules
  let recommended = MOCK_MODULES.filter(mod => mod.progress === 0);

  const filteredByInterest = recommended.filter(mod => {
    const mappedInterests = INTEREST_MAP[mod.tag] || [];
    return mappedInterests.some(interest => userCategoryNames.includes(interest));
  });

  if (filteredByInterest.length > 0) {
    recommended = filteredByInterest;
  }

  return (
    <section style={{ marginBottom: 36, ...style }}>
      <SectionHeader
        title="Rekomendasi Micro-learning Untukmu"
        onSeeAll={() => navigate('/learner/catalog')}
      />

      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          marginLeft: -16,
          marginRight: -16,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {recommended.map(mod => (
          <RecommendedModuleCard
            key={mod.id}
            mod={mod}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedMicrolearningSection;
