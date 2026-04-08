import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus } from 'lucide-react';

/**
 * StatCards
 * Props:
 *   stats {Array<{label, value, sub, progress?, iconBg, iconColor, lucideIcon?, progressColor?}>}
 */

const defaultStats = [
  {
    label: 'Tickets Sold',
    value: '450 / 500',
    sub: '90% kapasitas terisi',
    progress: 90,
    iconBg: '#dff3ff',
    iconColor: '#00699e',
    lucideIcon: Ticket,
    progressColor: 'var(--primary)',
  },
  {
    label: 'Revenue',
    value: 'Rp 22,5jt',
    sub: '@ Rp 50.000 / tiket',
    iconBg: '#dcfce7',
    iconColor: '#166534',
    lucideIcon: DollarSign,
  },
  {
    label: 'Checked-In',
    value: '0',
    sub: 'Belum dimulai',
    iconBg: '#f3e8ff',
    iconColor: '#7c3aed',
    lucideIcon: UserCheck,
  },
  {
    label: 'Absent',
    value: '0',
    sub: '0% dari pendaftar',
    iconBg: '#fef3c7',
    iconColor: '#92400e',
    lucideIcon: UserMinus,
  },
];

function StatCard({ label, value, sub, progress, iconBg, iconColor, lucideIcon: Icon, progressColor = 'var(--primary)' }) {
  return (
    <div className="card h-100" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icon && <Icon size={18} color={iconColor} strokeWidth={1.8} />}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
      {progress != null && (
        <div style={{ background: '#e2e8f0', borderRadius: 99, height: 4, marginTop: 10 }}>
          <div style={{ width: `${progress}%`, height: 4, borderRadius: 99, background: progressColor, transition: 'width 0.6s ease' }} />
        </div>
      )}
    </div>
  );
}

export default function StatCards({ stats = defaultStats }) {
  return (
    <Row className="g-3 mb-4">
      {stats.map((s, i) => (
        <Col key={i} xs={12} sm={6} lg={3}>
          <StatCard {...s} />
        </Col>
      ))}
    </Row>
  );
}
