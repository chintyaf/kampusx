import React from 'react';
import { Ticket, BookOpen, CheckCircle, Coins } from 'lucide-react';

const MOCK_MODULES = [
  { status: 'not_started', progress: 0, lessons: 4 },
  { status: 'in_progress', progress: 60, lessons: 6 },
  { status: 'completed', progress: 100, lessons: 5 },
  { status: 'not_started', progress: 0, lessons: 3 },
];

const STATS = (globalPoints, activeModulesCount, completedLessonsCount, activeTicketsCount) => [
  { icon: Coins,       value: globalPoints,          suffix: 'Poin Saya',         color: '#eab308', bg: '#fefce8' },
  { icon: BookOpen,    value: activeModulesCount,    suffix: 'Modul Berjalan',    color: '#7c3aed', bg: '#f5f3ff' },
  { icon: CheckCircle, value: completedLessonsCount, suffix: 'Pelajaran Selesai', color: '#16a34a', bg: '#d1fae5' },
  { icon: Ticket,      value: activeTicketsCount,    suffix: 'Tiket Event',       color: '#00699e', bg: '#e0f2fe' },
];

const QuickStatsSection = ({ activeTicketsCount, pointsData, isLoading }) => {
  const global = pointsData?.current_global_points ?? 0;
  
  const runningModules = MOCK_MODULES.filter(m => m.status === 'in_progress').length;
  const displayModulesCount = runningModules > 0 ? 2 : 0; 

  const completedLessonsCount = MOCK_MODULES.reduce((sum, m) => {
    return sum + Math.round(m.lessons * (m.progress / 100));
  }, 0); 

  const stats = STATS(global, displayModulesCount, completedLessonsCount, activeTicketsCount);

  return (
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <style>{`
        @media (max-width: 767px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding: 10px !important;
          }
          .stats-card {
            padding: 12px 8px !important;
            gap: 8px !important;
          }
          .stats-value {
            font-size: 16px !important;
          }
          .stats-suffix {
            font-size: 9px !important;
          }
          .stats-icon-container {
            width: 30px !important;
            height: 30px !important;
          }
        }
      `}</style>

      <div className="stats-grid" style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',  /* 1×4 single row */
        gap: 16,
        padding: 16,
      }}>
        {isLoading
          ? [0,1,2,3].map(i => (
              <div key={i} className="placeholder-glow stats-card" style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span className="placeholder" style={{ width: 36, height: 36, borderRadius: 8, display: 'block', backgroundColor: '#e2e8f0' }} />
                <div style={{ flex: 1 }}>
                  <span className="placeholder col-8" style={{ height: 16, borderRadius: 4, display: 'block', marginBottom: 6 }} />
                  <span className="placeholder col-5" style={{ height: 11, borderRadius: 4, display: 'block' }} />
                </div>
              </div>
            ))
          : stats.map(({ icon: Icon, value, suffix, color, bg }, i) => (
              <div key={i} className="stats-card" style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid #f1f5f9',
              }}>
                <div className="stats-icon-container" style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span className="stats-value" style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: 2 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </span>
                  <span className="stats-suffix" style={{ fontSize: 10, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {suffix}
                  </span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
};

export default QuickStatsSection;
