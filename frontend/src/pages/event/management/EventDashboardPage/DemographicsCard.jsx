import React from 'react';
import { Users } from 'lucide-react';

/**
 * DemographicsCard
 * Props:
 *   title  {string}
 *   data   {Array<{label:string, pct:number, color?:string}>}
 *   totals {Array<{label:string, value:string|number}>}
 */

const palette = ['#00699e', '#3c84a8', '#7bd6fe', '#b9e7fe', '#dff3ff'];

const defaultData = [
  { label: 'Informatika',      pct: 60 },
  { label: 'Sistem Informasi', pct: 20 },
  { label: 'Teknik Komputer',  pct: 10 },
  { label: 'Data Science',     pct: 7 },
  { label: 'Teknik Elektro',   pct: 3 },
];

export default function DemographicsCard({
  title = 'Participant Demographics – Major',
  data = defaultData,
  totals = [
    { label: 'Total Peserta', value: 450 },
    { label: 'Jurusan Unik',  value: 5 },
  ],
}) {
  return (
    <div className="card h-100">
      <div className="card-title">
        <Users size={15} />
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 99, height: 7, overflow: 'hidden' }}>
              <div style={{
                width: `${item.pct}%`, height: 7, borderRadius: 99,
                background: item.color || palette[i % palette.length],
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', width: 32, textAlign: 'right', flexShrink: 0 }}>
              {item.pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totals.length}, 1fr)`, gap: 10 }}>
        {totals.map((t, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
