import React from 'react';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * MissingInformation
 * Props:
 *   issues {Array<{severity:'HIGH'|'MEDIUM'|'LOW', category:string, message:string}>}
 *   onFix  {Function(issue)}
 */

const defaultIssues = [
  { severity: 'HIGH',   category: 'Media',        message: 'Poster belum di-upload' },
  { severity: 'HIGH',   category: 'Sessions',     message: "Sesi Day 2 – 'Q&A' belum memiliki pembicara" },
  { severity: 'HIGH',   category: 'Technical',    message: 'Link Zoom/Streaming untuk Day 1 belum di-generate' },
  { severity: 'HIGH',   category: 'Registration', message: "Custom Checkout: Pertanyaan 'NIM' belum diatur" },
  { severity: 'MEDIUM', category: 'Content',      message: 'Speaker Bio untuk Pak Jaka masih kosong' },
];

const severityConfig = {
  HIGH:   { Icon: AlertTriangle, color: '#dc2626', tagCls: 'tag-high',   borderColor: '#dc2626' },
  MEDIUM: { Icon: AlertCircle,   color: '#d97706', tagCls: 'tag-medium', borderColor: '#d97706' },
  LOW:    { Icon: Info,          color: '#2563eb', tagCls: 'tag-low',    borderColor: '#2563eb' },
};

export default function MissingInformation({ issues = defaultIssues, onFix }) {
  return (
    <div className="card h-100">
      <div className="card-title">
        <Info size={15} />
        Missing Information
        <span className="badge-count">{issues.length} Issues</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {issues.map((issue, i) => {
          const cfg = severityConfig[issue.severity] || severityConfig.LOW;
          const { Icon } = cfg;
          return (
            <div
              key={i}
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 12px', border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)', background: '#fafafa',
                borderLeft: `3px solid ${cfg.borderColor}`,
              }}
            >
              <div style={{ marginTop: 1, flexShrink: 0 }}>
                <Icon size={15} color={cfg.color} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{issue.message}</p>
                <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`tag ${cfg.tagCls}`}>{issue.severity}</span>
                  <span className="tag tag-cat">{issue.category}</span>
                </div>
              </div>
              {onFix && (
                <button className="btn btn-sm" style={{ flexShrink: 0 }} onClick={() => onFix(issue)}>
                  Perbaiki
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
