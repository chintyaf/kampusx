import React from 'react';
import { Activity, Check } from 'lucide-react';

/**
 * EventTimeline
 * Props:
 *   steps {Array<{label, date, status: 'done'|'active'|'pending'}>}
 */

const defaultSteps = [
  { label: 'Draft',      date: 'Dibuat',       status: 'done' },
  { label: 'Published',  date: '1 Jun 2025',   status: 'done' },
  { label: 'Registrasi', date: 'Berlangsung',  status: 'active' },
  { label: 'Hari-H',     date: '20 Jul 2025',  status: 'pending' },
  { label: 'Selesai',    date: '21 Jul 2025',  status: 'pending' },
];

function TimelineDot({ status }) {
  const base = {
    width: 22, height: 22, borderRadius: '50%',
    margin: '0 auto', marginBottom: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1, border: '2px solid', flexShrink: 0,
  };

  if (status === 'done') {
    return (
      <div style={{ ...base, background: 'var(--primary)', borderColor: 'var(--primary)' }}>
        <Check size={11} color="#fff" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div style={{ ...base, background: '#fff', borderColor: 'var(--primary)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: '#e2e8f0', borderColor: '#e2e8f0' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
    </div>
  );
}

export default function EventTimeline({ steps = defaultSteps }) {
  return (
    <div className="card mb-4">
      <div className="card-title">
        <Activity size={15} />
        Timeline Event
      </div>
      <div style={{ display: 'flex', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 10, left: '10%', right: '10%', height: 2,
          background: 'var(--border)', zIndex: 0,
        }} />
        {steps.map((step, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            <TimelineDot status={step.status} />
            <div style={{ fontSize: 12, fontWeight: 600, color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text)' }}>
              {step.label}
            </div>
            <div style={{ fontSize: 11, color: step.status === 'active' ? 'var(--primary)' : 'var(--text-muted)', marginTop: 2, fontWeight: step.status === 'active' ? 600 : 400 }}>
              {step.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
