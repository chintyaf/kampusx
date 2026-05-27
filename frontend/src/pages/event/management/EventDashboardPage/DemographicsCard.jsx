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
  eventStatus
}) {
  const totalParticipants = totals.find(t => t.label === 'Total Peserta')?.value || 0;
  const isEmpty = eventStatus === 'draft' || totalParticipants === 0 || data.length === 0 || (data.length === 1 && data[0].pct === 0);

  if (isEmpty) {
    return (
      <div className="card h-100" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-title">
          <Users size={15} />
          {title}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '40px 20px',
          background: '#fafafa',
          borderRadius: '6px',
          border: '1.5px dashed #cbd5e1',
          textAlign: 'center',
          minHeight: '220px'
        }}>
          <Users size={32} style={{ color: '#94a3b8', marginBottom: 12, opacity: 0.6 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Belum ada data demografi
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Data demografi akan otomatis terisi setelah tiket terjual kepada peserta.
          </span>
        </div>
      </div>
    );
  }

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
