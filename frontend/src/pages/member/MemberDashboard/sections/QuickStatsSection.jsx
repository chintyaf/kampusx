import React from 'react';
import { Ticket, Calendar, Award, Coins } from 'lucide-react';

const STATS = (a, b, c, d) => [
  { icon: Ticket,   label: 'Tiket Aktif',  value: a, suffix: null  },
  { icon: Calendar, label: 'Event Diikuti', value: b, suffix: null  },
  { icon: Award,    label: 'Poin Lokal',    value: c, suffix: 'pts' },
  { icon: Coins,    label: 'Poin Global',   value: d, suffix: 'pts' },
];

const QuickStatsSection = ({ activeTicketsCount, totalTicketsCount, pointsData, isLoading }) => {
  const local  = pointsData?.current_local_points  ?? 0;
  const global = pointsData?.current_global_points ?? 0;
  const stats  = STATS(activeTicketsCount, totalTicketsCount, local, global);

  return (
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e8ecf0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',  /* 1×4 single row */
        overflow: 'hidden',
      }}>
        {isLoading
          ? [0,1,2,3].map(i => (
              <div key={i} className="placeholder-glow" style={{
                padding: '20px 12px',
                borderRight: i < 3 ? '1px solid #f0f2f5' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <span className="placeholder col-6" style={{ height: 11, borderRadius: 4, display: 'block' }} />
                <span className="placeholder col-4" style={{ height: 24, borderRadius: 4, display: 'block' }} />
              </div>
            ))
          : stats.map(({ icon: Icon, label, value, suffix }, i) => (
              <div key={i} style={{
                padding: '20px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid #f0f2f5' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <Icon size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </span>
                  {suffix && (
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{suffix}</span>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
};

export default QuickStatsSection;
