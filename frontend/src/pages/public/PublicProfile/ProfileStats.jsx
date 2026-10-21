import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Award, Zap, Trophy, BookOpen, ShieldCheck } from 'lucide-react';

const ProfileStats = ({ stats = {} }) => {
  const statItems = [
    {
      label: 'Status Tier',
      value: stats.tier || 'Silver',
      icon: <Award size={20} className="text-warning mb-1" />
    },
    {
      label: 'Poin Global',
      value: `${(stats.points || 2450).toLocaleString('id-ID')} pts`,
      icon: <Zap size={20} className="text-primary mb-1" />
    },
    {
      label: 'Rank Leaderboard',
      value: stats.rank ? `#${stats.rank}` : '#12',
      icon: <Trophy size={20} className="text-dark mb-1" />
    },
    {
      label: 'Modul SRL Lulus',
      value: stats.modulesCompleted ?? 8,
      icon: <BookOpen size={20} className="text-info mb-1" />
    },
    {
      label: 'SBT On-Chain',
      value: `${stats.sbtCount ?? 5} SBT`,
      icon: <ShieldCheck size={20} className="text-success mb-1" />
    }
  ];

  return (
    <div className="profile-stats-card">
      <Row className="g-2">
        {statItems.map((item, idx) => (
          <Col key={idx} xs={6} md={true} className="stat-metric-box">
            <div>{item.icon}</div>
            <div className="stat-metric-val">{item.value}</div>
            <div className="stat-metric-lbl">{item.label}</div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProfileStats;
