import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, BookOpen, Ticket, ChevronRight } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import { STORAGE_URL } from '@/api/storage';
import { formatDate } from '@/utils/dateUtils';

const MOCK_MODULES = [
  {
    id: 1,
    tag: 'Design Thinking',
    tagColor: '#7c3aed',
    tagBg: '#f5f3ff',
    title: 'Pengenalan Design Thinking untuk Pemula',
    duration: '12 min',
    lessons: 4,
    progress: 0,
    status: 'not_started',
    thumbColor: '#c4b5fd',
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80',
    category: 'Design',
    difficulty: 'Beginner',
    difficultyColor: '#16a34a',
    difficultyBg: '#d1fae5',
  },
  {
    id: 2,
    tag: 'Public Speaking',
    tagColor: '#0369a1',
    tagBg: '#e0f2fe',
    title: 'Teknik Presentasi yang Memukau Audiens',
    duration: '18 min',
    lessons: 6,
    progress: 60,
    status: 'in_progress',
    thumbColor: '#7dd3fc',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
    category: 'Speaking',
    difficulty: 'Intermediate',
    difficultyColor: '#b45309',
    difficultyBg: '#fef3c7',
  },
  {
    id: 3,
    tag: 'Leadership',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
    title: 'Dasar-dasar Kepemimpinan Tim Efektif',
    duration: '15 min',
    lessons: 5,
    progress: 100,
    status: 'completed',
    thumbColor: '#fcd34d',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
    category: 'Leadership',
    difficulty: 'Beginner',
    difficultyColor: '#16a34a',
    difficultyBg: '#d1fae5',
  },
  {
    id: 4,
    tag: 'Produktivitas',
    tagColor: '#047857',
    tagBg: '#d1fae5',
    title: 'Deep Work: Fokus Tanpa Distraksi Digital',
    duration: '10 min',
    lessons: 3,
    progress: 0,
    status: 'not_started',
    thumbColor: '#6ee7b7',
    coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80',
    category: 'Productivity',
    difficulty: 'Beginner',
    difficultyColor: '#16a34a',
    difficultyBg: '#d1fae5',
  },
];

const ModuleRow = ({ mod }) => {
  const navigate = useNavigate();
  const completedLessons = Math.round(mod.lessons * (mod.progress / 100));
  const durationNum = parseInt(mod.duration) || 10;
  const remainingMinutes = Math.max(1, Math.round(durationNum * (1 - mod.progress / 100)));
  
  const getSubTitleText = () => {
    if (mod.status === 'completed') {
      return `100% selesai • ${mod.lessons}/${mod.lessons} Lesson`;
    }
    return `${mod.progress}% selesai • ${completedLessons}/${mod.lessons} Lesson`;
  };

  const getButtonText = () => {
    if (mod.status === 'completed') return '▶ Ulangi';
    if (mod.status === 'not_started') return '▶ Mulai';
    return '▶ Lanjutkan';
  };

  const getButtonBg = () => {
    if (mod.status === 'completed') return '#16a34a';
    return '#005a87';
  };

  return (
    <div
      onClick={() => navigate(`/learner/modules/${mod.id}`)}
      style={{
        display: 'flex',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,105,158,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
      }}
    >
      {/* Kiri: Thumbnail gambar (120x120px) */}
      <div style={{
        position: 'relative',
        width: 120,
        height: 120,
        overflow: 'hidden',
        flexShrink: 0,
        background: '#cbd5e1',
      }}>
        <img
          src={mod.coverImage}
          alt={mod.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Overlaid duration remaining badge */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          borderRadius: 6,
          padding: '2px 4px',
          fontSize: 9,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {mod.status === 'completed' ? '🏆 Selesai' : `⏱️ ${remainingMinutes} mnt`}
        </div>
      </div>

      {/* Kanan: Dikelompokkan Rapat */}
      <div style={{
        flex: 1,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 0,
      }}>
        <div>
          {/* Tag Kategori & Level (DESIGN • Beginner) */}
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            color: '#64748b',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <span style={{ color: mod.tagColor }}>{mod.category}</span>
            <span style={{ margin: '0 4px', color: '#cbd5e1' }}>•</span>
            <span>{mod.difficulty}</span>
          </div>

          {/* Judul Modul (max 2 baris) */}
          <h4 style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 32,
          }}>
            {mod.title}
          </h4>
        </div>

        {/* Progress bar & CTA row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Progress details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', fontWeight: 700, marginBottom: 2 }}>
              <span>{getSubTitleText()}</span>
            </div>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${mod.progress}%`, background: getButtonBg(), borderRadius: 999 }} />
            </div>
          </div>

          {/* Tombol CTA kecil */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/learner/modules/${mod.id}`);
              }}
              style={{
                background: getButtonBg(),
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyActivitySection = ({ activeTickets, isLoading }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning'); // Default to learning tab ('learning' | 'events')

  // Only count modules that are actively in progress or completed (> 0% progress)
  const activeModules = MOCK_MODULES.filter(m => m.progress > 0);
  const activeClassesCount = activeModules.length;

  const handleSeeAll = () => {
    if (activeTab === 'events') {
      navigate('/my-tickets');
    } else {
      navigate('/learner/catalog');
    }
  };

  const renderEventsTab = () => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
        }} className="placeholder-glow no-scrollbar">
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 236,
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,105,158,0.08)',
                paddingBottom: 12
              }}
            >
              <div className="placeholder" style={{ width: '100%', height: 108, display: 'block', backgroundColor: '#e2e8f0' }} />
              <div style={{ padding: '10px 12px 0' }}>
                <span className="placeholder col-4" style={{ height: 16, borderRadius: 4, display: 'block', marginBottom: 8 }} />
                <span className="placeholder col-10" style={{ height: 18, borderRadius: 4, display: 'block', marginBottom: 6 }} />
                <span className="placeholder col-6" style={{ height: 12, borderRadius: 4, display: 'block' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTickets.length === 0) {
      return (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: 13,
            boxShadow: '0 2px 12px rgba(0,105,158,0.08)',
            border: '1px solid #e8ecf0',
          }}>
          Belum ada event aktif.{' '}
          <span
            style={{ color: '#00699e', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/explore-events')}>
            Cari event →
          </span>
        </div>
      );
    }

    return (
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          paddingLeft: 4,
          paddingRight: 4,
        }}>
        {activeTickets.map((t) => {
          const ev = t.order_item?.order?.event;
          if (!ev) return null;

          const locationDetail = ev.location_detail || ev.locationDetail;
          const locationText = locationDetail
            ? locationDetail.type === 'online'
              ? `Online (${locationDetail.platform || 'Platform'})`
              : locationDetail.location_name || locationDetail.city || 'Offline Venue'
            : ev.location_type === 'online'
              ? 'Online'
              : ev.venue || 'Offline Venue';

          return (
            <div
              key={t.id}
              onClick={() => navigate(`/event-space/${ev.slug || ev.id}`)}
              style={{
                flexShrink: 0,
                width: 236,
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,105,158,0.08)',
                cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
                border: '1px solid #e8ecf0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,105,158,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,105,158,0.08)';
              }}>
              <img
                src={ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id}.jpg`}
                alt={ev.title}
                style={{
                  width: '100%',
                  height: 108,
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ marginBottom: 6 }}>
                  <StatusPill status={t.status} />
                </div>
                <p
                  style={{
                    margin: '0 0 6px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: 36,
                  }}>
                  {ev.title}
                </p>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <Calendar size={10} color="#00699e" />
                    {formatDate(ev.start_date)}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <MapPin size={10} color="#00699e" />
                    {locationText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLearningTab = () => {
    if (activeModules.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 13 }}>
          Belum ada modul aktif yang sedang dipelajari.
        </div>
      );
    }

    return (
      <div className="learning-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {activeModules.map(mod => (
          <ModuleRow
            key={mod.id}
            mod={mod}
          />
        ))}
      </div>
    );
  };

  return (
    <section style={{ marginBottom: 36 }}>
      <style>{`
        @media (max-width: 767px) {
          .learning-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* Header Container */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Modern Segmented Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}>
          <button
            onClick={() => setActiveTab('learning')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: activeTab === 'learning' ? 700 : 500,
              background: activeTab === 'learning' ? '#fff' : 'transparent',
              color: activeTab === 'learning' ? '#00699e' : '#64748b',
              boxShadow: activeTab === 'learning' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span>📖 Belajar Saya</span>
            <span style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 99,
              background: activeTab === 'learning' ? '#00699e' : '#cbd5e1',
              color: '#fff',
              fontWeight: 700,
            }}>
              {activeClassesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: activeTab === 'events' ? 700 : 500,
              background: activeTab === 'events' ? '#fff' : 'transparent',
              color: activeTab === 'events' ? '#00699e' : '#64748b',
              boxShadow: activeTab === 'events' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span>🎟️ Event Aktif</span>
            <span style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 99,
              background: activeTab === 'events' ? '#00699e' : '#cbd5e1',
              color: '#fff',
              fontWeight: 700,
            }}>
              {activeTickets.length}
            </span>
          </button>
        </div>

        {/* Dynamic Action Button */}
        <button
          onClick={handleSeeAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#00699e',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,105,158,0.05)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span>Lihat Semua</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        padding: 16,
      }}>
        {activeTab === 'learning' ? renderLearningTab() : renderEventsTab()}
      </div>
    </section>
  );
};

export default MyActivitySection;
