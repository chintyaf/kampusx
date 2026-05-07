import React from 'react';
import './UI.css';

/* ── StatCard ─────────────────────────────────────── */
export const StatCard = ({ num, label, color = 'var(--primary-light)', icon: Icon }) => (
  <div className="stat-card animate-fade-up">
    {Icon && (
      <div className="stat-card-icon">
        <Icon size={18} color={color} />
      </div>
    )}
    <div className="stat-num" style={{ color }}>{num}</div>
    <div className="stat-label">{label}</div>
  </div>
);

/* ── SectionCard ──────────────────────────────────── */
export const SectionCard = ({ title, subtitle, iconBg = 'purple', icon: Icon, children, actions }) => (
  <div className="section-card animate-fade-up">
    <div className="section-card-header">
      <div className="section-card-title-row">
        <div className={`section-card-icon icon-bg-${iconBg}`}>
          {Icon && <Icon size={18} />}
        </div>
        <div>
          <div className="section-card-title">{title}</div>
          {subtitle && <div className="section-card-sub">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="section-card-actions">{actions}</div>}
    </div>
    <div className="section-card-body">{children}</div>
  </div>
);

/* ── Toggle ───────────────────────────────────────── */
export const Toggle = ({ on, onChange, label }) => (
  <button
    className={`toggle-btn ${on ? 'toggle-btn--on' : ''}`}
    onClick={() => onChange(!on)}
    aria-checked={on}
    role="switch"
    title={label}
  >
    <span className="toggle-knob" />
  </button>
);

/* ── ProgressBar ──────────────────────────────────── */
export const ProgressBar = ({ value, max = 100, color = 'var(--primary)', height = 6 }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="prog-wrap" style={{ height }}>
      <div
        className="prog-fill"
        style={{ width: `${pct}%`, background: color, height }}
      />
    </div>
  );
};

/* ── Badge ────────────────────────────────────────── */
export const Badge = ({ children, variant = 'purple' }) => (
  <span className={`kx-badge kx-badge--${variant}`}>{children}</span>
);

/* ── InfoBox ──────────────────────────────────────── */
export const InfoBox = ({ icon: Icon, iconColor = 'var(--primary-light)', children, variant = 'purple' }) => (
  <div className={`info-box info-box--${variant}`}>
    {Icon && <Icon size={14} color={iconColor} style={{ flexShrink: 0, marginTop: 1 }} />}
    <span>{children}</span>
  </div>
);

/* ── EmptyState ───────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="empty-state">
    {Icon && <Icon size={40} color="var(--subtle)" />}
    <div className="empty-title">{title}</div>
    {sub && <div className="empty-sub">{sub}</div>}
  </div>
);
