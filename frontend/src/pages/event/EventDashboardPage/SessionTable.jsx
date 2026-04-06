import React, { useState } from 'react';
import { List } from 'lucide-react';

/**
 * SessionTable
 * Props:
 *   sessions {Array<{
 *     title, day, time, speaker, materialStatus:'uploaded'|'pending'|'not_required', prerequisite
 *   }>}
 */

const defaultSessions = [
  { title: 'Logic 101',               day: 1, time: '09:00', speaker: 'Budi Santoso', materialStatus: 'uploaded',     prerequisite: null },
  { title: 'Introduction to Web Dev', day: 1, time: '11:00', speaker: 'Dewi Lestari', materialStatus: 'uploaded',     prerequisite: 'Logic 101' },
  { title: 'Advanced OOP',            day: 1, time: '13:00', speaker: 'Siti Aminah',  materialStatus: 'pending',      prerequisite: 'Logic 101' },
  { title: 'Database Design',         day: 2, time: '15:00', speaker: 'Ahmad Rizki',  materialStatus: 'uploaded',     prerequisite: null },
  { title: 'Q&A Session',            day: 2, time: '17:00', speaker: null,           materialStatus: 'not_required', prerequisite: null },
];

const statusConfig = {
  uploaded:     { label: 'Uploaded',     cls: 'tag-success' },
  pending:      { label: 'Pending',      cls: 'tag-warning' },
  not_required: { label: 'Not Required', cls: 'tag-neutral' },
};

const dayColors = {
  1: { bg: 'var(--primary-light)', color: 'var(--primary)' },
  2: { bg: '#fef3c7',              color: '#92400e' },
  3: { bg: '#fce7f3',              color: '#9d174d' },
};

export default function SessionTable({ sessions = defaultSessions }) {
  const [activeDay, setActiveDay] = useState('all');

  const days = [...new Set(sessions.map(s => s.day))].sort();
  const filtered = activeDay === 'all' ? sessions : sessions.filter(s => s.day === activeDay);

  return (
    <div style={{ background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 24, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <List size={15} color="var(--text-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Struktur Sesi &amp; Prerequisite</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', ...days].map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                border: '0.5px solid',
                background: activeDay === d ? 'var(--primary-light)' : 'transparent',
                color: activeDay === d ? 'var(--primary)' : 'var(--text-muted)',
                borderColor: activeDay === d ? 'var(--primary-border)' : 'var(--border)',
                cursor: 'pointer', fontWeight: activeDay === d ? 600 : 400,
                transition: 'all 0.15s', fontFamily: 'var(--font)',
              }}
            >
              {d === 'all' ? 'Semua' : `Day ${d}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['Sesi', 'Day', 'Waktu', 'Speaker', 'Status Materi', 'Prerequisite'].map(h => (
                <th key={h} style={{ background: '#f8fafc', color: 'var(--text-muted)', textAlign: 'left', padding: '10px 16px', fontWeight: 500, borderBottom: '0.5px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const dc = dayColors[s.day] || dayColors[1];
              const sc = statusConfig[s.materialStatus] || statusConfig.not_required;
              return (
                <tr
                  key={i}
                  style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', fontWeight: 500, color: 'var(--text)' }}>
                    {s.title}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: dc.bg, color: dc.color }}>
                      Day {s.day}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                    {s.time}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', color: 'var(--text)' }}>
                    {s.speaker
                      ? s.speaker
                      : <span className="tag tag-danger">TBA</span>}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)' }}>
                    <span className={`tag ${sc.cls}`}>{sc.label}</span>
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)' }}>
                    {s.prerequisite
                      ? <span className="tag tag-primary">{s.prerequisite}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
