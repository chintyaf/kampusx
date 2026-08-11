import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

/* ─── Placeholder module data ─────────────────────────────── */
const MOCK_MODULES = [
  {
    id: 1,
    tag: 'Design Thinking',
    tagColor: '#7c3aed',
    tagBg: '#f5f3ff',
    title: 'Pengenalan Design Thinking untuk Pemula',
    duration: '~12 min',
    lessons: 4,
    progress: 0,
    status: 'not_started',
    thumbColor: '#c4b5fd',
  },
  {
    id: 2,
    tag: 'Public Speaking',
    tagColor: '#0369a1',
    tagBg: '#e0f2fe',
    title: 'Teknik Presentasi yang Memukau Audiens',
    duration: '~18 min',
    lessons: 6,
    progress: 60,
    status: 'in_progress',
    thumbColor: '#7dd3fc',
  },
  {
    id: 3,
    tag: 'Leadership',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
    title: 'Dasar-dasar Kepemimpinan Tim Efektif',
    duration: '~15 min',
    lessons: 5,
    progress: 100,
    status: 'completed',
    thumbColor: '#fcd34d',
  },
  {
    id: 4,
    tag: 'Produktivitas',
    tagColor: '#047857',
    tagBg: '#d1fae5',
    title: 'Deep Work: Fokus Tanpa Distraksi Digital',
    duration: '~10 min',
    lessons: 3,
    progress: 0,
    status: 'not_started',
    thumbColor: '#6ee7b7',
  },
];

const STATUS_CONFIG = {
  not_started: { label: 'Belum dimulai', icon: Circle,       color: '#94a3b8' },
  in_progress:  { label: 'Sedang berjalan', icon: PlayCircle, color: '#0369a1' },
  completed:    { label: 'Selesai',          icon: CheckCircle,color: '#16a34a' },
};

/* ─── Single module card ───────────────────────────────────── */
const ModuleCard = ({ mod, onClick }) => {
  const { label, icon: StatusIcon, color } = STATUS_CONFIG[mod.status];

  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 220,
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e8ecf0',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', height: 96,
        background: mod.thumbColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <BookOpen size={28} color="rgba(255,255,255,0.75)" />
        {/* duration badge */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 999, padding: '2px 8px',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Clock size={9} color="#fff" />
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{mod.duration}</span>
        </div>
      </div>

      <div style={{ padding: '10px 12px 12px' }}>
        {/* Tag */}
        <span style={{
          display: 'inline-block',
          fontSize: 10, fontWeight: 700,
          color: mod.tagColor, background: mod.tagBg,
          borderRadius: 999, padding: '2px 8px',
          marginBottom: 6,
        }}>
          {mod.tag}
        </span>

        {/* Title */}
        <p style={{
          margin: '0 0 8px',
          fontSize: 12, fontWeight: 700, color: '#0f172a',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {mod.title}
        </p>

        {/* Progress bar */}
        {mod.status !== 'not_started' && (
          <div style={{ marginBottom: 8 }}>
            <div style={{
              height: 4, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${mod.progress}%`,
                background: mod.status === 'completed' ? '#16a34a' : '#0369a1',
                borderRadius: 999,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StatusIcon size={11} color={color} />
            <span style={{ fontSize: 10, color, fontWeight: 500 }}>{label}</span>
          </div>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{mod.lessons} pelajaran</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Section ──────────────────────────────────────────────── */
const MicrolearningSection = () => {
  const navigate = useNavigate();

  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader
        title="Micro-Learning"
        onSeeAll={() => navigate('/learner/catalog')}
      />

      {/* Negative margin bleeds past Bootstrap Container padding so cards aren't clipped */}
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
        }}>
        {MOCK_MODULES.map(mod => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            onClick={() => navigate('/learner/catalog')}
          />
        ))}
      </div>

    </section>
  );
};

export default MicrolearningSection;
