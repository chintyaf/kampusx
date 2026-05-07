import React, { useMemo } from 'react';
import { TicketIcon } from 'lucide-react';

/**
 * TicketDistribution
 * Props:
 *   tickets {Array<{label:string, count:number, color:string}>}
 */

const defaultTickets = [
  { label: 'Early Bird', count: 149, color: '#3c84a8' },
  { label: 'Regular',    count: 225, color: '#22c55e' },
  { label: 'VIP',        count: 76,  color: '#f59e0b' },
];

function DonutChart({ segments, total }) {
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const CX = 75, CY = 75, SIZE = 150;
  const STROKE = 26;

  const slices = useMemo(() => {
    let offset = 0;
    return segments.map(s => {
      const pct = s.count / total;
      const dash = pct * CIRC;
      const slice = { ...s, dash, gap: CIRC - dash, offset };
      offset += dash;
      return slice;
    });
  }, [segments, total, CIRC]);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={s.color}
          strokeWidth={STROKE}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      ))}
      <circle cx={CX} cy={CY} r={R - STROKE / 2 + 2} fill="white" />
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize="14" fontWeight="600" fill="#0f172a" fontFamily="var(--font)">
        {total}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="var(--font)">
        tiket terjual
      </text>
    </svg>
  );
}

export default function TicketDistribution({ tickets = defaultTickets }) {
  const total = tickets.reduce((s, t) => s + t.count, 0);

  return (
    <div className="card h-100">
      <div className="card-title">
        <TicketIcon size={15} />
        Ticket Distribution
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
        <DonutChart segments={tickets} total={total} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tickets.map((t, i) => {
          const pct = Math.round((t.count / total) * 100);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>{t.label}</span>
              <div style={{ width: 80, background: '#e2e8f0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: 6, borderRadius: 99, background: t.color, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 70, textAlign: 'right' }}>
                {t.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
