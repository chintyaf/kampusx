import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Ticket, Star, Calendar } from 'lucide-react';
import { clr } from '../constants';

const QuickStatsSection = ({ activeTicketsCount, points, totalTicketsCount }) => (
  <Row className="g-3 mb-4">
    {[
      {
        icon: <Ticket size={16} />,
        label: 'Tiket Aktif',
        value: activeTicketsCount,
        color: '#00699e',
      },
      {
        icon: <Star size={16} />,
        label: 'Poin Reward',
        value: points,
        color: '#F59E0B',
      },
      {
        icon: <Calendar size={16} />,
        label: 'Event Diikuti',
        value: totalTicketsCount,
        color: '#10B981',
      },
    ].map((s, i) => (
      <Col xs={4} key={i}>
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 12,
            padding: '12px 8px',
            textAlign: 'center',
            boxShadow: clr.shadow,
          }}>
          <div style={{ color: s.color, marginBottom: 4 }}>{s.icon}</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1,
            }}>
            {s.value}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-secondary)',
              marginTop: 3,
            }}>
            {s.label}
          </div>
        </div>
      </Col>
    ))}
  </Row>
);

export default QuickStatsSection;
