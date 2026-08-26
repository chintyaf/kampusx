import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Play, CheckCircle } from 'lucide-react';

const STATUS_CONFIG = {
  not_started: { label: 'Belum dimulai', btnText: 'Mulai', color: '#64748b', btnVariant: '#00699e' },
  in_progress:  { label: 'Sedang berjalan', btnText: 'Lanjutkan', color: '#0369a1', btnVariant: '#005a87' },
  completed:    { label: 'Selesai', btnText: 'Pelajari Lagi', color: '#16a34a', btnVariant: '#16a34a' },
};

const MicroLearningCard = ({ mod, style }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[mod.status] || STATUS_CONFIG.not_started;
  const completedLessons = Math.round(mod.lessons * (mod.progress / 100));

  const handleAction = (e) => {
    e.stopPropagation();
    if (mod.progress > 0) {
      navigate(`/learner/modules/${mod.id}`);
    } else {
      navigate(`/learner/modules/${mod.id}/goals`);
    }
  };

  return (
    <div
      onClick={() => {
        if (mod.progress > 0) {
          navigate(`/learner/modules/${mod.id}`);
        } else {
          navigate(`/learner/modules/${mod.id}/goals`);
        }
      }}
      style={{
        flexShrink: 0,
        width: 240,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        boxShadow: '0 2px 8px rgba(0, 105, 158, 0.04)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 105, 158, 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 105, 158, 0.04)';
      }}
    >
      {/* Card Cover Thumbnail */}
      <div style={{
        width: '100%',
        height: 104,
        background: `linear-gradient(135deg, ${mod.thumbColor || '#c4b5fd'} 0%, #ffffff 130%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <BookOpen size={32} color="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
        
        {/* Estimated Time Badge */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          borderRadius: 999,
          padding: '3px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <Clock size={10} color="#fff" />
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{mod.duration}</span>
        </div>
      </div>

      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category Tag */}
        <div>
          <span style={{
            display: 'inline-block',
            fontSize: 9,
            fontWeight: 800,
            color: mod.tagColor || '#7c3aed',
            background: mod.tagBg || '#f5f3ff',
            borderRadius: 6,
            padding: '2px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            {mod.tag}
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 700,
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

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Progress Bar & Counter */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              {completedLessons}/{mod.lessons} Pelajaran
            </span>
            <span style={{ fontSize: 11, color: config.color, fontWeight: 700 }}>
              {mod.progress}%
            </span>
          </div>
          <div style={{
            height: 6,
            background: '#f1f5f9',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${mod.progress}%`,
              background: config.btnVariant,
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          style={{
            width: '100%',
            background: config.btnVariant,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 0',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
        >
          {mod.status === 'completed' ? (
            <CheckCircle size={13} />
          ) : (
            <Play size={10} fill="#fff" />
          )}
          <span>{config.btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default MicroLearningCard;
