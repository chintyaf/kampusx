import React from 'react';
import { Clock, ImagePlus } from 'lucide-react';

/**
 * ReadinessStatus
 * Props:
 *   progress   {number}  0-100
 *   note       {string}
 *   posterUrl  {string|null}
 *   onUpload   {Function}
 */

export default function ReadinessStatus({
  progress = 85,
  note = 'Pastikan semua data lengkap sebelum event dimulai.',
  posterUrl = null,
  onUpload,
}) {
  const color = progress >= 80 ? 'var(--primary)' : progress >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card h-100">
      <div className="card-title">
        <Clock size={15} />
        Status Kesiapan Event
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
        <span>Completion Progress</span>
        <span style={{ fontWeight: 600, color }}>{progress}% Complete</span>
      </div>
      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8 }}>
        <div style={{ width: `${progress}%`, height: 8, borderRadius: 99, background: color, transition: 'width 0.6s ease' }} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{note}</p>

      <div className="divider" />

      {posterUrl ? (
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
          <img src={posterUrl} alt="Event Poster" style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
          <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>poster-event.png</span>
            <button className="btn btn-sm" onClick={onUpload}>Ganti</button>
          </div>
        </div>
      ) : (
        <div
          onClick={onUpload}
          style={{
            background: '#f8fafc',
            border: '1.5px dashed var(--border)',
            borderRadius: 8,
            minHeight: 160,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <ImagePlus size={30} color="var(--primary)" strokeWidth={1.5} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Upload poster event</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>PNG, JPG — maks 2MB</span>
          <button className="btn btn-sm" style={{ marginTop: 2 }} onClick={e => { e.stopPropagation(); onUpload?.(); }}>
            Pilih File
          </button>
        </div>
      )}
    </div>
  );
}
